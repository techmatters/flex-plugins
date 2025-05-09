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

import { DefinitionVersionId, loadDefinition } from '@tech-matters/hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import * as types from '../../../states/configuration/types';
import * as actions from '../../../states/configuration/actions';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

beforeEach(() => {
  mockReset();
});

describe('test action creators', () => {
  let mockV1;

  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  });

  test('changeLanguage', async () => {
    const language = 'es';

    expect(actions.changeLanguage(language)).toStrictEqual({
      type: types.CHANGE_LANGUAGE,
      language,
    });
  });

  test('populateCounselorsState', async () => {
    const counselorsList: types.CounselorsList = [
      { sid: '1', fullName: '1' },
      { sid: '2', fullName: '2' },
      { sid: '3', fullName: '3' },
    ];

    expect(actions.populateCounselorsState(counselorsList)).toStrictEqual({
      type: types.POPULATE_COUNSELORS,
      counselorsList,
    });
  });

  test('chatCapacityUpdated', async () => {
    expect(actions.chatCapacityUpdated(2)).toStrictEqual({
      type: types.CHAT_CAPACITY_UPDATED,
      capacity: 2,
    });
  });

  test('populateCurrentDefinitionVersion', async () => {
    expect(actions.populateCurrentDefinitionVersion(mockV1)).toStrictEqual({
      type: types.POPULATE_CURRENT_DEFINITION_VERSION,
      definitions: mockV1,
    });
  });

  test('updateDefinitionVersion', async () => {
    expect(actions.updateDefinitionVersion('v1', mockV1)).toStrictEqual({
      type: types.UPDATE_DEFINITION_VERSION,
      version: 'v1',
      definitions: mockV1,
    });
  });
});
