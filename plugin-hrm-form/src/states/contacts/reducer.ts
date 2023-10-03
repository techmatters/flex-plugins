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
import { ContactMetadata, ContactsState } from './types';
import {
  DefinitionVersion,
  INITIALIZE_CONTACT_STATE,
  InitializeContactStateAction,
  REMOVE_CONTACT_STATE,
  RemoveContactStateAction,
} from '../types';
import { createStateItem, getInitialValue } from '../../components/common/forms/formGenerators';
import { createContactlessTaskTabDefinition } from '../../components/tabbedForms/ContactlessTaskTabDefinition';
import {
  ContactState,
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
import { Contact, ContactRawJson } from '../../types/types';
import { ContactCategoryAction, toggleSubCategoriesReducer } from './categories';
import { configurationBase, RootState } from '..';

export const emptyCategories = [];

const newContactMetaData = (recreated: boolean): ContactMetadata => {
  const categoriesMeta = {
    gridView: false,
    expanded: {},
  };

  return {
    draft: {
      resourceReferralList: {
        resourceReferralIdToAdd: '',
        lookupStatus: ReferralLookupStatus.NOT_STARTED,
      },
    },
    startMillis: recreated ? null : new Date().getTime(),
    endMillis: null,
    recreated,
    categories: categoriesMeta,
  };
};

const newContact = (definitions: DefinitionVersion): Contact => {
  const initialChildInformation = definitions.tabbedForms.ChildInformationTab.reduce(createStateItem, {});
  const initialCallerInformation = definitions.tabbedForms.CallerInformationTab.reduce(createStateItem, {});
  const initialCaseInformation = definitions.tabbedForms.CaseInformationTab.reduce(createStateItem, {});

  const { helplines } = definitions.helplineInformation;
  const defaultHelpline = helplines.find(helpline => helpline.default).value || helplines[0].value;
  if (defaultHelpline === null || defaultHelpline === undefined) throw new Error('No helpline definition was found');

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
    accountSid: '',
    id: '',
    twilioWorkerId: '',
    timeOfContact: new Date().toISOString(),
    taskId: '',
    helpline: '',
    rawJson: {
      childInformation: initialChildInformation,
      callerInformation: initialCallerInformation,
      caseInformation: initialCaseInformation,
      callType: '',
      contactlessTask,
      categories: {},
    },
    createdBy: '',
    createdAt: '',
    updatedBy: '',
    updatedAt: '',
    queueName: '',
    channel: 'web',
    number: '',
    conversationDuration: 0,
    channelSid: '',
    serviceSid: '',
    csamReports: [],
    conversationMedia: [],
  };
};

// eslint-disable-next-line import/no-unused-modules
export const newContactState = (definitions: DefinitionVersion) => (recreated: boolean): ContactState => ({
  savedContact: newContact(definitions),
  metadata: newContactMetaData(recreated),
  draftContact: {},
  references: new Set(),
});

// exposed for testing
export const initialState: ContactsState = {
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
    | InitializeContactStateAction
    | RemoveContactStateAction,
): ContactsState {
  let state = boundReferralReducer(inputState, action as any);
  state = toggleSubCategoriesReducer(state, action as ContactCategoryAction);
  switch (action.type) {
    case INITIALIZE_CONTACT_STATE:
      return {
        ...state,
        existingContacts: {
          ...state.existingContacts,
          [action.initialContact.id]: {
            savedContact: action.initialContact,
            draftContact: {
              ...action.initialContact,
              // Cheap deep copy
              rawJson: JSON.parse(JSON.stringify(action.initialContact.rawJson)),
            },
            metadata: action.metadata,
            references: new Set(),
          },
        },
      };
    case REMOVE_CONTACT_STATE: {
      const contactId = Object.values(state.existingContacts).find(cs => cs.savedContact.taskId === action.taskId)
        ?.savedContact.id;
      return {
        ...state,
        existingContacts: omit(state.existingContacts, contactId),
      };
    }
    case t.SAVE_END_MILLIS: {
      const currentContact = Object.values(state.existingContacts).find(cs => cs.savedContact.taskId === action.taskId);

      const { metadata } = currentContact;
      const endedTask = { ...currentContact, metadata: { ...metadata, endMillis: new Date().getTime() } };

      return {
        ...state,
        existingContacts: {
          ...state.existingContacts,
          [currentContact.savedContact.id]: endedTask,
        },
      };
    }
    case t.PREPOPULATE_FORM: {
      const currentContact = Object.values(state.existingContacts).find(cs => cs.savedContact.taskId === action.taskId)
        .savedContact;
      if (!currentContact) {
        console.warn(`No contact with task sid ${action.taskId} found in redux state`);
        return state;
      }
      const { callType, values, isCaseInfo } = action;
      let formName = callType === callTypes.child ? 'childInformation' : 'callerInformation';
      if (isCaseInfo) formName = 'caseInformation';

      return {
        ...state,
        existingContacts: {
          ...state.existingContacts,
          [currentContact.id]: {
            ...state.existingContacts[currentContact.id],
            draftContact: {
              rawJson: {
                callType: callType ? callType : state.existingContacts[currentContact.id].draftContact.rawJson.callType,
                [formName]: {
                  ...state.existingContacts[currentContact.id].savedContact?.rawJson?.[formName],
                  ...state.existingContacts[currentContact.id].draftContact?.rawJson?.[formName],
                  ...values,
                },
              },
            },
          },
        },
      };
    }
    case t.RESTORE_ENTIRE_FORM: {
      const definition =
        rootState[configurationBase].definitionVersions[action.contact.savedContact.rawJson.definitionVersion];
      const { savedContact } = action.contact;
      return {
        ...state,
        existingContacts: {
          ...state.existingContacts,
          [savedContact.id]: {
            ...(state.existingContacts[savedContact.id] || newContactState(definition)(true)),
            ...action.contact,
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
      return {
        ...state,
        existingContacts: updateDraftReducer(state.existingContacts, rootState.configuration, action),
      };
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
