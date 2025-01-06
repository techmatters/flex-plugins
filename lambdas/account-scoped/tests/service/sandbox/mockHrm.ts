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
import type { Mockttp } from 'mockttp';
import { HrmContact } from '../../../src/hrm/populateHrmContactFormFromTask';
import { AccountSID } from '../../../src/twilioTypes';

const mockContacts: Record<AccountSID, Record<string, HrmContact>> = {};
const contactRootPathRegex = new RegExp(
  `${process.env.INTERNAL_HRM_URL!.replace('/', '\\')}\\/v1\/accounts\\/([^/]+)\\/contacts`,
);
let idCounter = 0;

export const mockHrmContacts = async (mockttp: Mockttp) => {
  await mockttp.forPost(contactRootPathRegex).thenCallback(async req => {
    const accountSid = req.url.match(contactRootPathRegex)![1] as AccountSID;
    mockContacts[accountSid] = mockContacts[accountSid] || {};
    const id = `mock-contact-${idCounter++}`;
    mockContacts[accountSid][id] = {
      ...((await req.body.getJson()) as HrmContact),
      id,
    };
    return { json: mockContacts[accountSid][id], statusCode: 200 };
  });
};
