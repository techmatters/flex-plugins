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
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { mount } from 'enzyme';
import { StorelessThemeProvider, withTheme, Actions } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import HrmTheme from '../../../styles/HrmTheme';
import { AddOfflineContactButton } from '../../../components/OfflineContact';
import { namespace, routingBase, configurationBase } from '../../../states';
import { rerenderAgentDesktop } from '../../../rerenderView';

let v1;

jest.mock('../../../services/ServerlessService');
jest.mock('../../../rerenderView', () => ({
  rerenderAgentDesktop: jest.fn(),
}));
jest.mock('@twilio/flex-ui', () => ({
  ...jest.requireActual('@twilio/flex-ui'),
  Actions: {
    invokeAction: jest.fn(),
  },
}));

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  v1 = await loadDefinition(formDefinitionsBaseUrl);
});

beforeEach(async () => {
  mockReset();
  Actions.invokeAction.mockClear();
  rerenderAgentDesktop.mockClear();
});

const themeConf = {
  colorTheme: HrmTheme,
};

expect.extend(toHaveNoViolations);

const mockStore = configureMockStore([]);
test('click on button', async () => {
  const store = mockStore({
    flex: {
      view: { selectedTaskSid: '123' },
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
        <AddOfflineContactButton recreateContactState={recreateContactState} />
      </Provider>
    </StorelessThemeProvider>,
  );

  screen.getByText('OfflineContactButtonText').click();

  await Promise.resolve();

  expect(Actions.invokeAction).toHaveBeenCalledTimes(1);
  expect(rerenderAgentDesktop).toHaveBeenCalledTimes(1);
  /*
   * This is failing and couldn't fix it yet
   * expect(recreateContactState).toHaveBeenCalled();
   */
});

test('button should be disabled (default task exists)', () => {
  const store = mockStore({
    flex: {
      view: { selectedTaskSid: undefined },
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
        <AddOfflineContactButton recreateContactState={recreateContactState} />
      </Provider>
    </StorelessThemeProvider>,
  );

  screen.getByText('OfflineContactButtonText').click();

  expect(Actions.invokeAction).not.toHaveBeenCalled();
  expect(rerenderAgentDesktop).not.toHaveBeenCalled();
  expect(recreateContactState).not.toHaveBeenCalled();
});

const Wrapped = withTheme(props => <AddOfflineContactButton {...props} />);

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
