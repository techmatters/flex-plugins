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
