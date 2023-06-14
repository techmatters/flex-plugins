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

/* eslint-disable react/prop-types */
import React from 'react';
import { Actions, Template, TaskHelper, TaskContextProps, withTaskContext } from '@twilio/flex-ui';

import { TransferStyledButton } from '../../styles/HrmStyles';
import HhrTheme from '../../styles/HrmTheme';

const TransferButton: React.FC<TaskContextProps> = ({ task, conference }) => {
  if (!task) {
    return null;
  }

  const isLiveCall = TaskHelper.isLiveCall(task);
  const disabled = isLiveCall && conference && conference.source.liveParticipantCount >= 3;

  return (
    <TransferStyledButton
      color={HhrTheme.colors.secondaryButtonTextColor}
      background={HhrTheme.colors.secondaryButtonColor}
      onClick={() => Actions.invokeAction('ShowDirectory')}
      disabled={disabled}
      data-fs-id="Task-Transfer-Button"
    >
      <Template code="Transfer-TransferButton" />
    </TransferStyledButton>
  );
};

TransferButton.displayName = 'TransferButton';

export default withTaskContext(TransferButton);
