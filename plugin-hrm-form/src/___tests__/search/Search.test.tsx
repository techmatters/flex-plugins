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
import { DefinitionVersionId, loadDefinition } from '@tech-matters/hrm-form-definitions';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import { mockLocalFetchDefinitions } from '../mockFetchDefinitions';
import { mockGetDefinitionsResponse } from '../mockGetConfig';
import { fetchRules } from '../../permissions/fetchRules';
import { getInitializedCan, validateAndSetPermissionRules } from '../../permissions';
import Search from '../../components/search';
import { getDefinitionVersions } from '../../hrmConfig';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { csamReportBase } from '../../states/storeNamespaces';
import { RecursivePartial } from '../RecursivePartial';
import { RootState } from '../../states';
import { Contact } from '../../types/types';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../testContacts';
import {
  DetailedSearchContactsResult,
  newSearchFormEntry,
  PreviousContactCounts,
  SearchFormValues,
} from '../../states/search/types';
import { AppRoutes } from '../../states/routing/types';
import { ContactState, ExistingContactsState } from '../../states/contacts/existingContacts';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

const mockStore = configureMockStore([]);
let mockV1;

const mockFlexManager = {
  workerClient: {
    attributes: {
      roles: [''],
    },
  },
};

jest.mock('../../services/ServerlessService', () => ({
  populateCounselors: async () => [],
}));

jest.mock('@twilio/flex-ui', () => ({
  ...(jest.requireActual('@twilio/flex-ui') as any),
  Manager: {
    getInstance: () => mockFlexManager,
  },
  Actions: {
    invokeAction: jest.fn(),
  },
}));

const e2eRules = require('../../permissions/e2e.json');

jest.mock('../../permissions/fetchRules', () => {
  return {
    fetchRules: jest.fn(() => {
      throw new Error('fetchRules not mocked!');
    }),
  };
});

beforeEach(async () => {
  const fetchRulesSpy = fetchRules as jest.MockedFunction<typeof fetchRules>;
  fetchRulesSpy.mockResolvedValueOnce(e2eRules);
  await validateAndSetPermissionRules();
  getInitializedCan();
});

jest.mock('../../states/case/caseBanners', () => ({
  __esModule: true,
  selectCaseMergingBanners: jest.fn(() => ({
    showRemovedFromCaseBanner: true,
  })),
}));

jest.mock('../../states/case/selectCaseStateByCaseId', () => {
  return {
    __esModule: true,
    selectCaseByCaseId: jest.fn(),
  };
});

function createState(
  taskId,
  context: string,
  {
    searchFormValues,
    currentContact,
    detailsExpanded,
    previousContactCounts,
    route,
    searchContactsResult,
  }: {
    searchFormValues: SearchFormValues;
    currentContact: Contact;
    detailsExpanded: any;
    previousContactCounts: { contacts: number; cases: number };
    route: AppRoutes;
    searchContactsResult?: DetailedSearchContactsResult;
  },
): RecursivePartial<RootState> {
  const references = searchContactsResult?.contacts.map(c => c.id) || [];
  const allContactsForState = [...(currentContact ? [currentContact] : []), ...(searchContactsResult?.contacts ?? [])];
  const existingContacts: ExistingContactsState = Object.fromEntries(
    allContactsForState.map<[string, ContactState]>(c => [
      c.id,
      {
        savedContact: c,
        references: new Set(['x']),
        metadata: VALID_EMPTY_METADATA,
      },
    ]),
  );

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
          'standalone-task-sid': [route],
          [taskId]: [route],
        },
      },
      searchContacts: {
        tasks: {
          [taskId]: {
            [context]: {
              form: searchFormValues || newSearchFormEntry,
              previousContactCounts,
              detailsExpanded: detailsExpanded || {},
              isRequesting: false,
              error: null,
              searchContactsResult: references
                ? {
                    count: searchContactsResult?.count,
                    ids: references,
                  }
                : undefined,
            },
          },
        },
      },
      activeContacts: {
        existingContacts,
        contactDetails: {
          [DetailsContext.CONTACT_SEARCH]: {
            detailsExpanded: {},
          },
        },
      },
      [csamReportBase]: {
        contacts: {},
      },
    },
    flex: {
      worker: {
        attributes: {
          roles: [] as any,
        },
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
  const searchFormValues: SearchFormValues = {
    firstName: 'Jill',
    lastName: 'Smith',
    counselor: { label: 'Counselor Name', value: 'counselor-id' },
    phoneNumber: 'Anonymous',
    dateFrom: '2020-03-10',
    dateTo: '2020-03-15',
    contactNumber: undefined,
    helpline: { label: '', value: '' },
  };
  const task = { taskSid: 'WT123', attributes: { preEngagementData: {} } };
  const context = 'root';

  const initialState = createState(task.taskSid, context, {
    searchFormValues,
    detailsExpanded,
    previousContactCounts: undefined,
    currentContact: undefined,
    route: { route: 'search', subroute: 'form' },
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <Search task={task} handleExpandDetailsSection={() => null} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.getByTestId('SearchForm')).toBeInTheDocument();
  expect(screen.queryByTestId('ContactDetails')).not.toBeInTheDocument();

  expect(screen.queryByRole('button', { name: 'Counsellor Name' })).toBeDefined();
});

test('<Search> should display <SearchForm /> with previous contacts checkbox', async () => {
  const searchFormValues: SearchFormValues = {
    firstName: 'Jill',
    lastName: 'Smith',
    counselor: { label: 'Counselor Name', value: 'counselor-id' },
    phoneNumber: 'Anonymous',
    dateFrom: '2020-03-10',
    dateTo: '2020-03-15',
    contactNumber: undefined,
    helpline: { label: '', value: '' },
  };
  const task = {
    taskSid: 'WT123',
    attributes: {
      isContactlessTask: false,
      ip: 'user-ip',
      preEngagementData: { contactType: 'ip' },
    },
  };
  const context = 'root';

  const previousContactCounts: PreviousContactCounts = {
    contacts: 3,
    cases: 1,
  };

  const initialState = createState(task.taskSid, context, {
    searchFormValues,
    detailsExpanded,
    previousContactCounts,
    currentContact: undefined,
    route: { route: 'search', subroute: 'form' },
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <Search task={task} handleExpandDetailsSection={() => null} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.queryByTestId('SearchForm')).toBeInTheDocument();
  expect(screen.queryByTestId('ContactDetails')).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: 'Search-PreviousContactsCheckbox' })).toBeDefined();
  expect(screen.queryByRole('button', { name: 'Counsellor Name' })).toBeDefined();
});

test('<Search> should display <ContactDetails />', async () => {
  const currentContact: Contact = {
    ...VALID_EMPTY_CONTACT,
    id: 'TEST CONTACT ID',
    timeOfContact: new Date().toISOString(),
    rawJson: {
      callType: 'Child calling about self',
      categories: {},
      contactlessTask: VALID_EMPTY_CONTACT.rawJson.contactlessTask,
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
    },
  };
  const task = { taskSid: 'WT123' };
  const context = 'root';

  const initialState = createState(task.taskSid, context, {
    currentContact,
    detailsExpanded,
    searchFormValues: undefined,
    previousContactCounts: undefined,
    searchContactsResult: { contacts: [currentContact], count: 1 },
    route: { route: 'contact', subroute: 'view', id: currentContact.id },
  });
  const store = mockStore(initialState);

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <Search task={task} handleExpandDetailsSection={() => null} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.queryByTestId('ContactDetails')).toBeInTheDocument();
  expect(screen.queryByTestId('SearchForm')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'SearchResultsIndex-BackToResults' })).toBeDefined();
  expect(store.getActions().length).toBe(0);
});
