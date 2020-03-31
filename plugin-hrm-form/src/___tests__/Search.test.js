import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';

import './mockStyled';

import Search from '../components/search';
import SearchForm from '../components/search/SearchForm';
import SearchResults from '../components/search/SearchResults';
import ContactDetails from '../components/search/ContactDetails';
import { formatName, formatAddress } from '../components/search/ContactDetails/Details';
import { SearchPages } from '../states/SearchContact';

const mockStore = configureMockStore([]);

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
      details: {
        caseInformation: {
          callSummary: 'Summary',
        },
      },
      counselor: 'Counselor',
      tags: ['Tag1', 'Tag2'],
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
      channel: 'web',
      conversationDuration: 10,
    },
    counselor: 'Counselor',
    tags: ['Tag1', 'Tag2'],
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

test('Test name and address formatters', () => {
  const name = 'Some name';
  const expectName = formatName(name);
  const expectUnknown = formatName(' ');

  expect(expectName).toEqual(name);
  expect(expectUnknown).toEqual('Unknown');

  const addr1 = ['Street', 'City', 'State', 'CP'];
  const expectedAddr1 = 'Street, City, State CP';
  const formattedAddr1 = formatAddress(addr1[0], addr1[1], addr1[2], addr1[3]);

  const addr2 = ['', 'City', 'State', ''];
  const expectedAddr2 = 'City, State';
  const formattedAddr2 = formatAddress(addr2[0], addr2[1], addr2[2], addr2[3]);

  const addr3 = ['', '', '', ''];
  const expectedAddr3 = '';
  const formattedAddr3 = formatAddress(addr3[0], addr3[1], addr3[2], addr3[3]);

  expect(formattedAddr1).toEqual(expectedAddr1);
  expect(formattedAddr2).toEqual(expectedAddr2);
  expect(formattedAddr3).toEqual(expectedAddr3);
});
