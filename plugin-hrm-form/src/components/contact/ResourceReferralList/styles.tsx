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

export const Container = styled('div')`
  width: 250px;
  margin-top: 25px;
  color: #000000;
`;

export const InputWrapper = styled('div')`
  display: flex;
  align-items: center;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  width: 100%;
  height: 39px;
  padding: 0 6px;
  margin-top: 10px;
  margin-bottom: 15px;

  &:focus-within {
    outline: 1px solid rgb(0, 95, 204);
  }
`;

export const InputText = styled('input')`
  border: none;
  flex-grow: 1;
  margin-right: 4px;
  width: inherit;

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: white;
  }
`;

type AddButtonProps = {
  disabled: boolean;
};

export const AddButton = styled('button')<AddButtonProps>`
  border: none;
  border-radius: 4px;
  height: 28px;
  padding-left: 12px;
  padding-right: 12px;
  color: rgba(18, 28, 45, 0.7);
  font-weight: 600;
  font-size: 13px;
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};

  &:hover {
    ${props => !props.disabled && 'background-color: #d8d8d8'};
  }
`;

// eslint-disable-next-line import/no-unused-modules
export const DeleteButton = styled('span')`
  color: #1876d1;
  font-family: OpenSans;
  font-size: 13px;
  line-height: 16px;
  width: 237px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-style: normal !important;
`;

export const Error = styled('p')`
  display: flex;
  color: red;
  margin-left: 12px;
  margin-bottom: 12px;
`;

export const ReferralList = styled('ul')`
  margin-left: 12px;
  color: rgba(0, 0, 0, 0.7);
`;

export const ReferralItem = styled('li')`
  display: flex;
  margin-bottom: 12px;
`;

export const ReferralItemInfo = styled('div')`
  display: flex;
  flex-direction: column;
  font-style: italic;
`;
