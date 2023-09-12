/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import { omit } from 'lodash';
import { callTypes } from 'hrm-form-definitions';

import * as t from './types';
import { ContactsState, HrmServiceContactWithMetadata } from './types';
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
  EXISTING_CONTACT_LOAD_TRANSCRIPT,
  EXISTING_CONTACT_SET_CATEGORIES_GRID_VIEW_ACTION,
  EXISTING_CONTACT_TOGGLE_CATEGORY_EXPANDED_ACTION,
  EXISTING_CONTACT_UPDATE_DRAFT_ACTION,
  ExistingContactAction,
  LOAD_CONTACT_ACTION,
  loadContactReducer,
  loadTranscriptReducer,
  RELEASE_CONTACT_ACTION,
  releaseContactReducer,
  setCategoriesGridViewReducer,
  toggleCategoryExpandedReducer,
  updateDraftReducer,
} from './existingContacts';
import {
  ContactDetailsAction,
  DetailsContext,
  sectionExpandedStateReducer,
  TOGGLE_DETAIL_EXPANDED_ACTION,
} from './contactDetails';
import { ADD_EXTERNAL_REPORT_ENTRY, addExternalReportEntryReducer } from '../csam-report/existingContactExternalReport';
import { ReferralLookupStatus, resourceReferralReducer } from './resourceReferral';
import { ContactRawJson } from '../../types/types';
import { ContactCategoryAction, toggleSubCategoriesReducer } from './categories';
import { configurationBase, RootState } from '..';
import { transformValues } from '../../services/ContactService';

export const emptyCategories = [];

// eslint-disable-next-line import/no-unused-modules
export const createContactWithMetadata = (definitions: DefinitionVersion) => (
  recreated: boolean,
): HrmServiceContactWithMetadata => {
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
    draft: {
      resourceReferralList: {
        resourceReferralIdToAdd: '',
        lookupStatus: ReferralLookupStatus.NOT_STARTED,
      },
    },
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
  const contactlessTask: ContactRawJson['contactlessTask'] = {
    channel: 'web', // default, should be overwritten
    date: new Date().toISOString(),
    time: new Date().toTimeString(),
    createdOnBehalfOf: '',
    ...Object.fromEntries(initialContactlessTaskTabDefinition.map(d => [d.name, getInitialValue(d)])),
  };

  return {
    contact: {
      id: '',
      twilioWorkerId: '',
      timeOfContact: new Date().toISOString(),
      taskId: '',
      helpline: '',
      rawJson: {
        childInformation: initialChildInformation,
        callerInformation: initialCallerInformation,
        caseInformation: initialCaseInformation,
        conversationMedia: [],
        callType: '',
        contactlessTask,
        categories: {},
      },
      createdBy: '',
      updatedBy: '',
      updatedAt: '',
      queueName: '',
      channel: 'web',
      number: '',
      conversationDuration: 0,
      channelSid: '',
      serviceSid: '',
      csamReports: [],
    },
    metadata,
  };
};

// exposed for testing
export const initialState: ContactsState = {
  tasks: {},
  existingContacts: {},
  contactDetails: {
    [DetailsContext.CASE_DETAILS]: { detailsExpanded: {} },
    [DetailsContext.CONTACT_SEARCH]: { detailsExpanded: {} },
  },
  editingContact: false,
  isCallTypeCaller: false,
};

const boundReferralReducer = resourceReferralReducer(initialState);

// eslint-disable-next-line import/no-unused-modules,complexity
export function reduce(
  rootState: RootState['plugin-hrm-form'],
  inputState = initialState,
  action:
    | t.ContactsActionType
    | ExistingContactAction
    | ContactDetailsAction
    | ContactCategoryAction
    | GeneralActionType,
): ContactsState {
  let state = boundReferralReducer(inputState, action as any);
  state = toggleSubCategoriesReducer(state, action as ContactCategoryAction);
  switch (action.type) {
    case INITIALIZE_CONTACT_STATE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: createContactWithMetadata(action.definitions)(false),
        },
      };
    case RECREATE_CONTACT_STATE:
      if (state.tasks[action.taskId]) return state;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: createContactWithMetadata(action.definitions)(true),
        },
      };
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    case t.UPDATE_FORM: {
      const updateFormDefinition =
        rootState[configurationBase].definitionVersions[state.tasks[action.taskId].contact.rawJson.definitionVersion] ??
        rootState[configurationBase].currentDefinitionVersion;
      let updatedForm: ContactRawJson[keyof ContactRawJson];
      const formDefinitionsMap = {
        childInformation: updateFormDefinition.tabbedForms.ChildInformationTab,
        callerInformation: updateFormDefinition.tabbedForms.CallerInformationTab,
        caseInformation: updateFormDefinition.tabbedForms.CaseInformationTab,
      };
      const formDefinition = formDefinitionsMap[action.parent];
      if (formDefinition) {
        updatedForm = transformValues(formDefinition)(
          action.payload as ContactRawJson['childInformation' | 'callerInformation' | 'caseInformation'],
        );
      } else {
        updatedForm = action.payload;
      }
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            contact: {
              ...state.tasks[action.taskId].contact,
              rawJson: {
                ...state.tasks[action.taskId].contact.rawJson,
                [action.parent]: updatedForm,
              },
            },
          },
        },
      };
    }
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
      const { callType, values, isCaseInfo } = action;
      let formName = callType === callTypes.child ? 'childInformation' : 'callerInformation';
      if (isCaseInfo) formName = 'caseInformation';

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...currentTask,
            contact: {
              ...currentTask.contact,
              rawJson: {
                ...currentTask.contact.rawJson,
                callType: callType ? callType : state.tasks[action.taskId].contact.rawJson.callType,
                [formName]: {
                  ...currentTask[formName],
                  ...values,
                },
              },
            },
          },
        },
      };
    }
    case t.RESTORE_ENTIRE_FORM: {
      const definition = rootState[configurationBase].definitionVersions[action.contact.rawJson.definitionVersion];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...(state.tasks[action.taskId] || createContactWithMetadata(definition)(true)),
            contact: action.contact,
          },
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
            contact: {
              ...state.tasks[action.taskId].contact,
              helpline: action.helpline,
              rawJson: {
                ...state.tasks[action.taskId].contact.rawJson,
                categories: {},
              },
            },
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
            contact: {
              ...state.tasks[action.taskId].contact,
              csamReports: [...state.tasks[action.taskId].contact.csamReports, action.csamReportEntry],
            },
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
    case ADD_EXTERNAL_REPORT_ENTRY: {
      return { ...state, existingContacts: addExternalReportEntryReducer(state.existingContacts, action) };
    }
    default:
      return state;
  }
}
