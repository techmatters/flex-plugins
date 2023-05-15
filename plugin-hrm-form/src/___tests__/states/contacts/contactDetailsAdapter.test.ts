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

import { callTypes } from 'hrm-form-definitions';

import {
  hrmServiceContactToSearchContact,
  retrieveCategories,
  searchContactToHrmServiceContact,
} from '../../../states/contacts/contactDetailsAdapter';
import { HrmServiceContact, SearchAPIContact } from '../../../types/types';

describe('retrieveCategories', () => {
  test('falsy input, empty object output', () => expect(retrieveCategories(null)).toStrictEqual({}));
  test('empty object input, empty object output', () => expect(retrieveCategories({})).toStrictEqual({}));
  test('Categories with enabled subcategories input, categories with enables subcategories in a list as output', () =>
    expect(
      retrieveCategories({
        category1: { sub1: true, sub2: false, sub3: true },
        category2: { sub1: true, sub2: true, sub3: false },
      }),
    ).toStrictEqual({ category1: ['sub1', 'sub3'], category2: ['sub1', 'sub2'] }));
  test('Falsy categories - throw', () =>
    expect(() =>
      retrieveCategories({
        category1: null,
        category2: { sub1: true, sub2: true, sub3: false },
      }),
    ).toThrow());
  test('Categories with no subcategories input, not included in output', () =>
    expect(
      retrieveCategories({
        category1: {},
        category2: { sub1: true, sub2: true, sub3: false },
      }),
    ).toStrictEqual({ category2: ['sub1', 'sub2'] }));
  test('Categories with no enabled subcategories input, not included in output', () =>
    expect(
      retrieveCategories({
        category1: { sub1: false, sub2: false, sub3: false },
        category2: { sub1: true, sub2: true, sub3: false },
      }),
    ).toStrictEqual({ category2: ['sub1', 'sub2'] }));
});

describe('hrmServiceContactToSearchContact', () => {
  const emptyHrmContact: HrmServiceContact = {
    rawJson: {
      caseInformation: {
        categories: {},
      },
      callerInformation: {},
      callType: callTypes.child,
      childInformation: {},
      contactlessTask: {
        channel: 'voice',
      },
      conversationMedia: [],
    },
    conversationDuration: 0,
    csamReports: [],
    id: undefined,
    twilioWorkerId: undefined,
    serviceSid: undefined,
    queueName: undefined,
    channelSid: undefined,
    number: undefined,
    taskId: undefined,
    helpline: undefined,
    updatedBy: undefined,
    updatedAt: undefined,
    timeOfContact: undefined,
    createdBy: undefined,
    channel: undefined,
  };

  const emptyOverview: SearchAPIContact['overview'] = {
    helpline: undefined,
    dateTime: undefined,
    customerNumber: undefined,
    callType: callTypes.child,
    categories: {},
    counselor: undefined,
    notes: undefined,
    channel: undefined,
    conversationDuration: 0,
    createdBy: undefined,
    taskId: undefined,
    updatedBy: undefined,
    updatedAt: undefined,
  };

  test('input rawJson.caseInformation.categories are converted using retrieveCategories and added to overview', () => {
    const input: HrmServiceContact = {
      ...emptyHrmContact,
      rawJson: {
        ...emptyHrmContact.rawJson,
        caseInformation: {
          categories: {
            category1: { sub1: true, sub2: false, sub3: true },
            category2: { sub1: true, sub2: true, sub3: false },
          },
        },
      },
    };
    expect(hrmServiceContactToSearchContact(input as HrmServiceContact)).toStrictEqual({
      contactId: undefined,
      overview: {
        ...emptyOverview,
        categories: { category1: ['sub1', 'sub3'], category2: ['sub1', 'sub2'] },
      },
      details: input.rawJson,
      csamReports: [],
      referrals: undefined,
    });
  });

  test('input conversationDuration, channel, createdBy & helpline are added to overview as is', () => {
    const input: Partial<HrmServiceContact> = {
      ...emptyHrmContact,
      conversationDuration: 1234,
      helpline: 'my-helpline',
      createdBy: 'bob',
      channel: 'whatsapp',
      taskId: 'TASK_SID',
    };
    expect(hrmServiceContactToSearchContact(input as HrmServiceContact)).toStrictEqual({
      contactId: undefined,
      overview: {
        ...emptyOverview,
        conversationDuration: input.conversationDuration,
        helpline: input.helpline,
        createdBy: input.createdBy,
        channel: input.channel,
        taskId: input.taskId,
      },
      details: input.rawJson,
      csamReports: [],
      referrals: undefined,
    });
  });

  test('input csamReports are added to top level as is', () => {
    const input: HrmServiceContact = {
      ...emptyHrmContact,
      csamReports: [
        {
          csamReportId: '',
          id: 0,
          reportType: 'counsellor-generated',
          acknowledged: true,
          twilioWorkerId: 'worker',
          createdAt: 'yesterday',
        },
      ],
      referrals: undefined,
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: emptyOverview,
      csamReports: input.csamReports,
      referrals: undefined,
      details: input.rawJson,
    });
  });

  test('input referrals are added to top level as is', () => {
    const input: HrmServiceContact = {
      ...emptyHrmContact,
      referrals: [
        {
          resourceId: 'TEST_RESOURCE',
          referredAt: new Date().toISOString(),
          resourceName: 'A test referred resource',
        },
      ],
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: emptyOverview,
      csamReports: [],
      referrals: input.referrals,
      details: input.rawJson,
    });
  });

  test('input rawJson.callType is added to overview as is', () => {
    const input = {
      ...emptyHrmContact,
      rawJson: {
        ...emptyHrmContact.rawJson,
        callType: callTypes.caller,
      },
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, callType: input.rawJson.callType },
      csamReports: [],
      referrals: undefined,
      details: input.rawJson,
    });
  });

  test('input id is added to top level as contactId', () => {
    const input = {
      ...emptyHrmContact,
      id: 'an id',
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: input.id,
      overview: emptyOverview,
      csamReports: [],
      referrals: undefined,
      details: input.rawJson,
    });
  });

  test('input rawJson.caseInformation.callSummary mapped to output overView.notes', () => {
    const input: HrmServiceContact = {
      ...emptyHrmContact,
      rawJson: {
        ...emptyHrmContact.rawJson,
        caseInformation: {
          callSummary: 'a summary',
          categories: {},
        },
      },
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, notes: input.rawJson.caseInformation.callSummary },
      csamReports: [],
      referrals: undefined,
      details: input.rawJson,
    });
  });

  test('input twilioWorkerId mapped to output overView.counselor', () => {
    const input = {
      ...emptyHrmContact,
      twilioWorkerId: 'a worker',
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, counselor: input.twilioWorkerId },
      csamReports: [],
      referrals: undefined,
      details: input.rawJson,
    });
  });

  test('input timeOfContact mapped to output overView.dateTime', () => {
    const input = {
      ...emptyHrmContact,
      timeOfContact: 'a string, not a JS Date',
    };
    expect(hrmServiceContactToSearchContact(input)).toStrictEqual({
      contactId: undefined,
      overview: { ...emptyOverview, dateTime: input.timeOfContact },
      csamReports: [],
      referrals: undefined,
      details: input.rawJson,
    });
  });

  test('missing rawJson or rawJson.caseInformation objects on input throw', () => {
    expect(() => hrmServiceContactToSearchContact({} as HrmServiceContact)).toThrow();
    expect(() =>
      hrmServiceContactToSearchContact({ rawJson: { childInformation: {} } } as HrmServiceContact),
    ).toThrow();
  });
});

describe('searchContactToHrmServiceContact', () => {
  const baseSearchContact: SearchAPIContact = {
    contactId: '1337',
    overview: {
      taskId: 'A task',
      helpline: 'A helpline',
      conversationDuration: 14,
      createdBy: 'bob',
      channel: 'whatsapp',
      counselor: 'WK_roberta',
      customerNumber: '1234 4321',
      dateTime: 'Last Tuesday',
      callType: 'child',
      categories: {},
      notes: 'Hello',
      updatedAt: 'Yesterday',
      updatedBy: 'WK_bob',
    },
    csamReports: [
      {
        id: 1,
        csamReportId: '1',
        twilioWorkerId: 'WK_roberta',
        createdAt: 'Last Thursday',
        reportType: 'counsellor-generated',
        acknowledged: true,
      },
    ],
    referrals: [
      {
        resourceId: 'TEST_RESOURCE',
        referredAt: new Date().toISOString(),
        resourceName: 'A test referred resource',
      },
    ],
    details: {
      callType: 'child',
      childInformation: { firstName: 'Lo', lastName: 'Ballantyne' },
      callerInformation: { firstName: 'Lo', lastName: 'Ballantyne' },
      caseInformation: { categories: {} },
      contactlessTask: { channel: 'voice' },
      conversationMedia: [],
    },
  };

  test('maps SearchContact overview to top level properties', () => {
    const hrmContact = searchContactToHrmServiceContact(baseSearchContact);
    expect(hrmContact).toMatchObject({
      helpline: 'A helpline',
      conversationDuration: 14,
      createdBy: 'bob',
      channel: 'whatsapp',
      twilioWorkerId: 'WK_roberta',
      number: '1234 4321',
      timeOfContact: 'Last Tuesday',
      updatedAt: 'Yesterday',
      updatedBy: 'WK_bob',
    });
  });

  test('copies details, csamReports, referrals and contactId to top level', () => {
    const hrmContact = searchContactToHrmServiceContact(baseSearchContact);
    expect(hrmContact).toMatchObject({
      id: baseSearchContact.contactId,
      rawJson: baseSearchContact.details,
      csamReports: baseSearchContact.csamReports,
      referrals: baseSearchContact.referrals,
    });
  });
});
