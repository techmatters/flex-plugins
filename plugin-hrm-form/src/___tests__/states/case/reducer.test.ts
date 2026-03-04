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

import { DefinitionVersion, loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import { reduce } from '../../../states/case/reducer';
import * as GeneralActions from '../../../states/actions';
import { Case } from '../../../types/types';
import { REMOVE_CONTACT_STATE } from '../../../states/types';
import { HrmState } from '../../../states';
import { STALE_CONTACT_CASE_MINUTES } from '../../../states/staleTimeout';

const task = { taskSid: 'task1' };
const stubRootState = { configuration: { definitionVersions: {} }, connectedCase: { cases: {} } } as HrmState;

jest.mock('../../../states/case/caseStatus', () => ({
  getAvailableCaseStatusTransitions: jest.fn(),
}));

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

beforeEach(() => {
  mockReset();
});

describe('test reducer', () => {
  let mockV1: DefinitionVersion;

  const connectedCase: Case = {
    accountSid: 'ACxxx',
    id: '1',
    helpline: '',
    status: 'open',
    twilioWorkerId: 'WK123',
    info: {
      definitionVersion: 'as-v1',
    },
    createdAt: '2020-07-31T20:39:37.408Z',
    updatedAt: '2020-07-31T20:39:37.408Z',
    categories: {},
  };

  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL('as-v1');
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  });

  test('should return initial state', async () => {
    const result = reduce(stubRootState, {
      type: REMOVE_CONTACT_STATE,
      taskId: 'TEST_TASK_ID',
      contactId: 'TEST_CONTACT_ID',
    });
    expect(result).toStrictEqual(stubRootState);
  });

  test('REMOVE_CONTACT_STATE - does not immediately remove cases (GC handles removal)', async () => {
    const recentDate = new Date();
    const state = {
      ...stubRootState,
      connectedCase: {
        cases: {
          1: {
            connectedCase,
            caseWorkingCopy: { sections: {} },
            availableStatusTransitions: Object.values(mockV1.caseStatus),
            lastReferencedDate: recentDate,
            sections: {},
            timelines: {},
            outstandingUpdateCount: 0,
          },
        },
      },
    } as HrmState;

    const result = reduce(state, GeneralActions.removeContactState(task.taskSid, undefined));
    // Case still present because it's not stale
    expect(result.connectedCase.cases[1]).toBeDefined();
  });

  test('GC - removes stale cases without draft updates', async () => {
    const staleDate = new Date(Date.now() - (STALE_CONTACT_CASE_MINUTES + 1) * 60 * 1000);
    const state = {
      ...stubRootState,
      connectedCase: {
        cases: {
          1: {
            connectedCase,
            caseWorkingCopy: { sections: {} },
            availableStatusTransitions: Object.values(mockV1.caseStatus),
            lastReferencedDate: staleDate,
            sections: {},
            timelines: {},
            outstandingUpdateCount: 0,
          },
        },
      },
    } as HrmState;

    const result = reduce(state, GeneralActions.removeContactState(task.taskSid, undefined));
    // Stale case with no drafts should be removed by GC
    expect(result.connectedCase.cases[1]).toBeUndefined();
  });

  test('GC - preserves stale cases that have draft updates in sections', async () => {
    const staleDate = new Date(Date.now() - (STALE_CONTACT_CASE_MINUTES + 1) * 60 * 1000);
    const state = {
      ...stubRootState,
      connectedCase: {
        cases: {
          1: {
            connectedCase,
            caseWorkingCopy: {
              sections: {
                household: {
                  new: { age: 10 },
                  existing: {},
                },
              },
            },
            availableStatusTransitions: Object.values(mockV1.caseStatus),
            lastReferencedDate: staleDate,
            sections: {},
            timelines: {},
            outstandingUpdateCount: 0,
          },
        },
      },
    } as HrmState;

    const result = reduce(state, GeneralActions.removeContactState(task.taskSid, undefined));
    // Case with draft updates should NOT be removed even if stale
    expect(result.connectedCase.cases[1]).toBeDefined();
  });

  test('GC - preserves stale cases that have a case summary draft', async () => {
    const staleDate = new Date(Date.now() - (STALE_CONTACT_CASE_MINUTES + 1) * 60 * 1000);
    const state = {
      ...stubRootState,
      connectedCase: {
        cases: {
          1: {
            connectedCase,
            caseWorkingCopy: {
              sections: {},
              caseSummary: { status: 'open', summary: 'draft summary' },
            },
            availableStatusTransitions: Object.values(mockV1.caseStatus),
            lastReferencedDate: staleDate,
            sections: {},
            timelines: {},
            outstandingUpdateCount: 0,
          },
        },
      },
    } as HrmState;

    const result = reduce(state, GeneralActions.removeContactState(task.taskSid, undefined));
    // Case with caseSummary draft should NOT be removed even if stale
    expect(result.connectedCase.cases[1]).toBeDefined();
  });
});
