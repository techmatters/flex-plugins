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

import { DefinitionVersionId } from '@tech-matters/hrm-form-definitions';

import { cancelCase, createCase, getCase, updateCaseOverview, updateCaseStatus } from '../../services/CaseService';
import { fetchHrmApi } from '../../services/fetchHrmApi';
import { CaseOverview, Contact } from '../../types/types';
import { VALID_EMPTY_CONTACT } from '../testContacts';

jest.mock('../../services/fetchHrmApi');
const mockFetchHrmAPi: jest.Mock = fetchHrmApi as jest.Mock;

const jsonStringToParseAs = (actual: string, expected: any) => {
  try {
    const parsed = JSON.parse(actual);
    expect(parsed).toStrictEqual(expected);
  } catch (err) {
    return { pass: false, message: () => err.message() };
  }
  return { pass: true, message: () => 'JSON string parses as expected object' };
};

declare global {
  namespace jest {
    interface Matchers<R> {
      jsonStringToParseAs(expected: any): R;
    }
    // @ts-ignore
    interface Expect<R> {
      jsonStringToParseAs(expected: any): R;
    }
  }
}

expect.extend({ jsonStringToParseAs });

beforeEach(() => {
  mockFetchHrmAPi.mockClear();
});

describe('cancelCase()', () => {
  test('cancelCase calls "DELETE /cases/id', async () => {
    const caseId = '1';

    await cancelCase(caseId);

    const expectedUrl = `/cases/${caseId}`;
    const expectedOptions = { method: 'DELETE' };
    expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
  });
});

describe('createCase()', () => {
  const baselineResponse = {
    id: '1',
    createdAt: '2022-12-22T07:20:17.042Z',
    updatedAt: '2022-12-22T07:20:17.042Z',
    status: 'open',
    helpline: 'a helpline',
    info: { definitionVersion: 'demo-v1' },
    twilioWorkerId: 'creating worker',
    accountSid: 'an account',
    createdBy: 'creating worker',
    updatedBy: null,
    categories: {},
    firstContact: undefined,
  };

  const baselineContact: Contact = {
    ...VALID_EMPTY_CONTACT,
    helpline: 'a helpline',
  };

  test('No createdOnBehalfOf set - assumes a twilio contact, calls "POST /cases with twilioWorkerId set to owning worker', async () => {
    mockFetchHrmAPi.mockResolvedValue(baselineResponse);

    const response = await createCase(baselineContact, 'creating worker', DefinitionVersionId.demoV1);

    const expectedUrl = `/cases`;
    const expectedOptions = {
      method: 'POST',
      body: expect.jsonStringToParseAs({
        twilioWorkerId: 'creating worker',
        status: 'open',
        helpline: 'a helpline',
        info: {
          definitionVersion: DefinitionVersionId.demoV1,
        },
      }),
    };
    expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
    expect(response).toStrictEqual(baselineResponse);
  });

  test('contactlessTask.createdOnBehalfOf set - assumes offline contact, calls "POST /cases with offlineContactCreator set to creating worker and twilioWorkerId set to owning worker', async () => {
    const mockedResponse = {
      ...baselineResponse,
      info: { definitionVersion: 'demo-v1', offlineContactCreator: 'creating worker' },
      twilioWorkerId: 'WK-owning worker',
    };

    const contactForm: Contact = {
      ...baselineContact,
      rawJson: {
        ...baselineContact.rawJson,
        contactlessTask: {
          ...baselineContact.rawJson.contactlessTask,
          createdOnBehalfOf: 'WK-owning worker',
        },
      },
    };

    mockFetchHrmAPi.mockResolvedValue(mockedResponse);

    const response = await createCase(contactForm, 'creating worker', DefinitionVersionId.demoV1);

    const expectedUrl = `/cases`;
    const expectedOptions = {
      method: 'POST',
      body: expect.jsonStringToParseAs({
        twilioWorkerId: 'WK-owning worker',
        status: 'open',
        helpline: 'a helpline',
        info: {
          definitionVersion: DefinitionVersionId.demoV1,
          offlineContactCreator: 'creating worker',
        },
      }),
    };
    expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
    expect(response).toStrictEqual(mockedResponse);
  });
});

describe('update endpoints', () => {
  const baselineResponse = {
    id: '1',
    createdAt: '2022-12-22T07:20:17.042Z',
    updatedAt: '2022-12-22T07:20:17.042Z',
    status: 'open',
    helpline: 'a helpline',
    info: { definitionVersion: 'demo-v1' },
    twilioWorkerId: 'creating worker',
    accountSid: 'an account',
    createdBy: 'creating worker',
    updatedBy: null,
    categories: {},
  };

  test('updateCaseOverview - Generates a PUT HTTP call via fetchHrmApi', async () => {
    mockFetchHrmAPi.mockResolvedValue(baselineResponse);
    const body: CaseOverview = {
      summary: 'a summary',
      childIsAtRisk: false,
      followUpDate: '2022-12-22T07:20:17.042Z',
    };
    const response = await updateCaseOverview('case-123', body);

    const expectedUrl = `/cases/case-123/overview`;
    const expectedOptions = {
      method: 'PUT',
      body: expect.jsonStringToParseAs(body),
    };
    expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
    expect(response).toStrictEqual(baselineResponse);
  });

  test('updateCaseStatus - Generates a PUT HTTP call via fetchHrmApi', async () => {
    mockFetchHrmAPi.mockResolvedValue(baselineResponse);
    const response = await updateCaseStatus('case-123', 'stately');

    const expectedUrl = `/cases/case-123/status`;
    const expectedOptions = {
      method: 'PUT',
      body: expect.jsonStringToParseAs({ status: 'stately' }),
    };
    expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
    expect(response).toStrictEqual(baselineResponse);
  });
});

test('getCase - Generates a GET HTTP call via fetchHrmApi', async () => {
  mockFetchHrmAPi.mockResolvedValue({ id: 'case' });
  const response = await getCase('case-123');

  const expectedUrl = `/cases/case-123`;
  const expectedOptions = {
    method: 'GET',
    returnNullFor404: true,
  };
  expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
  expect(response).toStrictEqual({ id: 'case' });
});
