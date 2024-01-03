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

import { FontOpenSans } from '../../styles';

export const Container = styled('div')<{ backgroundColor?: string }>`
  display: flex;
  flex-grow: 0;
  flex-direction: column;
  background-color: ${props => (props.backgroundColor ? props.backgroundColor : '#ffffff')};
  border-style: solid;
`;

export const QueuesContainer = styled('div')<{ paddingRight?: boolean }>`
  width: 100%;
  ${props => props.paddingRight && 'padding-right: 30px;'}
`;

export const QueueName = styled(FontOpenSans)`
  font-size: 12px;
  font-weight: 400;
  line-height: 14px;
  padding-left: 2px;
`;

export const ChannelColumn = styled('div')<{ marginLeft?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${props => props.marginLeft && 'margin-left: 3px;'}
`;

export const ChannelBox = styled('div')<{ isZero?: boolean; backgroundColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 26px;
  font-size: 12px;
  font-weight: 600;
  line-height: 14px;
  margin-bottom: 5px;
  color: ${props => (props.isZero ? '#646D7F' : '#000000')};
  background-color: ${props => `${props.backgroundColor}26` /* adds 0.15 opacity alpha to the hex string */};
`;

export const ChannelLabel = styled(FontOpenSans)`
  font-size: 10px;
  font-weight: 400;
  line-height: 12px;
`;

const WaitTimeText = styled(FontOpenSans)`
  font-size: 12px;
  font-weight: 600;
  line-height: 14px;
`;

export const WaitTimeLabel = styled(WaitTimeText)`
  opacity: 0.8;
  margin-right: 1em;
`;

export const WaitTimeValue = styled(WaitTimeText)`
  color: #192b33;
`;
