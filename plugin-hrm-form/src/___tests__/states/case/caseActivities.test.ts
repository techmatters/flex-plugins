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

import { callTypes, DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import { Case, CaseInfo } from '../../../types/types';
import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { getDefinitionVersions } from '../../../hrmConfig';
import { getActivitiesFromCase, getActivitiesFromContacts } from '../../../states/case/caseActivities';
import { VALID_EMPTY_CONTACT } from '../../testContacts';
import { Activity, ReferralActivity } from '../../../states/case/types';
import { WorkerSID } from '../../../types/twilio';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

const createFakeCase = (sections: Case['sections'], info: CaseInfo = {}, connectedContacts: any[] = []): Case => ({
  id: '0',
  status: 'borked',
  info: { definitionVersion: DefinitionVersionId.v1, ...info },
  helpline: 'Fakeline',
  connectedContacts,
  twilioWorkerId: 'WK-fake-worker',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  categories: {},
  accountSid: 'ACx',
  sections,
  label: 'Fake Case',
});

const noteWorker: WorkerSID = 'WK-note-twilio-worker-id';
const referralWorker: WorkerSID = 'WK-note-twilio-worker-id';

let formDefinition;

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  formDefinition = await loadDefinition(formDefinitionsBaseUrl);
});

describe('getActivitiesFromCase', () => {
  const createdAt = '2020-07-30 18:55:20';
  const updatedAt = '2020-08-30 18:55:20';

  test('nothing added - empty array', async () => {
    const fakeCase = createFakeCase({});

    const activities = getActivitiesFromCase(fakeCase, formDefinition);
    expect(activities).toStrictEqual([]);
  });

  test('single note added', async () => {
    const fakeCase = createFakeCase({
      note: [
        {
          sectionId: 'NOTE_ID',
          twilioWorkerId: noteWorker,
          createdAt,
          sectionTypeSpecificData: {
            note: 'content',
          },
        },
      ],
    });

    const activities = getActivitiesFromCase(fakeCase, formDefinition);
    const expectedActivity: Activity = {
      id: 'NOTE_ID',
      date: createdAt,
      type: 'note',
      note: {
        note: 'content',
      },
      text: 'content',
      twilioWorkerId: noteWorker,
      updatedBy: undefined,
      updatedAt: undefined,
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('custom note added without preview fields specified in layout - uses first field for text property', async () => {
    const fakeCase = createFakeCase({
      note: [
        {
          sectionId: 'NOTE_ID',
          twilioWorkerId: 'WK-note-twilio-worker-id',
          createdAt,
          sectionTypeSpecificData: {
            customProperty1: 'customProperty1 content',
            customProperty2: 'customProperty2 content',
          },
        },
      ],
    });

    const activities = getActivitiesFromCase(fakeCase, {
      ...formDefinition,
      caseForms: {
        ...formDefinition.caseForms,
        NoteForm: [{ name: 'customProperty1' }, { name: 'customProperty2' }],
      },
    });
    const expectedActivity: Activity = {
      id: 'NOTE_ID',
      date: createdAt,
      type: 'note',
      note: {
        customProperty1: 'customProperty1 content',
        customProperty2: 'customProperty2 content',
      },
      text: 'customProperty1 content',
      twilioWorkerId: noteWorker,
      updatedBy: undefined,
      updatedAt: undefined,
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('custom note added with preview fields in layout - uses preview fields specified in layout for text property', async () => {
    const fakeCase = createFakeCase({
      note: [
        {
          sectionId: 'NOTE_ID',
          twilioWorkerId: noteWorker,
          createdAt,
          sectionTypeSpecificData: {
            customProperty1: 'customProperty1 content',
            customProperty2: 'customProperty2 content',
            customProperty3: 'customProperty3 content',
          },
        },
      ],
    });

    const activities = getActivitiesFromCase(fakeCase, {
      ...formDefinition,
      caseForms: {
        ...formDefinition.caseForms,
        NoteForm: [{ name: 'customProperty1' }, { name: 'customProperty2' }, { name: 'customProperty3' }],
      },
      layoutVersion: {
        ...formDefinition.layoutVersion,
        case: {
          ...formDefinition.layoutVersion.case,
          notes: { previewFields: ['customProperty1', 'customProperty3'] },
        },
      },
    });
    const expectedActivity: Activity = {
      id: 'NOTE_ID',
      date: createdAt,
      type: 'note',
      note: {
        customProperty1: 'customProperty1 content',
        customProperty2: 'customProperty2 content',
        customProperty3: 'customProperty3 content',
      },
      text: expect.stringMatching(/.*customProperty1 content.*customProperty3 content.*/),
      twilioWorkerId: noteWorker,
      updatedBy: undefined,
      updatedAt: undefined,
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('multiple notes added', async () => {
    const fakeCase = createFakeCase({
      note: [
        {
          sectionId: 'NOTE_ID_1',
          twilioWorkerId: noteWorker,
          createdAt,
          sectionTypeSpecificData: {
            note: 'content',
          },
        },
        {
          sectionId: 'NOTE_ID_2',
          twilioWorkerId: noteWorker,
          createdAt,
          sectionTypeSpecificData: {
            note: 'moar content',
          },
          updatedBy: 'WK-updater',
          updatedAt,
        },
      ],
    });

    const activities = getActivitiesFromCase(fakeCase, formDefinition);
    const expectedActivities: Activity[] = [
      {
        id: 'NOTE_ID_1',
        date: createdAt,
        type: 'note',
        text: 'content',
        note: {
          note: 'content',
        },
        twilioWorkerId: noteWorker,
        updatedBy: undefined,
        updatedAt: undefined,
      },
      {
        id: 'NOTE_ID_2',
        date: createdAt,
        type: 'note',
        note: {
          note: 'moar content',
        },
        text: 'moar content',
        twilioWorkerId: noteWorker,
        updatedBy: 'WK-updater',
        updatedAt,
      },
    ];

    expect(activities).toStrictEqual(expectedActivities);
  });

  test('single referral added', async () => {
    const referral = {
      sectionId: 'REFERRAL_ID',
      sectionTypeSpecificData: {
        date: '2020-12-15',
        referredTo: 'State Agency 1',
        comments: 'comment',
      },
      createdAt,
      twilioWorkerId: referralWorker,
    } as const;
    const fakeCase = createFakeCase({
      referral: [referral],
    });
    const { createdAt: referralCreatedAt, twilioWorkerId, sectionId, sectionTypeSpecificData } = referral;
    const activities = getActivitiesFromCase(fakeCase, formDefinition);
    const expectedActivity: ReferralActivity = {
      id: sectionId,
      date: sectionTypeSpecificData.date,
      createdAt,
      type: 'referral',
      text: sectionTypeSpecificData.referredTo,
      referral: sectionTypeSpecificData,
      twilioWorkerId,
      updatedBy: undefined,
      updatedAt: undefined,
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('Multiple events - returned in descending date order', async () => {
    const timeOfContact = '2019-01-07 10:00:00';
    const referralCreatedAt = '2020-07-30 18:55:20';
    const referralDate = '2020-06-15';
    const contactCreatedAt = '2020-07-30 19:55:20';
    const noteCreatedAt = '2020-06-30 18:55:20';
    const referral = {
      sectionId: 'REFERRAL_ID',
      sectionTypeSpecificData: {
        date: referralDate,
        referredTo: 'State Agency 1',
        comments: 'comment',
      },
      createdAt: referralCreatedAt,
      twilioWorkerId: referralWorker,
    } as const;

    const fakeCase = createFakeCase(
      {
        referral: [referral],
        note: [
          {
            sectionId: 'NOTE_ID',
            twilioWorkerId: noteWorker,
            createdAt: noteCreatedAt,
            sectionTypeSpecificData: {
              note: 'content',
            },
          },
        ],
      },
      {},
      [
        {
          id: 1,
          channel: 'facebook',
          timeOfContact,
          createdAt: contactCreatedAt,
          twilioWorkerId: 'contact-adder',
          rawJson: {
            caseInformation: {
              callSummary: 'Child summary',
            },
          },
        },
      ],
    );

    const activities = getActivitiesFromCase(fakeCase, formDefinition);
    const { sectionTypeSpecificData } = referral;

    const expectedActivities: Activity[] = [
      {
        id: 'NOTE_ID',
        date: noteCreatedAt,
        type: 'note',
        note: {
          note: 'content',
        },
        text: 'content',
        twilioWorkerId: noteWorker,
        updatedBy: undefined,
        updatedAt: undefined,
      },
      {
        id: 'REFERRAL_ID',
        date: sectionTypeSpecificData.date,
        createdAt: referralCreatedAt,
        type: 'referral',
        text: sectionTypeSpecificData.referredTo,
        referral: sectionTypeSpecificData,
        twilioWorkerId: referralWorker,
        updatedBy: undefined,
        updatedAt: undefined,
      },
    ];

    expect(activities).toStrictEqual(expectedActivities);
  });
});

describe('getActivitiesFromContacts', () => {
  const createdAt = '2020-07-30 18:55:20';
  const contactAdder: WorkerSID = 'WK-contact-adder';
  beforeEach(async () => {
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, formDefinition);
  });

  test('Empty array - returns empty array', () => {
    expect(getActivitiesFromContacts([])).toStrictEqual([]);
  });

  test('single facebook contact', async () => {
    const timeOfContact = '2020-29-07 18:55:20';

    const activities = getActivitiesFromContacts([
      {
        ...VALID_EMPTY_CONTACT,
        id: '1',
        channel: 'facebook',
        timeOfContact,
        createdAt,
        twilioWorkerId: contactAdder,
        rawJson: {
          ...VALID_EMPTY_CONTACT.rawJson,
          caseInformation: {
            callSummary: 'Child summary',
          },
        },
      },
    ]);

    const expectedActivity: Activity = {
      callType: callTypes.child,
      contactId: '1',
      date: timeOfContact,
      createdAt,
      type: 'facebook',
      text: 'Child summary',
      twilioWorkerId: contactAdder,
      channel: 'facebook',
      isDraft: true,
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('single facebook contact (contactless task)', async () => {
    const timeOfContact = '2021-01-07 10:00:00';
    const activities = getActivitiesFromContacts([
      {
        ...VALID_EMPTY_CONTACT,
        id: '1',
        channel: 'default',
        timeOfContact,
        createdAt,
        twilioWorkerId: contactAdder,
        rawJson: {
          ...VALID_EMPTY_CONTACT.rawJson,
          callType: 'beep boop',
          caseInformation: {
            callSummary: 'Child summary',
          },
          contactlessTask: {
            ...VALID_EMPTY_CONTACT.rawJson.contactlessTask,
            channel: 'facebook',
          },
        },
      },
    ]);
    const expectedActivity: Activity = {
      callType: 'beep boop',
      contactId: '1',
      date: timeOfContact,
      createdAt,
      type: 'default',
      text: 'Child summary',
      twilioWorkerId: contactAdder,
      channel: 'facebook',
      isDraft: true,
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('Multiple contacts - creates an activity for each, returned in original order', async () => {
    const timeOfContactlessContact = '2019-01-08 10:00:00';
    const timeOfContact = '2019-01-07 10:00:00';
    const contactCreatedAt = '2020-07-30 19:55:20';
    const contactlessContactCreatedAt = '2020-06-30 18:55:20';

    const activities = getActivitiesFromContacts([
      {
        ...VALID_EMPTY_CONTACT,
        id: '1',
        channel: 'facebook',
        timeOfContact,
        createdAt: contactCreatedAt,
        twilioWorkerId: contactAdder,
        finalizedAt: contactCreatedAt,
        rawJson: {
          ...VALID_EMPTY_CONTACT.rawJson,
          callType: 'beep boop',
          caseInformation: {
            callSummary: 'Child summary',
          },
        },
      },
      {
        ...VALID_EMPTY_CONTACT,
        id: '0',
        channel: 'default',
        timeOfContact: timeOfContactlessContact,
        createdAt: contactlessContactCreatedAt,
        twilioWorkerId: contactAdder,
        rawJson: {
          ...VALID_EMPTY_CONTACT.rawJson,
          callType: 'boop beep',
          caseInformation: {
            callSummary: 'Child summary',
          },
          contactlessTask: {
            ...VALID_EMPTY_CONTACT.rawJson.contactlessTask,
            channel: 'facebook',
          },
        },
      },
    ]);

    const expectedActivities: Activity[] = [
      {
        callType: 'beep boop',
        contactId: '1',
        date: timeOfContact,
        createdAt: contactCreatedAt,
        type: 'facebook',
        text: 'Child summary',
        twilioWorkerId: contactAdder,
        channel: 'facebook',
        isDraft: false,
      },
      {
        callType: 'boop beep',
        contactId: '0',
        date: timeOfContactlessContact,
        createdAt: contactlessContactCreatedAt,
        type: 'default',
        text: 'Child summary',
        twilioWorkerId: contactAdder,
        channel: 'facebook',
        isDraft: true,
      },
    ];

    expect(activities).toMatchObject(expectedActivities);
  });
});
