import { omit } from 'lodash';
import { CallTypes, callTypes } from 'hrm-form-definitions';

import * as t from './types';
import {
  DefinitionVersion,
  GeneralActionType,
  INITIALIZE_CONTACT_STATE,
  RECREATE_CONTACT_STATE,
  REMOVE_CONTACT_STATE,
} from '../types';
import { createStateItem, getInitialValue } from '../../components/common/forms/formGenerators';
import { createContactlessTaskTabDefinition } from '../../components/tabbedForms/ContactlessTaskTabDefinition';
import {
  createDraftReducer,
  EXISTING_CONTACT_CREATE_DRAFT_ACTION,
  EXISTING_CONTACT_SET_CATEGORIES_GRID_VIEW_ACTION,
  EXISTING_CONTACT_TOGGLE_CATEGORY_EXPANDED_ACTION,
  EXISTING_CONTACT_UPDATE_DRAFT_ACTION,
  EXISTING_CONTACT_LOAD_TRANSCRIPT,
  ExistingContactAction,
  ExistingContactsState,
  LOAD_CONTACT_ACTION,
  loadContactReducer,
  RELEASE_CONTACT_ACTION,
  releaseContactReducer,
  setCategoriesGridViewReducer,
  toggleCategoryExpandedReducer,
  updateDraftReducer,
  loadTranscriptReducer,
} from './existingContacts';
import { CSAMReportEntry } from '../../types/types';
import {
  ContactDetailsAction,
  ContactDetailsState,
  DetailsContext,
  sectionExpandedStateReducer,
  TOGGLE_DETAIL_EXPANDED_ACTION,
} from './contactDetails';
import { ChannelTypes } from '../DomainConstants';

export type TaskEntry = {
  helpline: string;
  callType: CallTypes;
  childInformation: { [key: string]: string | boolean };
  callerInformation: { [key: string]: string | boolean };
  caseInformation: { [key: string]: string | boolean };
  contactlessTask: { channel: ChannelTypes; [key: string]: string | boolean };
  categories: string[];
  csamReports: CSAMReportEntry[];
  metadata: {
    startMillis: number;
    endMillis: number;
    recreated: boolean;
    categories: {
      gridView: boolean;
      expanded: { [key: string]: boolean };
    };
  };
  isCallTypeCaller: boolean;
};

type ContactsState = {
  tasks: {
    [taskId: string]: TaskEntry;
  };
  existingContacts: ExistingContactsState;
  contactDetails: ContactDetailsState;
  editingContact: boolean;
  isCallTypeCaller: boolean;
};

export const emptyCategories = [];

// eslint-disable-next-line import/no-unused-modules
export const createNewTaskEntry = (definitions: DefinitionVersion) => (recreated: boolean): TaskEntry => {
  const initialChildInformation = definitions.tabbedForms.ChildInformationTab.reduce(createStateItem, {});
  const initialCallerInformation = definitions.tabbedForms.CallerInformationTab.reduce(createStateItem, {});
  const initialCaseInformation = definitions.tabbedForms.CaseInformationTab.reduce(createStateItem, {});

  const { helplines } = definitions.helplineInformation;
  const defaultHelpline = helplines.find(helpline => helpline.default).value || helplines[0].value;
  if (defaultHelpline === null || defaultHelpline === undefined) throw new Error('No helpline definition was found');

  const categoriesMeta = {
    gridView: false,
    expanded: Object.keys(definitions.tabbedForms.IssueCategorizationTab(defaultHelpline)).reduce(
      (acc, category) => ({ ...acc, [category]: false }),
      {},
    ),
  };

  const metadata = {
    startMillis: recreated ? null : new Date().getTime(),
    endMillis: null,
    tab: 1,
    recreated,
    categories: categoriesMeta,
  };

  const initialContactlessTaskTabDefinition = createContactlessTaskTabDefinition({
    counselorsList: [],
    definition: definitions.tabbedForms.ContactlessTaskTab,
    helplineInformation: definitions.helplineInformation,
  });
  const contactlessTask: TaskEntry['contactlessTask'] = {
    channel: 'web', // default, should be overwritten
    ...Object.fromEntries(initialContactlessTaskTabDefinition.map(d => [d.name, getInitialValue(d)])),
  };

  return {
    helpline: '',
    callType: '',
    childInformation: initialChildInformation,
    callerInformation: initialCallerInformation,
    caseInformation: initialCaseInformation,
    contactlessTask,
    categories: emptyCategories,
    csamReports: [],
    metadata,
    isCallTypeCaller: false,
  };
};

const initialState: ContactsState = {
  tasks: {},
  existingContacts: {},
  contactDetails: {
    [DetailsContext.CASE_DETAILS]: { detailsExpanded: {} },
    [DetailsContext.CONTACT_SEARCH]: { detailsExpanded: {} },
  },
  editingContact: false,
  isCallTypeCaller: false,
};

// eslint-disable-next-line import/no-unused-modules,complexity
export function reduce(
  state = initialState,
  action: t.ContactsActionType | ExistingContactAction | ContactDetailsAction | GeneralActionType,
): ContactsState {
  switch (action.type) {
    case INITIALIZE_CONTACT_STATE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: createNewTaskEntry(action.definitions)(false),
        },
      };
    case RECREATE_CONTACT_STATE:
      if (state.tasks[action.taskId]) return state;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: createNewTaskEntry(action.definitions)(true),
        },
      };
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    case t.UPDATE_FORM:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            [action.parent]: action.payload,
          },
        },
      };
    case t.SAVE_END_MILLIS: {
      const taskToEnd = state.tasks[action.taskId];

      const { metadata } = taskToEnd;
      const endedTask = { ...taskToEnd, metadata: { ...metadata, endMillis: new Date().getTime() } };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: endedTask,
        },
      };
    }
    case t.SET_CATEGORIES_GRID_VIEW: {
      const currentTask = state.tasks[action.taskId];
      const { metadata } = currentTask;
      const { categories } = metadata;
      const taskWithCategoriesViewToggled = {
        ...currentTask,
        metadata: {
          ...metadata,
          categories: {
            ...categories,
            gridView: action.gridView,
          },
        },
      };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: taskWithCategoriesViewToggled,
        },
      };
    }
    case t.HANDLE_EXPAND_CATEGORY: {
      const currentTask = state.tasks[action.taskId];
      const { metadata } = currentTask;
      const { categories } = metadata;
      const taskWithCategoriesExpanded = {
        ...currentTask,
        metadata: {
          ...metadata,
          categories: {
            ...categories,
            expanded: {
              ...categories.expanded,
              [action.category]: !categories.expanded[action.category],
            },
          },
        },
      };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: taskWithCategoriesExpanded,
        },
      };
    }
    case t.PREPOPULATE_FORM: {
      const currentTask = state.tasks[action.taskId];
      const { callType, values } = action;
      const formName = callType === callTypes.child ? 'childInformation' : 'callerInformation';

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...currentTask,
            callType,
            [formName]: {
              ...currentTask[formName],
              ...values,
            },
          },
        },
      };
    }
    case t.RESTORE_ENTIRE_FORM: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: action.form,
        },
      };
    }
    case t.UPDATE_HELPLINE: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            helpline: action.helpline,
            categories: emptyCategories,
          },
        },
      };
    }
    case t.ADD_CSAM_REPORT_ENTRY: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            csamReports: [...state.tasks[action.taskId].csamReports, action.csamReportEntry],
          },
        },
      };
    }
    case t.SET_CALL_TYPE: {
      return { ...state, isCallTypeCaller: action.isCallTypeCaller };
    }
    case t.SET_EDITING_CONTACT: {
      return { ...state, editingContact: action.editing };
    }
    case LOAD_CONTACT_ACTION: {
      return { ...state, existingContacts: loadContactReducer(state.existingContacts, action) };
    }
    case RELEASE_CONTACT_ACTION: {
      return { ...state, existingContacts: releaseContactReducer(state.existingContacts, action) };
    }
    case EXISTING_CONTACT_LOAD_TRANSCRIPT: {
      return { ...state, existingContacts: loadTranscriptReducer(state.existingContacts, action) };
    }
    case EXISTING_CONTACT_TOGGLE_CATEGORY_EXPANDED_ACTION: {
      return { ...state, existingContacts: toggleCategoryExpandedReducer(state.existingContacts, action) };
    }
    case EXISTING_CONTACT_SET_CATEGORIES_GRID_VIEW_ACTION: {
      return { ...state, existingContacts: setCategoriesGridViewReducer(state.existingContacts, action) };
    }
    case TOGGLE_DETAIL_EXPANDED_ACTION: {
      return { ...state, contactDetails: sectionExpandedStateReducer(state.contactDetails, action) };
    }
    case EXISTING_CONTACT_UPDATE_DRAFT_ACTION: {
      return { ...state, existingContacts: updateDraftReducer(state.existingContacts, action) };
    }
    case EXISTING_CONTACT_CREATE_DRAFT_ACTION: {
      return { ...state, existingContacts: createDraftReducer(state.existingContacts, action) };
    }
    default:
      return state;
  }
}
