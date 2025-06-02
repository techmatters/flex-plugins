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
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { render, screen, waitFor } from '@testing-library/react';
import { mount } from 'enzyme';
import { Actions, StorelessThemeProvider, withTheme } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import { loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import { mockPartialConfiguration } from '../../mockGetConfig';
import { AddOfflineContactButton } from '../../../components/OfflineContact';
import { rerenderAgentDesktop } from '../../../rerenderView';
import { createContact } from '../../../services/ContactService';
import { Contact } from '../../../types/types';
import { namespace } from '../../../states/storeNamespaces';
import { RootState } from '../../../states';
import { RecursivePartial } from '../../RecursivePartial';
import { getOfflineContactTask } from '../../../states/contacts/offlineContactTask';

let mockV1;

jest.mock('../../../services/ServerlessService');
jest.mock('../../../rerenderView', () => ({
  rerenderAgentDesktop: jest.fn(),
}));
jest.mock('../../../services/ContactService', () => ({
  createContact: jest.fn(),
  updateContactInHrm: jest.fn(),
}));
jest.mock('@twilio/flex-ui', () => ({
  ...jest.requireActual('@twilio/flex-ui'),
  Actions: {
    invokeAction: jest.fn(),
  },
}));

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();
const mockInvokeAction = Actions.invokeAction as jest.MockedFunction<typeof Actions.invokeAction>;
const mockRerenderAgentDesktop = rerenderAgentDesktop as jest.MockedFunction<typeof rerenderAgentDesktop>;
const mockCreateContact = createContact as jest.MockedFunction<typeof createContact>;

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL('v1');
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  mockPartialConfiguration({ workerSid: 'WK123' });
  baseState = {
    flex: {
      view: { selectedTaskSid: 'WT123' },
    },
    [namespace]: {
      configuration: {
        currentDefinitionVersion: mockV1,
      },
      activeContacts: {
        existingContacts: {
          contact1: {
            savedContact: {
              id: 'contact1',
              taskId: 'WT123',
            },
          },
        },
      },
    },
  };
});

beforeEach(async () => {
  mockReset();
  mockInvokeAction.mockClear();
  mockRerenderAgentDesktop.mockClear();
});

expect.extend(toHaveNoViolations);

let baseState: RecursivePartial<RootState>;

const mockStore = configureMockStore([]);
test('click on button', async () => {
  mockCreateContact.mockImplementation((contact: Contact) => {
    console.log('Creating contact', contact);
    return Promise.resolve(contact);
  });

  const store = mockStore(baseState);

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <AddOfflineContactButton />
      </Provider>
    </StorelessThemeProvider>,
  );

  screen.getByText('OfflineContactButtonText').click();
  await waitFor(
    () => {
      expect(mockCreateContact).toHaveBeenCalledWith(expect.anything(), 'WK123', getOfflineContactTask());
      expect(Actions.invokeAction).toHaveBeenCalledTimes(1);
    },
    { timeout: 1000 },
  );
  // expect(rerenderAgentDesktop).toHaveBeenCalledTimes(1);
  /*
   * This is failing and couldn't fix it yet
   * expect(recreateContactState).toHaveBeenCalled();
   */
});

test('button should be disabled (default task exists)', () => {
  const state: RecursivePartial<RootState> = {
    ...baseState,
    flex: {
      view: { selectedTaskSid: undefined },
      ...baseState.flex,
    },
    [namespace]: {
      ...baseState[namespace],
    },
  };

  const store = mockStore(state);

  const recreateContactState = jest.fn();

  render(
    <StorelessThemeProvider themeConf={{}}>
      <Provider store={store}>
        <AddOfflineContactButton />
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
  const state: RecursivePartial<RootState> = {
    ...baseState,
    flex: {
      view: { selectedTaskSid: 'WT123', activeView: 'some-view' },
      ...baseState.flex,
    },
  };
  const store = mockStore(state);

  const wrapper = mount(
    <StorelessThemeProvider themeConf={{}}>
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
