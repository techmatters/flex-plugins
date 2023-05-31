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

import { Flex } from '../../../styles/HrmStyles';

export const PhoneDialog = styled('div')`
  position: absolute;
  background: white;
  box-sizing: border-box;
  width: 350px;
  left:20px;
  bottom: 100px;
  min-width: 200px;
  padding: 25px 32px;
  border: 1px solid lightgray;
  border-radius: 4px;
  box-shadow: 0px 0px 3px 2px rgb(0 0 0 / 10%);
  z-index: 100;
`;
PhoneDialog.displayName = 'PhoneDialog';

type DialogArrowProps = {
  left?: string;
};

export const DialogArrow = styled(Flex)<DialogArrowProps>`
  position: absolute;
  bottom: 0;
  left: ${props => (props.left ? props.left : '75px')};
  background: #ffffff;
  border: 0px solid #d3d3d3;

  &:after,
  &:before {
    top: 100%;
    left: 50%;
    border: solid transparent;
    content: '';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }

  &:after {
    border-color: rgba(255, 255, 255, 0);
    border-top-color: #ffffff;
    border-width: 10px;
    margin-left: -10px;
  }

  &:before {
    border-color: rgba(211, 211, 211, 0);
    border-top-color: rgba(211, 211, 211, 0.7);
    border-width: 13px;
    margin-left: -13px;
  }
`;
DialogArrow.displayName = 'DialogArrow';
