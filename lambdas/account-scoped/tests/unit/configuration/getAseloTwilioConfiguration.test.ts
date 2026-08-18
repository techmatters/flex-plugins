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

import { getAseloTwilioConfigurationHandler } from '../../../src/configuration/getAseloTwilioConfiguration';
import { getDocsBucketName } from '@tech-matters/twilio-configuration';
import { getS3Object } from '@tech-matters/s3';
import { isErr, isOk } from '../../../src/Result';
import { HttpRequest } from '../../../src/httpTypes';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getDocsBucketName: jest.fn(),
}));

jest.mock('@tech-matters/s3', () => ({
  getS3Object: jest.fn(),
}));

const mockGetDocsBucketName = getDocsBucketName as jest.MockedFunction<
  typeof getDocsBucketName
>;
const mockGetS3Object = getS3Object as jest.MockedFunction<typeof getS3Object>;

const TEST_BUCKET = 'test-docs-bucket';

const createMockRequest = (): HttpRequest => ({
  method: 'GET',
  headers: {},
  path: '/test',
  query: {},
  body: {},
});

describe('getTwilioPrivateConfigurationHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDocsBucketName.mockResolvedValue(TEST_BUCKET);
  });

  it('should return parsed JSON content when configuration file exists', async () => {
    const config = { someKey: 'someValue', nested: { flag: true } };
    mockGetS3Object.mockResolvedValue(JSON.stringify(config));

    const result = await getAseloTwilioConfigurationHandler(
      createMockRequest(),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toEqual(config);
    }
    expect(mockGetDocsBucketName).toHaveBeenCalledWith(TEST_ACCOUNT_SID);
    expect(mockGetS3Object).toHaveBeenCalledWith(
      TEST_BUCKET,
      'configuration/twilio-private.json',
    );
  });

  it('should return an empty object when configuration file does not exist (NoSuchKey)', async () => {
    const noSuchKeyError = Object.assign(new Error('The specified key does not exist.'), {
      name: 'NoSuchKey',
    });
    mockGetS3Object.mockRejectedValue(noSuchKeyError);

    const result = await getAseloTwilioConfigurationHandler(
      createMockRequest(),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toEqual({});
    }
  });

  it('should return 500 on unexpected S3 error', async () => {
    mockGetS3Object.mockRejectedValue(new Error('S3 service unavailable'));

    const result = await getAseloTwilioConfigurationHandler(
      createMockRequest(),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toBe('S3 service unavailable');
      expect(result.error.statusCode).toBe(500);
    }
  });

  it('should return 500 when getDocsBucketName fails', async () => {
    mockGetDocsBucketName.mockRejectedValue(new Error('SSM parameter not found'));

    const result = await getAseloTwilioConfigurationHandler(
      createMockRequest(),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toBe('SSM parameter not found');
      expect(result.error.statusCode).toBe(500);
    }
  });
});
