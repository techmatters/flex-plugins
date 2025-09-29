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
import styled from '@emotion/styled';

import HrmTheme from '../../../styles/HrmTheme';
import { Row } from '../../../styles';

export const FormLabel = styled('label')`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  letter-spacing: 0;
  min-height: 18px;
  color: #000000;
`;
FormLabel.displayName = 'FormLabel';

export const RequiredAsterisk = () => (
  <span aria-hidden style={{ color: 'red' }}>
    *
  </span>
);

export const FormError = styled('span')`
  text-transform: none;
  color: ${HrmTheme.colors.errorColor};
  font-size: 10px;
  line-height: 1.5;
  letter-spacing: normal;
`;
FormError.displayName = 'FormError';

type FormInputBaseProps = { error?: boolean; width?: number | string; fullWidth?: boolean };

export const FormInputBase = styled('input')<FormInputBaseProps>`
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
    color: ${HrmTheme.colors.darkTextColor};
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
FormInputBase.displayName = 'FormInputBase';

export type FormInputProps = { error?: boolean; width?: number | string; fullWidth?: boolean };

export const FormCheckBoxWrapper = styled(Row)<FormInputProps>`
  align-items: flex-start;
  box-sizing: border-box; /* Tells the browser to account for any border and padding in the values you specify for an element's width and height. https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing*/
  height: 36px;
  border-radius: 4px;
  border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
  box-shadow: ${props => (props.error ? '0px 0px 0px 2px rgba(234,16,16,0.2)' : 'none')};
`;
FormCheckBoxWrapper.displayName = 'FormCheckBoxWrapper';

export const CheckboxBase = styled.input<FormInputProps>`
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
