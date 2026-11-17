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

import { Actions, Manager, Notifications } from '@twilio/flex-ui';
import type { Reservation } from 'twilio-taskrouter';

export const TAKEOVER_SUCCESS_NOTIFICATION_ID = 'TakeOver_SucceededNotification';
export const SUPERVISOR_TAKEOVER_NOTIFICATION_ID = 'Supervisor_TakeOver_Notification';

type TransferMetadata = {
  initiatingWorkerSid?: string;
  originalTask?: string;
  originalTaskSid?: string;
};

export const isSupervisorTakeoverOfTask = (
  transferMeta: TransferMetadata | undefined,
  taskSid: string,
  workerSid: string,
) => {
  const originalTaskSid = transferMeta?.originalTaskSid ?? transferMeta?.originalTask;
  return Boolean(
    transferMeta?.initiatingWorkerSid && transferMeta.initiatingWorkerSid !== workerSid && originalTaskSid === taskSid,
  );
};

export const notifySupervisorTakeoverIfNeeded = (
  transferMeta: TransferMetadata | undefined,
  taskSid: string,
  workerSid: string,
  notifiedTaskSids: Set<string>,
) => {
  if (notifiedTaskSids.has(taskSid) || !isSupervisorTakeoverOfTask(transferMeta, taskSid, workerSid)) return;

  notifiedTaskSids.add(taskSid);
  Notifications.showNotificationSingle(SUPERVISOR_TAKEOVER_NOTIFICATION_ID);
};

export const acceptSelfInitiatedTakeover = async (reservation: Reservation) => {
  const { workerClient } = Manager.getInstance();
  if (reservation.task.attributes?.initiatedByWorker !== workerClient.sid) return;

  await Actions.invokeAction('AcceptTask', { sid: reservation.sid });
  Notifications.showNotificationSingle(TAKEOVER_SUCCESS_NOTIFICATION_ID);
  await Actions.invokeAction('SelectTask', { sid: reservation.sid });
};
