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

/* eslint-disable no-nested-ternary */
import React from 'react';
import { ButtonBase, Input, MenuItem, MenuList, Select, Tab, TabProps, Tabs, withStyles } from '@material-ui/core';
import type { ButtonBaseProps } from '@material-ui/core/ButtonBase';
import AssignmentInd from '@material-ui/icons/AssignmentIndOutlined';
import { Button, Icon, styled } from '@twilio/flex-ui';
import { getBackgroundWithHoverCSS } from '@twilio/flex-ui-core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Tooltip from '@material-ui/core/Tooltip';

import HrmTheme from './HrmTheme';

type BoxProps = {
  width?: string;
  height?: string;
  margin?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  alignSelf?: string;
  textAlign?: string;
  borderBottom?: string;
};

export const Box = styled('div')<BoxProps>`
  ${({ width }) => width && `width: ${width};`}
  ${({ height }) => height && `height: ${height};`}
  ${({ margin }) => margin && `margin: ${margin}`}
  ${({ marginTop }) => marginTop && `margin-top: ${marginTop};`}
  ${({ marginBottom }) => marginBottom && `margin-bottom: ${marginBottom};`}
  ${({ marginLeft }) => marginLeft && `margin-left: ${marginLeft};`}
  ${({ marginRight }) => marginRight && `margin-right: ${marginRight};`}
  ${({ padding }) => padding && `padding: ${padding}`}
  ${({ paddingTop }) => paddingTop && `padding-top: ${paddingTop};`}
  ${({ paddingBottom }) => paddingBottom && `padding-bottom: ${paddingBottom};`}
  ${({ paddingLeft }) => paddingLeft && `padding-left: ${paddingLeft};`}
  ${({ paddingRight }) => paddingRight && `padding-right: ${paddingRight};`}
  ${({ alignSelf }) => alignSelf && `align-self: ${alignSelf};`}
  ${({ textAlign }) => textAlign && `text-align: ${textAlign};`}
`;
Box.displayName = 'Box';

type FlexProps = {
  inline?: boolean;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
};

export const Flex = styled(Box)<FlexProps>`
  display: ${({ inline }) => (inline ? 'inline-flex' : 'flex')};
  ${({ flexDirection }) => flexDirection && `flex-direction: ${flexDirection};`}
  ${({ alignItems }) => alignItems && `align-items: ${alignItems};`}
  ${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
`;
Flex.displayName = 'Flex';

type AbsoluteProps = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

export const Absolute = styled('div')<AbsoluteProps>`
  position: absolute;
  top: ${({ top }) => top || 'auto'};
  bottom: ${({ bottom }) => bottom || 'auto'};
  left: ${({ left }) => left || 'auto'};
  right: ${({ right }) => right || 'auto'};
`;
Absolute.displayName = 'Absolute';

const containerLeftRightMargin = '5px';

type ContainerProps = {
  formContainer?: boolean;
};
export const Container = styled('div')<ContainerProps>`
  display: flex;
  padding: ${({ formContainer }) => (formContainer ? '0' : '32px 20px 12px 20px')};
  flex-direction: column;
  flex-wrap: nowrap;
  background-color: #ffffff;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  margin: 0 ${containerLeftRightMargin};
  height: 100%;
  overflow-y: auto;
  ${({ formContainer }) => (formContainer ? 'border-bottom: 1px solid #e1e3ea' : '')};
`;
Container.displayName = 'Container';

export const ErrorText = styled('p')`
  color: ${HrmTheme.colors.errorColor};
  font-size: 10px;
  line-height: 1.5;
`;
ErrorText.displayName = 'ErrorText';

export const CategoryTitle = styled('p')`
  text-transform: uppercase;
  font-weight: 600;
`;
CategoryTitle.displayName = 'CategoryTitle';

export const CategorySubtitleSection = styled('div')`
  display: flex;
  align-items: center;
  margin: 6px 0;
`;
CategorySubtitleSection.displayName = 'CategorySubtitleSection';

export const CategoryRequiredText = styled('p')`
  color: ${HrmTheme.colors.darkTextColor};
  font-size: 12px;
  font-weight: 400;
  flex-grow: 1;

  &:before {
    color: ${HrmTheme.colors.errorColor};
    content: '* ';
  }
`;
CategoryRequiredText.displayName = 'CategoryRequiredText';

const StyledInput = styled(Input)`
  display: flex;
  flex-grow: 0;
  font-size: 12px;
  line-height: 1.33;
  letter-spacing: normal;
  variant: filled;
  input {
    width: 217px;
    height: 36px;
    border-radius: 4px;
    background-color: ${HrmTheme.colors.inputBackgroundColor};
    border: none;
    padding: 0 7px;
    margin-bottom: -2px;
  }
  input:focus {
    background-color: ${HrmTheme.colors.inputBackgroundColor};
    box-shadow: none;
    border: 1px solid rgba(0, 59, 129, 0.37);
  }
  background-color: ${HrmTheme.colors.base1};
  color: ${/*
   * props =>
   * props.theme.calculated.lightTheme ? props.theme.colors.darkTextColor : props.theme.colors.lightTextColor
   */
  HrmTheme.colors.darkTextColor};

  input[type='date'] {
    padding-right: 7px;
  }
  input[type='date']::-webkit-clear-button,
  input[type='date']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    display: none;
  }
`;
StyledInput.displayName = 'StyledInput';

export const TextField = styled('div')`
  display: flex;
  flex-direction: column;
  margin: 8px 0;
`;
TextField.displayName = 'TextField';

export const StyledLabel = styled('label')`
  text-transform: uppercase;
  margin-bottom: 8px;
  font-size: 13px;
  letter-spacing: 2px;
  min-height: 18px;
`;
StyledLabel.displayName = 'StyledLabel';

type StyledSelectProps = {
  isPlaceholder?: boolean;
};

export const StyledSelect = styled(({ isPlaceholder = false, ...rest }: StyledSelectProps) => (
  <Select disableUnderline {...rest} />
))<StyledSelectProps>`
  flex-grow: 0;
  flex-shrink: 0;
  line-height: 1.33;
  letter-spacing: normal;
  box-sizing: border-box; /* Tells the browser to account for any border and padding in the values you specify for an element's width and height. https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing*/
  width: 217px;
  background-color: ${HrmTheme.colors.inputBackgroundColor};
  height: 36px;
  line-height: 22px;
  border-radius: 4px;
  border: none;
  box-shadow: none;
  padding: 0 7px;

  /* hide the arrow */
  -webkit-appearance: none;
  appearance: none;
  div[role='button'] {
    color: ${({ isPlaceholder }) => (isPlaceholder ? 'darkgray' : 'currentColor')};
    font-family: Open Sans;
    font-size: 12px;
  }
`;
StyledSelect.displayName = 'StyledSelect';

export const StyledMenuList = styled(MenuList)`
  border-radius: 5px;
  min-width: 250px;
  width: 100%;
`;
StyledMenuList.displayName = 'StyledMenuList';

export const StyledMenuItem = styled(MenuItem)`
  box-sizing: border-box;
  height: 32px;
  display: flex;
  margin: 0;
  padding: 0 12px;
  min-width: 0;
  text-transform: capitalize;
`;
StyledMenuItem.displayName = 'StyledMenuItem';

export const BottomButtonBarHeight = 55;

export const BottomButtonBar = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: ${BottomButtonBarHeight}px;
  flex-shrink: 0;
  background-color: #ffffff;
  padding: 0 20px;
  z-index: 1;
`;
BottomButtonBar.displayName = 'BottomButtonBar';

export const ColumnarBlock = styled('div')`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 0;
  margin: 0;
`;
ColumnarBlock.displayName = 'ColumnarBlock';

export const TwoColumnLayout = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: inherit;
  box-sizing: border-box;
`;
TwoColumnLayout.displayName = 'TwoColumnLayout';

type ToggleViewButtonProps = { active?: boolean };

export const ToggleViewButton = styled('button')<ToggleViewButtonProps>`
  display: inline-flex;
  width: 37px;
  height: 37px;
  min-height: 37px;
  border-radius: 1px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  cursor: pointer;
  border: ${({ active }) => (active ? '1px solid #a0a8bd33' : 'none')};
  color: ${({ active }) => (active ? '#000000cc' : 'initial')};
  background-color: ${({ active }) => (active ? 'initial' : '#a0a8bdcc')};
  opacity: ${({ active }) => (active ? 'initial' : '20%')};

  &:focus {
    outline: auto;
  }

  > svg {
    font-size: 18px;
  }
`;
ToggleViewButton.displayName = 'ToggleViewButton';

export const InformationIconButton = withStyles({
  root: {
    width: '16px',
    height: '16px',
    color: '#b4babd',
    margin: '13px 20px 0 5px',
    cursor: 'pointer',
  },
})(InfoOutlinedIcon);

export const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#717171',
    color: '#fff',
    maxWidth: 400,
    fontSize: '10pt',
    fontStyle: 'open sans semibold',
    border: '1px solid #dadde9',
  },
}))(Tooltip);

export const CategoriesWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding-bottom: ${BottomButtonBarHeight}px;
`;
CategoriesWrapper.displayName = 'CategoriesWrapper';

type SubcategoriesWrapperProps = { gridView?: boolean };

export const SubcategoriesWrapper = styled('div')<SubcategoriesWrapperProps>`
  display: flex;
  padding: 10px 0 10px 6px;
  flex-wrap: wrap;
  flex-direction: ${({ gridView }) => (gridView ? 'row' : 'column')};
`;
SubcategoriesWrapper.displayName = 'SubcategoriesWrapper';

export const StyledTabs = withStyles({
  root: {
    minHeight: 35,
    height: 35,
    flexShrink: 0,
    padding: '0 7%',
  },
  indicator: {
    backgroundColor: 'transparent',
  },
})(Tabs);
StyledTabs.displayName = 'StyledTabs';

export type StyledTabProps = { searchTab?: boolean; label: React.ReactNode } & Partial<TabProps>;

export const StyledTab = withStyles({
  root: {
    height: 35,
    minHeight: 35,
    minWidth: 120,
    width: 120,
    backgroundColor: '#ecedf1',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    margin: '0 5px 0 0',
    padding: 0,
    fontSize: 12,
    lineHeight: 14,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#c9c9c9',
    },
    '&:focus': {
      outline: 'auto',
    },
  },
  selected: {
    backgroundColor: '#ffffff',
    fontWeight: 600,
  },
})(Tab);
StyledTab.displayName = 'StyledTab';

export const StyledSearchTab = withStyles({
  root: {
    minWidth: 40,
    width: 40,
    backgroundColor: 'transparent',
    '&:focus': {
      outline: 'auto',
    },
  },
  selected: {
    backgroundColor: '#ffffff',
  },
})(StyledTab);
StyledSearchTab.displayName = 'StyledSearchTab';

export const Row = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
Row.displayName = 'Row';

export const Column = styled('div')`
  display: flex;
  flex-direction: column;
`;
Column.displayName = 'Column';

export const FontOpenSans = styled('p')`
  color: #000000;
  font-family: Open Sans;
  text-align: left;
`;
FontOpenSans.displayName = 'FontOpenSans';

// used for screen readers only
export const HiddenText = styled('span')`
  width: 0px;
  height: 0px;
  font-size: 0px;
  line-height: 0px;
`;
HiddenText.displayName = 'HiddenText';

// This text will not be a child element but can be used for aria-live
// where the text is read when it enters the dom
export const AriaLiveHiddenText = styled('span')`
  top: 0;
  left: -2px;
  width: 1px;
  height: 1px;
  position: absolute;
  overflow: hidden;
`;
AriaLiveHiddenText.displayName = 'AriaLiveHiddenText';

export const CasePrintViewSpinner = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
CasePrintViewSpinner.displayName = 'CasePrintViewSpinner';

export const HeaderContainer = styled(Row)`
  width: 100%;
  justify-items: flex-start;
  background-color: ${HrmTheme.colors.base2};
  border-width: 0px;
  text-transform: capitalize;
  color: #192b33;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  padding: 0px;
`;
HeaderContainer.displayName = 'HeaderContainer';

const TaskButtonBase = withStyles({
  root: {
    '&:hover': {
      backgroundColor: '#ECEDF1',
    },
    '&:hover > div': {
      backgroundColor: '#ECEDF1',
    },
  },
  disabled: {
    opacity: 0.3,
    color: '#192B33',
    '& svg': {
      color: '#192B33',
    },
    '& p': {
      color: '#192B33',
    },
  },
})(ButtonBase);

// @ts-ignore
export const AddTaskIconContainer = styled('div')`
  display: flex;
  flex: 0 0 44px;
  height: 44px;
  background-color: #ffffff;
`;
AddTaskIconContainer.displayName = 'AddTaskIconContainer';

export const AddTaskIcon = styled(Icon)`
  display: flex;
  flex: 0 0 auto;
  margin: auto;
  color: #000000;
`;
AddTaskIcon.displayName = 'AddTaskIcon';

export const AddTaskContent = styled('div')`
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;
  padding-right: auto;
  padding-left: 12px;
`;
AddTaskContent.displayName = 'AddTaskContent';

export const AddTaskText = styled(FontOpenSans)`
  color: #0d74d5;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  margin-right: 5px;
`;
AddTaskText.displayName = 'AddTaskText';

export const AddTaskButtonBase = styled(TaskButtonBase)``;
AddTaskButtonBase.displayName = 'AddTaskButtonBase';

export const OfflineContactTaskIconContainer = styled('div')`
  display: flex;
  flex: 0 0 44px;
  height: 44px;
`;
OfflineContactTaskIconContainer.displayName = 'OfflineContactTaskIconContainer';

export const OfflineContactTaskIcon = withStyles({
  root: {
    display: 'flex',
    flex: '0 0 auto',
    margin: 'auto',
    color: '#159af8',
  },
})(AssignmentInd);
OfflineContactTaskIcon.displayName = 'OfflineContactTaskIcon';

export const OfflineContactTaskContent = styled('div')`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  overflow: hidden;
  padding-right: auto;
  padding-left: 12px;
`;
OfflineContactTaskContent.displayName = 'OfflineContactTaskContent';

export const OfflineContactTaskFirstLine = styled(FontOpenSans)`
  font-size: 12px;
  font-weight: 700;
  color: rgb(34, 34, 34);
`;
OfflineContactTaskFirstLine.displayName = 'OfflineContactTaskFirstLine';

export const OfflineContactTaskSecondLine = styled(FontOpenSans)`
  font-size: 10px;
  font-weight: 400;
  color: rgb(34, 34, 34);
`;
OfflineContactTaskSecondLine.displayName = 'OfflineContactTaskSecondLine';

// eslint-disable-next-line react/prop-types
export const OfflineContactTaskButton: React.FC<{ selected: boolean } & ButtonBaseProps> = ({ selected, ...props }) => (
  <TaskButtonBase style={{ border: selected ? '2px solid rgb(86, 166, 246)' : 'none' }} {...props} />
);
OfflineContactTaskButton.displayName = 'OfflineContactTaskButton';

// eslint-disable-next-line import/no-unused-modules
export const FormItem = styled('div')`
  display: flex;
  flex-direction: column;
`;
FormItem.displayName = 'FormItem';

export const FormLabel = styled('label')`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  letter-spacing: 0;
  min-height: 18px;
  color: #000000;
`;
FormLabel.displayName = 'FormLabel';

export const FormLegend = styled('legend')`
  display: flex;
  font-size: 14px;
  letter-spacing: 0;
  min-height: 18px;
  color: #000000;
`;
FormLegend.displayName = 'FormLegend';

export const FormFieldset = styled('fieldset')<FormInputProps>`
  display: flex;
  flex-direction: column;
  border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
  border-radius: 4px;
`;
FormFieldset.displayName = 'FormFieldset';

type FormListboxMultiselectProps = FormInputProps & { height?: number; width?: number };

export const FormListboxMultiselect = styled('ul')<FormListboxMultiselectProps>`
  display: flex;
  flex-direction: column;
  border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
  border-radius: 4px;
  height: ${props => (props.height ? `${props.height}px` : '250px')};
  width: ${props => (props.width ? `${props.width}px` : '220px')};

  &:focus-within {
    outline: auto;
  }
`;
FormListboxMultiselect.displayName = 'FormListboxMultiselect';

export const FormListboxMultiselectOptionsContainer = styled('div')<FormListboxMultiselectProps>`
  display: flex;
  flex-direction: column;
  padding-left: 10px;
  padding-top: 10px;
  overflow-y: scroll;
  box-sizing: border-box;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
`;
FormListboxMultiselectOptionsContainer.displayName = 'FormListboxMultiselectOptionsContainer';

export const FormListboxMultiselectOption = styled('li')`
  display: inline-flex;
`;
FormListboxMultiselectOption.displayName = 'FormListboxMultiselectOption';

export const FormListboxMultiselectOptionLabel = styled(FormLabel)`
  flex-direction: row;
  align-items: start;
`;

export const UploadFileLabel = styled(Flex)`
  font-size: 14px;
  letter-spacing: 0;
  min-height: 18px;
  color: #000000;
`;
UploadFileLabel.displayName = 'UploadFileLabel';

export const UploadFileFileName = styled(Flex)`
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0;
  min-height: 18px;
  color: #000000;
`;
UploadFileFileName.displayName = 'UploadFileFileName';

export const DependentSelectLabel = styled(FormLabel)<{ disabled: boolean }>`
  ${({ disabled }) => disabled && `opacity: 0.30;`}
`;
DependentSelectLabel.displayName = 'DependentSelectLabel';

export const FormError = styled('span')`
  text-transform: none;
  color: ${HrmTheme.colors.errorColor};
  font-size: 10px;
  line-height: 1.5;
  letter-spacing: normal;
`;
FormError.displayName = 'FormError';

type FormInputProps = { error?: boolean; width?: number | string; fullWidth?: boolean };

export const FormInput = styled('input')<FormInputProps>`
  /* ---------- Input ---------- */
  & {
    display: flex;
    flex-grow: 0;
    font-family: Open Sans;
    font-size: 12px;
    line-height: 1.33;
    letter-spacing: normal;
    box-sizing: border-box; /* Tells the browser to account for any border and padding in the values you specify for an element's width and height. https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing*/
    width: 217px;
    height: 36px;
    border-radius: 4px;
    background-color: ${HrmTheme.colors.inputBackgroundColor};
    color: ${/*
     * props =>
     * props.theme.calculated.lightTheme ? props.theme.colors.darkTextColor : props.theme.colors.lightTextColor
     */
    HrmTheme.colors.darkTextColor};
    border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
    box-shadow: ${props => (props.error ? '0px 0px 0px 2px rgba(234,16,16,0.2)' : 'none')};
    padding: 0 7px;
  }
  &:focus {
    background-color: ${HrmTheme.colors.inputBackgroundColor};
    box-shadow: none;
    border: 1px solid rgba(0, 59, 129, 0.37);
  }
`;
FormInput.displayName = 'FormInput';

export const FormRadioInput = styled('input')<FormInputProps>`
  &[type='radio'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    box-sizing: content-box;
    padding: 0;
    margin: 0 7px 0 0;
    width: 12px;
    height: 12px;
    border: 2px solid #080808;
    background-color: ${HrmTheme.colors.inputBackgroundColor};
    border-radius: 50%;
    display: grid;
    place-content: center;
  }

  &[type='radio']:checked:after {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    content: '';
    position: relative;
    background-color: #080808;
  }
`;
FormRadioInput.displayName = 'FormRadioInput';

export const FormDateInput = styled(FormInput)`
  &[type='date']::-webkit-clear-button,
  &[type='date']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    display: none;
  }
  &[type='date']::placeholder {
    color: '#AEAEAE';
    opacity: 1;
  }
  /* &[type='date'] {} */
  /* &[type='date']::-webkit-calendar-picker-indicator {} */
`;
FormDateInput.displayName = 'FormDateInput';

export const FormTimeInput = styled(FormInput)`
  &[type='time']::-webkit-datetime-edit-fields-wrapper {
    display: flex;
  }
  &[type='time']::-webkit-clear-button,
    -webkit-appearance: none;
    display: none;
  }
  /* Other pseudoelements that can be styled
   &[type='time'] {}
   &[type='time']::-webkit-calendar-picker-indicator {}
   &[type='time']::-webkit-datetime-edit-hour-field {}
   &[type='time']::-webkit-datetime-edit-minute-field {}
   &[type='time']::-webkit-datetime-edit-ampm-field {}
  */
`;
FormTimeInput.displayName = 'FormTimeInput';

export const FormTextArea = styled('textarea')<FormInputProps>`
  & {
    display: flex;
    flex-grow: 0;
    font-family: Open Sans;
    font-size: 12px;
    line-height: 15px;
    letter-spacing: normal;
    box-sizing: border-box; /* Tells the browser to account for any border and padding in the values you specify for an element's width and height. https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing*/
    width: ${props => (props.width ? props.width : '217')}px;
    border-radius: 4px;
    background-color: ${HrmTheme.colors.base2};
    color: ${/*
     * props =>
     * props.theme.calculated.lightTheme ? props.theme.colors.darkTextColor : props.theme.colors.lightTextColor
     */
    HrmTheme.colors.darkTextColor};
    border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
    box-shadow: ${props => (props.error ? '0px 0px 0px 2px rgba(234,16,16,0.2)' : 'none')};
    padding: 5px;
    border-radius: 4px;
  }
  &:focus {
    background-color: ${HrmTheme.colors.inputBackgroundColor};
    box-shadow: none;
    border: 1px solid rgba(0, 59, 129, 0.37);
  }
`;

export const ColumnarContent = styled('div')`
  width: 217px;
`;
ColumnarContent.displayName = 'ColumnarContent';

export const FormCheckBoxWrapper = styled(Row)<FormInputProps>`
  align-items: flex-start;
  box-sizing: border-box; /* Tells the browser to account for any border and padding in the values you specify for an element's width and height. https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing*/
  height: 36px;
  border-radius: 4px;
  border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
  box-shadow: ${props => (props.error ? '0px 0px 0px 2px rgba(234,16,16,0.2)' : 'none')};
`;
FormCheckBoxWrapper.displayName = 'FormCheckBoxWrapper';

const CheckboxBase = styled.input<FormInputProps>`
  &[type='checkbox'] {
    display: inline-block;
    position: relative;
    padding-left: 1.4em;
    cursor: default;
    margin-right: 5px;
  }
  &[type='checkbox']::before,
  &[type='checkbox']::after {
    position: absolute;
    top: 50%;
    left: 7px;
    transform: translate(-50%, -50%);
    content: '';
    font-weight: 900;
  }
  &[type='checkbox']::before {
    width: 13px;
    height: 13px;
    border: 1px solid hsl(0, 0%, 66%);
    border-radius: 0.2em;
    background-image: linear-gradient(to bottom, hsl(300, 3%, 93%), #fff 30%);
  }
  &[type='checkbox']:active::before {
    background-image: linear-gradient(to bottom, hsl(300, 3%, 73%), hsl(300, 3%, 93%) 30%);
  }
`;
CheckboxBase.displayName = 'CheckboxBase';

export const FormCheckbox = styled(CheckboxBase)`
  &[type='checkbox']:checked::before {
    border-color: #1976d2;
    background: #1976d2;
  }
  &[type='checkbox']:checked::after {
    font-family: 'Font Awesome 5 Free';
    content: '\\f00c';
    color: #ffffff;
    font-weight: 900;
  }

  &[type='checkbox']:focus:not(:focus-visible) {
    outline: auto;
  }
`;
FormCheckbox.displayName = 'FormCheckbox';

export const FormMixedCheckbox = styled(CheckboxBase)`
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='false']::before {
    border-color: #d13821;
    background: #d13821;
  }
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='true']::before {
    border-color: #1976d2;
    background: #1976d2;
  }
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='false']::after {
    font-family: 'Font Awesome 5 Free';
    content: '\\f00d';
    color: #ffffff;
    font-weight: 900;
  }
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='true']::after {
    font-family: 'Font Awesome 5 Free';
    content: '\\f00c';
    color: #ffffff;
    font-weight: 900;
  }
  /* To disable the outline when focused */
  /* &[class~=mixed-checkbox][type=checkbox]:focus {
  outline: none;
} */
  /* Other stuff that we can use to style the pseudo elements */
  /* &[class~=mixed-checkbox][type=checkbox][aria-checked="true"]:active::before  */
  /* &[class~=mixed-checkbox][type=checkbox]:focus::before */
`;
type FormSelectProps = {
  fullWidth?: boolean;
};

export const FormSelectWrapper = styled('div')<FormSelectProps>`
  position: relative;
  box-sizing: border-box; /* Tells the browser to account for any border and padding in the values you specify for an element's width and height. https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing*/
  ${props => (props.fullWidth ? 'width: 100%' : 'width: 217px')};
  height: 36px;

  &:after {
    content: '';
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid #666;
    position: absolute;
    right: 10px;
    top: 50%;
    pointer-events: none;
  }
`;
FormSelectWrapper.displayName = 'FormSelectWrapper';

// eslint-disable-next-line import/no-unused-modules
export const FormSelect = styled('select')<FormInputProps>`
  flex-grow: 0;
  flex-shrink: 0;
  font-family: Open Sans;
  font-size: 12px;
  line-height: 1.33;
  letter-spacing: normal;
  box-sizing: border-box; /* Tells the browser to account for any border and padding in the values you specify for an element's width and height. https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing*/
  ${props => (props.fullWidth ? 'width: 100%' : 'width: 217px')};
  background-color: ${HrmTheme.colors.inputBackgroundColor};
  color: ${/*
   * props =>
   * props.theme.calculated.lightTheme ? props.theme.colors.darkTextColor : props.theme.colors.lightTextColor
   */
  HrmTheme.colors.darkTextColor};
  height: 36px;
  line-height: 22px;
  border-radius: 4px;
  border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
  box-shadow: ${props => (props.error ? '0px 0px 0px 2px rgba(234,16,16,0.2)' : 'none')};
  padding: 0 7px;

  /* hide the arrow */
  -webkit-appearance: none;
  appearance: none;
`;
FormSelect.displayName = 'FormSelect';

type FormOptionProps = { isEmptyValue?: boolean; disabled?: boolean };

export const FormOption = styled('option')<FormOptionProps>`
  font-family: Open Sans;
  font-size: 12px;
  line-height: 1.33;
  letter-spacing: normal;
  box-sizing: border-box;
  height: 32px;
  display: flex;
  margin: 0;
  padding: 0 12px;
  min-width: 0;
  ${({ isEmptyValue }) => isEmptyValue && 'color: #616161'}
  ${props => props.disabled && `background-color: ${HrmTheme.colors.disabledColor};`}
`;
FormOption.displayName = 'FormOption';

type CategoryCheckboxProps = { disabled: boolean };
// eslint-disable-next-line import/no-unused-modules
export const CategoryCheckbox = styled(CheckboxBase)<CategoryCheckboxProps>`
  padding: 8px;

  &[type='checkbox'] {
    color: white;
    margin-left: 10px;
    margin-right: 10px;
  }

  &[type='checkbox']:checked {
    color: white;
  }

  &[type='checkbox']:checked::after {
    font-family: 'Font Awesome 5 Free';
    content: '\\f00c';
    font-weight: 900;
    color: #000;
  }

  svg {
    font-size: 16px;
  }
`;
CategoryCheckbox.displayName = 'CategoryCheckbox';

type CategoryCheckboxLabelProps = { disabled?: boolean };
export const CategoryCheckboxLabel = styled('label')<CategoryCheckboxLabelProps>`
  margin-top: auto;
  margin-bottom: auto;
  font-size: 12px;
  letter-spacing: normal;
  text-transform: none;
  color: ${({ disabled, theme }) =>
    disabled ? `${HrmTheme.colors.categoryTextColor}33` : HrmTheme.colors.categoryTextColor};
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`;
CategoryCheckboxLabel.displayName = 'CategoryCheckboxLabel';

export const CategoryCheckboxWrapper = styled('div')`
  display: flex;
`;

CategoryCheckboxWrapper.displayName = 'CategoryCheckboxWrapper';

type BaseCheckboxProps = {
  color: string;
  selected?: boolean;
  disabled?: boolean;
};
export const CategoryCheckboxField = styled('div')<BaseCheckboxProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 4px 4px 4px 0;
  width: fit-content;
  height: 34px;
  box-sizing: border-box;
  border: ${({ color, disabled, theme }) =>
    `1px solid ${
      disabled
        ? `${HrmTheme.colors.categoryDisabledColor}14` // Hex with alpha 0.08
        : color
    }`};
  border-radius: 2px;
  padding-right: 15px;
  background-color: ${({ selected, disabled, color, theme }) => {
    if (disabled) return `${HrmTheme.colors.categoryDisabledColor}14`; // Hex with alpha 0.08
    if (selected) return color;
    return 'initial';
  }};
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`;
CategoryCheckboxField.displayName = 'CategoryCheckboxField';

export const TaskCanvasOverride = styled('div')`
  width: 100%;
  height: 100%;
  background-color: ${HrmTheme.colors.base2};
`;

export const CannedResponsesContainer = styled('div')`
  margin-bottom: 15px;

  .form {
    width: 100%;
    margin-bottom: 20px;
  }

  .input-label {
    padding-left: 5px;
  }
`;

CannedResponsesContainer.displayName = 'CannedResponsesContainer';

export const Bold = styled('span')`
  font-weight: 700;
`;

Bold.displayName = 'Bold';

export const TypingIndicatorText = styled(FontOpenSans)`
  font-size: 10px;
  margin: auto 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
TypingIndicatorText.displayName = 'TypingIndicatorText';

export const HorizontalLine = styled('hr')`
  border: 0;
  height: 1px;
  background-color: #c6cad7;
  margin: 0;
`;
HorizontalLine.displayName = 'HorizontalLine';

// Used in search results and viewing records of an identifier(View Records in Yello Banner) regardless of client profiles
export const PreviewWrapper = styled(Flex)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 10px;
  padding: 5px 20px 10px 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
  border-color: #e1e3ea;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
`;

PreviewWrapper.displayName = 'PreviewWrapper';
