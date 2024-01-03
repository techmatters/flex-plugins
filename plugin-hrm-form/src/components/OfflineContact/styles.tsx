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
import { withStyles } from '@material-ui/core';
import { styled } from '@twilio/flex-ui';
import AssignmentInd from '@material-ui/icons/AssignmentIndOutlined';
import type { ButtonBaseProps } from '@material-ui/core/ButtonBase';

import { FontOpenSans, TaskButtonBase } from '../../styles';

export const OfflineContactTaskIconContainer = styled('div')`
  display: flex;
  flex: 0 0 44px;
  height: 44px;
`;

OfflineContactTaskIconContainer.displayName = 'OfflineContactTaskIconContainer';
export const OfflineContactTaskIcon = withStyles({
  root: {
    display: 'flex',
    flex: '0 0 auto',
    margin: 'auto',
    color: '#159af8',
  },
})(AssignmentInd);
OfflineContactTaskIcon.displayName = 'OfflineContactTaskIcon';

export const OfflineContactTaskContent = styled('div')`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  overflow: hidden;
  padding-right: auto;
  padding-left: 12px;
`;
OfflineContactTaskContent.displayName = 'OfflineContactTaskContent';

export const OfflineContactTaskFirstLine = styled(FontOpenSans)`
  font-size: 12px;
  font-weight: 700;
  color: rgb(34, 34, 34);
`;
OfflineContactTaskFirstLine.displayName = 'OfflineContactTaskFirstLine';

export const OfflineContactTaskSecondLine = styled(FontOpenSans)`
  font-size: 10px;
  font-weight: 400;
  color: rgb(34, 34, 34);
`;
OfflineContactTaskSecondLine.displayName = 'OfflineContactTaskSecondLine';

// eslint-disable-next-line react/prop-types
export const OfflineContactTaskButton: React.FC<{ selected: boolean } & ButtonBaseProps> = ({ selected, ...props }) => (
  <TaskButtonBase style={{ border: selected ? '2px solid rgb(86, 166, 246)' : 'none' }} {...props} />
);
OfflineContactTaskButton.displayName = 'OfflineContactTaskButton';
