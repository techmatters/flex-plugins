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

import React, { useEffect, useState } from 'react';
import { Actions, Template, withTaskContext, TaskHelper } from '@twilio/flex-ui';
import Tooltip from '@material-ui/core/Tooltip';
import { useDispatch, useSelector } from 'react-redux';

import { DestructiveButton } from '../../styles/buttons';
import { ConfirmDialog } from '../../design-system/modals/ConfirmDialog';
import { getHrmConfig } from '../../hrmConfig';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import type { RootState } from '../../states';
import asyncDispatch from '../../states/asyncDispatch';
import { newLoadContactFromHrmByTaskSidAsyncAction } from '../../states/contacts/saveContact';
import { isTransferring } from '../../transfer/transferTaskState';
import { selectIsContactCreating } from '../../states/contacts/selectContactSaveStatus';

const TakeOverTaskButton: React.FC<TaskContextProps> = ({ task }) => {
  const { isSupervisor, workerSid } = getHrmConfig();
  const asyncDispatcher = asyncDispatch(useDispatch());
  const contactState = useSelector((state: RootState) => selectContactByTaskSid(state, task?.taskSid));
  const isCreating = useSelector((state: RootState) => selectIsContactCreating(state, task?.taskSid));
  const activityName = useSelector((state: RootState) => state.flex.worker.worker.activityName);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingTakeoverTaskSid, setPendingTakeoverTaskSid] = useState<string | null>(null);

  useEffect(() => {
    if (task && !contactState && !isCreating) {
      asyncDispatcher(newLoadContactFromHrmByTaskSidAsyncAction(task.taskSid));
    }
  }, [asyncDispatcher, contactState, isCreating, task]);

  useEffect(() => {
    if (task && isTransferring(task) && pendingTakeoverTaskSid === task.taskSid) {
      setPendingTakeoverTaskSid(null);
    }
  }, [pendingTakeoverTaskSid, task]);

  // Takeovers are only supported for chat tasks via the lambda transferStart endpoint, which sets the transfer metadata server side
  if (!task || !workerSid || !contactState || TaskHelper.isCallTask(task)) {
    return null;
  }

  const transferInProgress = isTransferring(task);
  const isPending = pendingTakeoverTaskSid === task.taskSid;
  const isOnline = Boolean(activityName && activityName !== 'Offline');
  let disabledReason: string | undefined;
  if (isSupervisor) {
    if (isOnline) {
      if (transferInProgress || isPending) {
        disabledReason = 'TakeOver-Disabled-TransferInProgress';
      }
    } else {
      disabledReason = 'TakeOver-Disabled-Offline';
    }
  } else {
    disabledReason = 'TakeOver-Disabled-NotSupervisor';
  }

  const startTakeover = async () => {
    setIsConfirmationOpen(false);
    setPendingTakeoverTaskSid(task.taskSid);
    try {
      if (activityName !== 'Available') {
        await Actions.invokeAction('SetActivity', { activityName: 'Available' });
      }
      await Actions.invokeAction('TransferTask', {
        task,
        targetSid: workerSid,
        options: { mode: 'COLD' },
      });
    } catch (error) {
      setPendingTakeoverTaskSid(null);
      console.error('Failed to take over task', error);
    }
  };

  return (
    <>
      <Tooltip title={disabledReason ? <Template code={disabledReason} /> : ''}>
        <span>
          <DestructiveButton
            onClick={() => setIsConfirmationOpen(true)}
            data-fs-id="Task-TakeOver-Button"
            disabled={Boolean(disabledReason)}
          >
            <Template code="MonitorTaskCanvas-Header-TakeoverButtonLabel" />
          </DestructiveButton>
        </span>
      </Tooltip>
      <ConfirmDialog
        openDialog={isConfirmationOpen}
        dialogHeader="TakeOver-Confirm-Header"
        dialogContent="TakeOver-Confirm-Content"
        actionComponent={
          <DestructiveButton buttonSize="small" onClick={startTakeover}>
            <Template code="TakeOver-Confirm-Button" />
          </DestructiveButton>
        }
        onCloseDialog={() => setIsConfirmationOpen(false)}
      />
    </>
  );
};

TakeOverTaskButton.displayName = 'TakeOverTaskButton';

export default withTaskContext(TakeOverTaskButton);
