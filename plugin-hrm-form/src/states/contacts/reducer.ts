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
import {
  ContactsState,
  CREATE_CONTACT_ACTION,
  LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION,
  SET_SAVED_CONTACT,
  UPDATE_CONTACT_ACTION,
} from './types';
import { REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../types';
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
  releaseAllContactStates,
  releaseContactReducer,
  SET_CONTACT_DIALOG_STATE,
  setCategoriesGridViewReducer,
  setContactDialogStateReducer,
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
import { resourceReferralReducer } from './resourceReferral';
import { ContactCategoryAction, toggleSubCategoriesReducer } from './categories';
import { HrmState } from '..';
import { createCaseAsyncAction } from '../case/saveCase';
import { newContactState } from './contactState';
import { loadContactIntoRedux, saveContactReducer } from './saveContact';
import { configurationBase } from '../storeNamespaces';
import { ConfigurationState } from '../configuration/reducer';
import { Contact } from '../../types/types';
import { SEARCH_CONTACTS_SUCCESS, SearchContactsSuccessAction } from '../search/types';

export const emptyCategories = [];

// exposed for testing
export const initialState: ContactsState = {
  existingContacts: {},
  contactsBeingCreated: new Set<string>(),
  contactDetails: {
    [DetailsContext.CASE_DETAILS]: { detailsExpanded: {} },
    [DetailsContext.CONTACT_SEARCH]: { detailsExpanded: {} },
  },
};

const boundReferralReducer = resourceReferralReducer(initialState);
const boundSaveContactReducer = saveContactReducer(initialState);
type SaveContactReducerAction = Parameters<typeof boundSaveContactReducer>[1] &
  { type:
    // eslint-disable-next-line prettier/prettier
      `${typeof CREATE_CONTACT_ACTION
      | typeof UPDATE_CONTACT_ACTION
      | typeof LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION
      | typeof SET_SAVED_CONTACT}_${string}`
  };

const newCaseReducer = createReducer(initialState, handleAction => [
  handleAction(
    createCaseAsyncAction.fulfilled,
    (state: ContactsState, { payload: connectedCase }) => {
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

const loadContactListIntoState = (
  contactsState: ContactsState,
  configurationState: ConfigurationState,
  contacts: Contact[],
  referenceId: string,
): ContactsState => {
  // Release any contacts currently loaded with the same referenceId - they are being replaced
  const withoutOldSearchResults = { ...contactsState, existingContacts: releaseAllContactStates(contactsState.existingContacts, referenceId) };
  if (contacts?.length) {
    return contacts.reduce((acc, newContact) => {
      // TODO: strip the totalCount property in HRM
      const { totalCount, ...contactToAdd } = newContact as Contact & { totalCount: number };
      return loadContactIntoRedux(acc, contactToAdd, referenceId);
    }, withoutOldSearchResults);
  }
  return withoutOldSearchResults;
};

// eslint-disable-next-line import/no-unused-modules,complexity
export function reduce(
  rootState: HrmState,
  inputState = initialState,
  action:
    | t.ContactsActionType
    | ExistingContactAction
    | ContactDetailsAction
    | ContactCategoryAction
    | RemoveContactStateAction
    | t.UpdatedContactAction
    | SaveContactReducerAction
    | SearchContactsSuccessAction,
): ContactsState {
  let state = boundReferralReducer(inputState, action as any);
  state = toggleSubCategoriesReducer(state, action as ContactCategoryAction);
  state = newCaseReducer(state, action as any);
  state = boundSaveContactReducer(state, action as SaveContactReducerAction);
  switch (action.type) {
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
      if (!currentContact) {
        console.warn(`No contact with task sid ${action.taskId} found in redux state`);
        return state;
      }

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
    case SET_CONTACT_DIALOG_STATE: {
      return { ...state, existingContacts: setContactDialogStateReducer(state.existingContacts, action) };
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
    case SEARCH_CONTACTS_SUCCESS: {
      return loadContactListIntoState(state, rootState.configuration, action.searchResult.contacts, `${action.taskId}-search`);
    }
    default:
      return state;
  }
}
