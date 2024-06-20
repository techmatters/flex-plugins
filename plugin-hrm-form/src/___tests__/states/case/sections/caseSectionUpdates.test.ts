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
import { CaseSectionApiName, DefinitionVersion, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../../mockFetchDefinitions';
import { HrmState } from '../../../../states';
import { RecursivePartial } from '../../../RecursivePartial';
import { createCaseSection, FullCaseSection, updateCaseSection } from '../../../../services/caseSectionService';
import {
  caseSectionUpdateReducer,
  createCaseSectionAsyncAction,
  updateCaseSectionAsyncAction,
} from '../../../../states/case/sections/caseSectionUpdates';
import { VALID_EMPTY_CASE } from '../../../testCases';
import { lookupApi } from '../../../../states/case/sections/lookupApi';

jest.mock('../../../../services/caseSectionService', () => ({
  createCaseSection: jest.fn(),
  updateCaseSection: jest.fn(),
}));

const { mockFetchImplementation, buildBaseURL } = mockLocalFetchDefinitions();

let state: HrmState;
const initialState: HrmState = {
  connectedCase: {
    cases: {},
  },
} as HrmState;
const CASE_ID = '1234';
const BASELINE_DATE = new Date('2000-01-01T00:00:00Z');
const mockCreateSection = createCaseSection as jest.Mock<ReturnType<typeof createCaseSection>>;
const mockUpdateSection = updateCaseSection as jest.Mock<ReturnType<typeof updateCaseSection>>;

const noteApi = lookupApi(CaseSectionApiName.Notes);
const referralApi = lookupApi(CaseSectionApiName.Referrals);
let definitionVersion: DefinitionVersion;

const testStore = (stateChanges: Partial<HrmState> = {}) =>
  configureStore({
    preloadedState: { ...state, ...stateChanges },
    reducer: caseSectionUpdateReducer(initialState),
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.demoV1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  definitionVersion = await loadDefinition(formDefinitionsBaseUrl);
});

beforeEach(() => {
  const partial: RecursivePartial<HrmState> = {
    connectedCase: {
      cases: {
        [CASE_ID]: {
          sections: {
            note: {
              EXISTING_NOTE_ID: {
                sectionTypeSpecificData: { text: 'existing note' } as any,
                sectionId: 'EXISTING_NOTE_ID',
                createdBy: 'WK-WORKER_ID',
                createdAt: BASELINE_DATE,
                eventTimestamp: BASELINE_DATE,
              },
            },
          },
          connectedCase: {
            ...VALID_EMPTY_CASE,
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
      createdBy: 'WK-WORKER_ID',
      createdAt: BASELINE_DATE,
      eventTimestamp: BASELINE_DATE,
    });
  });

  test('calls createCaseSection with parameters taken form the action', async () => {
    const res = createCaseSectionAsyncAction(CASE_ID, noteApi, payload, definitionVersion);
    expect(mockCreateSection).toHaveBeenCalledWith(CASE_ID, 'note', payload, undefined);
    const result = await res.payload;
    expect(result).toEqual({
      caseId: CASE_ID,
      sections: [
        {
          section: {
            sectionTypeSpecificData: payload,
            sectionId: 'SECTION_ID',
            createdBy: 'WK-WORKER_ID',
            createdAt: BASELINE_DATE,
            eventTimestamp: BASELINE_DATE,
          },
          sectionType: 'note',
        },
      ],
    });
  });

  describe('createCaseSectionAsyncAction completes', () => {
    const EXPECTED_CASE_SECTION: FullCaseSection = {
      sectionTypeSpecificData: payload,
      sectionId: 'SECTION_ID',
      sectionType: 'note',
      createdBy: 'WK-WORKER_ID',
      createdAt: BASELINE_DATE,
      eventTimestamp: BASELINE_DATE,
    };

    test(`case already has sections of the same type - appends section to the appropriate section type list`, async () => {
      const { dispatch, getState } = testStore({});

      await ((dispatch(
        createCaseSectionAsyncAction(CASE_ID, noteApi, payload, definitionVersion),
      ) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(Object.keys(state.connectedCase.cases[CASE_ID].sections.note)).toHaveLength(2);
      expect(state.connectedCase.cases[CASE_ID].sections.note[EXPECTED_CASE_SECTION.sectionId]).toEqual(
        EXPECTED_CASE_SECTION,
      );
    });
    test(`case has no existing sections of the same type - adds an appropriate section type list with the new item as its element`, async () => {
      const { dispatch, getState } = testStore({});

      await ((dispatch(
        createCaseSectionAsyncAction(CASE_ID, referralApi, payload, definitionVersion),
      ) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(Object.keys(state.connectedCase.cases[CASE_ID].sections.note)).toHaveLength(1);
      expect(Object.keys(state.connectedCase.cases[CASE_ID].sections.referral)).toHaveLength(1);
      expect(state.connectedCase.cases[CASE_ID].sections.referral[EXPECTED_CASE_SECTION.sectionId]).toEqual({
        ...EXPECTED_CASE_SECTION,
        sectionType: 'referral',
      });
    });
    test(`case has no existing sections object - adds a sections object with an appropriate section type list with the new item as its element`, async () => {
      const { dispatch, getState } = testStore({
        connectedCase: {
          cases: {
            [CASE_ID]: {
              availableStatusTransitions: [],
              references: new Set(),
              caseWorkingCopy: null,
              connectedCase: { ...VALID_EMPTY_CASE },
              timelines: {},
              sections: {},
            },
          },
        },
      });

      await ((dispatch(
        createCaseSectionAsyncAction(CASE_ID, noteApi, payload, definitionVersion),
      ) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(state.connectedCase.cases[CASE_ID].sections).toBeDefined();
      expect(Object.keys(state.connectedCase.cases[CASE_ID].sections.note)).toHaveLength(1);
      expect(state.connectedCase.cases[CASE_ID].sections.note[EXPECTED_CASE_SECTION.sectionId]).toEqual(
        EXPECTED_CASE_SECTION,
      );
    });

    test(`Case exists on backend but not in redux - noop`, async () => {
      const { dispatch, getState } = testStore({});
      const oldState = getState();
      await ((dispatch(
        createCaseSectionAsyncAction('not existing case', referralApi, payload, definitionVersion),
      ) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(state).toStrictEqual(oldState);
    });

    test(`Case doesn't exist on backend - noop`, async () => {
      mockUpdateSection.mockRejectedValue({});
      const { dispatch, getState } = testStore({});
      const oldState = getState();

      try {
        await ((dispatch(
          createCaseSectionAsyncAction(CASE_ID, referralApi, payload, definitionVersion),
        ) as unknown) as PromiseLike<unknown>);
      } catch (e) {
        // Error still bubbles up so need to swallow it
      }
      const state = getState();
      expect(state).toStrictEqual(oldState);
    });
  });
});

describe('updateCaseSectionAsyncAction', () => {
  const payload = { text: 'boop!' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateSection.mockImplementation(async (caseId, sectionType, sectionId, sectionData) => ({
      sectionTypeSpecificData: sectionData,
      sectionId,
      createdBy: 'WK-WORKER_ID',
      createdAt: BASELINE_DATE,
      eventTimestamp: BASELINE_DATE,
    }));
  });

  test('calls updateCaseSection with parameters taken form the action', async () => {
    const res = updateCaseSectionAsyncAction(CASE_ID, noteApi, 'EXISTING_NOTE_ID', payload, definitionVersion);
    expect(mockUpdateSection).toHaveBeenCalledWith(CASE_ID, 'note', 'EXISTING_NOTE_ID', payload, undefined);
    const result = await res.payload;
    expect(result).toEqual({
      caseId: CASE_ID,
      sections: [
        {
          section: {
            sectionTypeSpecificData: payload,
            sectionId: 'EXISTING_NOTE_ID',
            createdBy: 'WK-WORKER_ID',
            createdAt: BASELINE_DATE,
            eventTimestamp: BASELINE_DATE,
          },
          sectionType: 'note',
        },
      ],
    });
  });

  describe('updateCaseSectionAsyncAction completes', () => {
    const EXPECTED_CASE_SECTION: FullCaseSection = {
      sectionTypeSpecificData: payload,
      sectionType: 'note',
      sectionId: 'EXISTING_NOTE_ID',
      createdBy: 'WK-WORKER_ID',
      createdAt: BASELINE_DATE,
      eventTimestamp: BASELINE_DATE,
    };

    test(`case with caseId exists & section with sectionId exists - updates the section in the appropriate type list`, async () => {
      const { dispatch, getState } = testStore({});
      await ((dispatch(
        updateCaseSectionAsyncAction(CASE_ID, noteApi, 'EXISTING_NOTE_ID', payload, definitionVersion),
      ) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(Object.keys(state.connectedCase.cases[CASE_ID].sections.note)).toHaveLength(1);
      expect(state.connectedCase.cases[CASE_ID].sections.note[EXPECTED_CASE_SECTION.sectionId]).toEqual(
        EXPECTED_CASE_SECTION,
      );
    });

    test(`case with caseId exists but section with sectionId does not exist - appends section to the appropriate section type list`, async () => {
      const { dispatch, getState } = testStore({});

      await ((dispatch(
        updateCaseSectionAsyncAction(CASE_ID, noteApi, 'NEW_NOTE_ID', payload, definitionVersion),
      ) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(Object.keys(state.connectedCase.cases[CASE_ID].sections.note)).toHaveLength(2);
      expect(state.connectedCase.cases[CASE_ID].sections.note.NEW_NOTE_ID).toEqual({
        ...EXPECTED_CASE_SECTION,
        sectionId: 'NEW_NOTE_ID',
      });
    });
    test(`case has no existing sections of the same type - adds an appropriate section type list with the new item as its element`, async () => {
      const { dispatch, getState } = testStore({});

      await ((dispatch(
        updateCaseSectionAsyncAction(CASE_ID, referralApi, 'NEW_REFERRAL_ID', payload, definitionVersion),
      ) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(Object.keys(state.connectedCase.cases[CASE_ID].sections.note)).toHaveLength(1);
      expect(Object.keys(state.connectedCase.cases[CASE_ID].sections.referral)).toHaveLength(1);
      expect(state.connectedCase.cases[CASE_ID].sections.referral.NEW_REFERRAL_ID).toEqual({
        ...EXPECTED_CASE_SECTION,
        sectionType: 'referral',
        sectionId: 'NEW_REFERRAL_ID',
      });
    });
    test(`case has no existing sections object - adds a sections object with an appropriate section type list with the new item as its element`, async () => {
      const { dispatch, getState } = testStore({
        connectedCase: {
          cases: {
            [CASE_ID]: {
              availableStatusTransitions: [],
              references: new Set(),
              caseWorkingCopy: null,
              connectedCase: { ...VALID_EMPTY_CASE },
              timelines: {},
              sections: {},
            },
          },
        },
      });

      await ((dispatch(
        updateCaseSectionAsyncAction(CASE_ID, noteApi, 'EXISTING_NOTE_ID', payload, definitionVersion),
      ) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(state.connectedCase.cases[CASE_ID].sections).toBeDefined();
      expect(Object.keys(state.connectedCase.cases[CASE_ID].sections.note)).toHaveLength(1);
      expect(state.connectedCase.cases[CASE_ID].sections.note[EXPECTED_CASE_SECTION.sectionId]).toEqual(
        EXPECTED_CASE_SECTION,
      );
    });

    test(`Case exists on backend but not in redux - noop`, async () => {
      const { dispatch, getState } = testStore({});
      const oldState = getState();

      await ((dispatch(
        updateCaseSectionAsyncAction('not existing case', referralApi, 'EXISTING_NOTE_ID', payload, definitionVersion),
      ) as unknown) as PromiseLike<unknown>);
      const state = getState();
      expect(state).toStrictEqual(oldState);
    });

    test(`Case doesn't exist on backend - noop`, async () => {
      mockUpdateSection.mockRejectedValue({});
      const { dispatch, getState } = testStore({});
      const oldState = getState();
      try {
        await ((dispatch(
          updateCaseSectionAsyncAction(CASE_ID, referralApi, 'EXISTING_NOTE_ID', payload, definitionVersion),
        ) as unknown) as PromiseLike<unknown>);
      } catch (e) {
        // Error still bubbles up so need to swallow it
      }
      const state = getState();
      expect(state).toStrictEqual(oldState);
    });
  });
});
