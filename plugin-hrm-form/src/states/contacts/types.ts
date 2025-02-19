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

import { DataCallTypes } from 'hrm-form-definitions';

import { Case, Contact } from '../../types/types';
import { DraftResourceReferralState } from './resourceReferral';
import { ExistingContactsState } from './existingContacts';
import { ContactDetailsState } from './contactDetails';

// Action types
export const SAVE_END_MILLIS = 'SAVE_END_MILLIS';
export const PREPOPULATE_FORM = 'PREPOPULATE_FORM';
export const CREATE_CONTACT_ACTION = 'contact-action/create-contact' as const;
export const CREATE_CONTACT_ACTION_FULFILLED = `${CREATE_CONTACT_ACTION}_FULFILLED` as const;
export const UPDATE_CONTACT_ACTION = 'contact-action/update-contact' as const;
export const UPDATE_CONTACT_ACTION_FULFILLED = `${UPDATE_CONTACT_ACTION}_FULFILLED` as const;
export const LOAD_CONTACT_FROM_HRM_BY_ID_ACTION = 'contact-action/load-contact-from-hrm-by-id' as const;

export const LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION = 'contact-action/load-contact-from-hrm-for-task' as const;
export const LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED = `${LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION}_FULFILLED` as const;
export const CONNECT_TO_CASE = 'contact-action/connect-to-case' as const;
export const REMOVE_FROM_CASE = 'contact-action/remove-from-case' as const;
export const CONNECT_TO_CASE_ACTION_FULFILLED = `${CONNECT_TO_CASE}_FULFILLED` as const;
export const REMOVE_FROM_CASE_ACTION_FULFILLED = `${REMOVE_FROM_CASE}_FULFILLED` as const;
export const SET_SAVED_CONTACT = 'contact-action/set-saved-contact' as const;
export const FINALIZE_CONTACT = 'contact-action/finalize-contact' as const;
export const SUBMIT_AND_FINALIZE_CONTACT_FROM_OUTSIDE_TASK_CONTEXT = 'contact-action/submit-and-finalize-contact-from-outside-task-context' as const;
export const CASE_CONNECTED_TO_CONTACT = 'CASE_CONNECTED_TO_CONTACT' as const;

export const LoadingStatus = {
  LOADING: 'loading',
  LOADED: 'loaded',
} as const;

export type LoadingStatus = typeof LoadingStatus[keyof typeof LoadingStatus];

export const LlmAssistantStatus = {
  READY: 'ready',
  WORKING: 'working',
  ERROR: 'error',
} as const;

export type LlmAssistantStatus = typeof LlmAssistantStatus[keyof typeof LlmAssistantStatus];

export type ContactMetadata = {
  startMillis: number;
  endMillis: number;
  recreated: boolean;
  categories: {
    gridView: boolean;
    expanded: { [key: string]: boolean };
  };
  draft: {
    resourceReferralList: DraftResourceReferralState;
    dialogsOpen: { [key: string]: boolean };
  };
  loadingStatus: LoadingStatus;
  llmAssistant: {
    status: LlmAssistantStatus;
    lastError?: Error;
  };
};

export type ContactsState = {
  existingContacts: ExistingContactsState;
  contactsBeingCreated: Set<string>;
  contactDetails: ContactDetailsState;
};

type SaveEndMillisAction = {
  type: typeof SAVE_END_MILLIS;
  taskId: string;
};

export type UpdatedContactAction = {
  type: typeof UPDATE_CONTACT_ACTION;
  payload: Promise<{ contact: Contact }>;
  meta: unknown;
};

type PrePopulateFormAction = {
  type: typeof PREPOPULATE_FORM;
  callType: DataCallTypes | null;
  values: { [property: string]: string };
  taskId: string;
  isCaseInfo: Boolean;
};

type CaseConnectedToContactAction = {
  type: typeof CASE_CONNECTED_TO_CONTACT;
  caseConnectedToContact: Case;
  contactId: string;
};

export type ContactsActionType = SaveEndMillisAction | PrePopulateFormAction | CaseConnectedToContactAction;

export type ContactUpdatingAction = {
  type:
    | typeof CREATE_CONTACT_ACTION_FULFILLED
    | typeof UPDATE_CONTACT_ACTION_FULFILLED
    | typeof CONNECT_TO_CASE_ACTION_FULFILLED
    | typeof REMOVE_FROM_CASE_ACTION_FULFILLED
    | typeof LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED;
  payload: { contact: Contact; contactCase?: Case; previousContact?: Contact };
};

export type ContactConnectingAction = {
  type: typeof CONNECT_TO_CASE_ACTION_FULFILLED;
};
