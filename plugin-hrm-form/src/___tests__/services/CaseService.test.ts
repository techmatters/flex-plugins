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

import { callTypes, DefinitionVersionId } from 'hrm-form-definitions';

import { cancelCase, createCase } from '../../services/CaseService';
import fetchHrmApi from '../../services/fetchHrmApi';

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
    const caseId = 1;

    await cancelCase(caseId);

    const expectedUrl = `/cases/${caseId}`;
    const expectedOptions = { method: 'DELETE' };
    expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
  });
});

describe('createCase()', () => {
  const baselineResponse = {
    id: 1,
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

  const baselineContactForm: TaskEntry = {
    helpline: 'a helpline',
    callType: callTypes.child,
    contactlessTask: {
      channel: 'voice',
    },
    childInformation: {},
    callerInformation: {},
    caseInformation: {},
    categories: [],
    csamReports: [],
    isCallTypeCaller: false,
    metadata: { startMillis: 0, endMillis: 0, categories: { gridView: false, expanded: {} }, recreated: false },
  };

  test('No createdOnBehalfOf set - assumes a twilio contact, calls "POST /cases with twilioWorkerId set to owning worker', async () => {
    const contactForm: TaskEntry = {
      helpline: 'a helpline',
      callType: callTypes.child,
      contactlessTask: {
        channel: 'voice',
      },
      childInformation: {},
      callerInformation: {},
      caseInformation: {},
      categories: [],
      csamReports: [],
      isCallTypeCaller: false,
      metadata: { startMillis: 0, endMillis: 0, categories: { gridView: false, expanded: {} }, recreated: false },
    };

    mockFetchHrmAPi.mockResolvedValue(baselineResponse);

    const response = await createCase(contactForm, 'creating worker', DefinitionVersionId.demoV1);

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
      twilioWorkerId: 'owning worker',
    };

    const contactForm: TaskEntry = {
      ...baselineContactForm,
      contactlessTask: {
        channel: 'voice',
        createdOnBehalfOf: 'owning worker',
      },
    };

    mockFetchHrmAPi.mockResolvedValue(mockedResponse);

    const response = await createCase(contactForm, 'creating worker', DefinitionVersionId.demoV1);

    const expectedUrl = `/cases`;
    const expectedOptions = {
      method: 'POST',
      body: expect.jsonStringToParseAs({
        twilioWorkerId: 'owning worker',
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
