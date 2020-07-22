import React from 'react';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';

import HrmTheme from '../../../styles/HrmTheme';
import AddNote from '../../../components/case/AddNote';

expect.extend(toHaveNoViolations);

const themeConf = {
  colorTheme: HrmTheme,
};

test('Test close functionality', async () => {
  const handleSaveNote = jest.fn();
  const onClickClose = jest.fn();

  const ownProps = {
    counselor: 'Someone',
    handleSaveNote,
    onClickClose,
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <AddNote {...ownProps} />
    </StorelessThemeProvider>,
  );

  expect(onClickClose).not.toHaveBeenCalled();

  wrapper
    .find('ButtonBase')
    .find('t')
    .findWhere(t => t.prop('code') === 'Case-CloseButton')
    .simulate('click');

  expect(onClickClose).toHaveBeenCalled();

  onClickClose.mockClear();

  expect(onClickClose).not.toHaveBeenCalled();

  wrapper
    .find('button')
    .find('t')
    .findWhere(t => t.prop('code') === 'BottomBar-Cancel')
    .simulate('click');

  expect(onClickClose).toHaveBeenCalled();

  onClickClose.mockClear();
});

test('Test input/add note functionality', async () => {
  const clickOnSaveNote = wrapper => {
    wrapper
      .find('button')
      .find('t')
      .findWhere(t => t.prop('code') === 'BottomBar-SaveNote')
      .simulate('click');
  };
  const handleSaveNote = jest.fn();
  const onClickClose = jest.fn();

  const ownProps = {
    counselor: 'Someone',
    handleSaveNote,
    onClickClose,
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <AddNote {...ownProps} />
    </StorelessThemeProvider>,
  );

  expect(handleSaveNote).not.toHaveBeenCalled();

  wrapper.find('textarea').simulate('change', { target: { value: 'Some note' } });

  clickOnSaveNote(wrapper);
  expect(handleSaveNote).toHaveBeenCalledWith('Some note');
});

test('a11y', async () => {
  const handleSaveNote = jest.fn();
  const onClickClose = jest.fn();

  const ownProps = {
    counselor: 'Someone',
    handleSaveNote,
    onClickClose,
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <AddNote {...ownProps} />
    </StorelessThemeProvider>,
  );

  const rules = {
    region: { enabled: false },
  };

  const axe = configureAxe({ rules });
  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});
