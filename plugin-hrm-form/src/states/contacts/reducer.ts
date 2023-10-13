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
import { createReducer } from 'redux-promise-middleware-actions';

import * as t from './types';
import { ContactsState, SET_SAVED_CONTACT, UPDATE_CONTACT_ACTION } from './types';
import {
  INITIALIZE_CONTACT_STATE,
  InitializeContactStateAction,
  REMOVE_CONTACT_STATE,
  RemoveContactStateAction,
} from '../types';
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
  initialState as existingContactInitialState,
} from './existingContacts';
import {
  ContactDetailsAction,
  DetailsContext,
  sectionExpandedStateReducer,
  TOGGLE_DETAIL_EXPANDED_ACTION,
} from './contactDetails';
import { ADD_EXTERNAL_REPORT_ENTRY, addExternalReportEntryReducer } from '../csam-report/existingContactExternalReport';
import { resourceReferralReducer } from './resourceReferral';
import { ContactCategoryAction, toggleSubCategoriesReducer } from './categories';
import { configurationBase, RootState } from '..';
import { createCaseAsyncAction } from '../case/saveCase';
import { newContactState } from './contactState';
import { saveContactReducer } from './saveContact';

export const emptyCategories = [];

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
const boundSaveContactReducer = saveContactReducer(existingContactInitialState);

const newCaseReducer = createReducer(initialState, handleAction => [
  handleAction(
    createCaseAsyncAction.fulfilled,
    (state: ContactsState, { payload: { case: connectedCase, taskSid } }) => {
      const connectedContacts = connectedCase.connectedContacts
        .map(({ id }) => state.existingContacts[id])
        .filter(Boolean);
      const contactsMap = Object.fromEntries(
        connectedContacts.map(contact => [
          contact.savedContact.id,
          { ...contact, savedContact: { ...contact.savedContact, caseId: connectedCase.id } },
        ]),
      );
      return {
        ...state,
        existingContacts: {
          ...state.existingContacts,
          ...contactsMap,
        },
      };
    },
  ),
]);

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
    | RemoveContactStateAction
    | t.UpdatedContactAction,
): ContactsState {
  let state = boundReferralReducer(inputState, action as any);
  state = toggleSubCategoriesReducer(state, action as ContactCategoryAction);
  state = newCaseReducer(state, action as any);
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
            references: new Set(action.references),
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
    case `${UPDATE_CONTACT_ACTION}_FULFILLED`: {
      return { ...state, existingContacts: boundSaveContactReducer(state.existingContacts, action) };
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
