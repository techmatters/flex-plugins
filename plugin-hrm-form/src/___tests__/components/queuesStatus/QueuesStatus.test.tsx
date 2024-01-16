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

import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import each from 'jest-each';

import HrmTheme from '../../../styles/HrmTheme';
import QueuesStatus from '../../../components/queuesStatus';
import { coreChannelTypes } from '../../../states/DomainConstants';

jest.mock('../../../components/CSAMReport/CSAMReportFormDefinition');

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

const themeConf = {
  colorTheme: HrmTheme,
};

function createState(queuesStatusState) {
  return {
    'plugin-hrm-form': {
      queuesStatusState,
    },
  };
}

const colors = {
  voice: '#000000',
  web: '#000000',
  facebook: '#000000',
  sms: '#000000',
  whatsapp: '#000000',
  twitter: '#000000',
  instagram: '#000000',
  line: '#000000',
};

test('Test <QueuesStatus> with initial state (display Not initialized)', () => {
  const ownProps = {
    colors,
    helpline: '',
    paddingRight: false,
  };
  const queuesStatusState = {
    queuesStatus: null,
    error: 'Not initialized',
    loading: true,
  };
  const initialState = createState(queuesStatusState);
  const store = mockStore(initialState);

  render(
    // @ts-ignore
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <QueuesStatus {...ownProps} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.queryByText('QueueCard-Name')).not.toBeInTheDocument();
  expect(screen.getByText('Not initialized')).toBeInTheDocument();
});

const checkValue = (qName: string, c: string, queuesStatusState) => {
  let value: string;
  if (queuesStatusState.queuesStatus[qName][c].toString() === '0') {
    value = '<span>—</span>';
  } else {
    value = queuesStatusState.queuesStatus[qName][c].toString();
  }
  return value;
};

test('Test <QueuesStatus> after update', () => {
  const secondsAgo = new Date();
  const oneMinuteAgo = new Date(secondsAgo.getTime() - 60 * 1000);
  const twoMinutesAgo = new Date(oneMinuteAgo.getTime() - 60 * 1000);

  const ownProps = {
    colors,
    paddingRight: false,
  };

  const queuesStatusState = {
    queuesStatus: {
      Q1: {
        facebook: 1,
        sms: 2,
        voice: 3,
        web: 4,
        whatsapp: 5,
        twitter: 0,
        instagram: 0,
        line: 0,
        longestWaitingDate: secondsAgo.toISOString(),
      },
      Q2: {
        facebook: 5,
        sms: 4,
        voice: 3,
        web: 2,
        whatsapp: 1,
        twitter: 0,
        instagram: 0,
        line: 0,
        longestWaitingDate: oneMinuteAgo.toISOString(),
      },
      Q3: {
        facebook: 2,
        sms: 2,
        voice: 2,
        web: 2,
        whatsapp: 2,
        twitter: 0,
        instagram: 0,
        line: 0,
        longestWaitingDate: twoMinutesAgo.toISOString(),
      },
      Q4: {
        facebook: 0,
        sms: 0,
        voice: 0,
        web: 0,
        whatsapp: 0,
        twitter: 0,
        instagram: 0,
        line: 0,
        longestWaitingDate: null,
      },
      Admin: {
        facebook: 9,
        sms: 9,
        voice: 9,
        web: 9,
        whatsapp: 9,
        twitter: 0,
        instagram: 0,
        line: 0,
        longestWaitingDate: null,
      },
    },
    error: null,
    loading: true,
  };
  const initialState = createState(queuesStatusState);
  const store = mockStore(initialState);

  render(
    // @ts-ignore
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <QueuesStatus {...ownProps} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.getAllByText('QueueCard-Name')).toHaveLength(5);

  const expectAllChannelsRendersInQ = ([qName, qStatus]) =>
    Object.values(coreChannelTypes).forEach(c => {
      // Check that the UI renders for this channel
      const channelInQ = screen.getByTestId(`${qName}-${c}`);
      expect(channelInQ).toBeInTheDocument();
      // Check that it contains one value and it's the same as the value for the channel in the given queue
      const channelBoxInnerValues = channelInQ.getElementsByClassName('channel-box-inner-value');
      expect(channelBoxInnerValues).toHaveLength(1);
      expect(channelBoxInnerValues[0].innerHTML).toContain(checkValue(qName, c, queuesStatusState));
    });
  Object.entries(queuesStatusState.queuesStatus).forEach(expectAllChannelsRendersInQ);

  expect(screen.getAllByText('QueueCard-LessThanMinute')).toHaveLength(1);
  expect(screen.getAllByText('QueueCard-OneMinute')).toHaveLength(1);
  expect(screen.getAllByText('QueueCard-Minutes')).toHaveLength(1);
  expect(screen.getAllByText('QueueCard-None')).toHaveLength(2);
});

each([
  ...Object.values(coreChannelTypes).map(c => ({ contactsWaitingChannels: [c], expectedChannelsCount: 1 })),
  {
    contactsWaitingChannels: [coreChannelTypes.voice, coreChannelTypes.whatsapp, coreChannelTypes.instagram],
    expectedChannelsCount: 3,
  },
  ...Object.values(coreChannelTypes).map((c1, _, arr) => ({
    contactsWaitingChannels: arr.filter(c2 => c2 !== c1),
    expectedChannelsCount: arr.length - 1,
  })),
]).test(
  'Test <QueuesStatus> with filtered channels with $contactsWaitingChannels',
  ({ contactsWaitingChannels, expectedChannelsCount }) => {
    const secondsAgo = new Date();

    const ownProps = {
      colors,
      paddingRight: false,
      contactsWaitingChannels,
    };

    const queuesStatusState = {
      queuesStatus: {
        Q1: {
          facebook: 1,
          sms: 2,
          voice: 3,
          web: 4,
          whatsapp: 5,
          twitter: 0,
          instagram: 0,
          line: 0,
          longestWaitingDate: secondsAgo.toISOString(),
        },
      },
      error: null,
      loading: true,
    };
    const initialState = createState(queuesStatusState);
    const store = mockStore(initialState);

    render(
      // @ts-ignore
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <QueuesStatus {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    expect(screen.getAllByText('QueueCard-Name')).toHaveLength(1);
    expect(screen.getAllByTestId('channel-box-inner-value')).toHaveLength(expectedChannelsCount);

    const expectAllChannelsRendersInQ = ([qName, qStatus]) =>
      Object.values(coreChannelTypes).forEach(c => {
        if (ownProps.contactsWaitingChannels.includes(c as any)) {
          // Check that the UI renders for this channel (if it's defined in contactsWaitingChannels)
          const channelInQ = screen.getByTestId(`${qName}-${c}`);
          expect(channelInQ).toBeInTheDocument();
          // Check that it contains one value and it's the same as the value for the channel in the given queue
          const channelBoxInnerValues = channelInQ.getElementsByClassName('channel-box-inner-value');
          expect(channelBoxInnerValues).toHaveLength(1);
          expect(channelBoxInnerValues[0].innerHTML).toContain(checkValue(qName, c, queuesStatusState));
        } else {
          // Check that the UI filters out this channel (cause it's not defined in contactsWaitingChannels)
          expect(screen.queryByTestId(`${qName}-${c}`)).not.toBeInTheDocument();
        }
      });
    Object.entries(queuesStatusState.queuesStatus).forEach(expectAllChannelsRendersInQ);
  },
);

test('Test <QueuesStatus> after error', () => {
  const secondsAgo = new Date();

  const ownProps = {
    colors,
    paddingRight: false,
  };
  const queuesStatusState = {
    queuesStatus: {
      Q1: {
        facebook: 1,
        sms: 2,
        voice: 3,
        web: 4,
        whatsapp: 5,
        twitter: 0,
        instagram: 0,
        line: 0,
        longestWaitingDate: secondsAgo.toISOString(),
      },
      Admin: {
        facebook: 9,
        sms: 9,
        voice: 9,
        web: 9,
        whatsapp: 9,
        twitter: 0,
        instagram: 0,
        line: 0,
        longestWaitingDate: null,
      },
    },
    error: 'Some error occured',
    loading: true,
  };
  const initialState = createState(queuesStatusState);
  const store = mockStore(initialState);

  render(
    // @ts-ignore
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <QueuesStatus {...ownProps} />
      </Provider>
    </StorelessThemeProvider>,
  );

  expect(screen.getAllByText('QueueCard-Name')).toHaveLength(2);
  expect(screen.getByText('Some error occured')).toBeInTheDocument();
});

test('a11y', async () => {
  const secondsAgo = new Date();
  const oneMinuteAgo = new Date(secondsAgo.getTime() - 60 * 1000);
  const twoMinutesAgo = new Date(oneMinuteAgo.getTime() - 60 * 1000);

  const ownProps = {
    colors,
    helpline: '',
    paddingRight: false,
  };
  const queuesStatusState = {
    queuesStatus: {
      Q1: {
        facebook: 1,
        sms: 2,
        voice: 3,
        web: 4,
        whatsapp: 5,
        twitter: 0,
        instagram: 0,
        line: 0,
        longestWaitingDate: secondsAgo.toISOString(),
      },
    },
    error: null,
    loading: true,
  };
  const initialState = createState(queuesStatusState);
  const store = mockStore(initialState);

  const { container } = render(
    // @ts-ignore
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <QueuesStatus {...ownProps} />
      </Provider>
    </StorelessThemeProvider>,
  );

  const rules = {};

  const axe = configureAxe({ rules });
  const results = await axe(container);

  // @ts-ignore
  expect(results).toHaveNoViolations();
});
