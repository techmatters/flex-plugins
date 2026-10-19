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
import { Actions, Template, withTaskContext, TaskHelper } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';

import { TransferButton as TransferButtonStyled } from '../../styles/buttons';
import { getHrmConfig } from '../../hrmConfig';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import type { RootState } from '../../states';
import asyncDispatch from '../../states/asyncDispatch';
import { newLoadContactFromHrmByIdAsyncAction } from '../../states/contacts/saveContact';
import { isTransferring } from '../../transfer/transferTaskState';

const TakeOverTaskButton: React.FC<TaskContextProps> = ({ task }) => {
  const { isSupervisor, workerSid } = getHrmConfig();
  const asyncDispatcher = asyncDispatch(useDispatch());
  const contactState = useSelector((state: RootState) => selectContactByTaskSid(state, task?.taskSid));

  useEffect(() => {
    const { contactId } = task?.attributes ?? {};
    if (contactId && !contactState) {
      asyncDispatcher(newLoadContactFromHrmByIdAsyncAction(contactId));
    }
  }, [asyncDispatcher, contactState, task]);

  // Takeovers are only supported for chat tasks via the lambda transferStart endpoint, which sets the transfer metadata server side
  if (!task || !workerSid || !isSupervisor || !contactState || TaskHelper.isCallTask(task) || isTransferring(task)) {
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
