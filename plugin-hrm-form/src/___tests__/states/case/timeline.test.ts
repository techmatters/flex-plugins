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

import promiseMiddleware from 'redux-promise-middleware';
import { configureStore } from '@reduxjs/toolkit';
import each from 'jest-each';
import { addHours } from 'date-fns';

import { VALID_EMPTY_CASE } from '../../testCases';
import { getCaseTimeline, TimelineResult } from '../../../services/CaseService';
import { HrmState } from '../../../states';
import { newGetTimelineAsyncAction, PaginationSettings, timelineReducer } from '../../../states/case/timeline';
import { RecursivePartial } from '../../RecursivePartial';
import { CaseSectionIdentifierTimelineActivity, CaseStateEntry, TimelineActivity } from '../../../states/case/types';
import { FullCaseSection } from '../../../services/caseSectionService';

jest.mock('../../../services/CaseService', () => ({
  getCaseTimeline: jest.fn(),
}));

const TEST_CASE_ID = 'case-id';
const TEST_TIMELINE_ID = 'timeline-id';
const SAMPLE_PAGINATION = {
  offset: 123,
  limit: 456,
};
const BASE_DATE = new Date(2001, 1, 1);

const EMPTY_RESPONSE: TimelineResult<Date> = {
  count: 0,
  activities: [],
};

const partialState: RecursivePartial<HrmState> = {
  connectedCase: {
    cases: {
      [TEST_CASE_ID]: {
        connectedCase: VALID_EMPTY_CASE,
        timelines: {},
        references: {},
        caseWorkingCopy: undefined,
        sections: {},
      },
    },
  },
};

const timelineState = partialState as HrmState;

const boundTimelineReducer = timelineReducer(timelineState);

const testStore = (stateChanges: HrmState) =>
  configureStore({
    preloadedState: { ...timelineState, ...stateChanges },
    reducer: boundTimelineReducer,
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

const mockGetCaseTimeline = getCaseTimeline as jest.MockedFunction<typeof getCaseTimeline>;

const newSampleCaseSection = (
  sectionType: string,
  sectionId: string,
  eventTimestampHoursAfterBaseline: number = 0,
): FullCaseSection => ({
  sectionId,
  sectionType,
  sectionTypeSpecificData: { label: `${sectionType}/${sectionId}` },
  eventTimestamp: addHours(BASE_DATE, eventTimestampHoursAfterBaseline),
  createdAt: addHours(BASE_DATE, eventTimestampHoursAfterBaseline),
  createdBy: 'WK-test-user',
});

const wrapCaseSectionInTimelineActivity = (section: FullCaseSection): TimelineActivity<FullCaseSection> => ({
  timestamp: section.eventTimestamp,
  activityType: 'case-section',
  activity: section,
});
const newCaseSectionIdTimelineActivity = ({
  sectionType,
  sectionId,
  eventTimestamp,
}: FullCaseSection): CaseSectionIdentifierTimelineActivity => ({
  timestamp: eventTimestamp,
  activityType: 'case-section-id',
  activity: { sectionType, sectionId },
});

describe('newGetTimelineAsyncAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCaseTimeline.mockResolvedValue(EMPTY_RESPONSE);
  });

  test('Passes action parameters down to service call', async () => {
    const action = newGetTimelineAsyncAction(
      TEST_CASE_ID,
      TEST_TIMELINE_ID,
      ['note', 'household'],
      true,
      SAMPLE_PAGINATION,
    );
    expect(getCaseTimeline).toHaveBeenCalledWith(TEST_CASE_ID, ['note', 'household'], true, SAMPLE_PAGINATION);

    const payload = await action.payload;
    expect(payload).toStrictEqual({
      timelineResult: EMPTY_RESPONSE,
      timelineId: TEST_TIMELINE_ID,
      caseId: TEST_CASE_ID,
      pagination: SAMPLE_PAGINATION,
    });
  });

  describe('fulfilled', () => {
    type TestCase = {
      description: string;
      pagination: PaginationSettings;
      apiResponse: TimelineResult<Date>;
      existingTimelines?: CaseStateEntry['timelines'];
      expectedTimelines: CaseStateEntry['timelines'];
      expectedSections: CaseStateEntry['sections'];
    };

    const testCases: TestCase[] = [
      {
        description: "case exists in redux store but timeline doesn't, empty result returned - adds empty timeline",
        pagination: SAMPLE_PAGINATION,
        apiResponse: EMPTY_RESPONSE,
        expectedTimelines: {
          [TEST_TIMELINE_ID]: [],
        },
        expectedSections: {},
      },
      {
        description: "case exists in redux store but timeline doesn't, full result returned - adds full timeline",
        pagination: { offset: 0, limit: 10 },
        apiResponse: {
          count: 3,
          activities: [
            wrapCaseSectionInTimelineActivity(newSampleCaseSection('note', 'note-2', 2)),
            wrapCaseSectionInTimelineActivity(newSampleCaseSection('household', 'household-1', 1)),
            wrapCaseSectionInTimelineActivity(newSampleCaseSection('note', 'note-1')),
          ],
        },
        expectedTimelines: {
          [TEST_TIMELINE_ID]: [
            newCaseSectionIdTimelineActivity(newSampleCaseSection('note', 'note-2', 2)),
            newCaseSectionIdTimelineActivity(newSampleCaseSection('household', 'household-1', 1)),
            newCaseSectionIdTimelineActivity(newSampleCaseSection('note', 'note-1')),
          ],
        },
        expectedSections: {
          note: {
            'note-1': newSampleCaseSection('note', 'note-1'),
            'note-2': newSampleCaseSection('note', 'note-2', 2),
          },
          household: {
            'household-1': newSampleCaseSection('household', 'household-1', 1),
          },
        },
      },
    ];
    each(testCases).test(
      '$description',
      async ({ existingTimelines, pagination, apiResponse, expectedTimelines, expectedSections }: TestCase) => {
        const { getState, dispatch } = testStore({
          ...timelineState,
          connectedCase: {
            ...timelineState.connectedCase,
            cases: {
              ...timelineState.connectedCase.cases,
              [TEST_CASE_ID]: {
                ...timelineState.connectedCase.cases[TEST_CASE_ID],
                ...(existingTimelines ? { timelines: existingTimelines } : {}),
              },
            },
          },
        });
        const {
          connectedCase: {
            cases: {
              [TEST_CASE_ID]: { timelines: startingTimeline, sections: startingSections, ...startingRest },
            },
          },
        } = getState() as HrmState;
        mockGetCaseTimeline.mockResolvedValue(apiResponse);
        await ((dispatch(
          newGetTimelineAsyncAction(TEST_CASE_ID, TEST_TIMELINE_ID, ['note', 'household'], true, pagination),
        ) as unknown) as PromiseLike<void>);
        const {
          connectedCase: {
            cases: {
              [TEST_CASE_ID]: { timelines: updatedTimeline, sections, ...rest },
            },
          },
        } = getState() as HrmState;
        expect(updatedTimeline).toEqual(expectedTimelines);
        expect(sections).toEqual(expectedSections);
        expect(rest).toEqual(startingRest);
      },
    );
  });
});
