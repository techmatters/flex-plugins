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

import * as FlexWebChat from '@twilio/flex-webchat-ui';

const { styled } = FlexWebChat;

export const CustomBubbleContainer = styled('div')`
  display: flex;
  flex-wrap: nowrap;
  flex-grow: 1;
  flex-direction: column;
  overflow-x: hidden;
`;

export const CustomBubbleHeader = styled('div')`
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 5px;
  justify-content: space-between;
  color: #222222;
  display: flex;
  flex-wrap: nowrap;
  flex-grow: 1;
  flex-shrink: 1;
  flex-direction: row;
`;

export const CustomBubbleUserName = styled('div')`
  font-size: 10px;
  margin-top: 0;
  margin-bottom: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-flex: 0 1 auto;
  -ms-flex: 0 1 auto;
  flex: 0 1 auto;
  margin-right: 8px;
  font-weight: bold;
`;

export const CustomBubbleTime = styled('div')`
  font-size: 10px;
  margin-top: 0;
  margin-bottom: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
`;

export const CustomBubbleBody = styled('div')`
  padding-left: 12px;
  padding-right: 12px;
  margin-top: 3px;
  margin-bottom: 0px;
  font-size: 12px;
  line-height: 1.54;
  overflow-wrap: break-word;
  word-wrap: break-word;
  padding-bottom: 8px;
`;
