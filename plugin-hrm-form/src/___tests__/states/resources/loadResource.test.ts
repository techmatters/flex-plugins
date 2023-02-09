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
