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

import { addDays, addSeconds, subSeconds } from 'date-fns';

import { Case, Contact } from '../../types/types';
import getUpdatedDate from '../../states/getUpdatedDate';
import { VALID_EMPTY_CONTACT } from '../testContacts';

describe('getUpdatedDate', () => {
  const baselineDate = new Date(2015, 5, 15);
  describe('Case input', () => {
    const baseCase: Case = {
      accountSid: 'ACx',
      id: '0',
      status: '',
      label: '',
      createdAt: new Date(baselineDate).toISOString(),
      helpline: undefined,
      twilioWorkerId: 'WK-PEGGY',
      categories: {},
      updatedAt: new Date(baselineDate).toISOString(),
      info: {},
    };

    test('Case has same updated date as created date - returns undefined', () => {
      expect(getUpdatedDate(baseCase)).toBeUndefined();
    });

    test('Case has no updated date - returns undefined', () => {
      expect(getUpdatedDate({ ...baseCase, updatedAt: undefined })).toBeUndefined();
    });

    test('Case has updated date before created date - returns undefined', () => {
      expect(getUpdatedDate({ ...baseCase, updatedAt: subSeconds(baselineDate, 1).toISOString() })).toBeUndefined();
    });

    test('Case has updated date just after created date - returns undefined', () => {
      expect(getUpdatedDate({ ...baseCase, updatedAt: addSeconds(baselineDate, 10).toISOString() })).toBeUndefined();
    });

    test('Case has updated date significantly after created date - returns updated date', () => {
      const updated = addDays(baselineDate, 10);
      expect(getUpdatedDate({ ...baseCase, updatedAt: updated.toISOString() })).toEqual(updated);
    });

    test('Case has invalid updated date - returns undefined', () => {
      expect(getUpdatedDate({ ...baseCase, updatedAt: 'NOT A DATE' })).toBeUndefined();
    });

    test('Case has invalid created date - returns undefined', () => {
      expect(getUpdatedDate({ ...baseCase, createdAt: 'NOT A DATE' })).toBeUndefined();
    });
  });

  describe('Contact input', () => {
    const patchOverView: (original: Contact, updates: Partial<Contact>) => Contact = (original, updates) => ({
      ...original,
      ...updates,
    });

    const baseContact: Contact = {
      profileId: 0,
      id: '0',
      accountSid: 'ACx',
      helpline: 'helpline',
      createdAt: baselineDate.toISOString(),
      createdBy: 'PEGGY',
      updatedAt: baselineDate.toISOString(),
      updatedBy: '',
      timeOfContact: baselineDate.toISOString(),
      channel: 'default',
      twilioWorkerId: 'WK-SUE',
      number: '',
      taskId: 'WT',
      conversationDuration: 0,
      queueName: '',
      channelSid: '',
      serviceSid: '',
      csamReports: [],
      conversationMedia: [],
      rawJson: {
        callType: '',
        callerInformation: {},
        childInformation: {},
        caseInformation: {},
        categories: {},
        contactlessTask: {
          ...VALID_EMPTY_CONTACT.rawJson.contactlessTask,
          channel: 'voice',
        },
      },
    };

    test('Contact overview has same updated date as dateTime but undefined updatedBy - returns updatedAt', () => {
      expect(getUpdatedDate(baseContact)).toEqual(baselineDate);
    });

    test('Contact overview has same updated date as dateTime and same updater as creator - returns undefined', () => {
      expect(getUpdatedDate(patchOverView(baseContact, { updatedBy: 'PEGGY' }))).toBeUndefined();
    });

    test('Contact overview has no updated date - returns undefined', () => {
      expect(getUpdatedDate(patchOverView(baseContact, { updatedAt: undefined }))).toBeUndefined();
    });

    test('Contact has updated date before dateTime and same updater as creator - returns undefined', () => {
      expect(
        getUpdatedDate(
          patchOverView(baseContact, { updatedAt: subSeconds(baselineDate, 1).toISOString(), updatedBy: 'PEGGY' }),
        ),
      ).toBeUndefined();
    });

    test('Contact has updated date before dateTime and different updater to creator - returns updated date', () => {
      const updated = subSeconds(baselineDate, 1);
      expect(
        getUpdatedDate(patchOverView(baseContact, { updatedAt: updated.toISOString(), updatedBy: 'SUE' })),
      ).toEqual(updated);
    });

    test('Contact has updated date just after dateTime and same updater as creator - returns undefined', () => {
      expect(
        getUpdatedDate(
          patchOverView(baseContact, { updatedAt: addSeconds(baselineDate, 10).toISOString(), updatedBy: 'PEGGY' }),
        ),
      ).toBeUndefined();
    });

    test('Contact has updated date just after dateTime and different updater to creator - returns updated date', () => {
      const updated = addSeconds(baselineDate, 10);
      expect(
        getUpdatedDate(patchOverView(baseContact, { updatedAt: updated.toISOString(), updatedBy: 'SUE' })),
      ).toEqual(updated);
    });

    test('Contact has updated date significantly after dateTime and updater is the same as the creator - returns updated date', () => {
      const updated = addDays(baselineDate, 10);
      expect(
        getUpdatedDate(patchOverView(baseContact, { updatedAt: updated.toISOString(), updatedBy: 'PEGGY' })),
      ).toEqual(updated);
    });

    test('Contact has invalid updated date - returns undefined', () => {
      expect(getUpdatedDate(patchOverView(baseContact, { updatedAt: 'NOT A DATE' }))).toBeUndefined();
    });

    test('Contact has invalid dateTime - returns updatedTime if creator and updater are different', () => {
      expect(getUpdatedDate(patchOverView(baseContact, { timeOfContact: 'NOT A DATE', updatedBy: 'SUE' }))).toEqual(
        baselineDate,
      );
    });

    test('Contact has invalid dateTime - returns undefined if creator and updater are the same', () => {
      expect(
        getUpdatedDate(patchOverView(baseContact, { timeOfContact: 'NOT A DATE', updatedBy: 'PEGGY' })),
      ).toBeUndefined();
    });
  });
});
