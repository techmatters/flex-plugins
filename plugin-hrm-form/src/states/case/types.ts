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

import type { StatusInfo } from 'hrm-form-definitions';

import type { WellKnownCaseSection } from '../../types/types';
import type { CaseSectionTypeSpecificData } from '../../services/caseSectionService';
import type { WorkerSID } from '../../types/twilio';
import type { ChannelTypes } from '../DomainConstants';
import type * as t from '../../types/types';
import type { LoadCaseAsync } from './case';

// Action types
export const CREATE_CASE_ACTION = 'case-action/create-case';
export const LOAD_CASE_ACTION = 'case-action/load-case';
export const LOAD_CASE_ACTION_PENDING = `${LOAD_CASE_ACTION}_PENDING` as const;
export const LOAD_CASE_ACTION_FULFILLED = `${LOAD_CASE_ACTION}_FULFILLED` as const;
export const LOAD_CASE_ACTION_REJECTED = `${LOAD_CASE_ACTION}_REJECTED` as const;
export const CREATE_CASE_ACTION_FULFILLED = `${CREATE_CASE_ACTION}_FULFILLED` as const;
export const CANCEL_CASE_ACTION = 'case-action/cancel-case';

// eslint-disable-next-line prettier/prettier,import/no-unused-modules
export enum SavedCaseStatus {
  NotSaved,
  ResultPending,
  ResultReceived,
  Error,
}

type CreateCaseAction = {
  type: typeof CREATE_CASE_ACTION;
  payload: Promise<{ taskSid: string; case: t.Case }>;
  taskId?: string;
  meta: unknown;
};

type LoadCaseActionPending = {
  type: typeof LOAD_CASE_ACTION_PENDING;
} & ReturnType<LoadCaseAsync['pending']>;

type LoadCaseActionFulfilled = {
  type: typeof LOAD_CASE_ACTION_FULFILLED;
} & ReturnType<LoadCaseAsync['fulfilled']>;

type LoadCaseActionRejected = {
  type: typeof LOAD_CASE_ACTION_REJECTED;
} & ReturnType<LoadCaseAsync['rejected']>;

export type CaseActionType =
  | CreateCaseAction
  | LoadCaseActionPending
  | LoadCaseActionFulfilled
  | LoadCaseActionRejected;

type CoreActivity = {
  text: string;
  type: string;
  twilioWorkerId: WorkerSID;
};

export type NoteActivity = CoreActivity & {
  id: string;
  date: string;
  type: 'note';
  note: t.Note;
  updatedAt?: string;
  updatedBy?: WorkerSID;
};

export type ReferralActivity = CoreActivity & {
  id: string;
  date: string;
  createdAt: string;
  type: 'referral';
  referral: t.Referral;
  updatedAt?: string;
  updatedBy?: WorkerSID;
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
    [section in WellKnownCaseSection]?: {
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
  loading?: boolean;
  error?: any; // TODO: do better
};

export type CaseState = {
  cases: {
    [caseId: string]: CaseStateEntry;
  };
};

export type CaseUpdatingAction = {
  type: typeof CREATE_CASE_ACTION_FULFILLED;
};
