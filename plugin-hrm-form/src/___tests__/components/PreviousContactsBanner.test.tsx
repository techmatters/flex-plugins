import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';

import '../mockStyled';
import { UnconnectedPreviousContactsBanner } from '../../components/PreviousContactsBanner';
import { channelTypes } from '../../states/DomainConstants';
import { SearchPages } from '../../states/search/types';

expect.extend(toHaveNoViolations);

const ip = 'task-ip';
const webChatTask: any = {
  taskSid: 'task-sid',
  channelType: channelTypes.web,
  defaultFrom: 'Anonymous',
  attributes: {
    isContactlessTask: false,
    ip,
  },
};

const counselor = 'counselor';
const counselorsHash = {
  'counselor-hash-1': counselor,
};
test('PreviousContacts initial search', () => {
  const searchContacts = jest.fn();
  const searchCases = jest.fn();

  render(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={undefined}
      searchContacts={searchContacts}
      searchCases={searchCases}
      changeRoute={jest.fn()}
      handleSearchFormChange={jest.fn()}
      changeSearchPage={jest.fn()}
    />,
  );

  expect(searchContacts).toHaveBeenCalled();
  expect(searchCases).toHaveBeenCalled();
});

test('Dont repeat initial search calls on PreviousContacts', () => {
  const searchContacts = jest.fn();
  const searchCases = jest.fn();

  const previousContacts = {
    contactsCount: 3,
    casesCount: 1,
  };

  render(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={previousContacts}
      searchContacts={searchContacts}
      searchCases={searchCases}
      changeRoute={jest.fn()}
      handleSearchFormChange={jest.fn()}
      changeSearchPage={jest.fn()}
    />,
  );

  expect(searchContacts).not.toHaveBeenCalled();
  expect(searchCases).not.toHaveBeenCalled();
});

test('Dont render PreviousContacts when there are no previous contacts', () => {
  const previousContacts = {
    contactsCount: 0,
    casesCount: 0,
  };

  render(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={previousContacts}
      searchContacts={jest.fn()}
      searchCases={jest.fn()}
      changeRoute={jest.fn()}
      handleSearchFormChange={jest.fn()}
      changeSearchPage={jest.fn()}
    />,
  );

  expect(() => screen.getByTestId('PreviousContacts-Container')).toThrow();
});

test('Render PreviousContacts when there are previous contacts', () => {
  const previousContacts = {
    contactsCount: 3,
    casesCount: 1,
  };

  render(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={previousContacts}
      searchContacts={jest.fn()}
      searchCases={jest.fn()}
      changeRoute={jest.fn()}
      handleSearchFormChange={jest.fn()}
      changeSearchPage={jest.fn()}
    />,
  );

  expect(screen.getByTestId('PreviousContacts-Container')).toBeInTheDocument();
});

test('Click View Records should redirect user to search results', () => {
  const previousContacts = {
    contactsCount: 3,
    casesCount: 1,
  };

  const searchContacts = jest.fn();
  const searchCases = jest.fn();
  const changeRoute = jest.fn();
  const handleSearchFormChange = jest.fn();
  const changeSearchPage = jest.fn();

  render(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={previousContacts}
      searchContacts={searchContacts}
      searchCases={searchCases}
      changeRoute={changeRoute}
      handleSearchFormChange={handleSearchFormChange}
      changeSearchPage={changeSearchPage}
    />,
  );

  expect(searchContacts).not.toHaveBeenCalled();
  expect(searchCases).not.toHaveBeenCalled();

  screen.getByTestId('PreviousContacts-ViewRecords').click();

  expect(searchContacts).toHaveBeenCalled();
  expect(searchCases).toHaveBeenCalled();
  expect(handleSearchFormChange).toHaveBeenCalledWith('contactNumber', ip);
  expect(changeSearchPage).toHaveBeenCalledWith(SearchPages.resultsContacts);
  expect(changeRoute).toHaveBeenCalledWith({ route: 'tabbed-forms', subroute: 'search' });
});

test('a11y', async () => {
  const previousContacts = {
    contactsCount: 3,
    casesCount: 1,
  };

  const wrapper = mount(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={previousContacts}
      searchContacts={jest.fn()}
      searchCases={jest.fn()}
      changeRoute={jest.fn()}
      handleSearchFormChange={jest.fn()}
      changeSearchPage={jest.fn()}
    />,
  );

  const rules = {
    region: { enabled: false },
  };

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
