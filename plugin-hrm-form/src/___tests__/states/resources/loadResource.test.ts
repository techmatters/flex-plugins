import { getResource, ReferrableResource } from '../../../services/ResourceService';
import { loadResource } from '../../../states/resources/loadResource';
import { addResourceAction, loadResourceErrorAction } from '../../../states/resources';
import { ApiError } from '../../../services/fetchApi';

jest.mock('../../../services/ResourceService', () => ({
  getResource: jest.fn(),
}));

const mockGetResource = getResource as jest.Mock<Promise<ReferrableResource>>;

beforeEach(() => {
  mockGetResource.mockClear();
});

test('Gets resource from service and dispatches an action to add it to redux', async () => {
  const mockResource = {
    id: 'TEST_ID',
    name: 'test resource',
  };
  const dispatch = jest.fn();
  mockGetResource.mockResolvedValue(mockResource);
  await loadResource(dispatch, 'TEST_ID');
  expect(mockGetResource).toHaveBeenCalledWith('TEST_ID');
  expect(dispatch).toHaveBeenCalledWith(addResourceAction(mockResource));
});

test('Resource service throws - dispatches error action', async () => {
  const dispatch = jest.fn();
  const err = new ApiError('Boom', {});
  mockGetResource.mockRejectedValue(new ApiError('Boom', {}));
  await loadResource(dispatch, 'TEST_ID');
  expect(mockGetResource).toHaveBeenCalledWith('TEST_ID');
  expect(dispatch).not.toHaveBeenCalledWith(addResourceAction(expect.anything()));
  expect(dispatch).toHaveBeenCalledWith(loadResourceErrorAction('TEST_ID', err));
});
