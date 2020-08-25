import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import FolderIcon from '@material-ui/icons/FolderOpen';
import CancelIcon from '@material-ui/icons/Cancel';

import HrmTheme from '../../../styles/HrmTheme';
import { Menu, MenuItem } from '../../../components/menu';

expect.extend(toHaveNoViolations);

const themeConf = {
  colorTheme: HrmTheme,
};
const anchorEl = React.createRef();

test('do not show menu', () => {
  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Menu anchorEl={anchorEl} open={false} onClickAway={() => null}>
        <MenuItem Icon={FolderIcon} text="Open New Case" />
        <MenuItem Icon={CancelIcon} text="Yes, Cancel New Case and Close" red />
      </Menu>
    </StorelessThemeProvider>,
  );

  expect(wrapper.find('MenuList').exists()).toBeFalsy();
});

test('show menu', () => {
  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Menu anchorEl={anchorEl} open={true} onClickAway={() => null}>
        <MenuItem Icon={FolderIcon} text="Open New Case" />
        <MenuItem Icon={CancelIcon} text="Yes, Cancel New Case and Close" red />
      </Menu>
    </StorelessThemeProvider>,
  );

  expect(wrapper.find('MenuList').exists()).toBeTruthy();
});

test('show red menuItem', () => {
  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <>
        <Menu anchorEl={anchorEl} open={true} onClickAway={() => null}>
          <MenuItem Icon={FolderIcon} text="Open New Case" />
          <MenuItem Icon={CancelIcon} text="Yes, Cancel New Case and Close" red />
        </Menu>
      </>
    </StorelessThemeProvider>,
  );

  const menuItem = wrapper.find('MenuItem').find({ text: 'Yes, Cancel New Case and Close' });
  const redColor = menuItem.prop('theme').colors.declineColor;
  const iconColor = menuItem.find('SvgIcon').prop('nativeColor');
  const textColor = menuItem.find('ListItemText').prop('red');

  expect(iconColor).toBe(redColor);
  expect(textColor).toBe(true);
});

test('call menuItem onClick', () => {
  const onClick = jest.fn();

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <>
        <Menu anchorEl={anchorEl} open={true} onClickAway={() => null}>
          <MenuItem Icon={FolderIcon} text="Open New Case" onClick={onClick} />
          <MenuItem Icon={CancelIcon} text="Yes, Cancel New Case and Close" red />
        </Menu>
      </>
    </StorelessThemeProvider>,
  );

  wrapper.find('MenuItem').find({ text: 'Open New Case' }).simulate('click');
  expect(onClick).toHaveBeenCalled();
});

test('a11y', async () => {
  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Menu anchorEl={anchorEl} open={true} onClickAway={() => null}>
        <MenuItem Icon={FolderIcon} text="Open New Case" />
        <MenuItem Icon={CancelIcon} text="Yes, Cancel New Case and Close" red />
      </Menu>
    </StorelessThemeProvider>,
  );

  const results = await axe(wrapper.getDOMNode());

  expect(results).toHaveNoViolations();
});

// TODO: Fix onClickAway tests
/*
 *test('call onClickAway', () => {
 *  const onClickAway = jest.fn();
 *  const outsideButton = <button type="button" />;
 *
 *  const wrapper = mount(
 *    <StorelessThemeProvider themeConf={themeConf}>
 *      <>
 *        <Menu anchorEl={anchorEl} open={true} onClickAway={onClickAway}>
 *          <MenuItem Icon={FolderIcon} text="Open New Case" />
 *          <MenuItem Icon={CancelIcon} text="Yes, Cancel New Case and Close" red />
 *        </Menu>
 *        {outsideButton}
 *      </>
 *    </StorelessThemeProvider>,
 *  );
 *
 *  const mockedEvent = { target: outsideButton };
 *  wrapper.find('ClickAwayListener').simulate('click', mockedEvent);
 *  expect(onClickAway).toHaveBeenCalled();
 *});
 *
 *test('do not call onClickAway', () => {
 *  const onClickAway = jest.fn();
 *
 *  const wrapper = mount(
 *    <StorelessThemeProvider themeConf={themeConf}>
 *      <>
 *        <Menu anchorEl={anchorEl} open={true} onClickAway={onClickAway}>
 *          <MenuItem Icon={FolderIcon} text="Open New Case" />
 *          <MenuItem Icon={CancelIcon} text="Yes, Cancel New Case and Close" red />
 *        </Menu>
 *        <button type="button" />
 *      </>
 *    </StorelessThemeProvider>,
 *  );
 *
 *  const mockedEvent = { target: anchorEl };
 *  wrapper.find('ClickAwayListener').simulate('click', mockedEvent);
 *  expect(onClickAway).not.toHaveBeenCalled();
 *});
 */
