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

import { HelplineEntry, StatusInfo } from 'hrm-form-definitions';

import type * as t from '../../types/types';
import { CaseItemEntry, Contact } from '../../types/types';
import { ChannelTypes } from '../DomainConstants';

// Action types
export const SET_CONNECTED_CASE = 'SET_CONNECTED_CASE';
export const UPDATE_CASE_ACTION = 'case-action/update-case';
export const UPDATE_CASE_ACTION_FULFILLED = `${UPDATE_CASE_ACTION}_FULFILLED` as const;
export const CREATE_CASE_ACTION = 'case-action/create-case';
export const CREATE_CASE_ACTION_FULFILLED = `${CREATE_CASE_ACTION}_FULFILLED` as const;
export const CANCEL_CASE_ACTION = 'case-action/cancel-case';

export enum SavedCaseStatus {
  NotSaved,
  ResultPending,
  ResultReceived,
  Error,
}

type SetConnectedCaseAction = {
  type: typeof SET_CONNECTED_CASE;
  connectedCase: t.Case;
  taskId: string;
};

type UpdatedCaseAction = {
  type: typeof UPDATE_CASE_ACTION;
  payload: Promise<{ taskSid: string; case: t.Case }>;
  taskId?: string;
  meta: unknown;
};

type CreateCaseAction = {
  type: typeof CREATE_CASE_ACTION;
  payload: Promise<{ taskSid: string; case: t.Case }>;
  taskId?: string;
  meta: unknown;
};

export type CaseActionType = SetConnectedCaseAction | UpdatedCaseAction | CreateCaseAction;

export type Activity = NoteActivity | ReferralActivity | ConnectedCaseActivity;

export type NoteActivity = {
  id: string;
  date: string;
  type: 'note';
  text: string;
  note: t.Note;
  twilioWorkerId: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type ReferralActivity = {
  id: string;
  date: string;
  createdAt: string;
  type: 'referral';
  text: string;
  referral: t.Referral;
  twilioWorkerId: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type ConnectedCaseActivity = {
  callType: string;
  contactId?: string;
  date: string;
  createdAt: string;
  type: string;
  text: string;
  twilioWorkerId: string;
  channel: ChannelTypes;
  showViewButton: boolean;
};

export type CaseDetails = {
  id: number;
  contactIdentifier: string;
  categories?: {
    [category: string]: string[];
  };
  status: string;
  caseCounselor: string;
  currentCounselor: string;
  createdAt: string;
  updatedAt: string;
  followUpDate: string;
  followUpPrintedDate: string;
  households: t.HouseholdEntry[];
  perpetrators: t.PerpetratorEntry[];
  incidents: t.IncidentEntry[];
  referrals: t.ReferralEntry[];
  notes: NoteActivity[];
  documents: t.DocumentEntry[];
  summary: string;
  childIsAtRisk: boolean;
  office?: HelplineEntry;
  contact: Contact;
  contacts: any[];
};

export const caseItemHistory = (
  info: {
    updatedAt?: string;
    updatedBy?: string;
    createdAt: string;
    twilioWorkerId: string;
  },
  counselorsHash: Record<string, string>,
) => {
  const addingCounsellorName = counselorsHash[info.twilioWorkerId] || 'Unknown';
  const added = new Date(info.createdAt);
  const updatingCounsellorName = info.updatedBy ? counselorsHash[info.updatedBy] || 'Unknown' : undefined;
  const updated = info.updatedAt ? new Date(info.updatedAt) : undefined;
  return { addingCounsellorName, added, updatingCounsellorName, updated };
};

export type CaseSummaryWorkingCopy = {
  status: string;
  followUpDate: string;
  childIsAtRisk: boolean;
  summary: string;
};

export type CaseWorkingCopy = {
  sections: {
    [section: string]: {
      new?: CaseItemEntry;
      existing: { [id: string]: CaseItemEntry };
    };
  };
  caseSummary?: CaseSummaryWorkingCopy;
};
export type CaseState = {
  tasks: {
    [taskId: string]: {
      connectedCase: t.Case;
      caseWorkingCopy: CaseWorkingCopy;
      availableStatusTransitions: StatusInfo[];
    };
  };
};

export type CaseUpdatingAction = {
  type: typeof CREATE_CASE_ACTION_FULFILLED | typeof UPDATE_CASE_ACTION_FULFILLED;
};
