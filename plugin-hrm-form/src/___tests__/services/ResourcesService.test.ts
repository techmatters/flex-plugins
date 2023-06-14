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
import { getAseloFeatureFlags } from '../../hrmConfig';
import { FeatureFlags } from '../../types/types';

jest.mock('../../services/fetchResourcesApi');
jest.mock('../../hrmConfig', () => ({
  getReferrableResourceConfig: () => ({}),
  getAseloFeatureFlags: jest.fn(),
}));

const mockFetchResourcesApi = fetchResourcesApi as jest.Mock<ReturnType<typeof fetchResourcesApi>>;
const mockGetAseloFeatureFlags = getAseloFeatureFlags as jest.Mock<ReturnType<typeof getAseloFeatureFlags>>;

beforeEach(() => {
  mockFetchResourcesApi.mockReset();
  mockGetAseloFeatureFlags.mockReset();
  // eslint-disable-next-line camelcase
  mockGetAseloFeatureFlags.mockReturnValue({ enable_resources_elastic_search: true } as FeatureFlags);
});

test('getResource - valid params sends GET /resource/{id} to mockFetchResourcesApi', async () => {
  mockFetchResourcesApi.mockResolvedValue({
    results: [],
    totalCount: 0,
  });
  await getResource('TEST RESOURCE');
  expect(mockFetchResourcesApi).toHaveBeenCalledWith('resource/TEST RESOURCE');
});

test('searchResources - valid params sends POST /searchByName?start={start}&limit={limit} to mockFetchResourcesApi', async () => {
  mockFetchResourcesApi.mockResolvedValue({
    results: [],
    totalCount: 0,
  });
  const params = { generalSearchTerm: 'bob', filters: { province: 'CA/ON' } };
  await searchResources(params, 1337, 42);
  expect(mockFetchResourcesApi).toHaveBeenCalledWith('search?start=1337&limit=42', {
    method: 'POST',
    body: JSON.stringify({ generalSearchTerm: 'bob', filters: { province: 'CA/ON' } }),
  });
});
