import { getResource, ReferrableResource } from '../../../services/ResourceService';
import { loadResource } from '../../../states/resources/loadResource';
import { addResourceAction } from '../../../states/resources';
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

test('Resource service throws - does not dispatch action & throws', async () => {
  const dispatch = jest.fn();
  mockGetResource.mockRejectedValue(new ApiError('Boom', {}));
  await expect(loadResource(dispatch, 'TEST_ID')).rejects.toThrowError(ApiError);
  expect(mockGetResource).toHaveBeenCalledWith('TEST_ID');
  expect(dispatch).not.toBeCalled();
});
