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

import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { HrmState, RootState } from '..';
import { namespace } from '../storeNamespaces';
import { getActivitiesFromCase, getActivitiesFromContacts, getActivityCount, sortActivities } from './caseActivities';
import { selectSavedContacts } from './connectedContacts';
import { Case, Contact, WellKnownCaseSection } from '../../types/types';
import { getCaseTimeline, TimelineResult } from '../../services/CaseService';
import {
  CaseSectionIdentifierTimelineActivity,
  ContactIdentifierTimelineActivity,
  GET_CASE_TIMELINE_ACTION,
  isCaseSectionIdentifierTimelineActivity,
  isCaseSectionTimelineActivity,
  isContactTimelineActivity,
  TimelineActivity,
} from './types';
import { FullCaseSection } from '../../services/caseSectionService';

/**
 * @deprecated - This uses the connectedContacts & caseSections within the case to put together an activity timeline
 * These are legacy data locations and will be removed
 * Use selectTimeline instead, this uses the 'timelines' & 'sections' properties on the case state entry and the existing contacts state, populated from the case timeline endpoint
 */
export const selectCaseActivities = (state: RootState, caseId: string, pageSize: number, page: number) => {
  const {
    [namespace]: { configuration, connectedCase },
  } = state;
  const { definitionVersions, currentDefinitionVersion } = configuration;
  const caseState = connectedCase.cases[caseId];

  if (!caseState?.connectedCase) return [];

  const { connectedCase: caseForTask } = caseState;

  const timelineActivities = [
    ...getActivitiesFromCase(
      caseForTask,
      definitionVersions[caseForTask.info.definitionVersion] ?? currentDefinitionVersion,
    ),
    ...getActivitiesFromContacts(selectSavedContacts(state, caseForTask)),
  ];
  return sortActivities(timelineActivities).slice(page * pageSize, (page + 1) * pageSize);
};

export const selectCaseActivityCount = ({ [namespace]: { connectedCase } }: RootState, caseId: string) =>
  getActivityCount(connectedCase.cases[caseId]?.connectedCase) ?? 0;

type PaginationSettings = { offset: number; limit: number };

export const newGetTimelineAsyncAction = createAsyncAction(
  GET_CASE_TIMELINE_ACTION,
  async (
    caseId: Case['id'],
    timelineId: string,
    sectionTypes: WellKnownCaseSection[],
    includeContacts: boolean,
    pagination: PaginationSettings,
  ): Promise<{
    timelineResult: TimelineResult<Date>;
    caseId: Case['id'];
    timelineId: string;
    pagination: PaginationSettings;
  }> => {
    return {
      timelineResult: await getCaseTimeline(caseId, sectionTypes, includeContacts, pagination),
      caseId,
      timelineId,
      pagination,
    };
  },
);

export const timelineReducer = (initialState: HrmState): ((state: HrmState, action) => HrmState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      newGetTimelineAsyncAction.fulfilled,
      (state, { payload: { caseId, timelineId, timelineResult, pagination } }) => {
        const caseEntry = state.connectedCase.cases[caseId];
        if (!caseEntry) return state;
        let timeline: (CaseSectionIdentifierTimelineActivity | ContactIdentifierTimelineActivity)[] =
          caseEntry.timelines[timelineId] ?? [];
        if (timeline.length !== timelineResult.count) {
          timeline = [];
          timeline.length = timelineResult.count;
        }
        timelineResult.activities.forEach((timelineActivity, index) => {
          if (isCaseSectionTimelineActivity(timelineActivity)) {
            const { activity } = timelineActivity;
            timeline[index + pagination.offset] = {
              ...timelineActivity,
              activity: { sectionType: activity.sectionType, sectionId: activity.sectionId },
            } as CaseSectionIdentifierTimelineActivity;
            caseEntry.sections[activity.sectionType] = caseEntry.sections[activity.sectionType] ?? {};
            caseEntry.sections[activity.sectionType][activity.sectionId] = activity;
          } else if (isContactTimelineActivity(timelineActivity)) {
            const { activity } = timelineActivity;
            timeline[index + pagination.offset] = {
              ...timelineActivity,
              activity: { contactId: activity.id },
            } as ContactIdentifierTimelineActivity;
          }
        });
        caseEntry.timelines[timelineId] = timeline;
        return {
          ...state,
          connectedCase: {
            ...state.connectedCase,
            cases: {
              ...state.connectedCase.cases,
              [caseId]: caseEntry,
            },
          },
        };
      },
    ),
  ]);

export type GetTimelineAsyncAction = ReturnType<typeof newGetTimelineAsyncAction.fulfilled> & {
  type: typeof GET_CASE_TIMELINE_ACTION;
};

export const selectTimeline = (
  state: RootState,
  caseId: string,
  timelineId: string,
  { offset, limit }: PaginationSettings,
): TimelineActivity<FullCaseSection | Contact>[] | undefined => {
  const caseEntry = state[namespace].connectedCase.cases[caseId];
  if (!caseEntry) return undefined;
  const timeline = caseEntry.timelines[timelineId];
  if (!timeline) return undefined;
  const timelineWindow = timeline.slice(offset, offset + limit);
  return timelineWindow.map(timelineActivity => {
    if (isCaseSectionIdentifierTimelineActivity(timelineActivity)) {
      const { activity } = timelineActivity;
      const section = caseEntry.sections[activity.sectionType]?.[activity.sectionId];
      return {
        ...timelineActivity,
        activity: section,
      };
    }
    const { activity } = timelineActivity;
    const contact = state[namespace].activeContacts.existingContacts[activity.contactId]?.savedContact;
    return {
      ...timelineActivity,
      activity: contact,
    };
  });
};

// eslint-disable-next-line import/no-unused-modules
export const selectTimelineCount = (state: RootState, caseId: string, timelineId: string): number | undefined =>
  state[namespace].connectedCase.cases[caseId]?.timelines[timelineId]?.length;
