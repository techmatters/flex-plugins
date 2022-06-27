import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import HrmTheme from '../../styles/HrmTheme';
import { mockGetDefinitionsResponse } from '../mockGetConfig';
import { SearchPages } from '../../states/search/types';
import SearchResults from '../../components/search/SearchResults';
import { configurationBase, searchContactsBase, connectedCaseBase, contactFormsBase, namespace } from '../../states';
import { getDefinitionVersions } from '../../HrmFormPlugin';

const themeConf = {
  colorTheme: HrmTheme,
};

const mockStore = configureMockStore([]);

const task = { taskSid: 'task1' };
let state1;
let stateOnCasesTab;

let store1;
let storeOnCasesTab;
let mockV1;
describe('Search Results', () => {
  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);

    state1 = {
      [namespace]: {
        [configurationBase]: {
          counselors: {
            list: [],
            hash: { worker1: 'worker1 name' },
          },
          definitionVersions: { v1: mockV1 },
          currentDefinitionVersion: mockV1,
        },
        [contactFormsBase]: {
          tasks: {
            task1: {
              childInformation: {
                name: { firstName: { value: 'first' }, lastName: { value: 'last' } },
              },
              metadata: {},
            },
          },
        },
        [connectedCaseBase]: {
          tasks: {
            task1: {
              temporaryCaseInfo: null,
              connectedCase: {
                createdAt: 1593469560208,
                twilioWorkerId: 'worker1',
                status: 'open',
                info: null,
              },
            },
          },
        },
        [searchContactsBase]: {
          tasks: {
            task1: {
              currentPage: SearchPages.resultsContacts,
              temporaryCaseInfo: null,
              connectedCase: {
                createdAt: 1593469560208,
                twilioWorkerId: 'worker1',
                status: 'open',
                info: null,
              },
            },
          },
        },
      },
    };

    stateOnCasesTab = {
      [namespace]: {
        ...state1[namespace],
        [searchContactsBase]: {
          tasks: {
            task1: {
              ...state1[namespace][searchContactsBase].tasks.task1,
              currentPage: SearchPages.resultsCases,
            },
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
      expect(screen.getByTestId('ContactsCount')).toHaveTextContent('0 SearchResultsIndex-Contacts');
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
      expect(screen.getByTestId('CasesCount')).toHaveTextContent('0 SearchResultsIndex-Cases');
    });
  });

  describe('<SearchResults> with 1 result', () => {
    const searchContactsResults = {
      count: 1,
      contacts: [
        {
          contactId: 'Jill-Smith-id',
          overview: {
            dateTime: '2020-03-10',
            name: 'Jill Smith',
            customerNumber: 'Anonymous',
            callType: 'Child calling about self',
            categories: { category1: ['Tag1', 'Tag2'] },
            counselor: 'counselor-id',
            notes: 'Jill Smith Notes',
          },
          details: {
            definitionVersion: 'v1',
            caseInformation: {
              callSummary: 'Summary',
            },
          },
          counselor: 'Counselor',
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
          contactId: 'Jill-Smith-id',
          overview: {
            dateTime: '2020-03-10',
            name: 'Jill Smith',
            customerNumber: 'Anonymous',
            callType: 'Child calling about self',
            categories: { category1: ['Tag1', 'Tag2'] },
            counselor: 'counselor-id',
            notes: 'Jill Smith Notes',
          },
          details: {
            definitionVersion: 'v1',
            caseInformation: {
              callSummary: 'Summary',
            },
          },
          counselor: 'Counselor',
        },
        {
          contactId: 'Sarah-Park-id',
          overview: {
            dateTime: '2020-03-20',
            name: 'Sarah Park',
            customerNumber: 'Anonymous',
            callType: 'Child calling about self',
            categories: { category1: ['Tag3'] },
            counselor: 'counselor-id',
            notes: 'Jill Smith Notes',
          },
          details: {
            definitionVersion: 'v1',
            caseInformation: {
              callSummary: 'Summary',
            },
          },
          counselor: 'Counselor',
        },
      ],
    };

    const searchCasesResults = {
      count: 2,
      cases: [
        {
          createdAt: '2020-11-23T17:38:42.227Z',
          updatedAt: '2020-11-23T17:38:42.227Z',
          helpline: '',
          info: {
            households: [{ household: { name: { firstName: 'Maria', lastName: 'Silva' } } }],
            summary: 'case 1 summary',
          },
        },
        {
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
