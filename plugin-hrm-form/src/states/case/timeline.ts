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
import { getContactActivityText, getSectionText } from './caseActivities';
import { Case, Contact } from '../../types/types';
import { getCaseTimeline, TimelineResult } from '../../services/CaseService';
import {
  CaseSectionIdentifierTimelineActivity,
  ContactIdentifierTimelineActivity,
  GET_CASE_TIMELINE_ACTION,
  GET_CASE_TIMELINE_ACTION_FULFILLED,
  isCaseSectionIdentifierTimelineActivity,
  isCaseSectionTimelineActivity,
  isContactTimelineActivity,
  TimelineActivity,
} from './types';
import { FullCaseSection } from '../../services/caseSectionService';
import { getTemplateStrings } from '../../hrmConfig';
import { selectDefinitionVersionForCase, selectDefinitionVersionForContact } from '../configuration/selectDefinitions';
import { selectCaseByCaseId } from './selectCaseStateByCaseId';
import { contactLabelFromHrmContact, ContactLabelOptions } from '../contacts/contactIdentifier';

export type PaginationSettings = { offset: number; limit: number };

export const newGetTimelineAsyncAction = createAsyncAction(
  GET_CASE_TIMELINE_ACTION,
  async (
    caseId: Case['id'],
    timelineId: string,
    sectionTypes: string[],
    includeContacts: boolean,
    pagination: PaginationSettings,
    reference: string,
  ): Promise<{
    timelineResult: TimelineResult<Date>;
    caseId: Case['id'];
    timelineId: string;
    pagination: PaginationSettings;
    reference: string;
  }> => {
    return {
      timelineResult: await getCaseTimeline(caseId, sectionTypes, includeContacts, pagination),
      caseId,
      timelineId,
      pagination,
      reference,
    };
  },
);

export const loadTimelineIntoRedux = (
  state: HrmState,
  caseId: Case['id'],
  timelineResult: TimelineResult<Date>,
  timelineId: string,
  pagination: Partial<PaginationSettings> & Pick<PaginationSettings, 'offset'> = { offset: 0 },
): HrmState => {
  const caseEntry = state.connectedCase.cases[caseId];
  if (!caseEntry) return state;
  caseEntry.timelines = caseEntry.timelines ?? {};
  caseEntry.sections = caseEntry.sections ?? {};
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
        activityType: 'case-section-id',
        activity,
      } as CaseSectionIdentifierTimelineActivity;
      caseEntry.sections[activity.sectionType] = caseEntry.sections[activity.sectionType] ?? {};
      caseEntry.sections[activity.sectionType][activity.sectionId] = activity;
    } else if (isContactTimelineActivity(timelineActivity)) {
      const { activity } = timelineActivity;
      timeline[index + pagination.offset] = {
        ...timelineActivity,
        activityType: 'contact-id',
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
};

export const timelineReducer = (initialState: HrmState): ((state: HrmState, action) => HrmState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      newGetTimelineAsyncAction.fulfilled,
      (state, { payload: { caseId, timelineId, timelineResult, pagination } }) =>
        loadTimelineIntoRedux(state, caseId, timelineResult, timelineId, pagination),
    ),
  ]);

export type GetTimelineAsyncAction = ReturnType<typeof newGetTimelineAsyncAction.fulfilled> & {
  type: typeof GET_CASE_TIMELINE_ACTION_FULFILLED;
};

export type UITimelineActivity = TimelineActivity<FullCaseSection | Contact> & { text: string; isDraft: boolean };

export const selectTimeline = (
  state: RootState,
  caseId: string,
  timelineId: string,
  { offset, limit }: PaginationSettings,
): UITimelineActivity[] | undefined => {
  const strings = getTemplateStrings();
  const caseEntry = state[namespace].connectedCase.cases[caseId];
  if (!caseEntry) return undefined;
  const { connectedCase, sections, timelines } = caseEntry;
  const timeline = timelines?.[timelineId];
  if (!timeline) return undefined;
  const definitionVersion = selectDefinitionVersionForCase(state, connectedCase);
  const timelineWindow = timeline.slice(offset, offset + limit);
  return timelineWindow
    .map(timelineActivity => {
      if (isCaseSectionIdentifierTimelineActivity(timelineActivity)) {
        const { activity } = timelineActivity;
        const section = sections?.[activity.sectionType]?.[activity.sectionId];
        if (!section) return undefined;
        return {
          ...timelineActivity,
          activityType: 'case-section',
          activity: section,
          text: getSectionText(section, definitionVersion),
          isDraft: false,
        };
      }
      const { activity } = timelineActivity;
      const contact = state[namespace].activeContacts.existingContacts[activity.contactId]?.savedContact;
      if (!contact) return undefined;
      return {
        ...timelineActivity,
        activityType: 'contact',
        activity: contact,
        text: getContactActivityText(contact, strings),
        isDraft: !Boolean(contact?.finalizedAt),
      };
    })
    .filter(Boolean) as UITimelineActivity[];
};

// eslint-disable-next-line import/no-unused-modules
export const selectTimelineCount = (
  state: RootState,
  caseId: string,
  timelineId: string,
  filter: (activity: ContactIdentifierTimelineActivity | CaseSectionIdentifierTimelineActivity) => boolean = () => true,
): number | undefined => state[namespace].connectedCase.cases[caseId]?.timelines?.[timelineId]?.filter(filter)?.length;

export const selectTimelineContactCategories = (state: RootState, caseId: string, timelineId: string) => {
  const timeline = selectTimeline(state, caseId, timelineId, { offset: 0, limit: 10000 });
  if (!timeline) {
    return undefined;
  }
  const contactActivities = timeline.filter(isContactTimelineActivity) as TimelineActivity<Contact>[];
  const timelineCategories: Record<string, string[]> = {};
  for (const { activity } of contactActivities) {
    const categoriesList = Object.entries(activity.rawJson?.categories ?? {});
    for (const [newCategory, newSubcategories] of categoriesList) {
      timelineCategories[newCategory] = Array.from(
        new Set([...(timelineCategories[newCategory] ?? []), ...newSubcategories]),
      );
    }
  }
  return timelineCategories;
};

export const selectCaseLabel = (
  state: RootState,
  caseId: string,
  timelineId: string,
  contactLabelOptions?: ContactLabelOptions,
) => {
  const caseLabelFromCase = selectCaseByCaseId(state, caseId)?.connectedCase?.label;
  if (caseLabelFromCase) return caseLabelFromCase;
  const timeline = selectTimeline(state, caseId, timelineId, { offset: 0, limit: 10000 });
  if (timeline) {
    const firstContact = timeline.find(isContactTimelineActivity) as TimelineActivity<Contact>;
    if (firstContact?.activity) {
      const def = selectDefinitionVersionForContact(state, firstContact.activity);
      return contactLabelFromHrmContact(def, firstContact.activity, contactLabelOptions);
    }
  }
  return contactLabelOptions?.placeholder ?? '';
};
