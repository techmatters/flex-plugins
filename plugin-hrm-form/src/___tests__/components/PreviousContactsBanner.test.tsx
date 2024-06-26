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
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import { UnconnectedPreviousContactsBanner } from '../../components/profile/IdentifierBanner/PreviousContactsBanner';
import { channelTypes } from '../../states/DomainConstants';
import { PreviousContactCounts } from '../../states/search/types';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../testContacts';

jest.mock('../../components/CSAMReport/CSAMReportFormDefinition');

jest.mock('../../permissions', () => ({
  getInitializedCan: jest.fn(() => () => true),
  PermissionActions: {},
}));

expect.extend(toHaveNoViolations);

const ip = 'task-ip';
const webChatTask: any = {
  taskSid: 'task-sid',
  channelType: channelTypes.web,
  defaultFrom: 'Anonymous',
  attributes: {
    isContactlessTask: false,
    ip,
    preEngagementData: { contactType: 'ip', contactIdentifier: ip },
  },
};

const contact = {
  savedContact: VALID_EMPTY_CONTACT,
  references: new Set(['x']),
  metadata: VALID_EMPTY_METADATA,
};

const counselor = 'counselor';
const counselorsHash = {
  'counselor-hash-1': counselor,
};

const previousContactCounts: PreviousContactCounts = {
  contacts: 3,
  cases: 1,
};

test('PreviousContacts initial search', () => {
  const searchContacts = jest.fn();
  const searchCases = jest.fn();

  // Mocking the behavior of searchContacts and searchCases to return functions
  searchContacts.mockReturnValueOnce(jest.fn());
  searchCases.mockReturnValueOnce(jest.fn());

  render(
    <StorelessThemeProvider themeConf={{}}>
      <UnconnectedPreviousContactsBanner
        task={webChatTask}
        counselorsHash={counselorsHash}
        previousContactCounts={undefined}
        searchContacts={searchContacts}
        searchCases={searchCases}
        changeRoute={jest.fn()}
        viewPreviousContacts={jest.fn()}
        handleSearchFormChange={jest.fn().mockReturnValue(jest.fn())}
        contact={contact}
      />
    </StorelessThemeProvider>,
  );

  expect(searchContacts).toHaveBeenCalled();
  expect(searchCases).toHaveBeenCalled();
});

test('Dont repeat initial search calls on PreviousContacts', () => {
  const searchContacts = jest.fn();
  const searchCases = jest.fn();

  render(
    <StorelessThemeProvider themeConf={{}}>
      <UnconnectedPreviousContactsBanner
        task={webChatTask}
        counselorsHash={counselorsHash}
        previousContactCounts={previousContactCounts}
        searchContacts={searchContacts}
        searchCases={searchCases}
        changeRoute={jest.fn()}
        viewPreviousContacts={jest.fn()}
        handleSearchFormChange={jest.fn()}
      />
    </StorelessThemeProvider>,
  );

  expect(searchContacts).not.toHaveBeenCalled();
  expect(searchCases).not.toHaveBeenCalled();
});

test('Dont render PreviousContacts when there are no previous contacts', () => {
  const emptyPreviousContacts = {
    contacts: { count: 0, contacts: [] },
    casesCount: { count: 0, cases: [] },
  };

  render(
    <StorelessThemeProvider themeConf={{}}>
      <UnconnectedPreviousContactsBanner
        task={webChatTask}
        counselorsHash={counselorsHash}
        previousContactCounts={emptyPreviousContacts}
        searchContacts={jest.fn()}
        searchCases={jest.fn()}
        changeRoute={jest.fn()}
        viewPreviousContacts={jest.fn()}
        handleSearchFormChange={jest.fn()}
      />
    </StorelessThemeProvider>,
  );

  expect(() => screen.getByTestId('PreviousContacts-Container')).toThrow();
});

test('Render PreviousContacts when there are previous contacts', () => {
  const previousContactCounts: PreviousContactCounts = {
    contacts: 3,
    cases: 1,
  };

  render(
    <StorelessThemeProvider themeConf={{}}>
      <UnconnectedPreviousContactsBanner
        task={webChatTask}
        counselorsHash={counselorsHash}
        previousContactCounts={previousContactCounts}
        searchContacts={jest.fn()}
        searchCases={jest.fn()}
        changeRoute={jest.fn()}
        viewPreviousContacts={jest.fn()}
        handleSearchFormChange={jest.fn()}
      />
    </StorelessThemeProvider>,
  );

  expect(screen.getByTestId('PreviousContacts-Container')).toBeInTheDocument();
});

test('calls the correct function when the contacts link is clicked', () => {
  const openContactSearchResults = jest.fn();
  const openCaseSearchResults = jest.fn();
  const searchContacts = jest.fn();
  const searchCases = jest.fn();

  const { getByTestId } = render(
    <UnconnectedPreviousContactsBanner
      previousContactCounts={{ contacts: 1, cases: 0 }}
      task={webChatTask}
      searchContacts={searchContacts}
      searchCases={searchCases}
      openContactSearchResults={openContactSearchResults('10001')}
      openCaseSearchResults={openCaseSearchResults}
      handleSearchFormChange={jest.fn()}
    />,
  );

  fireEvent.click(getByTestId('banner-link-contacts'));
  expect(openContactSearchResults).toHaveBeenCalledWith('10001');
});

test('calls the correct function when the cases link is clicked', () => {
  const openContactSearchResults = jest.fn();
  const openCaseSearchResults = jest.fn();
  const searchContacts = jest.fn();
  const searchCases = jest.fn();

  const { getByTestId } = render(
    <UnconnectedPreviousContactsBanner
      previousContactCounts={{ contacts: 0, cases: 1 }}
      task={webChatTask}
      searchContacts={searchContacts}
      searchCases={searchCases}
      openContactSearchResults={openContactSearchResults}
      openCaseSearchResults={openCaseSearchResults('10001')}
      handleSearchFormChange={jest.fn()}
    />,
  );

  fireEvent.click(getByTestId('banner-link-cases'));
  expect(openCaseSearchResults).toHaveBeenCalledWith('10001');
});

test('a11y', async () => {
  const wrapper = mount(
    <StorelessThemeProvider themeConf={{}}>
      <UnconnectedPreviousContactsBanner
        task={webChatTask}
        counselorsHash={counselorsHash}
        previousContactCounts={previousContactCounts}
        searchContacts={jest.fn()}
        searchCases={jest.fn()}
        changeRoute={jest.fn()}
        viewPreviousContacts={jest.fn()}
        handleSearchFormChange={jest.fn()}
      />
    </StorelessThemeProvider>,
  );

  const rules = {
    region: { enabled: false },
  };

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
