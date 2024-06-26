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

import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../mockFetchDefinitions';
import * as types from '../../states/types';
import * as actions from '../../states/actions';
import { mockGetDefinitionsResponse } from '../mockGetConfig';
import { getDefinitionVersions } from '../../hrmConfig';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

const task = { taskSid: 'task1' };

let mockV1;

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

describe('test action creators', () => {
  test('removeContactState', async () => {
    const expected: types.RemoveContactStateAction = {
      type: types.REMOVE_CONTACT_STATE,
      taskId: task.taskSid,
      contactId: 'contact-1',
    };

    expect(actions.removeContactState(task.taskSid, 'contact-1')).toStrictEqual(expected);
  });
});
