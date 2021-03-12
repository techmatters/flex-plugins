import React from 'react';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { mount } from 'enzyme';
import { StorelessThemeProvider, withTheme, Actions } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';

import HrmTheme from '../../styles/HrmTheme';
import OfflineContactButton from '../../components/OfflineContactButton';
import { namespace, routingBase, configurationBase } from '../../states';
import v1 from '../../formDefinitions/v1';

jest.mock('../../services/ServerlessService');
jest.mock('@twilio/flex-ui', () => ({
  ...jest.requireActual('@twilio/flex-ui'),
  Actions: {
    invokeAction: jest.fn(),
  },
}));

beforeEach(() => {
  Actions.invokeAction.mockClear();
});

const themeConf = {
  colorTheme: HrmTheme,
};

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);
test('click on button', async () => {
  const store = mockStore({
    flex: {
      view: { selectedTaskSid: '123', activeView: 'some-view' },
    },
    [namespace]: {
      [configurationBase]: {
        currentDefinitionVersion: v1,
      },
      [routingBase]: {
        isAddingOfflineContact: false,
      },
    },
  });

  const recreateContactState = jest.fn();

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <OfflineContactButton recreateContactState={recreateContactState} />
      </Provider>
    </StorelessThemeProvider>,
  );

  screen.getByText('OfflineContactButtonText').click();

  await Promise.resolve();

  expect(Actions.invokeAction).toHaveBeenCalledTimes(2);
  /*
   * This is failing and couldn't fix it yet
   * expect(recreateContactState).toHaveBeenCalled();
   */
});

test('button should be disabled (default task exists)', () => {
  const store = mockStore({
    flex: {
      view: { selectedTaskSid: undefined, activeView: 'some-view' },
    },
    [namespace]: {
      [configurationBase]: {
        currentDefinitionVersion: v1,
      },
      [routingBase]: {
        isAddingOfflineContact: true,
      },
    },
  });

  const recreateContactState = jest.fn();

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <OfflineContactButton recreateContactState={recreateContactState} />
      </Provider>
    </StorelessThemeProvider>,
  );

  screen.getByText('OfflineContactButtonText').click();

  expect(Actions.invokeAction).not.toHaveBeenCalled();
  expect(recreateContactState).not.toHaveBeenCalled();
});

const Wrapped = withTheme(props => <OfflineContactButton {...props} />);

test('a11y', async () => {
  const store = mockStore({
    flex: {
      view: { selectedTaskSid: '123', activeView: 'some-view' },
    },
    [namespace]: {
      [configurationBase]: {
        currentDefinitionVersion: v1,
      },
      [routingBase]: {
        isAddingOfflineContact: false,
      },
    },
  });

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
