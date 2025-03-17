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

import type * as t from '../../types/types';
import type { Contact } from '../../types/types';
import type { CaseSectionTypeSpecificData, FullCaseSection } from '../../services/caseSectionService';
import type { ParseFetchErrorResult } from '../parseFetchError';
import type { DereferenceCaseAction, LoadCaseAsync, ReferenceCaseAction } from './singleCase';

// Action types
export const LOAD_CASE_ACTION = 'case-action/load-case';
export const LOAD_CASE_ACTION_PENDING = `${LOAD_CASE_ACTION}_PENDING` as const;
export const LOAD_CASE_ACTION_FULFILLED = `${LOAD_CASE_ACTION}_FULFILLED` as const;
export const LOAD_CASE_ACTION_REJECTED = `${LOAD_CASE_ACTION}_REJECTED` as const;
export const REFERENCE_CASE_ACTION = 'case-action/reference-case';
export const DEREFERENCE_CASE_ACTION = 'case-action/dereference-case';
export const CREATE_CASE_ACTION = 'case-action/create-case';
export const CREATE_CASE_ACTION_FULFILLED = `${CREATE_CASE_ACTION}_FULFILLED` as const;
export const CANCEL_CASE_ACTION = 'case-action/cancel-case';
export const GET_CASE_TIMELINE_ACTION = 'case-action/get-timeline';
export const GET_CASE_TIMELINE_ACTION_FULFILLED = `${GET_CASE_TIMELINE_ACTION}_FULFILLED` as const;

// eslint-disable-next-line prettier/prettier,import/no-unused-modules
export enum SavedCaseStatus {
  NotSaved,
  ResultPending,
  ResultReceived,
  Error,
}

type LoadCaseActionPending = {
  type: typeof LOAD_CASE_ACTION_PENDING;
} & ReturnType<LoadCaseAsync['pending']>;

type LoadCaseActionFulfilled = {
  type: typeof LOAD_CASE_ACTION_FULFILLED;
} & ReturnType<LoadCaseAsync['fulfilled']>;

type LoadCaseActionRejected = {
  type: typeof LOAD_CASE_ACTION_REJECTED;
} & ReturnType<LoadCaseAsync['rejected']>;

type CreateCaseAction = {
  type: typeof CREATE_CASE_ACTION;
  payload: Promise<{ taskSid: string; case: t.Case }>;
  taskId?: string;
  meta: unknown;
};

export type CaseActionType =
  | CreateCaseAction
  | LoadCaseActionPending
  | LoadCaseActionFulfilled
  | LoadCaseActionRejected
  | ReferenceCaseAction
  | DereferenceCaseAction;

export type GenericTimelineActivity<T, TDate extends string | Date> = {
  timestamp: TDate;
  activity: T;
  activityType: 'case-section' | 'contact' | 'contact-id' | 'case-section-id';
};

export type TimelineActivity<T> = GenericTimelineActivity<T, Date>;

export const isCaseSectionTimelineActivity = (
  activity: TimelineActivity<any>,
): activity is TimelineActivity<FullCaseSection> => activity.activityType === 'case-section';

export const isContactTimelineActivity = (activity: TimelineActivity<any>): activity is TimelineActivity<Contact> =>
  activity.activityType === 'contact';

export type ContactIdentifierTimelineActivity = TimelineActivity<{ contactId: Contact['id'] }> & {
  activityType: 'contact-id';
};

export type CaseSectionIdentifierTimelineActivity = TimelineActivity<{
  sectionType: string;
  sectionId: string;
}> & {
  activityType: 'case-section-id';
};

export const isCaseSectionIdentifierTimelineActivity = (
  activity: TimelineActivity<any>,
): activity is CaseSectionIdentifierTimelineActivity => activity.activityType === 'case-section-id';

export type CaseSummaryWorkingCopy = {
  status: string;
  summary: string;
  [key: string]: string | boolean;
};

export type CaseWorkingCopy = {
  sections: Record<
    string,
    {
      new?: CaseSectionTypeSpecificData;
      existing: { [id: string]: CaseSectionTypeSpecificData };
    }
  >;

  caseSummary?: CaseSummaryWorkingCopy;
};

export type CaseStateEntry = {
  connectedCase: t.Case;
  caseWorkingCopy: CaseWorkingCopy;
  availableStatusTransitions: StatusInfo[];
  references: Set<string>;
  timelines: Record<string, (ContactIdentifierTimelineActivity | CaseSectionIdentifierTimelineActivity)[]>;
  sections: Record<string, { [sectionId: string]: FullCaseSection }>;
  loading?: boolean;
  outstandingUpdateCount: number;
  error?: ParseFetchErrorResult;
};

export type CaseState = {
  cases: {
    [caseId: t.Case['id']]: CaseStateEntry;
  };
};

export type CaseUpdatingAction = {
  type: typeof CREATE_CASE_ACTION_FULFILLED;
};
