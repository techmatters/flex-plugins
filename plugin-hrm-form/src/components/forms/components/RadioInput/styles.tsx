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

import styled from '@emotion/styled';

import HrmTheme from '../../../../styles/HrmTheme';

type FormInputProps = { error?: boolean };

export const StyledFormRadioInput = styled('input')<FormInputProps>`
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
StyledFormRadioInput.displayName = 'FormRadioInput';

export const StyledFormFieldset = styled('fieldset')<FormInputProps>`
  display: flex;
  flex-direction: column;
  border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
  border-radius: 4px;
`;
StyledFormFieldset.displayName = 'FormFieldset';

export const StyledFormLegend = styled('legend')`
  display: flex;
  font-size: 14px;
  letter-spacing: 0;
  min-height: 18px;
  color: #000000;
`;
StyledFormLegend.displayName = 'FormLegend';
