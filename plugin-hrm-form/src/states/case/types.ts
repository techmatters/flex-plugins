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
import { Contact, WellKnownCaseSection } from '../../types/types';
import { CaseSectionTypeSpecificData, FullCaseSection } from '../../services/caseSectionService';

// Action types
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

type CreateCaseAction = {
  type: typeof CREATE_CASE_ACTION;
  payload: Promise<{ taskSid: string; case: t.Case }>;
  taskId?: string;
  meta: unknown;
};

export type CaseActionType = CreateCaseAction;

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
  sectionType: WellKnownCaseSection;
  sectionId: string;
}> & {
  activityType: 'case-section-id';
};

export const isCaseSectionIdentifierTimelineActivity = (
  activity: TimelineActivity<any>,
): activity is CaseSectionIdentifierTimelineActivity => activity.activityType === 'case-section-id';

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
  timelines: Record<string, (ContactIdentifierTimelineActivity | CaseSectionIdentifierTimelineActivity)[]>;
  sections: { [sectionType in WellKnownCaseSection]?: { [sectionId: string]: FullCaseSection } };
};

export type CaseState = {
  cases: {
    [caseId: string]: CaseStateEntry;
  };
};

export type CaseUpdatingAction = {
  type: typeof CREATE_CASE_ACTION_FULFILLED;
};
