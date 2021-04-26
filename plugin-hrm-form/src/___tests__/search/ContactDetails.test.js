import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import '../mockStyled';
import '../mockGetConfig';

import ContactDetails from '../../components/search/ContactDetails';
import Section from '../../components/Section';
import callTypes, { channelTypes } from '../../states/DomainConstants';
import mockV1 from '../../formDefinitions/v1';

const mockStore = configureMockStore([]);

const contactOfType = type => ({
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
const handleExpandDetailsSection = jest.fn();
const detailsExpanded = {
  'General details': true,
};

const initialState = {
  'plugin-hrm-form': {
    configuration: {
      definitionVersions: { v1: mockV1 },
      currentDefinitionVersion: mockV1,
      counselors: [{ HASH1: 'CreatorOfTheCase' }],
    },
  },
};

test(`<ContactDetails> with contact of type ${callTypes.child}`, () => {
  const contact = contactOfType(callTypes.child);
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <ContactDetails
        contact={contact}
        currentIsCaller={false}
        handleBack={handleBack}
        handleMockedMessage={handleMockedMessage}
        handleSelectSearchResult={handleSelectSearchResult}
        detailsExpanded={detailsExpanded}
        handleExpandDetailsSection={handleExpandDetailsSection}
      />
    </Provider>,
  ).root;

  const sections = component.findAllByType(Section);
  const sectionsCount = sections.length;
  expect(sectionsCount).toEqual(4);
});

test(`<ContactDetails> with contact of type ${callTypes.caller}`, () => {
  const contact = contactOfType(callTypes.caller);
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <ContactDetails
        contact={contact}
        currentIsCaller={true}
        handleBack={handleBack}
        handleMockedMessage={handleMockedMessage}
        handleSelectSearchResult={handleSelectSearchResult}
        detailsExpanded={detailsExpanded}
        handleExpandDetailsSection={handleExpandDetailsSection}
      />
    </Provider>,
  ).root;
  const sections = component.findAllByType(Section);
  const sectionsCount = sections.length;
  expect(sectionsCount).toEqual(5);
});

test(`<ContactDetails> with a non data (standalone) contact`, () => {
  const contact = contactOfType('anything else');
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <ContactDetails
        contact={contact}
        currentIsCaller={false}
        handleBack={handleBack}
        handleMockedMessage={handleMockedMessage}
        handleSelectSearchResult={handleSelectSearchResult}
        detailsExpanded={detailsExpanded}
        handleExpandDetailsSection={handleExpandDetailsSection}
      />
    </Provider>,
  ).root;
  const sections = component.findAllByType(Section);
  const sectionsCount = sections.length;
  expect(sectionsCount).toEqual(1);
});
