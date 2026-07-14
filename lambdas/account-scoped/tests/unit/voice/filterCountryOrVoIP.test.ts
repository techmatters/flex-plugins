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

import { filterCountryOrVoIPHandler } from '../../../src/voice/filterCountryOrVoIP';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '../../../src/Result';
import type { HttpRequest } from '../../../src/httpTypes';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;

const TEST_US_NUMBER = '+12025551234';
const TEST_NON_US_NUMBER = '+447911123456';

const createMockRequest = (body: any): HttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
});

const createMockPhoneNumberFetch = (
  data: Partial<{
    countryCode: string;
    lineTypeIntelligence: { type: string; carrier_name: string } | null;
  }>,
) => jest.fn().mockResolvedValue(data);

const createMockClient = (fetchData: any) => ({
  lookups: {
    v2: {
      phoneNumbers: jest.fn().mockReturnValue({
        fetch: createMockPhoneNumberFetch(fetchData),
      }),
    },
  },
});

describe('filterCountryOrVoIPHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when from is missing', async () => {
    const request = createMockRequest({});
    const result = await filterCountryOrVoIPHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('from');
    }
  });

  it('should block calls from non-US countries', async () => {
    mockGetTwilioClient.mockResolvedValue(
      createMockClient({ countryCode: 'GB', lineTypeIntelligence: null }) as any,
    );

    const request = createMockRequest({ from: TEST_NON_US_NUMBER });
    const result = await filterCountryOrVoIPHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.blockIncoming).toBe(true);
    }
  });

  it('should allow calls from the US with no line type intelligence', async () => {
    mockGetTwilioClient.mockResolvedValue(
      createMockClient({ countryCode: 'US', lineTypeIntelligence: null }) as any,
    );

    const request = createMockRequest({ from: TEST_US_NUMBER });
    const result = await filterCountryOrVoIPHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.blockIncoming).toBe(false);
    }
  });

  it('should block VoIP calls', async () => {
    mockGetTwilioClient.mockResolvedValue(
      createMockClient({
        countryCode: 'US',
        lineTypeIntelligence: { type: 'voip', carrier_name: 'Some VoIP Carrier' },
      }) as any,
    );

    const request = createMockRequest({ from: TEST_US_NUMBER });
    const result = await filterCountryOrVoIPHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.blockIncoming).toBe(true);
    }
  });

  it('should block VoIP calls regardless of casing in line type', async () => {
    mockGetTwilioClient.mockResolvedValue(
      createMockClient({
        countryCode: 'US',
        lineTypeIntelligence: { type: 'VoIP', carrier_name: 'Some VoIP Carrier' },
      }) as any,
    );

    const request = createMockRequest({ from: TEST_US_NUMBER });
    const result = await filterCountryOrVoIPHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.blockIncoming).toBe(true);
    }
  });

  it('should block calls from HD Carrier LLC', async () => {
    mockGetTwilioClient.mockResolvedValue(
      createMockClient({
        countryCode: 'US',
        lineTypeIntelligence: { type: 'mobile', carrier_name: 'HD Carrier LLC' },
      }) as any,
    );

    const request = createMockRequest({ from: TEST_US_NUMBER });
    const result = await filterCountryOrVoIPHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.blockIncoming).toBe(true);
    }
  });

  it('should allow calls from US mobile numbers not on the blocked carriers list', async () => {
    mockGetTwilioClient.mockResolvedValue(
      createMockClient({
        countryCode: 'US',
        lineTypeIntelligence: { type: 'mobile', carrier_name: 'Verizon' },
      }) as any,
    );

    const request = createMockRequest({ from: TEST_US_NUMBER });
    const result = await filterCountryOrVoIPHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.blockIncoming).toBe(false);
    }
  });
});
