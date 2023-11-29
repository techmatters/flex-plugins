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

import { DefinitionVersion, DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import { reduce } from '../../../states/case/reducer';
import * as GeneralActions from '../../../states/actions';
import { Case } from '../../../types/types';
import { REMOVE_CONTACT_STATE } from '../../../states/types';
import { CaseState } from '../../../states/case/types';
import { RootState } from '../../../states';
import { configurationBase, connectedCaseBase, namespace } from '../../../states/storeNamespaces';

const task = { taskSid: 'task1' };
const stubRootState = { [configurationBase]: { definitionVersions: {} } } as RootState['plugin-hrm-form'];

jest.mock('../../../states/case/caseStatus', () => ({
  getAvailableCaseStatusTransitions: jest.fn(),
}));

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

beforeEach(() => {
  mockReset();
});

describe('test reducer', () => {
  const state: CaseState = undefined;
  let mockV1: DefinitionVersion;

  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  });

  test('should return initial state', async () => {
    const expected = { tasks: {} };

    const result = reduce(stubRootState, state, {
      type: REMOVE_CONTACT_STATE,
      taskId: 'TEST_TASK_ID',
      contactId: 'TEST_CONTACT_ID',
    });
    expect(result).toStrictEqual(expected);
  });

  test('should handle REMOVE_CONTACT_STATE', async () => {
    const connectedCase: Case = {
      accountSid: 'ACxxx',
      id: '1',
      helpline: '',
      status: 'open',
      twilioWorkerId: 'WK123',
      info: {
        definitionVersion: DefinitionVersionId.v1,
      },
      createdAt: '2020-07-31T20:39:37.408Z',
      updatedAt: '2020-07-31T20:39:37.408Z',
      connectedContacts: null,
      categories: {},
    };

    const state: RootState[typeof namespace][typeof connectedCaseBase] = {
      cases: {
        1: {
          connectedCase,
          caseWorkingCopy: { sections: {} },
          availableStatusTransitions: Object.values(mockV1.caseStatus),
          references: new Set(['task-task1']),
        },
      },
      tasks: {},
    };

    const expected = { tasks: {}, cases: {} };

    const result = reduce(stubRootState, state, GeneralActions.removeContactState(task.taskSid, undefined));
    expect(result).toStrictEqual(expected);

    // state = result; no assignment here as we don't want to lose the only task in the state, it will be reused in following tests
  });
});
