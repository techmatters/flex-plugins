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

import { CallTypes, DataCallTypes } from 'hrm-form-definitions';

import { CSAMReportEntry, HrmServiceContact } from '../../types/types';
import { ChannelTypes } from '../DomainConstants';
import { DraftResourceReferralState, ResourceReferral } from './resourceReferral';
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

export type TaskEntry = {
  helpline: string;
  callType: CallTypes;
  childInformation: { [key: string]: string | boolean };
  callerInformation: { [key: string]: string | boolean };
  caseInformation: { [key: string]: string | boolean };
  contactlessTask: {
    channel: ChannelTypes;
    date?: string;
    time?: string;
    createdOnBehalfOf?: string;
    [key: string]: string | boolean;
  };
  categories: string[];
  referrals?: ResourceReferral[];
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
  reservationSid?: string;
  draft: {
    resourceReferralList: DraftResourceReferralState;
  };
};
export type ContactsState = {
  tasks: {
    [taskId: string]: HrmServiceContact;
  };
  existingContacts: ExistingContactsState;
  contactDetails: ContactDetailsState;
  editingContact: boolean;
  isCallTypeCaller: boolean;
};
type UpdateFormAction = {
  type: typeof UPDATE_FORM;
  taskId: string;
  parent: keyof TaskEntry;
  payload: any;
};

type SaveEndMillisAction = {
  type: typeof SAVE_END_MILLIS;
  taskId: string;
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
  form: TaskEntry;
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
