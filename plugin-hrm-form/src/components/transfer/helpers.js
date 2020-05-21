import { Actions, ITask } from '@twilio/flex-ui';

import { transferChatResolve } from '../../services/ServerlessService';
import { transferStatuses } from '../../states/DomainConstants';

/**
 * @param {ITask} task
 */
export const isOriginal = task =>
  task.attributes.transferMeta && task.attributes.transferMeta.originalReservation === task.sid;

/**
 * @param {ITask} task
 */
export const isTransferring = task =>
  task.attributes.transferMeta && task.attributes.transferMeta.transferStatus === transferStatuses.transferring;

/**
 * completes the given task, making sure the channel is kept open
 * @param {string} closeSid task to close
 * @param {string} keepSid task to keep
 * @param {string} newStatus resolution of the transfer (either "completed" or "rejected")
 * @returns {Promise<void>}
 */
export const resolveTransferChat = async (closeSid, keepSid, newStatus) => {
  const body = { closeSid, keepSid, newStatus };

  try {
    await transferChatResolve(body);
  } catch (err) {
    console.log(`Error while closing task ${closeSid}`, err);
    window.alert('Error while closing task');
  }
};

/**
 * Kicks the other participant in call and then closes the original task
 * @param {ITask} task
 * @returns {Promise<void>}
 */
export const closeCallOriginal = async task => {
  await Actions.invokeAction('KickParticipant', {
    sid: task.sid,
    targetSid: task.attributes.transferMeta.originalCounselor,
  });
  await Actions.invokeAction('CompleteTask', { sid: task.attributes.transferMeta.originalReservation });
};

/**
 * Hangs the current call and closes the task being transfered to the new counselor
 * @param {ITask} task
 * @returns {Promise<void>}
 */
export const closeCallSelf = async task => {
  await Actions.invokeAction('HangupCall', { sid: task.sid });
  await Actions.invokeAction('CompleteTask', { sid: task.sid });
};

/**
 * @param {string} newStatus
 * @returns {(task: ITask) => Promise<void>}
 */
const updateTransferStatus = newStatus => async task => {
  const updatedAttributes = {
    ...task.attributes,
    transferMeta: {
      ...task.attributes.transferMeta,
      transferStatus: newStatus,
    },
  };
  await task.setAttributes(updatedAttributes);
};

export const setTransferCompleted = updateTransferStatus(transferStatuses.completed);

export const setTransferRejected = updateTransferStatus(transferStatuses.rejected);
