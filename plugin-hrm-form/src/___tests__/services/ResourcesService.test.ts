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

import fetchResourcesApi from '../../services/fetchResourcesApi';
import { getResource, searchResources } from '../../services/ResourceService';

jest.mock('../../services/fetchResourcesApi');

const mockFetchResourcesApi = fetchResourcesApi as jest.Mock;

beforeEach(() => mockFetchResourcesApi.mockReset());

test('getResource - GET /resource/{id}', () => {
  mockFetchResourcesApi.mockResolvedValue({});
  getResource('TEST RESOURCE');
  expect(mockFetchResourcesApi).toHaveBeenCalledWith('resource/TEST RESOURCE');
});

test('searchResources - POST /search?start={start}&limit={limit}', () => {
  mockFetchResourcesApi.mockResolvedValue({});
  const params = { nameSubstring: 'bob', ids: ['anna'] };
  searchResources(params, 1337, 42);
  expect(mockFetchResourcesApi).toHaveBeenCalledWith('search?start=1337&limit=42', {
    method: 'POST',
    body: JSON.stringify(params),
  });
});
