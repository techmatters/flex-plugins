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
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import { UnconnectedPreviousContactsBanner } from '../../components/profile/ProfileIdentifierBanner/PreviousContactsBanner';
import { channelTypes } from '../../states/DomainConstants';
import { PreviousContactCounts } from '../../states/search/types';

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
      />
    </StorelessThemeProvider>,
  );

  expect(screen.getByTestId('PreviousContacts-Container')).toBeInTheDocument();
});

test('Click View Records should redirect user to search results', () => {
  const searchContacts = jest.fn();
  const searchCases = jest.fn();
  const openModal = jest.fn();
  const viewPreviousContacts = jest.fn();

  render(
    <StorelessThemeProvider themeConf={{}}>
      <UnconnectedPreviousContactsBanner
        task={webChatTask}
        counselorsHash={counselorsHash}
        previousContactCounts={previousContactCounts}
        searchContacts={searchContacts}
        searchCases={searchCases}
        viewPreviousContacts={viewPreviousContacts}
        openContactSearchResults={openModal}
      />
    </StorelessThemeProvider>,
  );

  screen.getByTestId('PreviousContacts-ViewRecords').click();

  expect(searchContacts).toHaveBeenCalled();
  expect(searchCases).toHaveBeenCalled();
  expect(viewPreviousContacts).toHaveBeenCalled();
  expect(openModal).toHaveBeenCalled();
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
