import { Manager, TaskHelper, Actions as FlexActions } from '@twilio/flex-ui';

import { DEFAULT_TRANSFER_MODE } from '../HrmFormPlugin';
import { saveInsightsData } from '../services/InsightsService';
import { transferChatStart } from '../services/ServerlessService';
import { namespace, contactFormsBase } from '../states';
import { Actions } from '../states/ContactState';
import { channelTypes, transferModes } from '../states/DomainConstants';
import * as TransferHelpers from './transfer';
import { saveFormSharedState, loadFormSharedState } from './sharedState';

const getStateContactForms = taskSid => {
  return Manager.getInstance().store.getState()[namespace][contactFormsBase].tasks[taskSid];
};

const saveEndMillis = async payload => {
  Manager.getInstance().store.dispatch(Actions.saveEndMillis(payload.task.taskSid));
};
/**
 * @param {import('@twilio/flex-ui').ActionFunction} fun
 * @returns {import('@twilio/flex-ui').ReplacedActionFunction}
 * A function that calls fun with the payload of the replaced action
 * and continues with the Twilio execution
 */
const fromActionFunction = fun => async (payload, original) => {
  await fun(payload);
  await original(payload);
};

export const initializeContactForm = payload => {
  Manager.getInstance().store.dispatch(Actions.initializeContactState(payload.task.taskSid));
};

export const restoreFormIfTransfer = async payload => {
  if (TransferHelpers.hasTransferStarted(payload.task)) {
    const form = await loadFormSharedState(payload.task);
    if (form) Manager.getInstance().store.dispatch(Actions.restoreEntireForm(form, payload.task.taskSid));
  }
};

export const customTransferTask = setupObject => async (payload, original) => {
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

const shouldSayGoodbye = channel =>
  channel === channelTypes.facebook || channel === channelTypes.sms || channel === channelTypes.whatsapp;

const sendGoodbyeMessage = setupObject => async payload => {
  const { getGoodbyeMsg, helplineLanguage, configuredLanguage } = setupObject;

  const getTaskLanguage = task => task.attributes.language || helplineLanguage || configuredLanguage;

  const taskLanguage = getTaskLanguage(payload.task);
  const goodbyeMsg = await getGoodbyeMsg(taskLanguage);
  await FlexActions.invokeAction('SendMessage', {
    body: goodbyeMsg,
    channelSid: payload.task.attributes.channelSid,
  });
};

export const wrapupTask = setupObject =>
  fromActionFunction(async payload => {
    if (shouldSayGoodbye(payload.task.channelType)) {
      await sendGoodbyeMessage(setupObject)(payload);
    }
    await saveEndMillis(payload);
  });

export const removeContactForm = payload => {
  const manager = Manager.getInstance();
  manager.store.dispatch(Actions.removeContactState(payload.task.taskSid));
};

const saveInsights = async payload => {
  const { taskSid } = payload.task;
  const task = getStateContactForms(taskSid);

  await saveInsightsData(payload.task, task);
};

export const sendFormToBackend = setUpObject => async (payload, abortFunction) => {
  const { hrmBaseUrl, workerSid, helpline, featureFlags } = setUpObject;

  const manager = Manager.getInstance();

  if (!featureFlags.enable_transfers || TransferHelpers.hasTaskControl(payload.task)) {
    manager.store.dispatch(Actions.saveContactState(payload.task, abortFunction, hrmBaseUrl, workerSid, helpline));
    if (featureFlags.enable_save_insights) {
      await saveInsights(payload);
    }
  }
};
