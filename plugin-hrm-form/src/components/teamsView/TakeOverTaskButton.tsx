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

import React, { useEffect, useRef, useState } from 'react';
import { Actions, Notifications, Template, withTaskContext, TaskHelper } from '@twilio/flex-ui';
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
import { requestCallTakeover, updateCallTakeoverStatus } from '../../services/twilioTaskService';
import {
  CALL_TAKEOVER_REQUEST_TTL_MS,
  CallTakeoverRequest,
  isCallTakeoverInProgress,
} from '../../transfer/callTakeoverRequest';
import { stopMonitoringCall, TAKEOVER_FAILED_NOTIFICATION_ID } from '../../transfer/takeoverReservation';

// Extra time for the counselor's client to start the transfer once it has claimed the request
const CALL_TAKEOVER_TIMEOUT_MS = CALL_TAKEOVER_REQUEST_TTL_MS + 15 * 1000;

const firstApplicableReason = (disabledReasons: [boolean, string][]) =>
  disabledReasons.find(([applies]) => applies)?.[1];

const TakeOverTaskButton: React.FC<TaskContextProps> = ({ task }) => {
  const { isSupervisor, workerSid, enableChatTakeovers, enableCallTakeovers } = getHrmConfig();
  const asyncDispatcher = asyncDispatch(useDispatch());
  const contactState = useSelector((state: RootState) => selectContactByTaskSid(state, task?.taskSid));
  const isCreating = useSelector((state: RootState) => selectIsContactCreating(state, task?.taskSid));
  const activityName = useSelector((state: RootState) => state.flex.worker.worker.activityName);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingTakeoverTaskSid, setPendingTakeoverTaskSid] = useState<string | null>(null);
  // An earlier, failed request may still be on the task until ours replaces it
  const requestedAtBeforeTakeover = useRef<string | undefined>();

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

  const isCall = Boolean(task && TaskHelper.isCallTask(task));
  const isCallTakeoverPending = isCall && pendingTakeoverTaskSid === task?.taskSid;
  const callTakeoverRequest: CallTakeoverRequest | undefined = task?.attributes?.takeoverRequest;

  const failCallTakeover = (reason: string) => {
    console.warn(`Call take over of task ${task.taskSid} failed: ${reason}`);
    setPendingTakeoverTaskSid(null);
    Notifications.showNotificationSingle(TAKEOVER_FAILED_NOTIFICATION_ID);
  };

  // The counselor's client reports failures on the request
  useEffect(() => {
    if (
      isCallTakeoverPending &&
      callTakeoverRequest?.status === 'failed' &&
      callTakeoverRequest.requestedBy === workerSid &&
      callTakeoverRequest.requestedAt !== requestedAtBeforeTakeover.current
    ) {
      failCallTakeover(callTakeoverRequest.reason ?? 'unknown');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCallTakeoverPending, callTakeoverRequest, workerSid]);

  // ...but its Flex may be closed, offline or on an older version, so don't wait forever
  useEffect(() => {
    if (!isCallTakeoverPending) return undefined;
    const timeout = setTimeout(() => {
      updateCallTakeoverStatus({ taskSid: task.taskSid, status: 'failed', reason: 'Timed out' }).catch(error =>
        console.error('Failed to mark timed out call take over as failed', error),
      );
      failCallTakeover('Timed out');
    }, CALL_TAKEOVER_TIMEOUT_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCallTakeoverPending]);

  if (!task || !workerSid || !contactState || !(isCall ? enableCallTakeovers : enableChatTakeovers)) {
    return null;
  }

  const isPending = pendingTakeoverTaskSid === task.taskSid;
  const isOnline = Boolean(activityName && activityName !== 'Offline');
  const disabledReason = firstApplicableReason([
    [!isSupervisor, 'TakeOver-Disabled-NotSupervisor'],
    [!isOnline, 'TakeOver-Disabled-Offline'],
    [isCall && task.taskStatus !== 'assigned', 'TakeOver-Disabled-CallNotActive'],
    [
      isTransferring(task) || isPending || isCallTakeoverInProgress(callTakeoverRequest, Date.now()),
      'TakeOver-Disabled-TransferInProgress',
    ],
  ]);

  const startChatTakeover = () =>
    Actions.invokeAction('TransferTask', {
      task,
      targetSid: workerSid,
      options: { mode: 'COLD' },
    });

  // Calls can only be transferred by the counselor's client, so ask it to transfer the call to us
  const startCallTakeover = async () => {
    await stopMonitoringCall();
    await requestCallTakeover({ taskSid: task.taskSid });
  };

  const startTakeover = async () => {
    setIsConfirmationOpen(false);
    requestedAtBeforeTakeover.current = callTakeoverRequest?.requestedAt;
    setPendingTakeoverTaskSid(task.taskSid);
    try {
      await (isCall ? startCallTakeover() : startChatTakeover());
    } catch (error) {
      setPendingTakeoverTaskSid(null);
      console.error('Failed to take over task', error);
      if (isCall) Notifications.showNotificationSingle(TAKEOVER_FAILED_NOTIFICATION_ID);
    }
  };

  return (
    <>
      <Tooltip title={disabledReason ? <Template code={disabledReason} /> : ''}>
        <span
          // This positions the button to the right of the status indicator rather than underneath it
          style={{
            display: 'inline-block',
            alignSelf: 'end',
            marginTop: '-30px',
            marginRight: '18px',
          }}
        >
          <DestructiveButton
            onClick={() => setIsConfirmationOpen(true)}
            data-fs-id="Task-TakeOver-Button"
            disabled={Boolean(disabledReason)}
            style={{ pointerEvents: disabledReason ? 'none' : undefined }}
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
          <DestructiveButton buttonSize="small" onClick={startTakeover} disabled={Boolean(disabledReason)}>
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
