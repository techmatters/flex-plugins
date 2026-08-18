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

import { getAseloTwilioConfiguration } from '../../services/configurationService';
import { getFromAccountScopedLambda } from '../../services/fetchAccountScopedLambdaApi';

jest.mock('../../services/fetchAccountScopedLambdaApi', () => ({
  getFromAccountScopedLambda: jest.fn(),
}));

const mockGetFromAccountScopedLambda = getFromAccountScopedLambda as jest.MockedFunction<
  typeof getFromAccountScopedLambda
>;

describe('configurationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAseloTwilioConfiguration fetches twilio configuration from account-scoped lambda', async () => {
    const response = {
      quickDialOptions: [{ labelKey: 'foo', phoneNumber: '+1234567890' }],
    };
    mockGetFromAccountScopedLambda.mockResolvedValue(response);

    await expect(getAseloTwilioConfiguration()).resolves.toStrictEqual(response);
    expect(mockGetFromAccountScopedLambda).toHaveBeenCalledWith('configuration/twilio');
  });
});
