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

import { styled } from '@twilio/flex-ui';

import { FormInputBaseProps } from '../styles';
import HrmTheme from '../../../../styles/HrmTheme';

export const FormFieldset = styled('fieldset')<FormInputBaseProps>`
  display: flex;
  flex-direction: column;
  border: ${props => (props.error ? '1px solid #CB3232' : 'none')};
  border-radius: 4px;
`;
FormFieldset.displayName = 'FormFieldset';

export const FormRadioInput = styled('input')<FormInputBaseProps>`
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
