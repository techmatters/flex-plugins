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

import { ContactRawJson, CSAMReportEntry, HrmServiceContact } from '../../types/types';
import { DraftResourceReferralState } from './resourceReferral';
import { ExistingContactsState } from './existingContacts';
import { ContactDetailsState } from './contactDetails';

// Action types
export const UPDATE_FORM = 'UPDATE_FORM';
export const SAVE_END_MILLIS = 'SAVE_END_MILLIS';
export const SET_CATEGORIES_GRID_VIEW = 'SET_CATEGORIES_GRID_VIEW';
export const HANDLE_EXPAND_CATEGORY = 'HANDLE_EXPAND_CATEGORY';
export const HANDLE_SELECT_SEARCH_RESULT = 'HANDLE_SELECT_SEARCH_RESULT';
export const PREPOPULATE_FORM = 'PREPOPULATE_FORM';
export const RESTORE_ENTIRE_FORM = 'RESTORE_ENTIRE_FORM';
export const UPDATE_HELPLINE = 'UPDATE_HELPLINE';
export const ADD_CSAM_REPORT_ENTRY = 'contacts/ADD_CSAM_REPORT_ENTRY';
export const SET_EDITING_CONTACT = 'SET_EDITING_CONTACT';
export const SET_CALL_TYPE = 'SET_CALL_TYPE';
export const UPDATE_CONTACT_ACTION = 'contact-action/update-contact';

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
  };
};

export type HrmServiceContactWithMetadata = { contact: HrmServiceContact; metadata: ContactMetadata };

export type ContactsState = {
  tasks: {
    [taskId: string]: HrmServiceContactWithMetadata;
  };
  existingContacts: ExistingContactsState;
  contactDetails: ContactDetailsState;
  editingContact: boolean;
  isCallTypeCaller: boolean;
};
type UpdateFormAction = {
  type: typeof UPDATE_FORM;
  taskId: string;
  parent: keyof ContactRawJson;
  payload: Partial<ContactRawJson[keyof ContactRawJson]>;
};

type SaveEndMillisAction = {
  type: typeof SAVE_END_MILLIS;
  taskId: string;
};

export type UpdatedContactAction = {
  type: typeof UPDATE_CONTACT_ACTION;
  payload: Promise<{ contacts: Partial<HrmServiceContact>[] }>;
  meta: unknown;
};

type SetCategoriesGridViewAction = {
  type: typeof SET_CATEGORIES_GRID_VIEW;
  gridView: boolean;
  taskId: string;
};

type HandleExpandCategoryAction = {
  type: typeof HANDLE_EXPAND_CATEGORY;
  category: string;
  taskId: string;
};

type PrePopulateFormAction = {
  type: typeof PREPOPULATE_FORM;
  callType: DataCallTypes | null;
  values: { [property: string]: string };
  taskId: string;
  isCaseInfo: Boolean;
};

type RestoreEntireFormAction = {
  type: typeof RESTORE_ENTIRE_FORM;
  contact: HrmServiceContactWithMetadata;
  taskId: string;
};

type UpdateHelpline = {
  type: typeof UPDATE_HELPLINE;
  helpline: string;
  taskId: string;
};

type AddCSAMReportEntry = {
  type: typeof ADD_CSAM_REPORT_ENTRY;
  csamReportEntry: CSAMReportEntry;
  taskId: string;
};

type SetEditingContact = {
  type: typeof SET_EDITING_CONTACT;
  editing: boolean;
};

type CheckButtonDataAction = {
  type: typeof SET_CALL_TYPE;
  isCallTypeCaller: boolean;
};

export type ContactsActionType =
  | UpdateFormAction
  | SaveEndMillisAction
  | SetCategoriesGridViewAction
  | HandleExpandCategoryAction
  | PrePopulateFormAction
  | RestoreEntireFormAction
  | UpdateHelpline
  | AddCSAMReportEntry
  | SetEditingContact
  | CheckButtonDataAction;
