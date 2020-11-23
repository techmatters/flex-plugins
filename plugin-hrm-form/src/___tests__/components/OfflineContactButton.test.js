import React from 'react';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { mount } from 'enzyme';
import { StorelessThemeProvider, withTheme } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

import HrmTheme from '../../styles/HrmTheme';
import OfflineContactButton from '../../components/OfflineContactButton';
import { assignMeContactlessTask } from '../../services/ServerlessService';

jest.mock('../../services/ServerlessService');

beforeEach(() => {
  assignMeContactlessTask.mockClear();
});

const themeConf = {
  colorTheme: HrmTheme,
};

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);

test('click on button', () => {
  const tasks = new Map(
    Object.entries({
      WT1: { channelType: 'web' },
      WT2: { channelType: 'sms' },
    }),
  );
  const store = mockStore({ flex: { worker: { tasks, activity: { available: true } } } });

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <OfflineContactButton />
      </Provider>
    </StorelessThemeProvider>,
  );

  screen.getByText('OfflineContactButtonText').click();

  expect(assignMeContactlessTask).toHaveBeenCalled();
});

test('button should be disabled (default task exists)', () => {
  const tasks = new Map(
    Object.entries({
      WT1: { channelType: 'web' },
      WT2: { channelType: 'default' },
    }),
  );
  const store = mockStore({ flex: { worker: { tasks, activity: { available: true } } } });

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <OfflineContactButton />
      </Provider>
    </StorelessThemeProvider>,
  );

  screen.getByText('OfflineContactButtonText').click();

  expect(assignMeContactlessTask).not.toHaveBeenCalled();
});

test('should not create task as worker is not available', () => {
  const tasks = new Map(
    Object.entries({
      WT1: { channelType: 'web' },
      WT2: { channelType: 'default' },
    }),
  );
  const store = mockStore({ flex: { worker: { tasks, activity: { available: false } } } });

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <OfflineContactButton />
      </Provider>
    </StorelessThemeProvider>,
  );

  screen.getByText('OfflineContactButtonText').click();

  expect(assignMeContactlessTask).not.toHaveBeenCalled();
});

const Wrapped = withTheme(props => <OfflineContactButton {...props} />);

test('a11y', async () => {
  const tasks = new Map(
    Object.entries({
      WT1: { channelType: 'web' },
      WT2: { channelType: 'sms' },
    }),
  );
  const store = mockStore({ flex: { worker: { tasks, activity: { available: true } } } });
  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <Wrapped />
      </Provider>
    </StorelessThemeProvider>,
  );

  const rules = {
    region: { enabled: false },
  };

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
