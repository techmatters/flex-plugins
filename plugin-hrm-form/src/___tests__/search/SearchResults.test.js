import React from 'react';
import renderer from 'react-test-renderer';

import '../mockStyled';

import SearchResults from '../../components/search/SearchResults';
import ContactPreview from '../../components/search/ContactPreview';
import { BackText } from '../../Styles/search';

const getResultsLabel = component => component.findAllByType(BackText)[1].children.join('');

test('<SearchResults> with 0 results', () => {
  const component = renderer.create(
    <SearchResults
      results={[]}
      handleSelectSearchResult={jest.fn()}
      handleBack={jest.fn()}
      handleViewDetails={jest.fn()}
      handleMockedMessage={jest.fn()}
    />,
  ).root;

  const resultsLabel = getResultsLabel(component);

  expect(resultsLabel).toEqual('0 results');
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

  const component = renderer.create(
    <SearchResults
      results={results}
      handleSelectSearchResult={jest.fn()}
      handleBack={jest.fn()}
      handleViewDetails={jest.fn()}
      handleMockedMessage={jest.fn()}
    />,
  ).root;

  const resultsLabel = getResultsLabel(component);

  expect(resultsLabel).toEqual('1 result');
  expect(() => component.findByType(ContactPreview)).not.toThrow();
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
    {
      contactId: 'Sarah-Park-id',
      overview: {
        dateTime: '2020-03-20',
        name: 'Sarah Park',
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
      tags: ['Tag3'],
    },
  ];

  const component = renderer.create(
    <SearchResults
      results={results}
      handleSelectSearchResult={jest.fn()}
      handleBack={jest.fn()}
      handleViewDetails={jest.fn()}
      handleMockedMessage={jest.fn()}
    />,
  ).root;

  const resultsLabel = getResultsLabel(component);

  expect(resultsLabel).toEqual('2 results');
  expect(() => component.findAllByType(ContactPreview)).not.toThrow();
});
