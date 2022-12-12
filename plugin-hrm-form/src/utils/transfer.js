// eslint-disable-next-line no-unused-vars
import { Actions, ITask, TaskHelper, StateHelper } from '@twilio/flex-ui';

import { transferStatuses, transferModes } from '../states/DomainConstants';

/**
 * @param {ITask} task
 */
export const hasTransferStarted = task => Boolean(task.attributes && task.attributes.transferMeta);

/**
 * @param {ITask} task
 */
export const isOriginalReservation = task =>
  Boolean(task.attributes.transferMeta && task.attributes.transferMeta.originalReservation === task.sid);

/**
 * @param {ITask} task
 */
export const isWarmTransfer = task =>
  Boolean(task.attributes.transferMeta && task.attributes.transferMeta.mode === transferModes.warm);

/**
 * @param {ITask} task
 */
export const isColdTransfer = task =>
  Boolean(task.attributes.transferMeta && task.attributes.transferMeta.mode === transferModes.cold);

export const isTransferring = task => {
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

/**
 * @param {ITask} task
 */
export const shouldShowTransferButton = task =>
  TaskHelper.isTaskAccepted(task) &&
  task.taskStatus === 'assigned' &&
  task.status === 'accepted' &&
  (!isTransferring(task) || hasTaskControl(task));

/**
 * @param {ITask} task
 */
export const shouldShowTransferControls = task =>
  !isOriginalReservation(task) && isTransferring(task) && hasTaskControl(task) && TaskHelper.isTaskAccepted(task);

/**
 * Indicates if the current counselor has sole control over the task. Used to know if counselor should send form to hrm backend and prevent the form from being edited
 * A counselor controls a task if
 * - transfer was not initiated
 * - this is the original reservation and a transfer was initiated and then rejected
 * - this is not the original reservation and a transfer was initiated and then accepted
 * @param {import('../types/types').CustomITask} task
 */
export const hasTaskControl = task =>
  !hasTransferStarted(task) || task.attributes.transferMeta.sidWithTaskControl === task.sid;

/**
 * @param {ITask} task
 * @param {string} sidWithTaskControl
 */
const setTaskControl = async (task, sidWithTaskControl) => {
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
 * @param {ITask} task
 */
export const takeTaskControl = async task => {
  await setTaskControl(task, task.sid);
};

/**
 * Returns control of the given task to original counselor (only for call tasks for now)
 * @param {ITask} task
 */
export const returnTaskControl = async task => {
  if (TaskHelper.isCallTask(task)) {
    await setTaskControl(task, task.attributes.transferMeta.originalReservation);
  }
};

/**
 * Updates the state of the transfer and adds a dummy channelSid to start tracking the task in TransferredTaskJanitor
 * @param {string} newStatus
 * @returns {(task: ITask) => Promise<void>}
 */
export const updateTransferStatus = newStatus => async task => {
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
 * @param {string} documentName name to retrieve the form or null if there were no form to save
 * @param {string} counselorName
 */
export const setTransferMeta = async (payload, documentName, counselorName) => {
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
      sidWithTaskControl: mode === transferModes.warm ? '' : 'WR00000000000000000000000000000000', // if cold, set control to dummy value so Task Janitor completes this one
      transferStatus: mode === transferModes.warm ? transferStatuses.transferring : transferStatuses.accepted,
      formDocument: documentName,
      mode,
      targetType,
    },
  };

  await task.setAttributes(updatedAttributes);
};

/**
 * @param {ITask} task
 */
export const clearTransferMeta = async task => {
  const { transferMeta, transferStarted, ...attributes } = task.attributes;

  await task.setAttributes(attributes);
};

/**
 * Kicks the other participant in call and then closes the original task
 * @param {ITask} task
 * @returns {Promise<void>}
 */
export const closeCallOriginal = async task => {
  await setTransferAccepted(task);
  await takeTaskControl(task);
  await Actions.invokeAction('KickParticipant', {
    sid: task.sid,
    targetSid: task.attributes.transferMeta.originalCounselor,
  });
};

/**
 * Hangs the current call and closes the task being transfered to the new counselor (i.e. this task)
 * @param {ITask} task
 * @returns {Promise<void>}
 */
export const closeCallSelf = async task => {
  await setTransferRejected(task);
  await returnTaskControl(task);
  await Actions.invokeAction('CompleteTask', { sid: task.sid });
};
