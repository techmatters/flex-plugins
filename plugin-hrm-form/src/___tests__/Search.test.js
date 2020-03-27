import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';

import Search from '../components/Search';
import SearchForm from '../components/SearchForm';
import SearchResults from '../components/SearchResults';
import ContactDetails from '../components/ContactDetails';
import { SearchPages } from '../states/SearchContact';

const mockStore = configureMockStore([]);

const mockContext = {
  hrmBaseUrl: '',
  serverlessBaseUrl: '',
  workerSid: '',
  helpline: '',
  currentWorkspace: '',
  getSsoToken: () => '',
};

jest.mock('../Styles/HrmStyles', () => ({
  Container: 'Container',
  SearchFields: 'SearchFields',
  StyledSearchButton: 'StyledSearchButton',
  StyledLabel: 'StyledLabel',
  StyledInput: 'StyledInput',
  TextField: 'TextField',
  StyledMenuItem: 'StyledMenuItem',
  StyledSelect: 'StyledSelect',
  StyledTableCell: 'StyledTableCell',
}));

jest.mock('../services/ServerlessService', () => ({
  populateCounselors: async () => [],
}));

function createState({ currentPage, searchFormValues, currentContact, searchResult }) {
  return {
    'plugin-hrm-form': {
      searchContacts: {
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
        isRequesting: false,
        error: null,
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

  const initialState = createState({ currentPage, searchFormValues });
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <Search handleSelectSearchResult={() => null} />
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
      details: {},
    },
  ];

  const initialState = createState({ currentPage, searchResult });
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <Search handleSelectSearchResult={() => null} />
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
  };

  const initialState = createState({ currentPage, currentContact });
  const store = mockStore(initialState);

  const component = renderer.create(
    <Provider store={store}>
      <Search handleSelectSearchResult={() => null} />
    </Provider>,
  ).root;

  expect(() => component.findByType(SearchForm)).toThrow();
  expect(() => component.findByType(SearchResults)).toThrow();
  expect(() => component.findByType(ContactDetails)).not.toThrow();

  const contactProps = component.findByType(ContactDetails).props.contact;
  expect(contactProps).toEqual(currentContact);
});
