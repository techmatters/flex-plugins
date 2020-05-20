import { Actions, TaskHelper, ITask, TaskReservationStatus } from '@twilio/flex-ui';

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
 * completes the given task, making sure the channel is kept open if task is chat based
 * @param {ITask} task
 * @returns {Promise<void>}
 */
export const closeTransfer = async task => {
  if (TaskHelper.isChatBasedTask(task)) {
    const updatedAttributes = {
      ...task.attributes,
      channelSid: 'CH00000000000000000000000000000000',
      proxySessionSID: 'KC00000000000000000000000000000000',
    };
    await task.setAttributes(updatedAttributes);

    Actions.invokeAction('CompleteTask', { task });
  } else if (isOriginal(task)) {
    // if the call being closed is the original (i.e. completing transfer)
    Actions.invokeAction('KickParticipant', {
      sid: task.sid,
      targetSid: task.attributes.transferMeta.originalCounselor,
    });
  } else {
    // if the call being closed is the new one (i.e. rejecting transfer)
    Actions.invokeAction('HangupCall', { sid: task.sid });
    Actions.invokeAction('CompleteTask', { sid: task.sid });
  }
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

export const completeTransfer = updateTransferStatus(transferStatuses.completed);

export const rejectTransfer = updateTransferStatus(transferStatuses.rejected);
