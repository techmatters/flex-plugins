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
import { Actions, Template, withTaskContext, Manager } from '@twilio/flex-ui';

import { canTransferConference } from '../../transfer/transferTaskState';
import { TransferButton as TransferButtonStyled } from '../../styles/buttons';
import { getHrmConfig } from '../../hrmConfig';

const TakeOverTaskButton: React.FC<TaskContextProps> = ({ task }) => {
  const workerSid = Manager.getInstance().workerClient?.workerSid;
  const { isSupervisor } = getHrmConfig();
  if (!task || !workerSid || !isSupervisor) {
    return null;
  }
  const disabled = !canTransferConference(task);

  return (
    <TransferButtonStyled
      onClick={() => Actions.invokeAction('TransferTask', { task, targetSid: workerSid, options: { mode: 'COLD' } })}
      disabled={disabled}
      data-fs-id="Task-TakeOver-Button"
    >
      <Template code="MonitorTaskCanvas-Header-TransferButtonLabel" />
    </TransferButtonStyled>
  );
};

TakeOverTaskButton.displayName = 'TakeOverTaskButton';

export default withTaskContext(TakeOverTaskButton);
