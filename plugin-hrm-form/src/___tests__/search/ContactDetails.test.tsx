import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { callTypes, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import { mockGetDefinitionsResponse } from '../mockGetConfig';
import ContactDetails from '../../components/search/ContactDetails';
import { channelTypes } from '../../states/DomainConstants';
import { getDefinitionVersions } from '../../HrmFormPlugin';
import { DetailsContext } from '../../states/contacts/contactDetails';

const mockStore = configureMockStore([]);

const contactOfType = type => ({
  contactId: 'TEST CONTACT ID',
  details: {
    definitionVersion: 'v1',
    childInformation: {
      name: {
        firstName: 'Jill',
        lastName: 'Smith',
      },
      gender: 'Other',
      age: '18-25',
      language: 'Language 1',
      nationality: 'Nationality 1',
      ethnicity: 'Ethnicity 1',
      location: {
        streetAddress: '',
        city: '',
        stateOrCounty: '',
        postalCode: '',
        phone1: '',
        phone2: '',
      },
      refugee: false,
      disabledOrSpecialNeeds: false,
      hiv: false,
      school: {
        name: 'school',
        gradeLevel: 'some',
      },
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
      name: {
        firstName: '',
        lastName: '',
      },
      relationshipToChild: '',
      gender: '',
      age: '',
      language: '',
      nationality: '',
      ethnicity: '',
      location: {
        city: '',
        phone1: '',
        phone2: '',
        postalCode: '',
        stateOrCounty: '',
        streetAddress: '',
      },
    },
  },
  overview: {
    dateTime: '2020-03-10',
    name: 'Jill Smith',
    customerNumber: 'Anonymous',
    callType: type,
    categories: { category1: ['Tag1', 'Tag2'] },
    counselor: 'counselor-id',
    notes: 'Jill Smith Notes',
    channel: channelTypes.web,
    conversationDuration: 10,
  },
  counselor: 'Counselor',
  createdBy: 'HASH1',
  tags: ['Tag1', 'Tag2'],
});

const handleBack = jest.fn();
const handleMockedMessage = jest.fn();
const handleSelectSearchResult = jest.fn();
const detailsExpanded = {
  'General details': true,
};

let mockV1;
let initialState;

beforeAll(async () => {
  mockV1 = await loadDefinition(DefinitionVersionId.v1);
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
          handleBack={handleBack}
          handleMockedMessage={handleMockedMessage}
          handleSelectSearchResult={handleSelectSearchResult}
          detailsExpanded={detailsExpanded}
          task={{ taskSid: 'TEST_TASK_ID' }}
        />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.getByTestId('ContactDetails')).toBeInTheDocument();
  expect(screen.queryByTestId('ContactDetails-Section-ChildInformation')).toBeInTheDocument();
  expect(store.getActions().length).toBe(1);
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
          handleBack={handleBack}
          handleMockedMessage={handleMockedMessage}
          handleSelectSearchResult={handleSelectSearchResult}
          detailsExpanded={detailsExpanded}
          task={{ taskSid: 'TEST_TASK_ID' }}
        />
      </Provider>
    </StorelessThemeProvider>,
  );
  expect(screen.getByTestId('ContactDetails')).toBeInTheDocument();
  expect(screen.queryByTestId('ContactDetails-Section-ChildInformation')).toBeInTheDocument();
  expect(store.getActions().length).toBe(1);
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
          handleBack={handleBack}
          handleMockedMessage={handleMockedMessage}
          handleSelectSearchResult={handleSelectSearchResult}
          detailsExpanded={detailsExpanded}
          task={{ taskSid: 'TEST_TASK_ID' }}
        />
      </Provider>
    </StorelessThemeProvider>,
  );
  expect(screen.getByTestId('ContactDetails')).toBeInTheDocument();
  expect(store.getActions().length).toBe(1);
  expect(screen.getAllByTestId('ContactDetails-Section')).toHaveLength(1);
});
