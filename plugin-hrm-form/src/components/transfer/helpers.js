// eslint-disable-next-line no-unused-vars
import { Actions, ITask, TaskHelper, StateHelper } from '@twilio/flex-ui';

import { transferChatResolve } from '../../services/ServerlessService';
import { transferStatuses, transferModes } from '../../states/DomainConstants';
import { getConfig, getSharedStateClient } from '../../HrmFormPlugin';

/**
 * @param {ITask} task
 */
const noTranferStarted = task => !Boolean(task.attributes.transferMeta);

/**
 * @param {ITask} task
 */
// eslint-disable-next-line import/no-unused-modules
export const isOriginal = task =>
  task.attributes.transferMeta && task.attributes.transferMeta.originalReservation === task.sid;

/**
 * @param {ITask} task
 */
export const isWarmTransfer = task =>
  task.attributes.transferMeta && task.attributes.transferMeta.mode === transferModes.warm;

/**
 * @param {ITask} task
 */
export const isColdTransfer = task =>
  task.attributes.transferMeta && task.attributes.transferMeta.mode === transferModes.cold;

/**
 * @param {string} status
 * @returns {(task: ITask) => boolean}
 */
const isTaskInTransferStatus = status => task =>
  task.attributes.transferMeta && task.attributes.transferMeta.transferStatus === status;

export const isTransferring = isTaskInTransferStatus(transferStatuses.transferring);

const isTransferRejected = isTaskInTransferStatus(transferStatuses.rejected);

const isTransferCompleted = isTaskInTransferStatus(transferStatuses.completed);

/**
 * @param {ITask} task
 */
export const showTransferButton = task =>
  TaskHelper.isTaskAccepted(task) && !TaskHelper.isInWrapupMode(task) && !isTransferring(task);

/**
 * @param {ITask} task
 */
export const showTransferControls = task =>
  !isOriginal(task) && isTransferring(task) && TaskHelper.isTaskAccepted(task);

/**
 * @param {ITask} task
 */
const shouldSubmitFormChat = task => TaskHelper.isChatBasedTask(task) && !isTransferring(task); // status updated satus closing

/**
 * A call should be submitted
 * - from original task if a transfer was initiated but it was rejected
 * - from non original task if a transfer was initiated and it was accepted
 * @param {ITask} task
 */
const shouldSubmitFormCall = task =>
  TaskHelper.isCallTask(task) &&
  (noTranferStarted(task) ||
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
const resolveTransferChat = async (closeSid, keepSid, kickMember, newStatus) => {
  const body = { closeSid, keepSid, kickMember, newStatus };

  try {
    await transferChatResolve(body);
  } catch (err) {
    console.log(`Error while closing task ${closeSid}`, err);
    window.alert('Error while closing task');
  }
};

const dontTransform = char =>
  (char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9');

/**
 * Helper to match the transformation Twilio does on identity for the member resources
 * @param {string} str
 */
const transformIdentity = str => {
  const transformed = [...str].map(char =>
    dontTransform(char)
      ? char
      : `_${char
          .charCodeAt(0)
          .toString(16)
          .toUpperCase()}`,
  );
  return transformed.join('');
};

/**
 * Takes the task and identity of the counselor to kick, and returns it's memberSid
 * @param {ITask} task
 * @param {string} kickIdentity
 */
const getKickMember = (task, kickIdentity) => {
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

  await resolveTransferChat(closeSid, keepSid, kickMember, transferStatuses.completed);
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

/**
 * Saves the actual form into the Sync Client
 * @param {*} form form for current contact or undefined
 * @param {string} taskSid
 */
export const saveFormSharedState = async (form, taskSid) => {
  const sharedStateClient = getSharedStateClient();
  if (saveFormSharedState === undefined || sharedStateClient.connectionState !== 'connected') {
    window.alert("Can't access Shared State, form won't be saved");
    return null;
  }

  const documentName = form ? `pending-form-${taskSid}` : null;
  if (documentName) {
    const document = await sharedStateClient.document(documentName);
    const val = await document.set(form, { ttl: 86400 });
    console.log('SYNC DOCUMENT SAVED', 'Doc name:', documentName, 'Value stored:', val);
  }

  return documentName;
};

/**
 * Restores the contact form from Sync Client (if there is any)
 * @param {ITask} task
 */
export const loadFormSharedState = async task => {
  const sharedStateClient = getSharedStateClient();
  if (saveFormSharedState === undefined || sharedStateClient.connectionState !== 'connected') {
    window.alert("Can't access Shared State, form can't be restored");
    return null;
  }

  const documentName = task.attributes.transferMeta.formDocument;
  if (documentName) {
    const document = await sharedStateClient.document(documentName);
    console.log('DOCUMENT RETRIEVED', document);
    return document.value;
  }

  return null;
};

/**
 * Saves transfer metadata into task attributes
 * @param {ITask} task
 * @param {"COLD" | "WARM"} mode
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
