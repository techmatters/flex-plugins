/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { getUserIp } from '../ipTracker';

const TEST_API_KEY = 'test-api-key';

describe('getUserIp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the ip_address from the API response', async () => {
    const mockIp = '1.2.3.4';
    global.fetch = jest.fn().mockResolvedValue({
      // eslint-disable-next-line camelcase
      json: jest.fn().mockResolvedValue({ ip_address: mockIp }),
    } as any);

    const result = await getUserIp(TEST_API_KEY);

    expect(result).toBe(mockIp);
    expect(fetch).toHaveBeenCalledWith(`https://api.ipfind.co/me?auth=${TEST_API_KEY}`);
  });

  it('returns "0.0.0.0" when the fetch throws an error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    // eslint-disable-next-line no-empty-function
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getUserIp(TEST_API_KEY);

    expect(result).toBe('0.0.0.0');
    consoleSpy.mockRestore();
  });

  it('returns "0.0.0.0" when the response JSON parsing fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
    } as any);
    // eslint-disable-next-line no-empty-function
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getUserIp(TEST_API_KEY);

    expect(result).toBe('0.0.0.0');
    consoleSpy.mockRestore();
  });
});
