import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import '../mockStyled';
import '../mockGetConfig';

import { SearchPages } from '../../states/search/types';
import SearchResults from '../../components/search/SearchResults';
import { configurationBase, searchContactsBase, connectedCaseBase, contactFormsBase, namespace } from '../../states';

const mockStore = configureMockStore([]);

const task = { taskSid: 'task1' };

const state1 = {
  [namespace]: {
    [configurationBase]: {
      counselors: {
        list: [],
        hash: { worker1: 'worker1 name' },
      },
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

const stateOnCasesTab = {
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

const store1 = mockStore(state1);
const storeOnCasesTab = mockStore(stateOnCasesTab);

describe('<SearchResults> with 0 results', () => {
  test('on contacts tab', () => {
    render(
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
      </Provider>,
    );

    expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('0 cases');
    expect(screen.getByTestId('ContactsCount')).toHaveTextContent('0 SearchResultsIndex-Contacts');
  });

  test('on cases tab', () => {
    render(
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
      </Provider>,
    );

    expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('0 contacts');
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
      </Provider>,
    );

    expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('1 cases');
    expect(screen.getByTestId('ContactsCount')).toHaveTextContent('1 SearchResultsIndex-Contacts');
  });

  test('on cases tab', () => {
    render(
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
      </Provider>,
    );

    expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('1 contacts');
    expect(screen.getByTestId('CasesCount')).toHaveTextContent('1 SearchResultsIndex-Cases');
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
      </Provider>,
    );

    expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('2 cases');
    expect(screen.getByTestId('ContactsCount')).toHaveTextContent('2 SearchResultsIndex-Contacts');
  });

  test('on cases tab', () => {
    render(
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
      </Provider>,
    );

    expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('2 contacts');
    expect(screen.getByTestId('CasesCount')).toHaveTextContent('2 SearchResultsIndex-Cases');
  });
});
