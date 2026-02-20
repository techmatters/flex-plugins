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

/* eslint-disable camelcase */
import { reportToIWF, selfReportToIWF } from '../../services/iwfService';
import fetchProtectedApi from '../../services/fetchProtectedApi';
import { getAseloFeatureFlags } from '../../hrmConfig';

jest.mock('../../services/fetchProtectedApi');
jest.mock('../../hrmConfig');

const mockFetchProtectedApi = fetchProtectedApi as jest.MockedFunction<typeof fetchProtectedApi>;
const mockGetAseloFeatureFlags = getAseloFeatureFlags as jest.MockedFunction<typeof getAseloFeatureFlags>;

const counselorForm = {
  webAddress: 'http://example.com',
  description: 'Test description',
  anonymous: 'non-anonymous',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
};

const childForm = {
  childAge: '13-15',
  ageVerified: true,
};

beforeEach(() => {
  mockFetchProtectedApi.mockClear();
  mockGetAseloFeatureFlags.mockClear();
});

describe('reportToIWF', () => {
  const serverlessResponse = {
    'IWFReportService1.0': { responseData: 'ref123', responseCode: '200', responseDescription: 'OK' },
  };
  const lambdaResponse = { status: 200, data: serverlessResponse };

  describe('feature flag disabled (serverless)', () => {
    beforeEach(() => {
      mockGetAseloFeatureFlags.mockReturnValue({ use_twilio_lambda_for_iwf_reporting: false } as any);
      mockFetchProtectedApi.mockResolvedValue(serverlessResponse);
    });

    test('calls fetchProtectedApi with serverless endpoint', async () => {
      await reportToIWF(counselorForm);
      expect(mockFetchProtectedApi).toHaveBeenCalledWith(
        '/reportToIWF',
        expect.objectContaining({ Reported_URL: 'http://example.com' }),
        { useTwilioLambda: false },
      );
    });

    test('returns the serverless response directly', async () => {
      const result = await reportToIWF(counselorForm);
      expect(result).toStrictEqual(serverlessResponse);
    });

    test('sets Reporter_Anonymous to N for non-anonymous form', async () => {
      await reportToIWF(counselorForm);
      expect(mockFetchProtectedApi).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ Reporter_Anonymous: 'N' }),
        expect.any(Object),
      );
    });

    test('sets Reporter_Anonymous to Y for anonymous form', async () => {
      await reportToIWF({ ...counselorForm, anonymous: 'anonymous' });
      expect(mockFetchProtectedApi).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ Reporter_Anonymous: 'Y' }),
        expect.any(Object),
      );
    });
  });

  describe('feature flag enabled (lambda)', () => {
    beforeEach(() => {
      mockGetAseloFeatureFlags.mockReturnValue({ use_twilio_lambda_for_iwf_reporting: true } as any);
      mockFetchProtectedApi.mockResolvedValue(lambdaResponse);
    });

    test('calls fetchProtectedApi with lambda endpoint', async () => {
      await reportToIWF(counselorForm);
      expect(mockFetchProtectedApi).toHaveBeenCalledWith(
        '/integrations/iwf/reportToIWF',
        expect.objectContaining({ Reported_URL: 'http://example.com' }),
        { useTwilioLambda: true },
      );
    });

    test('returns response.data (unwrapped from lambda wrapper)', async () => {
      const result = await reportToIWF(counselorForm);
      expect(result).toStrictEqual(serverlessResponse);
    });
  });
});

describe('selfReportToIWF', () => {
  const caseNumber = 'case-001';
  const selfReportResponse = { reportUrl: 'http://iwf.example.com/report?t=token', status: 'OK' };

  describe('feature flag disabled (serverless)', () => {
    beforeEach(() => {
      mockGetAseloFeatureFlags.mockReturnValue({ use_twilio_lambda_for_iwf_reporting: false } as any);
      mockFetchProtectedApi.mockResolvedValue(selfReportResponse);
    });

    test('calls fetchProtectedApi with serverless endpoint', async () => {
      await selfReportToIWF(childForm, caseNumber);
      expect(mockFetchProtectedApi).toHaveBeenCalledWith(
        '/selfReportToIWF',
        { user_age_range: '13-15', case_number: caseNumber },
        { useTwilioLambda: false },
      );
    });

    test('returns the response', async () => {
      const result = await selfReportToIWF(childForm, caseNumber);
      expect(result).toStrictEqual(selfReportResponse);
    });
  });

  describe('feature flag enabled (lambda)', () => {
    beforeEach(() => {
      mockGetAseloFeatureFlags.mockReturnValue({ use_twilio_lambda_for_iwf_reporting: true } as any);
      mockFetchProtectedApi.mockResolvedValue(selfReportResponse);
    });

    test('calls fetchProtectedApi with lambda endpoint', async () => {
      await selfReportToIWF(childForm, caseNumber);
      expect(mockFetchProtectedApi).toHaveBeenCalledWith(
        '/integrations/iwf/selfReportToIWF',
        { user_age_range: '13-15', case_number: caseNumber },
        { useTwilioLambda: true },
      );
    });

    test('returns the response', async () => {
      const result = await selfReportToIWF(childForm, caseNumber);
      expect(result).toStrictEqual(selfReportResponse);
    });
  });
});
