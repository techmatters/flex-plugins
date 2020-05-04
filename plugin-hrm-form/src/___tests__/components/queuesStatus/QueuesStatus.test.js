import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { mount } from 'enzyme';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import HrmTheme from '../../../styles/HrmTheme';
import QueuesStatus from '../../../components/queuesStatus';
import QueueCard from '../../../components/queuesStatus/QueueCard';
import { WaitTimeValue } from '../../../styles/queuesStatus';
import { ErrorText } from '../../../styles/HrmStyles';

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

test('Test <QueuesStatus> with initial state', () => {
  const ownProps = {
    colors: {
      voiceColor: { Accepted: '#000000' },
      webColor: { Accepted: '#000000' },
      facebookColor: { Accepted: '#000000' },
      smsColor: { Accepted: '#000000' },
      whatsappColor: { Accepted: '#000000' },
    },
  };
  const queuesStatusState = {
    queuesStatus: null,
    error: null,
    loading: true,
  };
  const initialState = createState(queuesStatusState);
  const store = mockStore(initialState);

  const component = renderer.create(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <QueuesStatus {...ownProps} />
      </Provider>
    </StorelessThemeProvider>,
  ).root;

  expect(() => component.findByType(QueueCard)).toThrow();
});

test('Test <QueuesStatus> after update', () => {
  const secondsAgo = new Date();
  const oneMinuteAgo = new Date(secondsAgo.getTime() - 60 * 1000);
  const twoMinutesAgo = new Date(oneMinuteAgo.getTime() - 60 * 1000);

  const ownProps = {
    colors: {
      voiceColor: { Accepted: '#000000' },
      webColor: { Accepted: '#000000' },
      facebookColor: { Accepted: '#000000' },
      smsColor: { Accepted: '#000000' },
      whatsappColor: { Accepted: '#000000' },
    },
  };
  const queuesStatusState = {
    queuesStatus: {
      Q1: { facebook: 1, sms: 2, voice: 3, web: 4, whatsapp: 5, longestWaitingDate: secondsAgo.toISOString() },
      Q2: { facebook: 5, sms: 4, voice: 3, web: 2, whatsapp: 1, longestWaitingDate: oneMinuteAgo.toISOString() },
      Q3: { facebook: 2, sms: 2, voice: 2, web: 2, whatsapp: 2, longestWaitingDate: twoMinutesAgo.toISOString() },
      Q4: { facebook: 0, sms: 0, voice: 0, web: 0, whatsapp: 0, longestWaitingDate: null },
    },
    error: null,
    loading: true,
  };
  const initialState = createState(queuesStatusState);
  const store = mockStore(initialState);

  const component = renderer.create(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <QueuesStatus {...ownProps} />
      </Provider>
    </StorelessThemeProvider>,
  ).root;
  expect(() => component.findAllByType(QueueCard)).not.toThrow();
  const QueueCards = component.findAllByType(QueueCard);
  expect(QueueCards).toHaveLength(4);

  const WaitTimeValue1 = QueueCards[0].findByType(WaitTimeValue).props;
  const WaitTimeValue2 = QueueCards[1].findByType(WaitTimeValue).props;
  const WaitTimeValue3 = QueueCards[2].findByType(WaitTimeValue).props;
  const WaitTimeValue4 = QueueCards[3].findByType(WaitTimeValue).props;
  expect(WaitTimeValue1.children).toBe('less than a minute');
  expect(WaitTimeValue2.children).toBe('1 minute');
  expect(WaitTimeValue3.children).toBe('2 minutes');
  expect(WaitTimeValue4.children).toBe('none');
});

test('Test <QueuesStatus> after error', () => {
  const secondsAgo = new Date();
  const oneMinuteAgo = new Date(secondsAgo.getTime() - 60 * 1000);
  const twoMinutesAgo = new Date(oneMinuteAgo.getTime() - 60 * 1000);

  const ownProps = {
    colors: {
      voiceColor: { Accepted: '#000000' },
      webColor: { Accepted: '#000000' },
      facebookColor: { Accepted: '#000000' },
      smsColor: { Accepted: '#000000' },
      whatsappColor: { Accepted: '#000000' },
    },
  };
  const queuesStatusState = {
    queuesStatus: {
      Q1: { facebook: 1, sms: 2, voice: 3, web: 4, whatsapp: 5, longestWaitingDate: secondsAgo.toISOString() },
    },
    error: 'Some error occured',
    loading: true,
  };
  const initialState = createState(queuesStatusState);
  const store = mockStore(initialState);

  const component = renderer.create(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <QueuesStatus {...ownProps} />
      </Provider>
    </StorelessThemeProvider>,
  ).root;
  expect(() => component.findByType(QueueCard)).not.toThrow();
  expect(() => component.findByType(ErrorText)).not.toThrow();
  const ErrorProps = component.findByType(ErrorText).props;
  expect(ErrorProps.children).toBe(queuesStatusState.error);
});

test('a11y', async () => {
  const secondsAgo = new Date();
  const oneMinuteAgo = new Date(secondsAgo.getTime() - 60 * 1000);
  const twoMinutesAgo = new Date(oneMinuteAgo.getTime() - 60 * 1000);

  const ownProps = {
    colors: {
      voiceColor: { Accepted: '#000000' },
      webColor: { Accepted: '#000000' },
      facebookColor: { Accepted: '#000000' },
      smsColor: { Accepted: '#000000' },
      whatsappColor: { Accepted: '#000000' },
    },
  };
  const queuesStatusState = {
    queuesStatus: {
      Q1: { facebook: 1, sms: 2, voice: 3, web: 4, whatsapp: 5, longestWaitingDate: secondsAgo.toISOString() },
      Q2: { facebook: 5, sms: 4, voice: 3, web: 2, whatsapp: 1, longestWaitingDate: oneMinuteAgo.toISOString() },
      Q3: { facebook: 2, sms: 2, voice: 2, web: 2, whatsapp: 2, longestWaitingDate: twoMinutesAgo.toISOString() },
      Q4: { facebook: 0, sms: 0, voice: 0, web: 0, whatsapp: 0, longestWaitingDate: null },
    },
    error: null,
    loading: true,
  };
  const initialState = createState(queuesStatusState);
  const store = mockStore(initialState);

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <QueuesStatus {...ownProps} />
      </Provider>
    </StorelessThemeProvider>,
  );

  const rules = {};

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
