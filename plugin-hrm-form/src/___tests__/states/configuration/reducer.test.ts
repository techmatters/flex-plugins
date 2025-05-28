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

import { loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import { reduce } from '../../../states/configuration/reducer';
import * as types from '../../../states/configuration/types';
import * as actions from '../../../states/configuration/actions';
import { defaultLanguage } from '../../../translations';
import { ConfigurationActionType } from '../../../states/configuration/types';

const { mockFetchImplementation, buildBaseURL } = mockLocalFetchDefinitions();

describe('test reducer', () => {
  let state = undefined;
  let mockV1;

  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL('v1');
    await mockFetchImplementation(formDefinitionsBaseUrl);
    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  });

  test('should return initial state', async () => {
    const expected = {
      locale: {
        selected: defaultLanguage,
        status: 'loaded',
      },
      counselors: { list: [], hash: {} },
      workerInfo: {
        chatChannelCapacity: 0,
      },
      definitionVersions: {},
    };

    const result = reduce(state, {} as ConfigurationActionType);
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle POPULATE_COUNSELORS', async () => {
    const counselorsList: types.CounselorsList = [
      { sid: '1', fullName: '1' },
      { sid: '2', fullName: '2' },
      { sid: '3', fullName: '3' },
    ];
    const counselors = {
      list: counselorsList,
      hash: { '1': '1', '2': '2', '3': '3' },
    };
    const expected = { ...state, counselors };

    const result = reduce(state, actions.populateCounselorsState(counselorsList));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle CHAT_CAPACITY_UPDATED', async () => {
    const chatChannelCapacity = 2;
    const expected = { ...state, workerInfo: { chatChannelCapacity } };

    const result = reduce(state, actions.chatCapacityUpdated(chatChannelCapacity));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle POPULATE_CURRENT_DEFINITION_VERSION', async () => {
    const expected = { ...state, currentDefinitionVersion: mockV1 };

    const result = reduce(state, actions.populateCurrentDefinitionVersion(mockV1));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle UPDATE_DEFINITION_VERSION', async () => {
    const expected = { ...state, definitionVersions: { v1: mockV1 } };

    const result = reduce(state, actions.updateDefinitionVersion('v1', mockV1));
    expect(result).toStrictEqual(expected);

    state = result;
  });
});
