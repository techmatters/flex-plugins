import { Manager, TaskHelper, Actions as FlexActions, ActionFunction, ReplacedActionFunction } from '@twilio/flex-ui';

import { DEFAULT_TRANSFER_MODE } from '../HrmFormPlugin';
import { saveInsightsData } from '../services/InsightsService';
import { transferChatStart } from '../services/ServerlessService';
import { namespace, contactFormsBase } from '../states';
import { Actions } from '../states/ContactState';
import { channelTypes, transferModes } from '../states/DomainConstants';
import * as TransferHelpers from './transfer';
import { saveFormSharedState, loadFormSharedState } from './sharedState';
import { SetupObject } from './types';

/**
 * Given a taskSid, retrieves the state of the form (stored in redux) for that task
 */
const getStateContactForms = (taskSid: string) => {
  return Manager.getInstance().store.getState()[namespace][contactFormsBase].tasks[taskSid];
};

/**
 * Saves the end time of the conversation (used to save the duration of the conversation)
 */
const saveEndMillis: ActionFunction = async payload => {
  Manager.getInstance().store.dispatch(Actions.saveEndMillis(payload.task.taskSid));
};

/**
 * A function that calls fun with the payload of the replaced action
 * and continues with the Twilio execution
 */
const fromActionFunction = (fun: ActionFunction): ReplacedActionFunction => async (payload, original) => {
  await fun(payload);
  await original(payload);
};

/**
 * Initializes an empty form (in redux store) for the task within payload
 */
export const initializeContactForm = (payload: { task: any }) => {
  Manager.getInstance().store.dispatch(Actions.initializeContactState(payload.task.taskSid));
};

/**
 * If the task within payload is a transferred one, load the form of the previous counselor (if possible)
 */
export const restoreFormIfTransfer = async (payload: { task: any }) => {
  if (TransferHelpers.hasTransferStarted(payload.task)) {
    const form = await loadFormSharedState(payload.task);
    if (form) Manager.getInstance().store.dispatch(Actions.restoreEntireForm(form, payload.task.taskSid));
  }
};

/**
 * Custom override for TransferTask action. Saves the form to share with another counseler (if possible) and then starts the transfer
 */
export const customTransferTask = (setupObject: SetupObject): ReplacedActionFunction => async (payload, original) => {
  console.log('TRANSFER PAYLOAD', payload);

  // save current form state as sync document (if there is a form)
  const form = getStateContactForms(payload.task.taskSid);
  const documentName = await saveFormSharedState(form, payload.task);

  const mode = payload.options.mode || DEFAULT_TRANSFER_MODE;

  // set metadata for the transfer
  await TransferHelpers.setTransferMeta(payload.task, mode, documentName);

  if (TaskHelper.isCallTask(payload.task)) {
    if (TransferHelpers.isColdTransfer(payload.task) && !TransferHelpers.hasTaskControl(payload.task)) {
      await TransferHelpers.setDummyChannelSid(payload.task);
    }

    return original(payload);
  }

  const { identity, workerSid } = setupObject;
  const memberToKick = mode === transferModes.cold ? TransferHelpers.getMemberToKick(payload.task, identity) : '';

  const body = {
    mode,
    taskSid: payload.task.taskSid,
    targetSid: payload.targetSid,
    ignoreAgent: workerSid,
    memberToKick,
  };

  return transferChatStart(body);
};

export const hangupCall = fromActionFunction(saveEndMillis);

/**
 * Helper to determine if the counselor should send a message before leaving the chat
 */
const shouldSayGoodbye = (channel: string) =>
  channel === channelTypes.facebook || channel === channelTypes.sms || channel === channelTypes.whatsapp;

/**
 * Sends the message before leaving the chat
 */
const sendGoodbyeMessage = (setupObject: SetupObject): ActionFunction => async payload => {
  const { getGoodbyeMsg, helplineLanguage, configuredLanguage } = setupObject;

  const getTaskLanguage = task => task.attributes.language || helplineLanguage || configuredLanguage;

  const taskLanguage = getTaskLanguage(payload.task);
  const goodbyeMsg = await getGoodbyeMsg(taskLanguage);
  await FlexActions.invokeAction('SendMessage', {
    body: goodbyeMsg,
    channelSid: payload.task.attributes.channelSid,
  });
};

/**
 * Override for WrapupTask action. Sends a message before leaving (if it should) and saves the end time of the conversation
 */
export const wrapupTask = (setupObject: SetupObject) =>
  fromActionFunction(async payload => {
    if (shouldSayGoodbye(payload.task.channelType)) {
      await sendGoodbyeMessage(setupObject)(payload);
    }
    await saveEndMillis(payload);
  });

/**
 * Saves custom attributes of the task (for Flex Insights)
 */
const saveInsights = async (payload: { task: any }) => {
  const { taskSid } = payload.task;
  const task = getStateContactForms(taskSid);

  await saveInsightsData(payload.task, task);
};

/**
 * Submits the form to the hrm backend (if it should), and saves the insights. Used before task is completed
 */
export const sendFormToBackend = (setupObject: SetupObject) => async (payload, abortFunction) => {
  const { hrmBaseUrl, workerSid, helpline, featureFlags } = setupObject;

  const manager = Manager.getInstance();

  if (!featureFlags.enable_transfers || TransferHelpers.hasTaskControl(payload.task)) {
    manager.store.dispatch(Actions.saveContactState(payload.task, abortFunction, hrmBaseUrl, workerSid, helpline));
    if (featureFlags.enable_save_insights) {
      await saveInsights(payload);
    }
  }
};

/**
 * Removes the form state from the redux store. Used after a task is completed
 */
export const removeContactForm = (payload: { task: any }) => {
  const manager = Manager.getInstance();
  manager.store.dispatch(Actions.removeContactState(payload.task.taskSid));
};
