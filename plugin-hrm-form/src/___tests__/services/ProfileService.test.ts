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

import { getIdentiferByIdentifier } from '../../services/ProfileService';
import { fetchHrmApi } from '../../services/fetchHrmApi';

jest.mock('../../services/fetchHrmApi');
const mockFetchHrmAPi: jest.Mock = fetchHrmApi as jest.Mock;

beforeEach(() => {
  mockFetchHrmAPi.mockClear();
});

describe('getIdentiferByIdentifier()', () => {
  test('getIdentiferByIdentifier calls "GET /profiles/identifier', async () => {
    const identifier = '1234567890';

    await getIdentiferByIdentifier(identifier);

    const expectedUrl = `/profiles/identifier/${identifier}`;
    expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl);
  });
});
