import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { Case, CaseInfo } from '../../../types/types';
import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { getDefinitionVersions } from '../../../HrmFormPlugin';
import { getActivitiesFromCase } from '../../../components/case/caseActivities';

const createFakeCase = (info: CaseInfo, connectedContacts: any[] = []): Case => ({
  id: 0,
  status: 'borked',
  info: { definitionVersion: DefinitionVersionId.v1, ...info },
  helpline: 'Fakeline',
  connectedContacts,
  twilioWorkerId: 'fake-worker',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  categories: {},
  childName: '',
});

let formDefinition;

beforeAll(async () => {
  formDefinition = await loadDefinition(DefinitionVersionId.v1);
});

describe('getActivitiesFromCase', () => {
  const createdAt = '2020-07-30 18:55:20';
  const updatedAt = '2020-08-30 18:55:20';
  beforeEach(async () => {
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, formDefinition);
  });
  test('single note added', async () => {
    const fakeCase = createFakeCase({
      counsellorNotes: [
        {
          id: 'NOTE_ID',
          twilioWorkerId: 'note-twilio-worker-id',
          createdAt,
          note: 'content',
        },
      ],
    });

    const activities = getActivitiesFromCase(fakeCase);
    const expectedActivity = {
      id: 'NOTE_ID',
      originalIndex: 0,
      date: createdAt,
      type: 'note',
      note: {
        note: 'content',
      },
      text: 'content',
      twilioWorkerId: 'note-twilio-worker-id',
      updatedBy: undefined,
      updatedAt: undefined,
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('custom note added without preview fields specified in layout - uses first field for text property', async () => {
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, {
      ...formDefinition,
      caseForms: {
        ...formDefinition.caseForms,
        NoteForm: [{ name: 'customProperty1' }, { name: 'customProperty2' }],
      },
    });

    const fakeCase = createFakeCase({
      counsellorNotes: [
        {
          id: 'NOTE_ID',
          twilioWorkerId: 'note-twilio-worker-id',
          createdAt,
          customProperty1: 'customProperty1 content',
          customProperty2: 'customProperty2 content',
        },
      ],
    });

    const activities = getActivitiesFromCase(fakeCase);
    const expectedActivity = {
      id: 'NOTE_ID',
      originalIndex: 0,
      date: createdAt,
      type: 'note',
      note: {
        customProperty1: 'customProperty1 content',
        customProperty2: 'customProperty2 content',
      },
      text: 'customProperty1 content',
      twilioWorkerId: 'note-twilio-worker-id',
      updatedBy: undefined,
      updatedAt: undefined,
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('custom note added with preview fields in layout - uses preview fields specified in layout for text property', async () => {
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, {
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
    const fakeCase = createFakeCase({
      counsellorNotes: [
        {
          id: 'NOTE_ID',
          twilioWorkerId: 'note-twilio-worker-id',
          createdAt,
          customProperty1: 'customProperty1 content',
          customProperty2: 'customProperty2 content',
          customProperty3: 'customProperty3 content',
        },
      ],
    });

    const activities = getActivitiesFromCase(fakeCase);
    const expectedActivity = {
      id: 'NOTE_ID',
      originalIndex: 0,
      date: createdAt,
      type: 'note',
      note: {
        customProperty1: 'customProperty1 content',
        customProperty2: 'customProperty2 content',
        customProperty3: 'customProperty3 content',
      },
      text: expect.stringMatching(/.*customProperty1 content.*customProperty3 content.*/),
      twilioWorkerId: 'note-twilio-worker-id',
      updatedBy: undefined,
      updatedAt: undefined,
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('multiple notes added', async () => {
    const fakeCase = createFakeCase({
      counsellorNotes: [
        {
          id: 'NOTE_ID_1',
          twilioWorkerId: 'note-twilio-worker-id',
          createdAt,
          note: 'content',
        },
        {
          id: 'NOTE_ID_2',
          twilioWorkerId: 'note-twilio-worker-id',
          createdAt,
          note: 'moar content',
          updatedBy: 'updater',
          updatedAt,
        },
      ],
    });

    const activities = getActivitiesFromCase(fakeCase);
    const expectedActivities = [
      {
        id: 'NOTE_ID_1',
        originalIndex: 0,
        date: createdAt,
        type: 'note',
        text: 'content',
        note: {
          note: 'content',
        },
        twilioWorkerId: 'note-twilio-worker-id',
        updatedBy: undefined,
        updatedAt: undefined,
      },
      {
        id: 'NOTE_ID_2',
        originalIndex: 1,
        date: createdAt,
        type: 'note',
        note: {
          note: 'moar content',
        },
        text: 'moar content',
        twilioWorkerId: 'note-twilio-worker-id',
        updatedBy: 'updater',
        updatedAt,
      },
    ];

    expect(activities).toStrictEqual(expectedActivities);
  });

  test('single referral added', async () => {
    const referral = {
      id: 'REFERRAL_ID',
      date: '2020-12-15',
      referredTo: 'State Agency 1',
      comments: 'comment',
      createdAt,
      twilioWorkerId: 'referral-adder',
    };
    const fakeCase = createFakeCase({
      referrals: [referral],
    });
    const { createdAt: referralCreatedAt, twilioWorkerId, id, ...restOfReferral } = referral;
    const activities = getActivitiesFromCase(fakeCase);
    const expectedActivity = {
      id,
      originalIndex: 0,
      date: referral.date,
      createdAt,
      type: 'referral',
      text: referral.referredTo,
      referral: restOfReferral,
      twilioWorkerId,
      updatedBy: undefined,
      updatedAt: undefined,
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('single facebook contact connected', async () => {
    const timeOfContact = '2020-29-07 18:55:20';

    const fakeCase = createFakeCase({}, [
      {
        id: 1,
        channel: 'facebook',
        timeOfContact,
        createdAt,
        twilioWorkerId: 'contact-adder',
        rawJson: {
          caseInformation: {
            callSummary: 'Child summary',
          },
        },
      },
    ]);

    const activities = getActivitiesFromCase(fakeCase);
    const expectedActivity = {
      originalIndex: 0,
      contactId: 1,
      date: timeOfContact,
      createdAt,
      type: 'facebook',
      text: 'Child summary',
      twilioWorkerId: 'contact-adder',
      channel: 'facebook',
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('single facebook contact (contactless task)', async () => {
    const timeOfContact = '2021-01-07 10:00:00';

    const fakeCase = createFakeCase({}, [
      {
        id: 1,
        channel: 'default',
        timeOfContact,
        createdAt,
        twilioWorkerId: 'contact-adder',
        rawJson: {
          caseInformation: {
            callSummary: 'Child summary',
          },
          contactlessTask: {
            channel: 'facebook',
          },
        },
      },
    ]);

    const activities = getActivitiesFromCase(fakeCase);
    const expectedActivity = {
      originalIndex: 0,
      contactId: 1,
      date: timeOfContact,
      createdAt,
      type: 'default',
      text: 'Child summary',
      twilioWorkerId: 'contact-adder',
      channel: 'facebook',
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
      id: 'REFERRAL_ID',
      date: referralDate,
      referredTo: 'State Agency 1',
      comments: 'comment',
      createdAt: referralCreatedAt,
      twilioWorkerId: 'referral-adder',
    };

    const fakeCase = createFakeCase(
      {
        referrals: [referral],
        counsellorNotes: [
          {
            id: 'NOTE_ID',
            twilioWorkerId: 'note-adder',
            createdAt: noteCreatedAt,
            note: 'content',
          },
        ],
      },
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

    const activities = getActivitiesFromCase(fakeCase);
    const { createdAt: _createdAt, twilioWorkerId, id, ...restOfReferral } = referral;

    const expectedActivities = [
      {
        id: 'NOTE_ID',
        originalIndex: 0,
        date: noteCreatedAt,
        type: 'note',
        note: {
          note: 'content',
        },
        text: 'content',
        twilioWorkerId: 'note-adder',
        updatedBy: undefined,
        updatedAt: undefined,
      },
      {
        id: 'REFERRAL_ID',
        originalIndex: 0,
        date: referral.date,
        createdAt: referralCreatedAt,
        type: 'referral',
        text: referral.referredTo,
        referral: restOfReferral,
        twilioWorkerId: 'referral-adder',
        updatedBy: undefined,
        updatedAt: undefined,
      },
      {
        originalIndex: 0,
        contactId: 1,
        date: timeOfContact,
        createdAt: contactCreatedAt,
        type: 'facebook',
        text: 'Child summary',
        twilioWorkerId: 'contact-adder',
        channel: 'facebook',
      },
    ];

    expect(activities).toStrictEqual(expectedActivities);
  });
});
