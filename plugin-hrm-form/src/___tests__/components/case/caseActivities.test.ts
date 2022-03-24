import { getActivitiesFromCase } from '../../../components/case/caseActivities';
import { Case, CaseInfo } from '../../../types/types';

const createFakeCase = (info: CaseInfo, connectedContacts: any[] = []): Case => ({
  id: 0,
  status: 'borked',
  info,
  helpline: 'Fakeline',
  connectedContacts,
  twilioWorkerId: 'fake-worker',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('getActivitiesFromCase', () => {
  test('single note added', async () => {
    const createdAt = '2020-30-07 18:55:20';

    const fakeCase = createFakeCase({
      counsellorNotes: [
        {
          twilioWorkerId: 'note-twilio-worker-id',
          createdAt,
          note: 'content',
        },
      ],
    });

    const activities = getActivitiesFromCase(fakeCase);
    const expectedActivity = {
      originalIndex: 0,
      date: createdAt,
      type: 'note',
      text: 'content',
      twilioWorkerId: 'note-twilio-worker-id',
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('multiple notes added', async () => {
    const createdAt = '2020-30-07 18:55:20';

    const fakeCase = createFakeCase({
      counsellorNotes: [
        {
          twilioWorkerId: 'note-twilio-worker-id',
          createdAt,
          note: 'content',
        },
        {
          twilioWorkerId: 'note-twilio-worker-id',
          createdAt,
          note: 'moar content',
        },
      ],
    });

    const activities = getActivitiesFromCase(fakeCase);
    const expectedActivities = [
      {
        originalIndex: 0,
        date: createdAt,
        type: 'note',
        text: 'content',
        twilioWorkerId: 'note-twilio-worker-id',
      },
      {
        originalIndex: 1,
        date: createdAt,
        type: 'note',
        text: 'moar content',
        twilioWorkerId: 'note-twilio-worker-id',
      },
    ];

    expect(activities).toStrictEqual(expectedActivities);
  });

  test('single referral added', async () => {
    const createdAt = '2020-30-07 18:55:20';
    const referral = {
      date: '2020-12-15',
      referredTo: 'State Agency 1',
      comments: 'comment',
      createdAt,
      twilioWorkerId: 'referral-adder',
    };
    const fakeCase = createFakeCase({
      referrals: [referral],
    });

    const activities = getActivitiesFromCase(fakeCase);
    const expectedActivity = {
      originalIndex: 0,
      date: referral.date,
      createdAt,
      type: 'referral',
      text: referral.referredTo,
      referral,
      twilioWorkerId: 'referral-adder',
    };

    expect(activities).toStrictEqual([expectedActivity]);
  });

  test('single facebook contact connected', async () => {
    const timeOfContact = '2020-29-07 18:55:20';
    const createdAt = '2020-30-07 18:55:20';

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
    const createdAt = '2020-30-07 18:55:20';

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

    const expectedActivities = [
      {
        originalIndex: 0,
        date: noteCreatedAt,
        type: 'note',
        text: 'content',
        twilioWorkerId: 'note-adder',
      },
      {
        originalIndex: 0,
        date: referral.date,
        createdAt: referralCreatedAt,
        type: 'referral',
        text: referral.referredTo,
        referral,
        twilioWorkerId: 'referral-adder',
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
