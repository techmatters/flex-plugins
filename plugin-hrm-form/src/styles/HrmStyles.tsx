/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'react-emotion';
import { ButtonBase, Input, Select, MenuItem, Tabs, Tab, Checkbox, withStyles, TableRow } from '@material-ui/core';
import { Button, Icon, getBackgroundWithHoverCSS } from '@twilio/flex-ui';

type BoxProps = {
  width?: string;
  height?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
};

export const Box = styled('div')<BoxProps>`
  ${({ width }) => width && `width: ${width};`}
  ${({ height }) => height && `height: ${height};`}
  ${({ marginTop }) => marginTop && `margin-top: ${marginTop};`}
  ${({ marginBottom }) => marginBottom && `margin-bottom: ${marginBottom};`}
  ${({ marginLeft }) => marginLeft && `margin-left: ${marginLeft};`}
  ${({ marginRight }) => marginRight && `margin-right: ${marginRight};`}
  ${({ paddingTop }) => paddingTop && `padding-top: ${paddingTop};`}
  ${({ paddingBottom }) => paddingBottom && `padding-bottom: ${paddingBottom};`}
  ${({ paddingLeft }) => paddingLeft && `padding-left: ${paddingLeft};`}
  ${({ paddingRight }) => paddingRight && `padding-right: ${paddingRight};`}
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

export const TabbedFormsContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
TabbedFormsContainer.displayName = 'TabbedFormsContainer';

const containerLeftRightMargin = '5px';
export const Container = styled('div')`
  display: flex;
  padding: 32px 20px 12px 20px;
  flex-direction: column;
  flex-wrap: nowrap;
  background-color: #ffffff;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  margin: 0 ${containerLeftRightMargin};
  height: 100%;
  overflow-y: auto;
`;
Container.displayName = 'Container';

export const ErrorText = styled('p')`
  color: ${props => props.theme.colors.errorColor};
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
  color: ${props => props.theme.colors.darkTextColor};
  font-size: 12px;
  font-weight: 400;
  flex-grow: 1;

  &:before {
    color: ${props => props.theme.colors.errorColor};
    content: '* ';
  }
`;
CategoryRequiredText.displayName = 'CategoryRequiredText';

export const StyledInput = styled(Input)`
  display: flex;
  flex-grow: 0;
  font-size: 12px;
  line-height: 1.33;
  letter-spacing: normal;
  input {
    width: 217px;
    height: 36px;
    border-radius: 4px;
    background-color: ${props => props.theme.colors.inputBackgroundColor};
    border: none;
  }
  input:focus {
    background-color: ${props => props.theme.colors.inputBackgroundColor};
    box-shadow: none;
    border: 1px solid rgba(0, 59, 129, 0.37);
  }
  background-color: ${props => props.theme.colors.base1};
  color: ${props =>
    props.theme.calculated.lightTheme ? props.theme.colors.darkTextColor : props.theme.colors.lightTextColor};

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

export const StyledSelect = styled(({ isPlaceholder = false, ...rest }: StyledSelectProps) => <Select {...rest} />)<
  StyledSelectProps
>`
  flex-grow: 0;
  flex-shrink: 0;
  width: 217px;
  div[role='button'] {
    height: 36px;
    line-height: 22px;
    border-radius: 4px;
    background-color: ${props => props.theme.colors.inputBackgroundColor};
    border: none;
    color: ${({ isPlaceholder }) => (isPlaceholder ? 'darkgray' : 'currentColor')};
  }
  .Twilio-Dropdown {
    height: 100%;
  }
  [class*='MuiSelect-selectMenu'] {
    padding-top: 7px;
    padding-bottom: 7px;
    border-right-width: 0px;
    &:focus {
      border-right-width: 1px;
    }
  }
  background-color: ${props => props.theme.colors.base1};
  color: ${props =>
    props.theme.calculated.lightTheme ? props.theme.colors.darkTextColor : props.theme.colors.lightTextColor};
`;
StyledSelect.displayName = 'StyledSelect';

export const StyledMenuItem = styled(MenuItem)`
  box-sizing: border-box;
  height: 32px;
  display: flex;
  margin: 0;
  padding: 0 12px;
  min-width: 0;
`;
StyledMenuItem.displayName = 'StyledMenuItem';

type StyledNextStepButtonProps = {
  secondary?: boolean;
  disabled?: boolean;
};

export const StyledNextStepButton = styled(Button)<StyledNextStepButtonProps>`
  display: flex;
  align-items: center;
  font-size: 12px;
  letter-spacing: normal;
  color: ${props =>
    props.secondary ? props.theme.colors.secondaryButtonTextColor : props.theme.colors.buttonTextColor};
  border: ${({ secondary }) => (secondary ? '1px solid' : 'none')};
  margin: 0;
  padding: 7px 23px;
  background-color: ${props =>
    props.disabled
      ? props.theme.colors.disabledColor
      : props.secondary
      ? props.theme.colors.secondaryButtonColor
      : props.theme.colors.defaultButtonColor};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'default')};
  ${p =>
    getBackgroundWithHoverCSS(
      p.disabled
        ? p.theme.colors.base5
        : p.secondary
        ? p.theme.colors.secondaryButtonColor
        : p.theme.colors.defaultButtonColor,
      true,
      false,
      p.disabled,
    )};

  &&:focus {
    background-color: rgba(255, 255, 255, 0.2);
    background-blend-mode: color;
  }

  &&:active {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;
StyledNextStepButton.displayName = 'StyledNextStepButton';

export const TransparentButton = styled(Button)`
  color: black;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 2px;
`;
TransparentButton.displayName = 'TransparentButton';

export const TopNav = styled('div')`
  display: flex;
  flex-direction: row;
`;
TopNav.displayName = 'TopNav';

export const BottomButtonBar = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 55px;
  flex-shrink: 0;
  padding: 0 20px;
  background-color: #f9fafb;
  z-index: 1;
  border-top: 1px solid #c6cad9;
  box-shadow: 0 -2px 2px -7px #192b331a;
`;
BottomButtonBar.displayName = 'BottomButtonBar';

export const NameFields = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  > div {
    flex-grow: 1;
    flex-basis: 0;
    margin: 0 10px;
  }
`;
NameFields.displayName = 'NameFields';

export const ColumnarBlock = styled('div')`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 0;
  margin: 0 10px;
`;
ColumnarBlock.displayName = 'ColumnarBlock';

export const TwoColumnLayout = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
TwoColumnLayout.displayName = 'TwoColumnLayout';

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
  border: ${({ selected, disabled, color }) => {
    if (disabled || selected) return 'none';
    return `1px solid ${color}`;
  }};
  border-radius: 2px;
  padding-right: 15px;
  background-color: ${({ selected, disabled, color, theme }) => {
    if (disabled) return `${theme.colors.categoryDisabledColor}14`; // Hex with alpha 0.08
    if (selected) return color;
    return 'initial';
  }};
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`;
CategoryCheckboxField.displayName = 'CategoryCheckboxField';

export const StyledCategoryCheckbox = styled(({ color, ...rest }: BaseCheckboxProps) => (
  <Checkbox {...rest} classes={{ root: 'root', checked: 'checked' }} />
))<BaseCheckboxProps>`
  &&&.root {
    color: ${({ disabled, color, theme }) => (disabled ? `${theme.colors.categoryDisabledColor}33` : color)};
    padding: 8px;

    &.checked {
      color: white;
    }

    svg {
      font-size: 16px;
    }
  }
`;
StyledCategoryCheckbox.displayName = 'StyledCategoryCheckbox';

type ToggleViewButtonProps = { active?: boolean };

export const ToggleViewButton = styled('div')<ToggleViewButtonProps>`
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

  > svg {
    font-size: 18px;
  }
`;
ToggleViewButton.displayName = 'ToggleViewButton';

export const CategoriesWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 20px;
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

export const StyledTabs = styled((props: typeof Tabs['defaultProps'] & { value: any }) => (
  <Tabs {...props} classes={{ indicator: 'indicator' }} />
))`
  && .indicator {
    background-color: transparent;
  }
  flex-shrink: 1;
`;
StyledTabs.displayName = 'StyledTabs';

export type StyledTabProps = { searchTab?: boolean; label: React.ReactNode } & typeof Tab['defaultProps'];

export const StyledTab = styled(({ searchTab = false, ...rest }: StyledTabProps) => (
  <Tab {...rest} classes={{ selected: 'selected' }} />
))<StyledTabProps>`
  && {
    height: 50px;
    min-width: ${({ searchTab }) => (searchTab ? '50px' : '120px')};
    width: ${({ searchTab }) => (searchTab ? '50px' : '120px')};
    background-color: ${({ searchTab }) => (searchTab ? 'transparent' : '#d1d1d5')};
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    margin: 0 5px;
    font-size: 12px;
    line-height: 14px;
    text-transform: none;

    &.selected {
      background-color: #ffffff;
      font-weight: 600;
    }
  }
`;
StyledTab.displayName = 'StyledTab';

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

type TransferStyledButtonProps = {
  background?: string;
  color?: string;
  taller?: boolean;
};

export const TransferStyledButton = styled('button')<TransferStyledButtonProps>`
  background: ${props => (props.background ? props.background : '#ccc')};
  color: ${props => (props.color ? props.color : '#000')};
  letter-spacing: 0px;
  text-transform: none;
  font-weight: bold;
  margin-right: 1em;
  padding: 0px 16px;
  height: ${props => (props.taller ? 35 : 28)}px;
  font-size: 13px;
  outline: none;
  border-width: 1px;
  border-color: ${props => (props.color ? props.color : '#000')};
  border-radius: 14px;
  align-self: center;
  &:hover {
    cursor: pointer;
  }
`;
TransferStyledButton.displayName = 'TransferStyledButton';

export const HeaderContainer = styled(Row)`
  width: 100%;
  justify-items: flex-start;
  background-color: ${props => props.theme.colors.base2};
  border-width: 0px;
  text-transform: uppercase;
  color: #192b33;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.67px;
  line-height: 12px;
  padding: 0px;
`;
HeaderContainer.displayName = 'HeaderContainer';

export const StyledIcon = icon => styled(icon)`
  opacity: 0.34;
`;
StyledIcon.displayName = 'StyledIcon';

export const addHover = Component =>
  withStyles({
    root: {
      '&:hover': {
        borderRadius: '50%',
        backgroundColor: '#a0a8bd66',
      },
    },
  })(Component);

type PaginationRowProps = {
  transparent?: boolean;
};

export const PaginationRow = styled(TableRow)<PaginationRowProps>`
  height: auto;
  vertical-align: top;
  background-color: ${props => (props.transparent ? 'transparent' : props.theme.colors.base2)};
  margin-top: -5;
`;
PaginationRow.displayName = 'PaginationRow';

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
`;
AddTaskText.displayName = 'AddTaskText';

export const AddTaskButtonBase = withStyles({
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
AddTaskButtonBase.displayName = 'AddTaskButtonBase';

// eslint-disable-next-line import/no-unused-modules
export const FormItem = styled('div')`
  display: flex;
  flex-direction: column;
`;
FormItem.displayName = 'FormItem';

export const FormLabel = styled('label')`
  display: flex;
  flex-direction: column;
  font-size: 13px;
  letter-spacing: 1px;
  min-height: 18px;
`;
FormLabel.displayName = 'FormLabel';

export const FormError = styled('span')`
  text-transform: none;
  color: ${props => props.theme.colors.errorColor};
  font-size: 10px;
  line-height: 1.5;
  letter-spacing: normal;
`;
FormError.displayName = 'FormError';

type FormInputProps = { error?: boolean };

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
    background-color: ${props => props.theme.colors.inputBackgroundColor};
    color: ${props =>
      props.theme.calculated.lightTheme ? props.theme.colors.darkTextColor : props.theme.colors.lightTextColor};
    border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
    boxshadow: ${props => (props.error ? '0px 0px 0px 2px rgba(234,16,16,0.2)' : 'none')};
    padding: 0 7px;
  }
  &:focus {
    background-color: ${props => props.theme.colors.inputBackgroundColor};
    box-shadow: none;
    border: 1px solid rgba(0, 59, 129, 0.37);
  }
`;
FormInput.displayName = 'FormInput';

export const FormDateInput = styled(FormInput)`
  &[type='date']::-webkit-clear-button,
  &[type='date']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    display: none;
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
    line-height: 1.33;
    letter-spacing: normal;
    box-sizing: border-box; /* Tells the browser to account for any border and padding in the values you specify for an element's width and height. https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing*/
    width: 217px;
    border-radius: 4px;
    background-color: ${props => props.theme.colors.inputBackgroundColor};
    color: ${props =>
      props.theme.calculated.lightTheme ? props.theme.colors.darkTextColor : props.theme.colors.lightTextColor};
    border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
    boxshadow: ${props => (props.error ? '0px 0px 0px 2px rgba(234,16,16,0.2)' : 'none')};
    padding: 0 7px;
  }
  &:focus {
    background-color: ${props => props.theme.colors.inputBackgroundColor};
    box-shadow: none;
    border: 1px solid rgba(0, 59, 129, 0.37);
  }
`;

export const FormCheckBoxWrapper = styled(Row)<FormInputProps>`
  box-sizing: border-box; /* Tells the browser to account for any border and padding in the values you specify for an element's width and height. https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing*/
  width: 217px;
  height: 36px;
  border-radius: 4px;
  border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
  boxshadow: ${props => (props.error ? '0px 0px 0px 2px rgba(234,16,16,0.2)' : 'none')};
`;
FormCheckBoxWrapper.displayName = 'FormCheckBoxWrapper';

const CheckboxBase = styled('input')<FormInputProps>`
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

export const FormCheckbox = styled(CheckboxBase)`
  &[type='checkbox']:checked::before {
    border-color: #5dba32;
    background: #5dba32;
  }
  &[type='checkbox']:checked::after {
    font-family: 'Font Awesome 5 Free';
    content: '\f00c';
    color: #ffffff;
  }
`;
FormCheckbox.displayName = 'FormCheckbox';

export const FormMixedCheckbox = styled(CheckboxBase)`
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='false']::before {
    border-color: #d13821;
    background: #d13821;
  }
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='true']::before {
    border-color: #5dba32;
    background: #5dba32;
  }
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='false']::after {
    font-family: 'Font Awesome 5 Free';
    content: '\f00d';
    color: #ffffff;
  }
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='true']::after {
    font-family: 'Font Awesome 5 Free';
    content: '\f00c';
    color: #ffffff;
  }
  /* To disable the outline when focused */
  /* &[class~=mixed-checkbox][type=checkbox]:focus {
  outline: none;
} */
  /* Other stuff that we can use to style the pseudo elements */
  /* &[class~=mixed-checkbox][type=checkbox][aria-checked="true"]:active::before  */
  /* &[class~=mixed-checkbox][type=checkbox]:focus::before */
`;

type CategoryCheckboxProps = { color: string; disabled: boolean };
// eslint-disable-next-line import/no-unused-modules
export const CategoryCheckbox = styled(CheckboxBase)<CategoryCheckboxProps>`
  color: ${({ disabled, color, theme }) => (disabled ? `${theme.colors.categoryDisabledColor}33` : color)};
  padding: 8px;

  &[type='checkbox']:checked {
    color: white;
  }

  &[type='checkbox']:checked::after {
    font-family: 'Font Awesome 5 Free';
    content: '\f00c';
    color: ${({ color }) => color};
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
    disabled ? `${theme.colors.categoryTextColor}33` : theme.colors.categoryTextColor};
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`;
CategoryCheckboxLabel.displayName = 'CategoryCheckboxLabel';

export const FormSelectWrapper = styled('div')`
  position: relative;
  box-sizing: border-box; /* Tells the browser to account for any border and padding in the values you specify for an element's width and height. https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing*/
  width: 217px;
  height: 36px;

  &:after {
    // font-family: 'Font Awesome 5 Free';
    // content: '\f0dd';
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
  width: 217px;
  background-color: ${props => props.theme.colors.inputBackgroundColor};
  color: ${props =>
    props.theme.calculated.lightTheme ? props.theme.colors.darkTextColor : props.theme.colors.lightTextColor};
  height: 36px;
  line-height: 22px;
  border-radius: 4px;
  border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
  boxshadow: ${props => (props.error ? '0px 0px 0px 2px rgba(234,16,16,0.2)' : 'none')};
  padding: 0 7px;

  /* hide the arrow */
  -webkit-appearance: none;
  appearance: none;
`;
FormSelect.displayName = 'FormSelect';

// eslint-disable-next-line import/no-unused-modules
export const FormOption = styled('option')`
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
`;
FormOption.displayName = 'FormOption';

export const TaskCanvasOverride = styled('div')`
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.colors.base2};
`;
