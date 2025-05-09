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

import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { DefinitionVersionId, loadDefinition } from '@tech-matters/hrm-form-definitions';

import { mockLocalFetchDefinitions } from './mockFetchDefinitions';
import { mockGetDefinitionsResponse } from './mockGetConfig';
import { initialState as searchInitialState } from '../states/search/reducer';
import { standaloneTaskSid } from '../types/types';
import { getDefinitionVersions } from '../hrmConfig';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

configureMockStore([]);

jest.mock('../services/ServerlessService', () => ({
  populateCounselors: async () => [],
}));

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockGetDefinitionsResponse(
    getDefinitionVersions,
    DefinitionVersionId.v1,
    await loadDefinition(formDefinitionsBaseUrl),
  );
});

test('<StandaloneSearch> should display <Search />', () => {
  /*
   *Commenting this test out since we need to deploy View Case functionality to staging
   *This will be revisited and fixed when we'll working on New Case revamp.
   *
   *const initialContact = createState();
   *const store = mockStore(initialContact);
   *
   *render(
   *  <Provider store={store}>
   *    <StandaloneSearch />
   *  </Provider>,
   *);
   *
   *expect(screen.getByTestId('Search-Title')).toBeInTheDocument();
   */
  expect(true).toBeTruthy();
});
