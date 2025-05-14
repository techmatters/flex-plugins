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

// eslint-disable-next-line import/no-extraneous-dependencies,prettier/prettier
import type {MockedEndpoint, Mockttp} from 'mockttp';
import { AccountSID } from '../../../src/twilioTypes';
import { TEST_ACCOUNT_SID, TEST_AUTH_TOKEN } from '../../testTwilioValues';

const mockContacts: Record<AccountSID, Record<string, HrmContact>> = {};
const contactRootPathRegex = new RegExp(
  `${process.env.INTERNAL_HRM_URL!.replace('/', '\\/')}\\/internal\\/v1\\/accounts\\/([^\\/]+)\\/contacts`,
);
const profileIdentifiersFlagsPathRegex = new RegExp(
  `${process.env.INTERNAL_HRM_URL!.replace('/', '\\/')}\\/internal\\/v1\\/accounts\\/([^\\/]+)\\/profiles\\/identifier\\/([^\/]+)\\/flags`,
);
let idCounter = 0;

export const HRM_AUTH_SSM_PARAMETERS = [
  {
    name: `/${process.env.NODE_ENV}/twilio/${TEST_ACCOUNT_SID}/auth_token`,
    valueGenerator: () => TEST_AUTH_TOKEN,
  },
  {
    name: `/${process.env.NODE_ENV}/twilio/${TEST_ACCOUNT_SID}/static_key`,
    valueGenerator: () => 'static_key',
  },
];

export const mockHrmContacts = async (mockttp: Mockttp) => {
  return mockttp
    .forPost(contactRootPathRegex)
    .always()
    .asPriority(10000)
    .thenCallback(async req => {
      const accountSid = req.url.match(contactRootPathRegex)![1] as AccountSID;
      mockContacts[accountSid] = mockContacts[accountSid] || {};
      const id = `mock-contact-${idCounter++}`;
      mockContacts[accountSid][id] = {
        ...((await req.body.getJson()) as HrmContact),
        id,
      };
      console.info('completed mocked request', req.method, req.url);
      return { json: mockContacts[accountSid][id], statusCode: 200 };
    });
};

export const verifyCreateContactRequest = async (
  createEndpoint: MockedEndpoint,
  expectedContact: HrmContact,
) => {
  const requests = await createEndpoint.getSeenRequests();
  expect(requests.length).toBe(1);
  const [request] = requests;
  expect(request.method).toBe('POST');
  expect(await request.body.getJson()).toEqual(expectedContact);
};

export const mockIdentifierFlags = async (
  mockttp: Mockttp,
  identifier: string,
  responseFlags: { name: string }[],
) => {
  return mockttp
    .forGet(profileIdentifiersFlagsPathRegex)
    .always()
    .asPriority(10000)
    .thenCallback(async req => {
      const [, , pathIdentifier] = req.url.match(profileIdentifiersFlagsPathRegex) as [
        unknown,
        unknown,
        string,
      ];
      return {
        json: pathIdentifier === identifier ? responseFlags : [],
        statusCode: 200,
      };
    });
};
