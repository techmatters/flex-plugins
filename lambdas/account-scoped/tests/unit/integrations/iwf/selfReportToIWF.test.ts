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

import { selfReportToIWFHandler } from '../../../../src/integrations/iwf/selfReportToIWF';
import { getSsmParameter } from '@tech-matters/ssm-cache';
import { isErr, isOk } from '../../../../src/Result';
import { FlexValidatedHttpRequest } from '../../../../src/validation/flexToken';

jest.mock('@tech-matters/ssm-cache');

const mockGetSsmParameter = getSsmParameter as jest.MockedFunction<typeof getSsmParameter>;

const TEST_ACCOUNT_SID = 'AC000000000000000000000000000000';

global.fetch = jest.fn();

describe('selfReportToIWFHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  const createMockRequest = (body: any): FlexValidatedHttpRequest => ({
    method: 'POST',
    headers: {},
    path: '/test',
    query: {},
    body,
    tokenResult: { worker_sid: 'WK1234', roles: ['agent'] },
  });

  it('should return error when user_age_range is missing', async () => {
    const request = createMockRequest({
      case_number: '12345',
    });

    const result = await selfReportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain('user_age_range');
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should return error when case_number is missing', async () => {
    const request = createMockRequest({
      user_age_range: '<13',
    });

    const result = await selfReportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain('case_number');
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should successfully submit self-report to IWF', async () => {
    mockGetSsmParameter.mockImplementation(async (key: string) => {
      if (key.includes('case_url')) return 'https://iwf.api/case';
      if (key.includes('report_url')) return 'https://iwf.api/report';
      if (key.includes('secret_key')) return 'secret123';
      return '';
    });

    const mockResponse = {
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue({
        result: 'OK',
        message: { access_token: 'token_abc123' },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const request = createMockRequest({
      user_age_range: '13-15',
      case_number: 'CASE-12345',
    });

    const result = await selfReportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.status).toBe('OK');
      expect(result.data.reportUrl).toBe('https://iwf.api/report/?t=token_abc123');
    }

    expect(global.fetch).toHaveBeenCalledWith(
      'https://iwf.api/case',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      }),
    );

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = fetchCall[1].body;
    expect(requestBody).toContain('user_age_range=13-15');
    expect(requestBody).toContain('case_number=CASE-12345');
    expect(requestBody).toContain('secret_key=secret123');
  });

  it('should handle different age ranges', async () => {
    mockGetSsmParameter.mockImplementation(async (key: string) => {
      if (key.includes('case_url')) return 'https://iwf.api/case';
      if (key.includes('report_url')) return 'https://iwf.api/report';
      if (key.includes('secret_key')) return 'secret123';
      return '';
    });

    const mockResponse = {
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue({
        result: 'OK',
        message: { access_token: 'token_xyz789' },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const ageRanges: Array<'<13' | '13-15' | '16-17'> = ['<13', '13-15', '16-17'];

    for (const ageRange of ageRanges) {
      const request = createMockRequest({
        user_age_range: ageRange,
        case_number: 'CASE-67890',
      });

      const result = await selfReportToIWFHandler(request, TEST_ACCOUNT_SID);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.status).toBe('OK');
      }

      const fetchCall = (global.fetch as jest.Mock).mock.calls[
        (global.fetch as jest.Mock).mock.calls.length - 1
      ];
      const requestBody = fetchCall[1].body;
      expect(requestBody).toContain(`user_age_range=${encodeURIComponent(ageRange)}`);
    }
  });

  it('should return error when IWF API returns non-OK result', async () => {
    mockGetSsmParameter.mockImplementation(async (key: string) => {
      if (key.includes('case_url')) return 'https://iwf.api/case';
      if (key.includes('report_url')) return 'https://iwf.api/report';
      if (key.includes('secret_key')) return 'secret123';
      return '';
    });

    const mockResponse = {
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue({
        result: 'ERROR',
        message: { access_token: 'invalid_case' },
      }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const request = createMockRequest({
      user_age_range: '<13',
      case_number: 'INVALID',
    });

    const result = await selfReportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should handle fetch errors gracefully', async () => {
    mockGetSsmParameter.mockImplementation(async (key: string) => {
      if (key.includes('case_url')) return 'https://iwf.api/case';
      if (key.includes('report_url')) return 'https://iwf.api/report';
      if (key.includes('secret_key')) return 'secret123';
      return '';
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const request = createMockRequest({
      user_age_range: '16-17',
      case_number: 'CASE-12345',
    });

    const result = await selfReportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain('Network error');
      expect(result.error.statusCode).toBe(500);
    }
  });

  it('should handle SSM parameter errors', async () => {
    mockGetSsmParameter.mockRejectedValue(new Error('SSM parameter not found'));

    const request = createMockRequest({
      user_age_range: '<13',
      case_number: 'CASE-12345',
    });

    const result = await selfReportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
    }
  });
});
