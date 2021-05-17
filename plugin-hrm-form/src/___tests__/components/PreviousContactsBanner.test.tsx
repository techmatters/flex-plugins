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
      viewPreviousContacts={jest.fn()}
    />,
  );

  expect(searchContacts).toHaveBeenCalled();
  expect(searchCases).toHaveBeenCalled();
});

test('Dont repeat initial search calls on PreviousContacts', () => {
  const searchContacts = jest.fn();
  const searchCases = jest.fn();

  const previousContacts = {
    contacts: { count: 3, contacts: [] },
    casesCount: { count: 1, cases: [] },
  };

  render(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={previousContacts}
      searchContacts={searchContacts}
      searchCases={searchCases}
      changeRoute={jest.fn()}
      viewPreviousContacts={jest.fn()}
    />,
  );

  expect(searchContacts).not.toHaveBeenCalled();
  expect(searchCases).not.toHaveBeenCalled();
});

test('Dont render PreviousContacts when there are no previous contacts', () => {
  const previousContacts = {
    contacts: { count: 0, contacts: [] },
    casesCount: { count: 0, cases: [] },
  };

  render(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={previousContacts}
      searchContacts={jest.fn()}
      searchCases={jest.fn()}
      changeRoute={jest.fn()}
      viewPreviousContacts={jest.fn()}
    />,
  );

  expect(() => screen.getByTestId('PreviousContacts-Container')).toThrow();
});

test('Render PreviousContacts when there are previous contacts', () => {
  const previousContacts = {
    contacts: { count: 3, contacts: [] },
    casesCount: { count: 1, cases: [] },
  };

  render(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={previousContacts}
      searchContacts={jest.fn()}
      searchCases={jest.fn()}
      changeRoute={jest.fn()}
      viewPreviousContacts={jest.fn()}
    />,
  );

  expect(screen.getByTestId('PreviousContacts-Container')).toBeInTheDocument();
});

test('Click View Records should redirect user to search results', () => {
  const previousContacts = {
    contacts: { count: 3, contacts: [] },
    casesCount: { count: 1, cases: [] },
  };

  const searchContacts = jest.fn();
  const searchCases = jest.fn();
  const changeRoute = jest.fn();
  const viewPreviousContacts = jest.fn();

  render(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={previousContacts}
      searchContacts={searchContacts}
      searchCases={searchCases}
      changeRoute={changeRoute}
      viewPreviousContacts={viewPreviousContacts}
    />,
  );

  screen.getByTestId('PreviousContacts-ViewRecords').click();

  expect(searchContacts).not.toHaveBeenCalled();
  expect(searchCases).not.toHaveBeenCalled();
  expect(viewPreviousContacts).toHaveBeenCalled();
  expect(changeRoute).toHaveBeenCalledWith({ route: 'tabbed-forms', subroute: 'search' });
});

test('a11y', async () => {
  const previousContacts = {
    contacts: { count: 3, contacts: [] },
    casesCount: { count: 1, cases: [] },
  };

  const wrapper = mount(
    <UnconnectedPreviousContactsBanner
      task={webChatTask}
      counselorsHash={counselorsHash}
      previousContacts={previousContacts}
      searchContacts={jest.fn()}
      searchCases={jest.fn()}
      changeRoute={jest.fn()}
      viewPreviousContacts={jest.fn()}
    />,
  );

  const rules = {
    region: { enabled: false },
  };

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
