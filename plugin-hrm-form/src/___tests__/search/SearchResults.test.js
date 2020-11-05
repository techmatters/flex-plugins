import React from 'react';
import renderer from 'react-test-renderer';
import { Template } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import '../mockStyled';

import { SearchPages } from '../../states/search/types';
import SearchResults from '../../components/search/SearchResults';
import ContactPreview from '../../components/search/ContactPreview';
import { configurationBase, searchContactsBase, connectedCaseBase, contactFormsBase, namespace } from '../../states';

const resultTemp = <Template code="SearchResultsIndex-Result" />;
const resultsTemp = <Template code="SearchResultsIndex-Results" />;

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
  const component = renderer.create(
    <Provider store={store1}>
      <SearchResults
        task={task}
        currentIsCaller={false}
        results={[]}
        handleSelectSearchResult={jest.fn()}
        handleBack={jest.fn()}
        handleViewDetails={jest.fn()}
        handleMockedMessage={jest.fn()}
      />
    </Provider>,
  ).root;

  expect(() => component.findByType(ContactPreview)).toThrow();
});

test('<SearchResults> with 1 result', () => {
  const results = [
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
  ];

  const component = renderer.create(
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
  ).root;

  expect(() => component.findAllByType(ContactPreview)).not.toThrow();
});

test('<SearchResults> with multiple results', () => {
  const results = [
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
  ];

  const component = renderer.create(
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
  ).root;

  expect(() => component.findAllByType(ContactPreview)).not.toThrow();
});
