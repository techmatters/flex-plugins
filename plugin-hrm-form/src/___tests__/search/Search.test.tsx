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
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import { mockGetDefinitionsResponse } from '../mockGetConfig';
import Search from '../../components/search';
import { SearchPages } from '../../states/search/types';
import { channelTypes } from '../../states/DomainConstants';
import { getDefinitionVersions } from '../../hrmConfig';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { csamReportBase } from '../../states/storeNamespaces';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

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
        existingContacts: {
          'TEST CONTACT ID': {
            refCount: 1,
            contact: currentContact,
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
    },
  };
}

const detailsExpanded = {
  'General details': true,
};

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
});

afterEach(() => {
  jest.clearAllMocks();
});

test('<Search> should display <SearchForm />', async () => {
  const currentPage = SearchPages.form;
  const searchFormValues = {
    firstName: 'Jill',
    lastName: 'Smith',
    counselor: { label: 'Counselor Name', value: 'counselor-id' },
    phoneNumber: 'Anonymous',
    dateFrom: '2020-03-10',
    dateTo: '2020-03-15',
  };
  const task = { taskSid: 'WT123', attributes: { preEngagementData: {} } };

  const initialState = createState(task.taskSid, {
    currentPage,
    searchFormValues,
    detailsExpanded,
    previousContacts: undefined,
    currentContact: undefined,
    searchResult: undefined,
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <Search task={task} handleSelectSearchResult={() => null} handleExpandDetailsSection={() => null} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.getByTestId('SearchForm')).toBeInTheDocument();
  expect(screen.queryByTestId('ContactDetails')).not.toBeInTheDocument();

  expect(screen.getAllByRole('textbox')).toHaveLength(5);
  expect(screen.queryByRole('button', { name: 'Counsellor Name' })).toBeDefined();
  expect(screen.getByDisplayValue('Jill')).toBeDefined();
});

test('<Search> should display <SearchForm /> with previous contacts checkbox', async () => {
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
      preEngagementData: { contactType: 'ip' },
    },
  };

  const previousContacts = {
    contacts: { count: 3, contacts: [] },
    casesCount: { count: 1, cases: [] },
  };

  const initialState = createState(task.taskSid, {
    currentPage,
    searchFormValues,
    detailsExpanded,
    previousContacts,
    currentContact: undefined,
    searchResult: undefined,
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <Search task={task} handleSelectSearchResult={() => null} handleExpandDetailsSection={() => null} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.queryByTestId('SearchForm')).toBeInTheDocument();
  expect(screen.queryByTestId('ContactDetails')).not.toBeInTheDocument();
  expect(screen.getAllByRole('textbox')).toHaveLength(5);
  expect(screen.queryByRole('checkbox', { name: 'Search-PreviousContactsCheckbox' })).toBeDefined();
  expect(screen.queryByRole('button', { name: 'Counsellor Name' })).toBeDefined();
});

test('<Search> should display <ContactDetails />', async () => {
  const currentPage = SearchPages.details;
  const currentContact = {
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

  const initialState = createState(task.taskSid, {
    currentPage,
    currentContact,
    detailsExpanded,
    searchFormValues: undefined,
    previousContacts: undefined,
    searchResult: undefined,
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <Search task={task} handleSelectSearchResult={() => null} handleExpandDetailsSection={() => null} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.queryByTestId('ContactDetails')).toBeInTheDocument();
  expect(screen.queryByTestId('SearchForm')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'SearchResultsIndex-BackToResults' })).toBeDefined();
  expect(store.getActions().length).toBe(1);
});
