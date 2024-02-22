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

import { Actions, Manager, TaskHelper } from '@twilio/flex-ui';

import type { RootState } from '../states';
import { transferModes, transferStatuses } from '../states/DomainConstants';
import { isInMyBehalfITask, isTwilioTask, RouterTask } from '../types/types';
import { isCallStatusLoading } from '../states/conferencing/callStatus';

export const hasTransferStarted = (task: ITask) => Boolean(task.attributes && task.attributes.transferMeta);

export const isOriginalReservation = (task: ITask) =>
  Boolean(task.attributes.transferMeta && task.attributes.transferMeta.originalReservation === task.sid);

export const isWarmTransfer = (task: ITask) =>
  Boolean(task.attributes.transferMeta && task.attributes.transferMeta.mode === transferModes.warm);

export const isColdTransfer = (task: ITask) =>
  Boolean(task.attributes.transferMeta && task.attributes.transferMeta.mode === transferModes.cold);

export const isTransferring = (task: ITask) => {
  const { transferMeta } = task.attributes;
  /*
   * Cold transfers are always in an 'accepted' state so we cannot use this to establish if it's still in progress
   * Checking if a cold transfer is not under our control suffices for current use cases, but it's tech debt
   * We should use the tranferStatus in both warm & cold transfers to simplify our state logic
   */
  return Boolean(
    transferMeta &&
      (transferMeta.transferStatus === transferStatuses.transferring ||
        (isColdTransfer(task) && !hasTaskControl(task))),
  );
};

export const shouldShowTransferButton = (task: ITask) =>
  TaskHelper.isTaskAccepted(task) &&
  task.taskStatus === 'assigned' &&
  task.status === 'accepted' &&
  (!isTransferring(task) || hasTaskControl(task));

export const shouldShowTransferControls = (task: ITask) =>
  !isOriginalReservation(task) && isTransferring(task) && !hasTaskControl(task) && TaskHelper.isTaskAccepted(task);

/**
 * Indicates if the current counselor has sole control over the task. Used to know if counselor should send form to hrm backend and prevent the form from being edited
 * A counselor controls a task if
 * - It isn't a Twilio task
 *  OR
 * - transfer was not initiated
 * - this is the original reservation and a transfer was initiated and then rejected
 * - this is not the original reservation and a transfer was initiated and then accepted
 */
export const hasTaskControl = (task: RouterTask) =>
  !isTwilioTask(task) ||
  !hasTransferStarted(task) ||
  (!isInMyBehalfITask(task) && task.attributes.transferMeta.sidWithTaskControl === task.sid);

const setTaskControl = async (task: ITask, sidWithTaskControl: string) => {
  const updatedAttributes = {
    ...task.attributes,
    transferMeta: {
      ...task.attributes.transferMeta,
      sidWithTaskControl,
    },
  };

  await task.setAttributes(updatedAttributes);
};

/**
 * Takes control of the given task
 */
export const takeTaskControl = async (task: ITask) => {
  await setTaskControl(task, task.sid);
};

/**
 * Returns control of the given task to original counselor (only for call tasks for now)
 */
export const returnTaskControl = async (task: ITask) => {
  if (TaskHelper.isCallTask(task)) {
    await setTaskControl(task, task.attributes.transferMeta.originalReservation);
  }
};

/**
 * Updates the state of the transfer and adds a dummy channelSid to start tracking the task in TransferredTaskJanitor
 * @param {string} newStatus
 * @returns {(task: ITask) => Promise<void>}
 */
export const updateTransferStatus = (newStatus: keyof typeof transferStatuses) => async (task: ITask) => {
  const updatedAttributes = {
    ...task.attributes,
    transferStarted: true,
    transferMeta: {
      ...task.attributes.transferMeta,
      transferStatus: newStatus,
    },
  };
  await task.setAttributes(updatedAttributes);
};

export const setTransferAccepted = updateTransferStatus(transferStatuses.accepted);

export const setTransferRejected = updateTransferStatus(transferStatuses.rejected);

/**
 * Saves transfer metadata into task attributes
 * @param {{ task: ITask, options: { mode: string }, targetSid: string }} payload
 * @param {string} counselorName
 */
export const setTransferMeta = async (
  payload: { task: ITask; options: { mode: string }; targetSid: string },
  counselorName: string,
) => {
  const { task, options, targetSid } = payload;
  const { mode } = options;
  const targetType = targetSid.startsWith('WK') ? 'worker' : 'queue';

  // Set transfer metadata
  const updatedAttributes = {
    ...task.attributes,
    transferStarted: true,
    transferMeta: {
      originalTask: task.taskSid,
      originalReservation: task.sid,
      originalCounselor: task.workerSid,
      originalCounselorName: counselorName,
      originalConversationSid: task.attributes.conversationSid || task.attributes.channelSid, // save the original conversation sid, so we can cleanup the listeners if transferred succesfully
      sidWithTaskControl: mode === transferModes.warm ? '' : 'WR00000000000000000000000000000000', // if cold, set control to dummy value so Task Janitor completes this one
      transferStatus: mode === transferModes.warm ? transferStatuses.transferring : transferStatuses.accepted,
      mode,
      targetType,
    },
  };

  await task.setAttributes(updatedAttributes);
};

/**
 * @param {ITask} task
 */
export const clearTransferMeta = async (task: ITask) => {
  const { transferMeta, transferStarted, ...attributes } = task.attributes;

  await task.setAttributes(attributes);
};

/**
 * Kicks the other participant in call and then closes the original task
 */
export const closeCallOriginal = async (task: ITask) => {
  await setTransferAccepted(task);
  await takeTaskControl(task);
  await Actions.invokeAction('KickParticipant', {
    sid: task.sid,
    targetSid: task.attributes.transferMeta.originalCounselor,
  });
};

/**
 * Hangs the current call and closes the task being transferred to the new counselor (i.e. this task)
 * @param {ITask} task
 * @returns {Promise<void>}
 */
export const closeCallSelf = async (task: ITask): Promise<void> => {
  await setTransferRejected(task);
  await returnTaskControl(task);
  await Actions.invokeAction('HangupCall', { sid: task.sid });
  await Actions.invokeAction('CompleteTask', { sid: task.sid });
};

export const canTransferConference = (task: ITask) => {
  const isChatTask = TaskHelper.isChatBasedTask(task);
  if (isChatTask) {
    return true;
  }

  const isLiveCall = TaskHelper.isLiveCall(task);
  const taskFromRedux = (Manager.getInstance().store.getState() as RootState)['plugin-hrm-form'].conferencing.tasks[
    task.taskSid
  ];

  const isLoading = taskFromRedux ? isCallStatusLoading(taskFromRedux.callStatus) : false;

  return isLiveCall && !isLoading && task.conference && task.conference.liveParticipantCount < 3;
};
