import { Actions, ITask, TaskHelper, StateHelper } from '@twilio/flex-ui';

import { transferChatStart, transferChatResolve } from '../services/ServerlessService';
import { transferStatuses, transferModes } from '../states/DomainConstants';
import { getConfig } from '../HrmFormPlugin';

/**
 * @param {ITask} task
 */
export const tranferStarted = task => Boolean(task.attributes.transferMeta);

/**
 * @param {ITask} task
 */
export const isOriginal = task =>
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

/**
 * @param {string} status
 * @returns {(task: ITask) => boolean}
 */
const isTaskInTransferStatus = status => task =>
  Boolean(task.attributes.transferMeta && task.attributes.transferMeta.transferStatus === status);

export const isTransferring = isTaskInTransferStatus(transferStatuses.transferring);

export const isTransferRejected = isTaskInTransferStatus(transferStatuses.rejected);

export const isTransferCompleted = isTaskInTransferStatus(transferStatuses.completed);

/**
 * @param {ITask} task
 */
export const showTransferButton = task =>
  TaskHelper.isTaskAccepted(task) && task.taskStatus === 'assigned' && !isTransferring(task);

/**
 * @param {ITask} task
 */
export const showTransferControls = task =>
  !isOriginal(task) && isTransferring(task) && TaskHelper.isTaskAccepted(task);

/**
 * @param {ITask} task
 */
export const shouldSubmitFormChat = task => TaskHelper.isChatBasedTask(task) && !isTransferring(task);

/**
 * A call should be submitted
 * - from original task if a transfer was initiated but it was rejected
 * - from non original task if a transfer was initiated and it was accepted
 * @param {ITask} task
 */
export const shouldSubmitFormCall = task =>
  TaskHelper.isCallTask(task) &&
  (!tranferStarted(task) ||
    (isOriginal(task) && isTransferRejected(task)) ||
    (!isOriginal(task) && isTransferCompleted(task)));

/**
 * @param {ITask} task
 */
export const shouldSubmitForm = task => shouldSubmitFormCall(task) || shouldSubmitFormChat(task);

/**
 * Completes the first task and keeps the second as the valid, making sure the channel is kept open
 * @param {string} closeSid task to close
 * @param {string} keepSid task to keep
 * @param {string} kickMember sid of the member that must be removed from channel
 * @param {string} newStatus resolution of the transfer (either "completed" or "rejected")
 * @returns {Promise<void>}
 */
export const resolveTransferChat = async (closeSid, keepSid, kickMember, newStatus) => {
  const body = { closeSid, keepSid, kickMember, newStatus };

  try {
    await transferChatResolve(body);
  } catch (err) {
    console.log(`Error while closing task ${closeSid}`, err);
    window.alert('Error while closing task');
  }
};

export const shouldReplaceChar = char =>
  !(char >= 'A' && char <= 'Z') && !(char >= 'a' && char <= 'z') && !(char >= '0' && char <= '9');

/**
 * Helper to match the transformation Twilio does on identity for the member resources
 * @param {string} str
 */
export const transformIdentity = str => {
  const transformed = [...str].map(char =>
    shouldReplaceChar(char)
      ? `_${char
          .charCodeAt(0)
          .toString(16)
          .toUpperCase()}`
      : char,
  );
  return transformed.join('');
};

/**
 * Takes the task and identity of the counselor to kick, and returns it's memberSid
 * @param {ITask} task
 * @param {string} kickIdentity
 */
export const getKickMember = (task, kickIdentity) => {
  const ChatChannel = StateHelper.getChatChannelStateForTask(task);
  const Member = ChatChannel.members.get(transformIdentity(kickIdentity));
  return (Member && Member.source && Member.source.sid) || '';
};

/**
 * Kicks the other participant in chat and then closes the original task
 * @param {ITask} task
 */
export const closeChatOriginal = async task => {
  const closeSid = task.attributes.transferMeta.originalTask;
  const keepSid = task.taskSid;
  const kickMember = getKickMember(task, task.attributes.ignoreAgent);
  await resolveTransferChat(closeSid, keepSid, kickMember, transferStatuses.completed);
};

/**
 * Leaves the current chat and closes the task being transfered to the new counselor
 * @param {ITask} task
 */
export const closeChatSelf = async task => {
  const closeSid = task.taskSid;
  const keepSid = task.attributes.transferMeta.originalTask;
  const { identity } = getConfig();
  const kickMember = getKickMember(task, identity);

  await resolveTransferChat(closeSid, keepSid, kickMember, transferStatuses.rejected);
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
};

/**
 * Hangs the current call and closes the task being transfered to the new counselor
 * @param {ITask} task
 * @returns {Promise<void>}
 */
export const closeCallSelf = async task => {
  await Actions.invokeAction('HangupCall', { sid: task.sid });
};

/**
 * @param {string} newStatus
 * @returns {(task: ITask) => Promise<void>}
 */
export const updateTransferStatus = newStatus => async task => {
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

/**
 * Saves transfer metadata into task attributes
 * @param {ITask} task
 * @param {string} mode
 * @param {string} documentName name to retrieve the form or null if there were no form to save
 */
export const setTransferMeta = async (task, mode, documentName) => {
  // Set transfer metadata
  const updatedAttributes = {
    ...task.attributes,
    transferMeta: {
      originalTask: task.taskSid,
      originalReservation: task.sid,
      originalCounselor: task.workerSid,
      transferStatus: mode === transferModes.warm ? transferStatuses.transferring : transferStatuses.completed,
      formDocument: documentName,
      mode,
    },
  };

  await task.setAttributes(updatedAttributes);
};
