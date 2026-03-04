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
import { callTypes } from 'hrm-types';
import { createReducer } from 'redux-promise-middleware-actions';

import * as t from './types';
import {
  ContactsState,
  CREATE_CONTACT_ACTION,
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
import { createCaseAsyncAction, CreateCaseAsyncActionFulfilled } from '../case/saveCase';
import { saveContactReducer } from './saveContact';
import { ConfigurationState } from '../configuration/reducer';
import { Contact } from '../../types/types';
import {
  CREATE_CASE_ACTION_FULFILLED,
  GET_CASE_TIMELINE_ACTION_FULFILLED,
  isContactTimelineActivity
} from '../case/types';
import { GetTimelineAsyncAction } from '../case/timeline';
import {llmAssistantReducer} from "./llmAssistant";
import {loadContactIntoRedux} from "./contactReduxUpdates";
import {SEARCH_CONTACTS_SUCCESS_ACTION, SearchCasesSuccessAction, SearchContactsSuccessAction} from "../search/results";
import { ExistingContactsState } from './existingContacts';
import { isStale } from '../staleTimeout';

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
const boundLlmAssistantReducer = llmAssistantReducer(initialState);

type SaveContactReducerAction = Parameters<typeof boundSaveContactReducer>[1] &
  { type:
    // eslint-disable-next-line prettier/prettier
      `${typeof CREATE_CONTACT_ACTION
      | typeof UPDATE_CONTACT_ACTION
      | typeof SET_SAVED_CONTACT}_${string}`
  };

type LlmAssistantReducerAction = Parameters<typeof boundLlmAssistantReducer>[1]

const newCaseReducer = createReducer(initialState, handleAction => [
  handleAction(
    createCaseAsyncAction.fulfilled,
    (state: ContactsState, { payload: { newCase: connectedCase, connectedContact } }) => {
      const existingContactState = state.existingContacts[connectedContact.id];
      if (!existingContactState) {
        return state;
      }
      existingContactState.savedContact.caseId = connectedCase.id;
      return {
        ...state,
        existingContacts: {
          ...state.existingContacts,
          ...{ [connectedContact.id]: existingContactState },
        },
      };
    },
  ),
]);

const garbageCollectContacts = (existingContacts: ExistingContactsState): ExistingContactsState => {
  return Object.fromEntries(
    Object.entries(existingContacts).filter(([, contactEntry]) => {
      if (contactEntry.draftContact !== undefined) return true;
      return !isStale(contactEntry.lastReferencedDate);
    }),
  );
};

const loadContactListIntoState = (
  contactsState: ContactsState,
  configurationState: ConfigurationState,
  contacts: Contact[],
  _referenceId: string,
  releaseExisting: boolean = true,
): ContactsState => {
  if (contacts?.length) {
    return contacts.reduce((acc, newContact) => {
      // TODO: strip the totalCount property in HRM
      const { totalCount, ...contactToAdd } = newContact as Contact & { totalCount: number };
      return loadContactIntoRedux(acc, contactToAdd);
    }, contactsState);
  }
  return contactsState;
};

// eslint-disable-next-line import/no-unused-modules,complexity
export function reduce(
  rootState: HrmState,
  inputState = initialState,
  inputAction:
    | t.ContactsActionType
    | ExistingContactAction
    | ContactDetailsAction
    | ContactCategoryAction
    | RemoveContactStateAction
    | t.UpdatedContactAction
    | SaveContactReducerAction
    | SearchContactsSuccessAction
    | SearchCasesSuccessAction
  | GetTimelineAsyncAction
  | CreateCaseAsyncActionFulfilled
): ContactsState {
  let state = boundReferralReducer(inputState, inputAction as any);
  state = toggleSubCategoriesReducer(state, inputAction as ContactCategoryAction);
  state = newCaseReducer(state, inputAction as any);
  state = boundSaveContactReducer(state, inputAction as SaveContactReducerAction);
  state = boundLlmAssistantReducer(state, inputAction as LlmAssistantReducerAction);

  const action: Exclude<typeof inputAction, SaveContactReducerAction> = inputAction as any;
  let updatedState: ContactsState;
  switch (action.type) {
    case REMOVE_CONTACT_STATE: {
      const contactId = Object.values(state.existingContacts).find(cs => cs.savedContact.taskId === action.taskId)
        ?.savedContact.id;
      updatedState = {
        ...state,
        existingContacts: omit(state.existingContacts, contactId),
      };
      break;
    }
    case t.SAVE_END_MILLIS: {
      const currentContact = Object.values(state.existingContacts).find(cs => cs.savedContact.taskId === action.taskId);
      if (!currentContact) {
        console.warn(`No contact with task sid ${action.taskId} found in redux state`);
        updatedState = state;
        break;
      }

      const { metadata } = currentContact;
      const endedTask = { ...currentContact, metadata: { ...metadata, endMillis: new Date().getTime() } };

      updatedState = {
        ...state,
        existingContacts: {
          ...state.existingContacts,
          [currentContact.savedContact.id]: endedTask,
        },
      };
      break;
    }
    case t.PREPOPULATE_FORM: {
      const currentContact = Object.values(state.existingContacts).find(cs => cs.savedContact.taskId === action.taskId)
        .savedContact;
      if (!currentContact) {
        console.warn(`No contact with task sid ${action.taskId} found in redux state`);
        updatedState = state;
        break;
      }
      const { callType, values, isCaseInfo } = action;
      let formName = callType === callTypes.child ? 'childInformation' : 'callerInformation';
      if (isCaseInfo) formName = 'caseInformation';

      updatedState = {
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
      break;
    }
    case LOAD_CONTACT_ACTION: {
      updatedState = { ...state, existingContacts: loadContactReducer(state.existingContacts, action) };
      break;
    }
    case EXISTING_CONTACT_LOAD_TRANSCRIPT: {
      updatedState = { ...state, existingContacts: loadTranscriptReducer(state.existingContacts, action) };
      break;
    }
    case EXISTING_CONTACT_TOGGLE_CATEGORY_EXPANDED_ACTION: {
      updatedState = { ...state, existingContacts: toggleCategoryExpandedReducer(state.existingContacts, action) };
      break;
    }
    case EXISTING_CONTACT_SET_CATEGORIES_GRID_VIEW_ACTION: {
      updatedState = { ...state, existingContacts: setCategoriesGridViewReducer(state.existingContacts, action) };
      break;
    }
    case TOGGLE_DETAIL_EXPANDED_ACTION: {
      updatedState = { ...state, contactDetails: sectionExpandedStateReducer(state.contactDetails, action) };
      break;
    }
    case SET_CONTACT_DIALOG_STATE: {
      updatedState = { ...state, existingContacts: setContactDialogStateReducer(state.existingContacts, action) };
      break;
    }
    case EXISTING_CONTACT_UPDATE_DRAFT_ACTION: {
      updatedState = {
        ...state,
        existingContacts: updateDraftReducer(state.existingContacts, rootState.configuration, action),
      };
      break;
    }
    case EXISTING_CONTACT_CREATE_DRAFT_ACTION: {
      updatedState = { ...state, existingContacts: createDraftReducer(state.existingContacts, action) };
      break;
    }
    case ADD_EXTERNAL_REPORT_ENTRY: {
      updatedState = { ...state, existingContacts: addExternalReportEntryReducer(state.existingContacts, action) };
      break;
    }
    case SEARCH_CONTACTS_SUCCESS_ACTION: {
      updatedState = loadContactListIntoState(state, rootState.configuration, action.payload.searchResult.contacts, `${action.payload.taskSid}-search-contact`);
      break;
    }
    case GET_CASE_TIMELINE_ACTION_FULFILLED: {
      const { payload: { timelineResult: { activities }, reference } } = action;
      const contacts = activities.filter(isContactTimelineActivity).map(({ activity })=> activity);
      updatedState = loadContactListIntoState(state, rootState.configuration, contacts, reference, false);
      break;
    }
    case CREATE_CASE_ACTION_FULFILLED: {
      const { payload: { connectedContact } } = action as CreateCaseAsyncActionFulfilled;
      updatedState = loadContactIntoRedux(state, connectedContact);
      break;
    }
    default:
      updatedState = state;
  }
  return { ...updatedState, existingContacts: garbageCollectContacts(updatedState.existingContacts) };
}
