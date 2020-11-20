import React from 'react';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { mount } from 'enzyme';
import { StorelessThemeProvider, withTheme } from '@twilio/flex-ui';
import '@testing-library/jest-dom/extend-expect';

import HrmTheme from '../../../styles/HrmTheme';
import AddTaskButton from '../../../components/common/AddTaskButton';

const themeConf = {
  colorTheme: HrmTheme,
};

expect.extend(toHaveNoViolations);

test('click on button', () => {
  const onClick = jest.fn();

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <AddTaskButton disabled={false} label="Testing Button" onClick={onClick} />
    </StorelessThemeProvider>,
  );

  screen.getByTestId('AddTaskButton').click();

  expect(onClick).toHaveBeenCalled();
});

test('click on disabled button', () => {
  const onClick = jest.fn();

  render(
    <StorelessThemeProvider themeConf={themeConf}>
      <AddTaskButton disabled={true} label="Testing Button" onClick={onClick} />
    </StorelessThemeProvider>,
  );

  screen.getByTestId('AddTaskButton').click();

  expect(onClick).not.toHaveBeenCalled();
});

const Wrapped = withTheme(props => <AddTaskButton disabled={false} label="Testing Button" {...props} />);

test('a11y', async () => {
  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Wrapped />
    </StorelessThemeProvider>,
  );

  const rules = {
    region: { enabled: false },
  };

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
