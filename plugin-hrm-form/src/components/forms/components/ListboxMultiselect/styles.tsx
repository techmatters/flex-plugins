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

type FormInputProps = { error?: boolean };
type FormListboxMultiselectProps = FormInputProps & { height?: number; width?: number };

export const StyledListboxMultiselect = styled('ul')<FormListboxMultiselectProps>`
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
StyledListboxMultiselect.displayName = 'FormListboxMultiselect';

export const StyledListboxOptionsContainer = styled('div')`
  display: flex;
  flex-direction: column;
  padding-left: 10px;
  padding-top: 10px;
  overflow-y: scroll;
  box-sizing: border-box;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
`;
StyledListboxOptionsContainer.displayName = 'FormListboxMultiselectOptionsContainer';

export const StyledListboxOption = styled('li')`
  display: inline-flex;
`;
StyledListboxOption.displayName = 'FormListboxMultiselectOption';

export const StyledListboxOptionLabel = styled('label')`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  font-size: 14px;
  letter-spacing: 0;
  min-height: 18px;
  color: #000000;
`;
StyledListboxOptionLabel.displayName = 'FormListboxMultiselectOptionLabel';
