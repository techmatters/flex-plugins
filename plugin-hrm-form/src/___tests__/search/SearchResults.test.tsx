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
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../mockFetchDefinitions';
import { mockGetDefinitionsResponse } from '../mockGetConfig';
import SearchResults from '../../components/search/SearchResults';
import { getDefinitionVersions } from '../../hrmConfig';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { RecursivePartial } from '../RecursivePartial';
import { VALID_EMPTY_METADATA } from '../testContacts';
import { SearchCaseResult } from '../../types/types';

jest.mock('../../permissions', () => ({
  getInitializedCan: jest.fn(() => () => true),
  PermissionActions: {},
}));

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

const themeConf = {};

const mockStore = configureMockStore([]);

const task = { taskSid: 'task1' };
let state1: RecursivePartial<RootState>;
let stateOnCasesTab: RecursivePartial<RootState>;

let store1;
let storeOnCasesTab;
let mockV1;

beforeEach(() => {
  mockReset();
});

describe('Search Results', () => {
  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockV1 = await loadDefinition(formDefinitionsBaseUrl);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);

    state1 = {
      [namespace]: {
        configuration: {
          counselors: {
            list: [],
            hash: { worker1: 'worker1 name' },
          },
          definitionVersions: { v1: mockV1 },
          currentDefinitionVersion: mockV1,
        },
        activeContacts: {
          existingContacts: {
            contact1: {
              savedContact: {
                rawJson: {
                  childInformation: {
                    firstName: 'first',
                    lastName: 'last',
                  },
                },
              },
              references: [],
              metadata: { ...VALID_EMPTY_METADATA },
            },
          },
        },
        connectedCase: {
          cases: {
            case1: {
              connectedCase: {
                createdAt: new Date(1593469560208).toISOString(),
                twilioWorkerId: 'WKworker1',
                status: 'open',
                info: {},
              },
            },
          },
        },
        searchContacts: {
          tasks: {
            task1: {},
          },
        },
        routing: {
          tasks: {
            [`WTtask1`]: [{ route: 'search', subroute: 'case-results' }],
          },
        },
      },
    };

    stateOnCasesTab = {
      [namespace]: {
        ...state1[namespace],

        routing: {
          tasks: {
            task1: [{ route: 'search', subroute: 'case-results' }],
          },
        },
      },
    };

    store1 = mockStore(state1);
    storeOnCasesTab = mockStore(stateOnCasesTab);
  });

  describe('<SearchResults> with 0 results', () => {
    test('on contacts tab', () => {
      render(
        <StorelessThemeProvider themeConf={themeConf}>
          <Provider store={store1}>
            <SearchResults
              task={task}
              currentIsCaller={false}
              searchContactsResults={{ count: 0, contacts: [] }}
              searchCasesResults={{ count: 0, cases: [] }}
              handleSelectSearchResult={jest.fn()}
              handleBack={jest.fn()}
              handleViewDetails={jest.fn()}
              handleMockedMessage={jest.fn()}
            />
          </Provider>
        </StorelessThemeProvider>,
      );

      expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('0 PreviousContacts-Cases');
      expect(screen.getByTestId('ContactsCount')).toHaveTextContent(
        'SearchResultsIndex-NoContactsFoundSearchResultsIndex-SearchAgainForContact',
      );
    });

    test('on cases tab', () => {
      render(
        <StorelessThemeProvider themeConf={themeConf}>
          <Provider store={storeOnCasesTab}>
            <SearchResults
              task={task}
              currentIsCaller={false}
              searchContactsResults={{ count: 0, contacts: [] }}
              searchCasesResults={{ count: 0, cases: [] }}
              handleSelectSearchResult={jest.fn()}
              handleBack={jest.fn()}
              handleViewDetails={jest.fn()}
              handleMockedMessage={jest.fn()}
            />
          </Provider>
        </StorelessThemeProvider>,
      );

      expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('0 PreviousContacts-Contacts');
      expect(screen.getByTestId('CasesCount')).toHaveTextContent(
        'SearchResultsIndex-NoCasesFoundSearchResultsIndex-SearchAgainForCase',
      );
    });
  });

  describe('<SearchResults> with 1 result', () => {
    const searchContactsResults: SearchContactResult = {
      count: 1,
      contacts: [
        {
          id: 'Jill-Smith-id',
          twilioWorkerId: 'counselor-id',
          timeOfContact: '2020-03-10',
          number: 'Anonymous',
          rawJson: {
            callType: 'Child calling about self',
            definitionVersion: 'v1',
            childInformation: {
              firstName: 'Jill',
              lastName: 'Smith',
            },
            caseInformation: {
              callSummary: 'Jill Smith Notes',
            },
            categories: { category1: ['Tag1', 'Tag2'] },
          },
          accountSid: '',
          conversationDuration: 0,
          csamReports: [],
          createdAt: '',
          // Add the missing properties here
        },
      ],
    };

    const searchCasesResults = {
      count: 1,
      cases: [
        {
          createdAt: '2020-11-23T17:38:42.227Z',
          updatedAt: '2020-11-23T17:38:42.227Z',
          helpline: '',
          info: {
            households: [{ household: { name: { firstName: 'Maria', lastName: 'Silva' } } }],
            summary: 'case summary',
          },
        },
      ],
    };

    test('on contacts tab', () => {
      render(
        <StorelessThemeProvider themeConf={themeConf}>
          <Provider store={store1}>
            <SearchResults
              task={task}
              currentIsCaller={false}
              searchContactsResults={searchContactsResults}
              searchCasesResults={searchCasesResults}
              handleSelectSearchResult={jest.fn()}
              handleBack={jest.fn()}
              handleViewDetails={jest.fn()}
              handleMockedMessage={jest.fn()}
            />
          </Provider>
        </StorelessThemeProvider>,
      );

      expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('1 PreviousContacts-Case');
      expect(screen.getByTestId('ContactsCount')).toHaveTextContent('1 PreviousContacts-Contact');
    });

    test('on cases tab', () => {
      render(
        <StorelessThemeProvider themeConf={themeConf}>
          <Provider store={storeOnCasesTab}>
            <SearchResults
              task={task}
              currentIsCaller={false}
              searchContactsResults={searchContactsResults}
              searchCasesResults={searchCasesResults}
              handleSelectSearchResult={jest.fn()}
              handleBack={jest.fn()}
              handleViewDetails={jest.fn()}
              handleMockedMessage={jest.fn()}
            />
          </Provider>
        </StorelessThemeProvider>,
      );

      expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('1 PreviousContacts-Contact');
      expect(screen.getByTestId('CasesCount')).toHaveTextContent('1 PreviousContacts-Case');
    });
  });

  describe('<SearchResults> with multiple results', () => {
    const searchContactsResults = {
      count: 2,
      contacts: [
        {
          id: 'Jill-Smith-id',
          twilioWorkerId: 'counselor-id',
          timeOfContact: '2020-03-10',
          number: 'Anonymous',
          rawJson: {
            callType: 'Child calling about self',
            definitionVersion: 'v1',
            childInformation: {
              firstName: 'Jill',
              lastName: 'Smith',
            },
            caseInformation: {
              callSummary: 'Jill Smith Notes',
            },
            categories: { category1: ['Tag1', 'Tag2'] },
          },
        },
        {
          id: 'Sarah-Park-id',
          twilioWorkerId: 'counselor-id-2',
          timeOfContact: '2020-03-20',
          number: 'Anonymous',
          rawJson: {
            callType: 'Child calling about self',
            definitionVersion: 'v1',
            childInformation: {
              firstName: 'Sarah',
              lastName: 'Park',
            },
            caseInformation: {
              callSummary: 'Sarah Park Notes',
            },
            categories: { category1: ['Tag3'] },
          },
        },
      ],
    };

    const searchCasesResults: SearchCaseResult = {
      count: 2,
      cases: [
        {
          id: 'case1',
          accountSid: '',
          status: '',
          twilioWorkerId: '',
          categories: [],
          createdAt: '2020-11-23T17:38:42.227Z',
          updatedAt: '2020-11-23T17:38:42.227Z',
          helpline: '',
          info: {
            households: [{ household: { name: { firstName: 'Maria', lastName: 'Silva' } } }],
            summary: 'case 1 summary',
          },
        },
        {
          id: 'case2',
          accountSid: '',
          status: '',
          twilioWorkerId: '',
          categories: [],
          createdAt: '2020-11-23T17:38:42.227Z',
          updatedAt: '2020-11-23T17:38:42.227Z',
          helpline: '',
          info: {
            households: [{ household: { name: { firstName: 'John', lastName: 'Doe' } } }],
            summary: 'case 2 summary',
          },
        },
      ],
    };

    test('on contacts tab', () => {
      render(
        <StorelessThemeProvider themeConf={themeConf}>
          <Provider store={store1}>
            <SearchResults
              task={task}
              currentIsCaller={false}
              searchContactsResults={searchContactsResults}
              searchCasesResults={searchCasesResults}
              handleSelectSearchResult={jest.fn()}
              handleBack={jest.fn()}
              handleViewDetails={jest.fn()}
              handleMockedMessage={jest.fn()}
            />
          </Provider>
        </StorelessThemeProvider>,
      );

      expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('2 PreviousContacts-Cases');
      expect(screen.getByTestId('ContactsCount')).toHaveTextContent('2 SearchResultsIndex-Contacts');
    });

    test('on cases tab', () => {
      render(
        <StorelessThemeProvider themeConf={themeConf}>
          <Provider store={storeOnCasesTab}>
            <SearchResults
              task={task}
              currentIsCaller={false}
              searchContactsResults={searchContactsResults}
              searchCasesResults={searchCasesResults}
              handleSelectSearchResult={jest.fn()}
              handleBack={jest.fn()}
              handleViewDetails={jest.fn()}
              handleMockedMessage={jest.fn()}
            />
          </Provider>
        </StorelessThemeProvider>,
      );

      expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('2 PreviousContacts-Contacts');
      expect(screen.getByTestId('CasesCount')).toHaveTextContent('2 SearchResultsIndex-Cases');
    });
  });
});
