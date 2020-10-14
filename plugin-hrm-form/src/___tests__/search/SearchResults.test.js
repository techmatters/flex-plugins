import React from 'react';
import renderer from 'react-test-renderer';
import { Template } from '@twilio/flex-ui';

import '../mockStyled';

import SearchResults from '../../components/search/SearchResults';
import ContactPreview from '../../components/search/ContactPreview';
import { BackText, StyledFormControlLabel } from '../../styles/search';

const getResultsLabel = component => component.findAllByType(BackText)[1].children;

const resultTemp = <Template code="SearchResultsIndex-Result" />;
const resultsTemp = <Template code="SearchResultsIndex-Results" />;

test('<SearchResults> with 0 results', () => {
  const results = {
    count: 0,
    contacts: [],
  };
  const component = renderer.create(
    <SearchResults
      currentIsCaller={false}
      results={results}
      handleSelectSearchResult={jest.fn()}
      handleBack={jest.fn()}
      handleViewDetails={jest.fn()}
      handleMockedMessage={jest.fn()}
    />,
  ).root;

  const resultsLabel = getResultsLabel(component);

  expect(resultsLabel[0]).toEqual('0');
  expect(resultsLabel[1].props).toStrictEqual(resultsTemp.props);
  expect(() => component.findByType(ContactPreview)).toThrow();
});

test('<SearchResults> with 1 result', () => {
  const results = {
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

  const component = renderer.create(
    <SearchResults
      currentIsCaller={false}
      results={results}
      handleSelectSearchResult={jest.fn()}
      handleBack={jest.fn()}
      handleViewDetails={jest.fn()}
      handleMockedMessage={jest.fn()}
    />,
  ).root;

  const resultsLabel = getResultsLabel(component);

  expect(resultsLabel[0]).toEqual('1');
  expect(resultsLabel[1].props).toStrictEqual(resultTemp.props);
  expect(() => component.findByType(ContactPreview)).not.toThrow();
});

test('<SearchResults> with multiple results', () => {
  const results = {
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

  const component = renderer.create(
    <SearchResults
      currentIsCaller={false}
      results={results}
      handleSelectSearchResult={jest.fn()}
      handleBack={jest.fn()}
      handleViewDetails={jest.fn()}
      handleMockedMessage={jest.fn()}
    />,
  ).root;

  const resultsLabel = getResultsLabel(component);

  expect(resultsLabel[0]).toEqual('2');
  expect(resultsLabel[1].props).toStrictEqual(resultsTemp.props);
  expect(() => component.findAllByType(ContactPreview)).not.toThrow();
});

const getSwitch = component => component.findByType(StyledFormControlLabel).props.control;

test('<SearchResults> toggle non-data contacts', () => {
  const results = {
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
          name: '',
          customerNumber: 'Anonymous',
          callType: 'Joke',
          categories: {},
          counselor: 'counselor-id',
          notes: '',
        },
        details: {
          caseInformation: {
            callSummary: '',
          },
        },
        counselor: 'Counselor',
      },
    ],
  };

  const toggleNonDataContacts = jest.fn();

  const component = renderer.create(
    <SearchResults
      currentIsCaller={false}
      results={results}
      handleSelectSearchResult={jest.fn()}
      toggleNonDataContacts={toggleNonDataContacts}
      handleBack={jest.fn()}
      handleViewDetails={jest.fn()}
      handleMockedMessage={jest.fn()}
    />,
  ).root;

  expect(() => getSwitch(component)).not.toThrow();
  getSwitch(component).props.onChange();

  expect(toggleNonDataContacts).toHaveBeenCalled();
});
