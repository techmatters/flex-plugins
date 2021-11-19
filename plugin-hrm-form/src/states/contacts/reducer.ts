import { omit } from 'lodash';

import * as t from './types';
import {
  INITIALIZE_CONTACT_STATE,
  RECREATE_CONTACT_STATE,
  REMOVE_CONTACT_STATE,
  GeneralActionType,
  DefinitionVersion,
} from '../types';
import { createStateItem } from '../../components/common/forms/formGenerators';
import { createContactlessTaskTabDefinition } from '../../components/tabbedForms/ContactlessTaskTabDefinition';
import callTypes, { CallTypes } from '../DomainConstants';
import type { CSAMReportEntry } from '../../types/types';

export type TaskEntry = {
  helpline: string;
  callType: CallTypes | '';
  childInformation: { [key: string]: string | boolean };
  callerInformation: { [key: string]: string | boolean };
  caseInformation: { [key: string]: string | boolean };
  contactlessTask: { [key: string]: string | boolean };
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
};

type ContactsState = {
  tasks: {
    [taskId: string]: TaskEntry;
  };
};

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

  const initialContactlessTaskTabDefinition = createContactlessTaskTabDefinition([], definitions.helplineInformation);
  const contactlessTask = initialContactlessTaskTabDefinition.reduce(createStateItem, {});

  return {
    helpline: defaultHelpline,
    callType: '',
    childInformation: initialChildInformation,
    callerInformation: initialCallerInformation,
    caseInformation: initialCaseInformation,
    contactlessTask,
    categories: [],
    csamReports: [],
    metadata,
  };
};

const initialState: ContactsState = { tasks: {} };

// eslint-disable-next-line import/no-unused-modules
export function reduce(state = initialState, action: t.ContactsActionType | GeneralActionType): ContactsState {
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
    default:
      return state;
  }
}
