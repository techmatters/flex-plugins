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

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import { getDefinitionVersions } from '../../../hrmConfig';
import { getActivitiesFromContacts } from '../../../states/case/caseActivities';
import { VALID_EMPTY_CONTACT } from '../../testContacts';
import { Activity } from '../../../states/case/types';
import { WorkerSID } from '../../../types/twilio';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

let formDefinition;

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  formDefinition = await loadDefinition(formDefinitionsBaseUrl);
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
