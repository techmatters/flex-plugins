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

import { StatusInfo } from 'hrm-form-definitions';

import type * as t from '../../types/types';
import { ChannelTypes } from '../DomainConstants';
import { CaseSectionTypeSpecificData } from '../../services/caseSectionService';

// Action types
export const UPDATE_CASE_ACTION = 'case-action/update-case';
export const UPDATE_CASE_ACTION_FULFILLED = `${UPDATE_CASE_ACTION}_FULFILLED` as const;
export const CREATE_CASE_ACTION = 'case-action/create-case';
export const CREATE_CASE_ACTION_FULFILLED = `${CREATE_CASE_ACTION}_FULFILLED` as const;
export const CANCEL_CASE_ACTION = 'case-action/cancel-case';

// eslint-disable-next-line prettier/prettier,import/no-unused-modules
export enum SavedCaseStatus {
  NotSaved,
  ResultPending,
  ResultReceived,
  Error,
}

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

export type CaseActionType = UpdatedCaseAction | CreateCaseAction;

type CoreActivity = {
  text: string;
  type: string;
  twilioWorkerId: string;
};

export type NoteActivity = CoreActivity & {
  id: string;
  date: string;
  type: 'note';
  note: t.Note;
  updatedAt?: string;
  updatedBy?: string;
};

export type ReferralActivity = CoreActivity & {
  id: string;
  date: string;
  createdAt: string;
  type: 'referral';
  referral: t.Referral;
  updatedAt?: string;
  updatedBy?: string;
};

export type ContactActivity = CoreActivity & {
  callType: string;
  contactId: string;
  date: string;
  createdAt: string;
  type: string;
  channel: ChannelTypes;
  isDraft: boolean;
};

export type Activity = NoteActivity | ReferralActivity | ContactActivity;

export type CaseSummaryWorkingCopy = {
  status: string;
  followUpDate: string;
  childIsAtRisk: boolean;
  summary: string;
};

export type CaseWorkingCopy = {
  sections: {
    [section: string]: {
      new?: CaseSectionTypeSpecificData;
      existing: { [id: string]: CaseSectionTypeSpecificData };
    };
  };
  caseSummary?: CaseSummaryWorkingCopy;
};

export type CaseStateEntry = {
  connectedCase: t.Case;
  caseWorkingCopy: CaseWorkingCopy;
  availableStatusTransitions: StatusInfo[];
  references: Set<string>;
};

export type CaseState = {
  cases: {
    [caseId: string]: CaseStateEntry;
  };
};

export type CaseUpdatingAction = {
  type: typeof CREATE_CASE_ACTION_FULFILLED | typeof UPDATE_CASE_ACTION_FULFILLED;
};
