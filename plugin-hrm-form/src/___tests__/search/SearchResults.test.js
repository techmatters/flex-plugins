import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import '../mockStyled';

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

const store1 = mockStore(state1);

test('<SearchResults> with 0 results', () => {
  render(
    <Provider store={store1}>
      <SearchResults
        task={task}
        currentIsCaller={false}
        results={{ count: 0, contacts: [], casesCount: 0, cases: [] }}
        handleSelectSearchResult={jest.fn()}
        handleBack={jest.fn()}
        handleViewDetails={jest.fn()}
        handleMockedMessage={jest.fn()}
      />
    </Provider>,
  );

  expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('0 cases');
});

test('<SearchResults> with 1 result', () => {
  const results = {
    casesCount: 1,
    cases: [],
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

  render(
    <Provider store={store1}>
      <SearchResults
        task={task}
        currentIsCaller={false}
        results={results}
        handleSelectSearchResult={jest.fn()}
        handleBack={jest.fn()}
        handleViewDetails={jest.fn()}
        handleMockedMessage={jest.fn()}
      />
    </Provider>,
  );

  expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('1 cases');
});

test('<SearchResults> with multiple results', () => {
  const results = {
    casesCount: 2,
    cases: [],
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

  render(
    <Provider store={store1}>
      <SearchResults
        task={task}
        currentIsCaller={false}
        results={results}
        handleSelectSearchResult={jest.fn()}
        handleBack={jest.fn()}
        handleViewDetails={jest.fn()}
        handleMockedMessage={jest.fn()}
      />
    </Provider>,
  );

  expect(screen.getByTestId('SearchResultsCount')).toHaveTextContent('2 cases');
});
