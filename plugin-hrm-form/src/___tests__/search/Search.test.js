import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';

import '../mockStyled';
import '../mockGetConfig';

import Search from '../../components/search';
import SearchForm from '../../components/search/SearchForm';
import SearchResults from '../../components/search/SearchResults';
import ContactDetails from '../../components/search/ContactDetails';
import { SearchPages } from '../../states/SearchContact';
import { channelTypes } from '../../states/DomainConstants';

const mockStore = configureMockStore([]);

jest.mock('../../services/ServerlessService', () => ({
  populateCounselors: async () => [],
}));

function createState(taskId, { currentPage, searchFormValues, currentContact, searchResult, detailsExpanded }) {
  return {
    'plugin-hrm-form': {
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
            detailsExpanded: detailsExpanded || {},
            isRequesting: false,
            error: null,
          },
        },
      },
    },
  };
}

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

  const initialState = createState(task.taskSid, { currentPage, searchFormValues });
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <Search task={task} handleSelectSearchResult={() => null} />
    </Provider>,
  ).root;

  expect(() => component.findByType(SearchForm)).not.toThrow();
  expect(() => component.findByType(SearchResults)).toThrow();
  expect(() => component.findByType(ContactDetails)).toThrow();

  const valuesProps = component.findByType(SearchForm).props.values;
  expect(valuesProps).toEqual(searchFormValues);
});

test('<Search> should display <SearchResults />', () => {
  const currentPage = SearchPages.results;
  const searchResult = [
    {
      contactId: 'Jill-Smith-id',
      overview: {
        dateTime: '2020-03-10',
        name: 'Jill Smith',
        customerNumber: 'Anonymous',
        callType: 'Child calling about self',
        categories: 'TBD',
        counselor: 'counselor-id',
        notes: 'Jill Smith Notes',
      },
      details: {
        caseInformation: {
          callSummary: 'Summary',
        },
      },
      counselor: 'Counselor',
      tags: ['Tag1', 'Tag2'],
    },
  ];
  const task = { taskSid: 'WT123' };

  const initialState = createState(task.taskSid, { currentPage, searchResult });
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <Search task={task} handleSelectSearchResult={() => null} />
    </Provider>,
  ).root;

  expect(() => component.findByType(SearchForm)).toThrow();
  expect(() => component.findByType(SearchResults)).not.toThrow();
  expect(() => component.findByType(ContactDetails)).toThrow();

  const resultsProps = component.findByType(SearchResults).props.results;
  expect(resultsProps).toEqual(searchResult);
});

test('<Search> should display <ContactDetails />', () => {
  const currentPage = SearchPages.details;
  const currentContact = {
    details: {
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
      categories: 'TBD',
      counselor: 'counselor-id',
      notes: 'Jill Smith Notes',
      channel: channelTypes.web,
      conversationDuration: 10,
    },
    counselor: 'Counselor',
    tags: ['Tag1', 'Tag2'],
  };
  const detailsExpanded = {
    'General details': true,
  };
  const task = { taskSid: 'WT123' };

  const initialState = createState(task.taskSid, { currentPage, currentContact, detailsExpanded });
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <Search task={task} handleSelectSearchResult={() => null} />
    </Provider>,
  ).root;

  expect(() => component.findByType(SearchForm)).toThrow();
  expect(() => component.findByType(SearchResults)).toThrow();
  expect(() => component.findByType(ContactDetails)).not.toThrow();

  const contactProps = component.findByType(ContactDetails).props.contact;
  expect(contactProps).toEqual(currentContact);
});
