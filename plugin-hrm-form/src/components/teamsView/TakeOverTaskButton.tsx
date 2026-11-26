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

import React, { useEffect, useMemo, useState } from 'react';
import { Template, withTaskContext, TaskHelper } from '@twilio/flex-ui';
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
import {
  CALL_TAKEOVER_REQUEST_TTL_MS,
  CallTakeoverRequest,
  isCallTakeoverInProgress,
} from '../../transfer/callTakeoverRequest';
import {
  newClearTakeoverAction,
  newFailCallTakeoverAsyncAction,
  newStartTakeoverAsyncAction,
  selectTakeover,
} from '../../states/taskScopedMetadata';
import { TaskSID } from '../../types/twilio';

// Extra time for the counselor's client to start the transfer once it has claimed the request
const CALL_TAKEOVER_TIMEOUT_MS = CALL_TAKEOVER_REQUEST_TTL_MS + 15 * 1000;

const firstApplicableReason = (disabledReasons: [boolean, string][]) =>
  disabledReasons.find(([applies]) => applies)?.[1];

const TakeOverTaskButton: React.FC<TaskContextProps> = ({ task }) => {
  const { isSupervisor, workerSid, enableChatTakeovers, enableCallTakeovers } = getHrmConfig();
  const dispatch = useDispatch();
  const asyncDispatcher = useMemo(() => asyncDispatch(dispatch), [dispatch]);
  const contactState = useSelector((state: RootState) => selectContactByTaskSid(state, task?.taskSid));
  const isCreating = useSelector((state: RootState) => selectIsContactCreating(state, task?.taskSid));
  const takeover = useSelector((state: RootState) => selectTakeover(state, task?.taskSid));
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  useEffect(() => {
    if (task && !contactState && !isCreating) {
      asyncDispatcher(newLoadContactFromHrmByTaskSidAsyncAction(task.taskSid));
    }
  }, [asyncDispatcher, contactState, isCreating, task]);

  const isPending = takeover?.status === 'pending';
  const isCall = Boolean(task && TaskHelper.isCallTask(task));
  const isCallTakeoverPending = isCall && isPending;
  const callTakeoverRequest: CallTakeoverRequest | undefined = task?.attributes?.takeoverRequest;
  const taskSid = task?.taskSid as TaskSID;

  useEffect(() => {
    if (isPending && isTransferring(task)) {
      dispatch(newClearTakeoverAction(taskSid));
    }
  }, [dispatch, isPending, task, taskSid]);

  // The counselor's client reports failures on the request
  useEffect(() => {
    if (
      isCallTakeoverPending &&
      callTakeoverRequest?.status === 'failed' &&
      callTakeoverRequest.requestedBy === workerSid &&
      callTakeoverRequest.requestedAt !== takeover?.requestedAtBeforeTakeover
    ) {
      asyncDispatcher(newFailCallTakeoverAsyncAction(taskSid, callTakeoverRequest.reason ?? 'unknown', false));
    }
  }, [asyncDispatcher, isCallTakeoverPending, callTakeoverRequest, takeover, taskSid, workerSid]);

  // ...but its Flex may be closed, offline or on an older version, so don't wait forever
  useEffect(() => {
    if (!isCallTakeoverPending) return undefined;
    const timeout = setTimeout(() => {
      asyncDispatcher(newFailCallTakeoverAsyncAction(taskSid, 'Timed out', true));
    }, CALL_TAKEOVER_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [asyncDispatcher, isCallTakeoverPending, taskSid]);

  if (!task || !workerSid || !contactState || !(isCall ? enableCallTakeovers : enableChatTakeovers)) {
    return null;
  }

  const disabledReason = firstApplicableReason([
    [!isSupervisor, 'TakeOver-Disabled-NotSupervisor'],
    [isCall && task.taskStatus !== 'assigned', 'TakeOver-Disabled-CallNotActive'],
    [
      isTransferring(task) || isPending || isCallTakeoverInProgress(callTakeoverRequest, Date.now()),
      'TakeOver-Disabled-TransferInProgress',
    ],
  ]);

  const startTakeover = () => {
    setIsConfirmationOpen(false);
    asyncDispatcher(newStartTakeoverAsyncAction(task, workerSid));
  };

  return (
    <>
      <Tooltip title={disabledReason ? <Template code={disabledReason} /> : ''}>
        <span
          // This positions the button to the right of the status indicator rather than underneath it
          style={{
            display: 'inline-block',
            alignSelf: 'end',
            marginTop: '-32px',
            marginBottom: '4px',
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
