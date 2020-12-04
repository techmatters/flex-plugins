import React from 'react';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { FormProvider } from 'react-hook-form';

import IssueCategorizationTab from '../../../components/tabbedForms/IssueCategorizationTab';
import { ToggleViewButton } from '../../../styles/HrmStyles';
import HrmTheme from '../../../styles/HrmTheme';
import { namespace, contactFormsBase } from '../../../states';
import { setCategoriesGridView } from '../../../states/contacts/actions';
import definition from '../../../formDefinitions/tabbedForms/IssueCategorizationTab.json';

// Copy paste from state/contacts initial state
const expanded = Object.keys(definition).reduce((acc, category) => ({ ...acc, [category]: false }), {});

const taskId = 'task-id';
const mockStore = configureMockStore([]);
const store = mockStore({
  [namespace]: { [contactFormsBase]: { tasks: { [taskId]: { metadata: { categories: { expanded } } } } } },
});
store.dispatch = jest.fn();

const themeConf = {
  colorTheme: HrmTheme,
};

const getGridIcon = wrapper => wrapper.find(ToggleViewButton).at(0);
const getListIcon = wrapper => wrapper.find(ToggleViewButton).at(1);

test('Click on view subcategories as grid icon', () => {
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
          <IssueCategorizationTab task={{ taskSid: taskId }} gridView={false} />
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
          <IssueCategorizationTab task={{ taskSid: taskId }} gridView={false} />
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
