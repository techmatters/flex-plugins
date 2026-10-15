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

import React, { useEffect } from 'react';
import { Actions, Template, withTaskContext, Manager, TaskHelper } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';

import { TransferButton as TransferButtonStyled } from '../../styles/buttons';
import { getAseloFeatureFlags, getHrmConfig } from '../../hrmConfig';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import type { RootState } from '../../states';
import asyncDispatch from '../../states/asyncDispatch';
import { newLoadContactFromHrmForTaskAsyncAction } from '../../states/contacts/saveContact';

const TakeOverTaskButton: React.FC<TaskContextProps> = ({ task }) => {
  const workerSid = Manager.getInstance().workerClient?.workerSid;
  const { isSupervisor } = getHrmConfig();
  const asyncDispatcher = asyncDispatch(useDispatch());
  const contactState = useSelector((state: RootState) => selectContactByTaskSid(state, task?.taskSid));

  useEffect(() => {
    if (task && !contactState) {
      asyncDispatcher(newLoadContactFromHrmForTaskAsyncAction(task));
    }
  }, [asyncDispatcher, contactState, task]);

  // Take overs are only supported for chat tasks via the lambda transferStart endpoint, which sets the transfer metadata server side
  const { use_twilio_lambda_transfers: useLambdaTransfers } = getAseloFeatureFlags();
  if (!task || !workerSid || !isSupervisor || !contactState || !useLambdaTransfers || TaskHelper.isCallTask(task)) {
    return null;
  }

  return (
    <TransferButtonStyled
      onClick={() => Actions.invokeAction('TransferTask', { task, targetSid: workerSid, options: { mode: 'COLD' } })}
      data-fs-id="Task-TakeOver-Button"
    >
      <Template code="MonitorTaskCanvas-Header-TransferButtonLabel" />
    </TransferButtonStyled>
  );
};

TakeOverTaskButton.displayName = 'TakeOverTaskButton';

export default withTaskContext(TakeOverTaskButton);
