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

import { HrmState } from '../../../../states';
import { RecursivePartial } from '../../../RecursivePartial';
import { createCaseSection } from '../../../../services/caseSectionService';
import {
  caseSectionUpdateReducer,
  createCaseSectionAsyncAction,
} from '../../../../states/case/sections/caseSectionUpdates';
import { VALID_EMPTY_CASE } from '../../../testCases';

jest.mock('../../../../services/caseSectionService', () => ({
  createCaseSection: jest.fn(),
  updateCaseSection: jest.fn(),
}));

let state: HrmState;
const initialState: HrmState = {
  connectedCase: {
    cases: {},
  },
} as HrmState;
const CASE_ID = '1234';
const BASELINE_DATE = new Date('2000-01-01T00:00:00Z');
const mockCreateSection = createCaseSection as jest.Mock<ReturnType<typeof createCaseSection>>;

const testStore = (stateChanges: Partial<HrmState> = {}) =>
  configureStore({
    preloadedState: { ...state, ...stateChanges },
    reducer: caseSectionUpdateReducer(initialState),
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

beforeEach(() => {
  const partial: RecursivePartial<HrmState> = {
    connectedCase: {
      cases: {
        [CASE_ID]: {
          connectedCase: {
            ...VALID_EMPTY_CASE,
            sections: {
              note: [
                {
                  sectionTypeSpecificData: { text: 'existing note' },
                  sectionId: 'EXISTING_NOTE_ID',
                  twilioWorkerId: 'WK-WORKER_ID',
                  createdAt: BASELINE_DATE.toISOString(),
                },
              ],
            },
          },
        },
      },
    },
  };

  state = partial as HrmState;
});

describe('createCaseSectionAsyncAction', () => {
  const payload = { text: 'boop!' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSection.mockResolvedValue({
      sectionTypeSpecificData: payload,
      sectionId: 'SECTION_ID',
      twilioWorkerId: 'WK-WORKER_ID',
      createdAt: BASELINE_DATE.toISOString(),
    });
  });

  test('calls createCaseSection with parameters taken form the action', async () => {
    const res = createCaseSectionAsyncAction(CASE_ID, 'note', payload);
    expect(mockCreateSection).toHaveBeenCalledWith(CASE_ID, 'note', payload);
    const result = await res.payload;
    expect(result).toEqual({
      caseId: CASE_ID,
      section: {
        sectionTypeSpecificData: payload,
        sectionId: 'SECTION_ID',
        twilioWorkerId: 'WK-WORKER_ID',
        createdAt: BASELINE_DATE.toISOString(),
      },
      sectionType: 'note',
    });
  });

  describe('createCaseSectionAsyncAction completes', () => {
    const EXPECTED_CASE_SECTION = {
      sectionTypeSpecificData: payload,
      sectionId: 'SECTION_ID',
      twilioWorkerId: 'WK-WORKER_ID',
      createdAt: BASELINE_DATE.toISOString(),
    };

    test(`case already has sections of the same type - appends section to the appropriate section type list`, async () => {
      const { dispatch, getState } = testStore({});

      await ((dispatch(createCaseSectionAsyncAction(CASE_ID, 'note', payload)) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(state.connectedCase.cases[CASE_ID].connectedCase.sections.note).toHaveLength(2);
      expect(state.connectedCase.cases[CASE_ID].connectedCase.sections.note[1]).toEqual(EXPECTED_CASE_SECTION);
    });
    test(`case has no existing sections of the same type - adds an appropriate section type list with the new item as its element`, async () => {
      const { dispatch, getState } = testStore({});

      await ((dispatch(createCaseSectionAsyncAction(CASE_ID, 'referral', payload)) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(state.connectedCase.cases[CASE_ID].connectedCase.sections.note).toHaveLength(1);
      expect(state.connectedCase.cases[CASE_ID].connectedCase.sections.referral).toHaveLength(1);
      expect(state.connectedCase.cases[CASE_ID].connectedCase.sections.referral[0]).toEqual(EXPECTED_CASE_SECTION);
    });
    test(`case has no existing sections object - adds a sections object with an appropriate section type list with the new item as its element`, async () => {
      const { dispatch, getState } = testStore({
        connectedCase: {
          cases: {
            [CASE_ID]: {
              availableStatusTransitions: [],
              references: new Set(),
              caseWorkingCopy: null,
              connectedCase: VALID_EMPTY_CASE,
            },
          },
        },
      });

      await ((dispatch(createCaseSectionAsyncAction(CASE_ID, 'note', payload)) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(state.connectedCase.cases[CASE_ID].connectedCase.sections).toBeDefined();
      expect(state.connectedCase.cases[CASE_ID].connectedCase.sections.note).toHaveLength(1);
      expect(state.connectedCase.cases[CASE_ID].connectedCase.sections.note).toHaveLength(1);
      expect(state.connectedCase.cases[CASE_ID].connectedCase.sections.note[0]).toEqual(EXPECTED_CASE_SECTION);
    });
  });
});
