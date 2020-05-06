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
    helpline: '',
  };
  const queuesStatusState = {
    queuesStatus: null,
    error: 'Not initialized',
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
  expect(() => component.findByType(ErrorText)).not.toThrow();
});

test('Test <QueuesStatus> after update (with helpline)', () => {
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

  const ownProps1 = { ...ownProps, helpline: 'Q1' };
  const ownProps2 = { ...ownProps, helpline: 'Q2' };
  const ownProps3 = { ...ownProps, helpline: 'Q3' };
  const ownProps4 = { ...ownProps, helpline: 'Q4' };

  const queuesStatusState = {
    queuesStatus: {
      Q1: { facebook: 1, sms: 2, voice: 3, web: 4, whatsapp: 5, longestWaitingDate: secondsAgo.toISOString() },
      Q2: { facebook: 5, sms: 4, voice: 3, web: 2, whatsapp: 1, longestWaitingDate: oneMinuteAgo.toISOString() },
      Q3: { facebook: 2, sms: 2, voice: 2, web: 2, whatsapp: 2, longestWaitingDate: twoMinutesAgo.toISOString() },
      Q4: { facebook: 0, sms: 0, voice: 0, web: 0, whatsapp: 0, longestWaitingDate: null },
      Admin: { facebook: 9, sms: 9, voice: 9, web: 9, whatsapp: 9, longestWaitingDate: null },
    },
    error: null,
    loading: true,
  };
  const initialState = createState(queuesStatusState);
  const store = mockStore(initialState);

  const [component1, component2, component3, component4] = [ownProps1, ownProps2, ownProps3, ownProps4].map(
    props =>
      renderer.create(
        <StorelessThemeProvider themeConf={themeConf}>
          <Provider store={store}>
            <QueuesStatus {...props} />
          </Provider>
        </StorelessThemeProvider>,
      ).root,
  );

  [component1, component2, component3, component4].forEach(component => {
    expect(() => component.findAllByType(QueueCard)).not.toThrow();
    expect(component.findAllByType(QueueCard)).toHaveLength(1);
  });

  const WaitTimeValue1 = component1.findByType(WaitTimeValue).props;
  const WaitTimeValue2 = component2.findByType(WaitTimeValue).props;
  const WaitTimeValue3 = component3.findByType(WaitTimeValue).props;
  const WaitTimeValue4 = component4.findByType(WaitTimeValue).props;
  expect(WaitTimeValue1.children).toBe('less than a minute');
  expect(WaitTimeValue2.children).toBe('1 minute');
  expect(WaitTimeValue3.children).toBe('2 minutes');
  expect(WaitTimeValue4.children).toBe('none');
});

test('Test <QueuesStatus> without helpline', () => {
  const ownProps = {
    colors: {
      voiceColor: { Accepted: '#000000' },
      webColor: { Accepted: '#000000' },
      facebookColor: { Accepted: '#000000' },
      smsColor: { Accepted: '#000000' },
      whatsappColor: { Accepted: '#000000' },
    },
    helpline: '',
  };

  const queuesStatusState = {
    queuesStatus: {
      Q1: { facebook: 1, sms: 2, voice: 3, web: 4, whatsapp: 5, longestWaitingDate: null },
      Q2: { facebook: 5, sms: 4, voice: 3, web: 2, whatsapp: 1, longestWaitingDate: null },
      Q3: { facebook: 2, sms: 2, voice: 2, web: 2, whatsapp: 2, longestWaitingDate: null },
      Q4: { facebook: 0, sms: 0, voice: 0, web: 0, whatsapp: 0, longestWaitingDate: null },
      Admin: { facebook: 9, sms: 9, voice: 9, web: 9, whatsapp: 9, longestWaitingDate: null },
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
  expect(QueueCards).toHaveLength(1);
  expect(QueueCards[0].props.facebook).toBe(9);
  expect(QueueCards[0].props.sms).toBe(9);
  expect(QueueCards[0].props.voice).toBe(9);
  expect(QueueCards[0].props.web).toBe(9);
  expect(QueueCards[0].props.whatsapp).toBe(9);
  const WaitTimeValue1 = component.findByType(WaitTimeValue).props;
  expect(WaitTimeValue1.children).toBe('none');
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
    helpline: '',
  };
  const queuesStatusState = {
    queuesStatus: {
      Q1: { facebook: 1, sms: 2, voice: 3, web: 4, whatsapp: 5, longestWaitingDate: secondsAgo.toISOString() },
      Admin: { facebook: 9, sms: 9, voice: 9, web: 9, whatsapp: 9, longestWaitingDate: null },
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
    helpline: '',
  };
  const queuesStatusState = {
    queuesStatus: {
      Q1: { facebook: 1, sms: 2, voice: 3, web: 4, whatsapp: 5, longestWaitingDate: secondsAgo.toISOString() },
      Q2: { facebook: 5, sms: 4, voice: 3, web: 2, whatsapp: 1, longestWaitingDate: oneMinuteAgo.toISOString() },
      Q3: { facebook: 2, sms: 2, voice: 2, web: 2, whatsapp: 2, longestWaitingDate: twoMinutesAgo.toISOString() },
      Q4: { facebook: 0, sms: 0, voice: 0, web: 0, whatsapp: 0, longestWaitingDate: null },
      Admin: { facebook: 9, sms: 9, voice: 9, web: 9, whatsapp: 9, longestWaitingDate: null },
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
