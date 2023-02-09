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
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { FormProvider } from 'react-hook-form';
import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import IssueCategorizationSectionForm from '../../../components/contact/IssueCategorizationSectionForm';
import { ToggleViewButton } from '../../../styles/HrmStyles';
import HrmTheme from '../../../styles/HrmTheme';
import { namespace, contactFormsBase } from '../../../states';
import { setCategoriesGridView } from '../../../states/contacts/actions';
import { forTask } from '../../../states/contacts/issueCategorizationStateApi';
import { getAseloFeatureFlags } from '../../../hrmConfig';

jest.mock('../../../components/CSAMReport/CSAMReportFormDefinition');
jest.mock('../../../hrmConfig');

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

let mockV1;
const helpline = 'ChildLine Zambia (ZM)';
let definition;

// Copy paste from state/contacts initial state
let expanded;

const taskId = 'task-id';
const mockStore = configureMockStore([]);

const themeConf = {
  colorTheme: HrmTheme,
};

const helplineEntry = [
  {
    label: 'label1',
    value: 'label1',
    default: true,
    manager: {
      name: 'test',
      phone: '0954380213',
      email: 'test@mail.ta',
    },
  },
];

getAseloFeatureFlags.mockReturnValue({
  // eslint-disable-next-line camelcase
  featureFlags: { enable_counselor_toolkits: true },
});

const getGridIcon = wrapper => wrapper.find(ToggleViewButton).at(0);
const getListIcon = wrapper => wrapper.find(ToggleViewButton).at(1);

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  definition = mockV1.tabbedForms.IssueCategorizationTab(helpline);
  expanded = Object.keys(definition).reduce((acc, category) => ({ ...acc, [category]: false }), {});
  // eslint-disable-next-line camelcase
});

test('Click on view subcategories as grid icon', () => {
  const store = mockStore({
    [namespace]: {
      [contactFormsBase]: { tasks: { [taskId]: { metadata: { categories: { expanded, gridView: false } } } } },
    },
  });
  store.dispatch = jest.fn();

  const mockMethods = {
    register: jest.fn(),
    unregister: jest.fn(),
    watch: jest.fn(),
    setError: jest.fn(),
    clearErrors: jest.fn(),
    setValue: jest.fn(),
    trigger: jest.fn(),
    errors: jest.fn(),
    formState: jest.fn(),
    reset: jest.fn(),
    getValues: jest.fn(() => ({ categories: [] })),
    handleSubmit: jest.fn(),
    control: jest.fn(),
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <FormProvider {...mockMethods}>
          <IssueCategorizationSectionForm
            definition={definition}
            display={true}
            stateApi={forTask({ taskSid: taskId })}
            helplineInformation={{ label: 'label1', helplines: helplineEntry }}
          />
        </FormProvider>
      </Provider>
    </StorelessThemeProvider>,
  );
  expect(store.dispatch).not.toHaveBeenCalled();

  getGridIcon(wrapper).simulate('click');

  expect(store.dispatch).toHaveBeenCalled();
  expect(store.dispatch).toHaveBeenCalledWith(setCategoriesGridView(true, taskId));
  store.dispatch.mockClear();
});

test('Click on view subcategories as list icon', () => {
  const store = mockStore({
    [namespace]: {
      [contactFormsBase]: { tasks: { [taskId]: { metadata: { categories: { expanded, gridView: false } } } } },
    },
  });
  store.dispatch = jest.fn();

  const mockMethods = {
    register: jest.fn(),
    unregister: jest.fn(),
    watch: jest.fn(),
    setError: jest.fn(),
    clearErrors: jest.fn(),
    setValue: jest.fn(),
    trigger: jest.fn(),
    errors: jest.fn(),
    formState: jest.fn(),
    reset: jest.fn(),
    getValues: jest.fn(() => ({ categories: [] })),
    handleSubmit: jest.fn(),
    control: jest.fn(),
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <FormProvider {...mockMethods}>
          <IssueCategorizationSectionForm
            definition={definition}
            display={true}
            stateApi={forTask({ taskSid: taskId })}
            helplineInformation={{ label: 'label1', helplines: helplineEntry }}
          />
        </FormProvider>
      </Provider>
    </StorelessThemeProvider>,
  );
  expect(store.dispatch).not.toHaveBeenCalled();

  getListIcon(wrapper).simulate('click');

  expect(store.dispatch).toHaveBeenCalled();
  expect(store.dispatch).toHaveBeenCalledWith(setCategoriesGridView(false, taskId));
  store.dispatch.mockClear();
});
