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

import { reportToIWFHandler } from '../../../../src/integrations/iwf/reportToIWF';
import { getSsmParameter } from '@tech-matters/ssm-cache';
import { isErr, isOk } from '../../../../src/Result';
import { FlexValidatedHttpRequest } from '../../../../src/validation/flexToken';

jest.mock('@tech-matters/ssm-cache');

const mockGetSsmParameter = getSsmParameter as jest.MockedFunction<
  typeof getSsmParameter
>;

const TEST_ACCOUNT_SID = 'AC000000000000000000000000000000';

global.fetch = jest.fn();

describe('reportToIWFHandler', () => {
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

  it('should return error when Reported_URL is missing', async () => {
    const request = createMockRequest({
      Reporter_Anonymous: 'Y',
    });

    const result = await reportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain('Reported_URL');
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should return error when Reporter_Anonymous is missing', async () => {
    const request = createMockRequest({
      Reported_URL: 'https://example.com',
    });

    const result = await reportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain('Reporter_Anonymous');
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should return error when Reporter_Anonymous is invalid', async () => {
    const request = createMockRequest({
      Reported_URL: 'https://example.com',
      Reporter_Anonymous: 'INVALID',
    });

    const result = await reportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain('Reporter_Anonymous');
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should successfully submit anonymous report to IWF', async () => {
    mockGetSsmParameter.mockImplementation(async (key: string) => {
      if (key.includes('username')) return 'test_user';
      if (key.includes('password')) return 'test_pass';
      if (key.includes('url')) return 'https://iwf.api/report';
      if (key.includes('environment')) throw new Error('not found');
      if (key.includes('country_code')) throw new Error('not found');
      if (key.includes('channel_id')) throw new Error('not found');
      return '';
    });

    const mockResponse = {
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, reportId: '12345' }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const request = createMockRequest({
      Reported_URL: 'https://example.com/illegal-content',
      Reporter_Anonymous: 'Y',
    });

    const result = await reportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.status).toBe(200);
      expect(result.data.data.success).toBe(true);
    }

    expect(global.fetch).toHaveBeenCalledWith(
      'https://iwf.api/report',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: expect.stringMatching(/^Basic /),
        }),
      }),
    );

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.Reported_URL).toBe('https://example.com/illegal-content');
    expect(requestBody.Reporter_Anonymous).toBe('Y');
    expect(requestBody.Reporting_Type).toBe('R');
    expect(requestBody.Live_Report).toBe('T'); // Test environment
  });

  it('should successfully submit non-anonymous report with contact details', async () => {
    mockGetSsmParameter.mockImplementation(async (key: string) => {
      if (key.includes('username')) return 'test_user';
      if (key.includes('password')) return 'test_pass';
      if (key.includes('url')) return 'https://iwf.api/report';
      if (key.includes('environment')) return 'L'; // Live environment
      if (key.includes('country_code')) return '123';
      if (key.includes('channel_id')) return '99';
      return '';
    });

    const mockResponse = {
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, reportId: '67890' }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const request = createMockRequest({
      Reported_URL: 'https://example.com/illegal-content',
      Reporter_Anonymous: 'N',
      Reporter_First_Name: 'John',
      Reporter_Last_Name: 'Doe',
      Reporter_Email_ID: 'john.doe@example.com',
      Reporter_Description: 'Found this content...',
    });

    const result = await reportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.status).toBe(200);
      expect(result.data.data.success).toBe(true);
    }

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.Reporter_Anonymous).toBe('N');
    expect(requestBody.Reporter_First_Name).toBe('John');
    expect(requestBody.Reporter_Last_Name).toBe('Doe');
    expect(requestBody.Reporter_Email_ID).toBe('john.doe@example.com');
    expect(requestBody.Reporter_Description).toBe('Found this content...');
    expect(requestBody.Live_Report).toBe('L'); // Live environment
    expect(requestBody.Reporter_Country_ID).toBe(123);
    expect(requestBody.Report_Channel_ID).toBe(99);
  });

  it('should handle fetch errors gracefully', async () => {
    mockGetSsmParameter.mockImplementation(async (key: string) => {
      if (key.includes('username')) return 'test_user';
      if (key.includes('password')) return 'test_pass';
      if (key.includes('url')) return 'https://iwf.api/report';
      throw new Error('not found');
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const request = createMockRequest({
      Reported_URL: 'https://example.com/illegal-content',
      Reporter_Anonymous: 'Y',
    });

    const result = await reportToIWFHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain('Network error');
      expect(result.error.statusCode).toBe(500);
    }
  });
});
