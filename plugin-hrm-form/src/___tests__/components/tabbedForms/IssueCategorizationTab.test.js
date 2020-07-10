import React from 'react';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import { UnconnectedIssueCategorizationTab } from '../../../components/tabbedForms/IssueCategorizationTab';
import { ToggleViewButton } from '../../../styles/HrmStyles';
import HrmTheme from '../../../styles/HrmTheme';

const themeConf = {
  colorTheme: HrmTheme,
};

const getGridIcon = wrapper => wrapper.find(ToggleViewButton).at(0);
const getListIcon = wrapper => wrapper.find(ToggleViewButton).at(1);

test('Click on view subcategories as grid icon', () => {
  const taskId = 'task-id';
  const setCategoriesGridView = jest.fn();

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedIssueCategorizationTab
        form={{}}
        taskId={taskId}
        handleCategoryToggle={jest.fn()}
        gridView={false}
        expanded={{}}
        setCategoriesGridView={setCategoriesGridView}
        handleExpandCategory={jest.fn()}
      />
    </StorelessThemeProvider>,
  );

  getGridIcon(wrapper).simulate('click');

  expect(setCategoriesGridView).toHaveBeenCalledWith(true, taskId);
});

test('Click on view subcategories as list icon', () => {
  const taskId = 'task-id';
  const setCategoriesGridView = jest.fn();

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <UnconnectedIssueCategorizationTab
        form={{}}
        taskId={taskId}
        handleCategoryToggle={jest.fn()}
        gridView={false}
        expanded={{}}
        setCategoriesGridView={setCategoriesGridView}
        handleExpandCategory={jest.fn()}
      />
    </StorelessThemeProvider>,
  );

  getListIcon(wrapper).simulate('click');

  expect(setCategoriesGridView).toHaveBeenCalledWith(false, taskId);
});
