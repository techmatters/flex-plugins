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
import { styled, Icon } from '@twilio/flex-ui';

import { FontOpenSans, TaskButtonBase } from '../../../styles';

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
  margin-right: 5px;
`;
AddTaskText.displayName = 'AddTaskText';

export const AddTaskButtonBase = styled(TaskButtonBase)``;
AddTaskButtonBase.displayName = 'AddTaskButtonBase';
