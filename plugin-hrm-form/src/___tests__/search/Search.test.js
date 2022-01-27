import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import '../mockStyled';
import { mockGetDefinitionsResponse } from '../mockGetConfig';
import Search from '../../components/search';
import SearchForm from '../../components/search/SearchForm';
import ContactDetails from '../../components/search/ContactDetails';
import { SearchPages } from '../../states/search/types';
import { channelTypes } from '../../states/DomainConstants';
import { getDefinitionVersions } from '../../HrmFormPlugin';

const mockStore = configureMockStore([]);
let mockV1;

jest.mock('../../services/ServerlessService', () => ({
  populateCounselors: async () => [],
}));

function createState(
  taskId,
  { currentPage, searchFormValues, currentContact, searchResult, detailsExpanded, previousContacts },
) {
  return {
    'plugin-hrm-form': {
      configuration: {
        counselors: {
          list: [],
          hash: {},
        },
        definitionVersions: { v1: mockV1 },
        currentDefinitionVersion: mockV1,
      },
      routing: {
        tasks: {
          'standalone-task-sid': 'some-id',
        },
      },
      searchContacts: {
        tasks: {
          [taskId]: {
            currentPage: currentPage || SearchPages.form,
            currentContact: currentContact || null,
            form: searchFormValues || {
              firstName: '',
              lastName: '',
              counselor: { label: '', value: '' },
              phoneNumber: '',
              dateFrom: '',
              dateTo: '',
            },
            searchResult: searchResult || [],
            previousContacts,
            detailsExpanded: detailsExpanded || {},
            isRequesting: false,
            error: null,
          },
        },
      },
      activeContacts: {
        tasks: {
          [taskId]: {
            helpline: 'helpline',
          },
        },
      },
    },
  };
}

const detailsExpanded = {
  'General details': true,
};

beforeAll(async () => {
  mockV1 = await loadDefinition(DefinitionVersionId.v1);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

test('<Search> should display <SearchForm />', () => {
  const currentPage = SearchPages.form;
  const searchFormValues = {
    firstName: 'Jill',
    lastName: 'Smith',
    counselor: { label: 'Counselor Name', value: 'counselor-id' },
    phoneNumber: 'Anonymous',
    dateFrom: '2020-03-10',
    dateTo: '2020-03-15',
  };
  const task = { taskSid: 'WT123' };

  const initialState = createState(task.taskSid, { currentPage, searchFormValues, detailsExpanded });
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <Search task={task} handleSelectSearchResult={() => null} handleExpandDetailsSection={() => null} />
    </Provider>,
  ).root;

  expect(() => component.findByType(SearchForm)).not.toThrow();
  expect(() => component.findByType(ContactDetails)).toThrow();

  const valuesProps = component.findByType(SearchForm).props.values;
  expect(valuesProps).toEqual(searchFormValues);
});

test('<Search> should display <SearchForm /> with previous contacts checkbox', () => {
  const currentPage = SearchPages.form;
  const searchFormValues = {
    firstName: 'Jill',
    lastName: 'Smith',
    counselor: { label: 'Counselor Name', value: 'counselor-id' },
    phoneNumber: 'Anonymous',
    dateFrom: '2020-03-10',
    dateTo: '2020-03-15',
  };
  const task = {
    taskSid: 'WT123',
    attributes: {
      isContactlessTask: false,
      ip: 'user-ip',
    },
  };

  const previousContacts = {
    contacts: { count: 3, contacts: [] },
    casesCount: { count: 1, cases: [] },
  };

  const initialState = createState(task.taskSid, { currentPage, searchFormValues, detailsExpanded, previousContacts });
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <Search task={task} handleSelectSearchResult={() => null} handleExpandDetailsSection={() => null} />
    </Provider>,
  ).root;

  expect(() => component.findByType(SearchForm)).not.toThrow();
  expect(() => component.findByProps({ 'data-testid': 'Search-PreviousContactsCheckbox' })).not.toThrow();
  expect(() => component.findByType(ContactDetails)).toThrow();

  const valuesProps = component.findByType(SearchForm).props.values;
  expect(valuesProps).toEqual(searchFormValues);
});

test('<Search> should display <ContactDetails />', () => {
  const currentPage = SearchPages.details;
  const currentContact = {
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
        callSummary: 'Child calling about self',
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
      callType: 'Child calling about self',
      categories: { category1: ['Tag1', 'Tag2'] },
      counselor: 'counselor-id',
      notes: 'Jill Smith Notes',
      channel: channelTypes.web,
      conversationDuration: 10,
    },
    counselor: 'Counselor',
  };
  const task = { taskSid: 'WT123' };

  const initialState = createState(task.taskSid, { currentPage, currentContact, detailsExpanded });
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <Search task={task} handleSelectSearchResult={() => null} handleExpandDetailsSection={() => null} />
    </Provider>,
  ).root;

  expect(() => component.findByType(SearchForm)).toThrow();
  expect(() => component.findByType(ContactDetails)).not.toThrow();

  const contactProps = component.findByType(ContactDetails).props.contact;
  expect(contactProps).toEqual(currentContact);
});
