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

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { callTypes, DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import { mockGetDefinitionsResponse } from '../mockGetConfig';
import ContactDetails from '../../components/search/ContactDetails';
import { channelTypes } from '../../states/DomainConstants';
import { getDefinitionVersions } from '../../hrmConfig';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { Contact, CustomITask } from '../../types/types';
import { csamReportBase } from '../../states/storeNamespaces';

jest.mock('@twilio/flex-ui', () => ({
  ...jest.requireActual('@twilio/flex-ui'),
  Actions: { invokeAction: jest.fn() },
}));

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

const mockStore = configureMockStore([]);

const contactOfType = (type): Contact => ({
  id: 'TEST CONTACT ID',
  profileId: 123,
  accountSid: '',
  createdAt: '',
  updatedBy: '',
  queueName: '',
  timeOfContact: '2020-03-10',
  number: 'Anonymous',
  twilioWorkerId: 'counselor-id',
  channel: channelTypes.web,
  conversationDuration: 10,
  helpline: '',
  taskId: '',
  createdBy: 'HASH1',
  csamReports: [],
  channelSid: '',
  serviceSid: '',
  rawJson: {
    definitionVersion: DefinitionVersionId.v1,
    childInformation: {
      firstName: 'Jill',
      lastName: 'Smith',
      gender: 'Other',
      age: '18-25',
      language: 'Language 1',
      nationality: 'Nationality 1',
      ethnicity: 'Ethnicity 1',
      streetAddress: '',
      city: '',
      stateOrCounty: '',
      postalCode: '',
      phone1: '',
      phone2: '',
      refugee: false,
      disabledOrSpecialNeeds: false,
      hiv: false,
      name: 'school',
      gradeLevel: 'some',
    },
    caseInformation: {
      callSummary: type,
      referredTo: '',
      status: 'In Progress',
      keepConfidential: true,
      okForCaseWorkerToCall: false,
      howDidTheChildHearAboutUs: '',
      didYouDiscussRightsWithTheChild: false,
      didTheChildFeelWeSolvedTheirProblem: false,
      wouldTheChildRecommendUsToAFriend: false,
    },
    callerInformation: {
      firstName: '',
      lastName: '',
      relationshipToChild: '',
      gender: '',
      age: '',
      language: '',
      nationality: '',
      ethnicity: '',
      city: '',
      phone1: '',
      phone2: '',
      postalCode: '',
      stateOrCounty: '',
      streetAddress: '',
    },
    categories: { category1: ['Tag1', 'Tag2'] },
    callType: type,
    contactlessTask: {
      channel: 'voice',
    } as Contact['rawJson']['contactlessTask'],
  },
  conversationMedia: [],
});

const handleSelectSearchResult = jest.fn();

let mockV1;
let initialState;

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  initialState = type => ({
    'plugin-hrm-form': {
      configuration: {
        definitionVersions: { v1: mockV1 },
        currentDefinitionVersion: mockV1,
        counselors: { hash: { HASH1: 'CreatorOfTheCase' } },
      },
      activeContacts: {
        existingContacts: {
          'TEST CONTACT ID': {
            refCount: 1,
            savedContact: contactOfType(type),
          },
        },
        contactDetails: {
          [DetailsContext.CONTACT_SEARCH]: {
            detailsExpanded: {},
          },
        },
      },
      [csamReportBase]: {
        tasks: {},
        contacts: {},
      },
      routing: {
        tasks: {
          TEST_TASK_ID: [{ route: 'contact', subroute: 'view', id: 'TEST CONTACT ID' }],
        },
      },
    },
    flex: {
      worker: {
        attributes: {
          roles: [],
        },
      },
    },
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test(`<ContactDetails> with contact of type ${callTypes.child}`, async () => {
  const contact = contactOfType(callTypes.child);
  const store = mockStore(initialState(callTypes.child));

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <ContactDetails
          contact={contact}
          currentIsCaller={false}
          handleSelectSearchResult={handleSelectSearchResult}
          showActionIcons={false}
          task={{ taskSid: 'TEST_TASK_ID' } as CustomITask}
        />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.getByTestId('ContactDetails')).toBeInTheDocument();
  expect(screen.queryByTestId('ContactDetails-Section-ChildInformation')).toBeInTheDocument();
  expect(screen.getAllByTestId('ContactDetails-Section')).toHaveLength(4);
});

test(`<ContactDetails> with contact of type ${callTypes.caller}`, async () => {
  const contact = contactOfType(callTypes.caller);
  const store = mockStore(initialState(callTypes.caller));

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <ContactDetails
          contact={contact}
          currentIsCaller={true}
          handleSelectSearchResult={handleSelectSearchResult}
          task={{ taskSid: 'TEST_TASK_ID' } as CustomITask}
          showActionIcons={false}
        />
      </Provider>
    </StorelessThemeProvider>,
  );
  expect(screen.getByTestId('ContactDetails')).toBeInTheDocument();
  expect(screen.queryByTestId('ContactDetails-Section-ChildInformation')).toBeInTheDocument();
  expect(screen.getAllByTestId('ContactDetails-Section')).toHaveLength(5);
});

test(`<ContactDetails> with a non data (standalone) contact`, async () => {
  const contact = contactOfType('anything else');
  const store = mockStore(initialState('anything else'));

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <ContactDetails
          contact={contact}
          currentIsCaller={false}
          handleSelectSearchResult={handleSelectSearchResult}
          showActionIcons={false}
          task={{ taskSid: 'TEST_TASK_ID' } as CustomITask}
        />
      </Provider>
    </StorelessThemeProvider>,
  );
  expect(screen.getByTestId('ContactDetails')).toBeInTheDocument();
  expect(screen.getAllByTestId('ContactDetails-Section')).toHaveLength(1);
});
