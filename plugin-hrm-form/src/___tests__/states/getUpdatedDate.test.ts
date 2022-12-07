import { addDays, addSeconds, subSeconds } from 'date-fns';

import { Case, SearchAPIContact } from '../../types/types';
import getUpdatedDate from '../../states/getUpdatedDate';

describe('getUpdatedDate', () => {
  const baselineDate = new Date(2015, 5, 15);
  describe('Case input', () => {
    const baseCase: Case = {
      accountSid: '',
      id: 0,
      status: '',
      childName: '',
      createdAt: new Date(baselineDate).toISOString(),
      helpline: undefined,
      twilioWorkerId: 'PEGGY',
      categories: {},
      updatedAt: new Date(baselineDate).toISOString(),
      connectedContacts: [],
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

  describe('SearchAPIContact input', () => {
    const patchOverView: (
      original: SearchAPIContact,
      updates: Partial<SearchAPIContact['overview']>,
    ) => SearchAPIContact = (original, updates) => ({
      ...original,
      overview: {
        ...original.overview,
        ...updates,
      },
    });

    const baseContact: SearchAPIContact = {
      contactId: '0',
      overview: {
        createdBy: 'PEGGY',
        helpline: undefined,
        dateTime: baselineDate.toISOString(),
        updatedAt: baselineDate.toISOString(),
        name: undefined,
        channel: 'default',
        customerNumber: undefined,
        counselor: 'SUE',
        taskId: undefined,
        callType: '',
        categories: {},
        notes: undefined,
        conversationDuration: 0,
      },
      details: {
        callType: '',
        callerInformation: {
          name: {
            firstName: undefined,
            lastName: undefined,
          },
        },
        childInformation: {
          name: {
            firstName: undefined,
            lastName: undefined,
          },
        },
        caseInformation: {
          categories: {},
        },
        contactlessTask: {
          channel: 'voice',
        },
        conversationMedia: [],
      },
      csamReports: [],
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
      expect(getUpdatedDate(patchOverView(baseContact, { dateTime: 'NOT A DATE', updatedBy: 'SUE' }))).toEqual(
        baselineDate,
      );
    });

    test('Contact has invalid dateTime - returns undefined if creator and updater are the same', () => {
      expect(
        getUpdatedDate(patchOverView(baseContact, { dateTime: 'NOT A DATE', updatedBy: 'PEGGY' })),
      ).toBeUndefined();
    });
  });
});
