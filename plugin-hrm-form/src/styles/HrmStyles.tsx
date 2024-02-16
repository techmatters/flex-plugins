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
import { Input, MenuItem, MenuList, Select } from '@material-ui/core';
import { styled } from '@twilio/flex-ui';

import { Row, Flex } from './layout';
import HrmTheme from './HrmTheme';

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
