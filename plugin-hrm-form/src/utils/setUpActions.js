// eslint-disable-next-line no-unused-vars
import { Manager, TaskHelper, Actions as FlexActions, StateHelper } from '@twilio/flex-ui';

// eslint-disable-next-line no-unused-vars
import { DEFAULT_TRANSFER_MODE, getConfig } from '../HrmFormPlugin';
import { saveInsightsData } from '../services/InsightsService';
import { transferChatStart, adjustChatCapacity } from '../services/ServerlessService';
import { namespace, contactFormsBase, connectedCaseBase } from '../states';
import * as Actions from '../states/contacts/actions';
import * as GeneralActions from '../states/actions';
import { channelTypes, transferModes } from '../states/DomainConstants';
import * as TransferHelpers from './transfer';
import { saveFormSharedState, loadFormSharedState } from './sharedState';
import { prepopulateForm } from './prepopulateForm';
import callerFormDefinition from '../formDefinitions/tabbedForms/CallerInformationTab.json';
import caseInfoFormDefinition from '../formDefinitions/tabbedForms/CaseInformationTab.json';
import childFormDefinition from '../formDefinitions/tabbedForms/ChildInformationTab.json';
import categoriesFormDefinition from '../formDefinitions/tabbedForms/IssueCategorizationTab.json';

/**
 * Given a taskSid, retrieves the state of the form (stored in redux) for that task
 * @param {string} taskSid
 */
const getStateContactForms = taskSid => {
  return Manager.getInstance().store.getState()[namespace][contactFormsBase].tasks[taskSid];
};

/**
 * Given a taskSid, retrieves the state of the connected case (stored in redux) for that task
 * This does not include temporaryCaseInfo
 * @param {string} taskSid
 */
const getStateCaseForms = taskSid => {
  return (
    (Manager.getInstance().store.getState()[namespace][connectedCaseBase] &&
      Manager.getInstance().store.getState()[namespace][connectedCaseBase].tasks[taskSid] &&
      Manager.getInstance().store.getState()[namespace][connectedCaseBase].tasks[taskSid].connectedCase) ||
    {}
  );
};

/**
 * Saves the end time of the conversation (used to save the duration of the conversation)
 * @type {import('@twilio/flex-ui').ActionFunction}
 */
const saveEndMillis = async payload => {
  Manager.getInstance().store.dispatch(Actions.saveEndMillis(payload.task.taskSid));
};

/**
 * A function that calls fun with the payload of the replaced action
 * and continues with the Twilio execution
 * @param {import('@twilio/flex-ui').ActionFunction} fun
 * @returns {import('@twilio/flex-ui').ReplacedActionFunction}
 */
const fromActionFunction = fun => async (payload, original) => {
  await fun(payload);
  await original(payload);
};

// The tabbed form definitions, used to create new form state.
const definitions = {
  callerFormDefinition,
  caseInfoFormDefinition,
  categoriesFormDefinition,
  childFormDefinition,
};

/**
 * Initializes an empty form (in redux store) for the task within payload
 * @param {{ task: any }} payload
 */
export const initializeContactForm = payload => {
  Manager.getInstance().store.dispatch(GeneralActions.initializeContactState(definitions)(payload.task.taskSid));
};

/**
 * If the task within payload is a transferred one, load the form of the previous counselor (if possible)
 * @param {import('@twilio/flex-ui').ITask} task
 */
const restoreFormIfTransfer = async task => {
  const form = await loadFormSharedState(task);
  if (form) Manager.getInstance().store.dispatch(Actions.restoreEntireForm(form, task.taskSid));
};

/**
 * If the task is transferred, set the reservation sid who controls the task (according to transfer mode)
 * @param {import('@twilio/flex-ui').ITask} task
 */
const takeControlIfTransfer = async task => {
  if (TransferHelpers.isColdTransfer(task)) await TransferHelpers.takeTaskControl(task);
};

/**
 * @param {import('@twilio/flex-ui').ITask} task
 */
const handleTransferredTask = async task => {
  await takeControlIfTransfer(task);
  await restoreFormIfTransfer(task);
};

const getTaskLanguage = ({ helplineLanguage, configuredLanguage }) => ({ task }) =>
  task.attributes.language || helplineLanguage || configuredLanguage;

/**
 * @param {string} messageKey
 * @returns {(setupObject: ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }) => import('@twilio/flex-ui').ActionFunction}
 */
const sendMessageOfKey = messageKey => setupObject => async payload => {
  const { getMessage } = setupObject;
  const taskLanguage = getTaskLanguage(setupObject)(payload);
  const message = await getMessage(messageKey)(taskLanguage);
  await FlexActions.invokeAction('SendMessage', {
    body: message,
    channelSid: payload.task.attributes.channelSid,
  });
};

const sendWelcomeMessage = sendMessageOfKey('WelcomeMsg');
const sendGoodbyeMessage = sendMessageOfKey('GoodbyeMsg');

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 * @returns {import('@twilio/flex-ui').ActionFunction}
 */
export const afterAcceptTask = setupObject => async payload => {
  const manager = Manager.getInstance();
  const { featureFlags } = setupObject;
  const { task } = payload;

  if (featureFlags.enable_transfers && TransferHelpers.hasTransferStarted(task)) handleTransferredTask(task);
  else prepopulateForm(task);

  // To enable for all chat based task, change condition to "if (TaskHelper.isChatBasedTask(task))"
  if (task.attributes.channelType === channelTypes.web) {
    const trySendWelcomeMessage = (ms, retries) => {
      setTimeout(() => {
        const channelState = StateHelper.getChatChannelStateForTask(task);
        // if channel is not ready, wait 200ms and retry
        if (channelState.isLoadingChannel) {
          if (retries < 10) trySendWelcomeMessage(200, retries + 1);
          else console.error('Failed to send welcome message: max retries reached.');
        } else {
          sendWelcomeMessage(setupObject)(payload);
        }
      }, ms);
    };

    // Ignore event payload as we already have everything we want in afterAcceptTask arguments. Start at 0ms as many users are able to send the message right away
    manager.chatClient.once('channelJoined', () => trySendWelcomeMessage(0, 0));
  }
};

/**
 * Prevents wrong task states when transfer fails (e.g. transferring to an offline worker)
 * @param {() => Promise<void>} transferFunction
 * @param {import('@twilio/flex-ui').ITask} task
 */
const safeTransfer = async (transferFunction, task) => {
  try {
    await transferFunction();
  } catch (err) {
    await TransferHelpers.clearTransferMeta(task);
  }
};

/**
 * Custom override for TransferTask action. Saves the form to share with another counseler (if possible) and then starts the transfer
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 * @returns {import('@twilio/flex-ui').ReplacedActionFunction}
 */
export const customTransferTask = setupObject => async (payload, original) => {
  const mode = payload.options.mode || DEFAULT_TRANSFER_MODE;

  /*
   * Currently (as of 2 Dec 2020) warm text transfers are not supported.
   * We shortcut the rest of the function to save extra time and unnecessary visual changes.
   */
  if (!TaskHelper.isCallTask(payload.task) && mode === transferModes.warm) {
    window.alert(Manager.getInstance().strings['Transfer-ChatWarmNotAllowed']);
    return () => undefined; // Not calling original(payload) prevents the additional "Task cannot be transferred" notification
  }

  const { identity, workerSid, counselorName } = setupObject;

  // save current form state as sync document (if there is a form)
  const form = getStateContactForms(payload.task.taskSid);
  const documentName = await saveFormSharedState(form, payload.task);

  // set metadata for the transfer
  await TransferHelpers.setTransferMeta(payload, documentName, counselorName);

  if (TaskHelper.isCallTask(payload.task)) {
    return safeTransfer(() => original(payload), payload.task);
  }

  const memberToKick = mode === transferModes.cold ? TransferHelpers.getMemberToKick(payload.task, identity) : '';

  const body = {
    mode,
    taskSid: payload.task.taskSid,
    targetSid: payload.targetSid,
    ignoreAgent: workerSid,
    memberToKick,
  };

  return safeTransfer(() => transferChatStart(body), payload.task);
};

export const afterCancelTransfer = payload => {
  TransferHelpers.clearTransferMeta(payload.task);
};

export const hangupCall = fromActionFunction(saveEndMillis);

/**
 * Helper to determine if the counselor should send a message before leaving the chat
 * @param {string} channel
 */
const shouldSayGoodbye = channel =>
  channel === channelTypes.facebook || channel === channelTypes.sms || channel === channelTypes.whatsapp;

/**
 * Override for WrapupTask action. Sends a message before leaving (if it should) and saves the end time of the conversation
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 */
export const wrapupTask = setupObject =>
  fromActionFunction(async payload => {
    if (shouldSayGoodbye(payload.task.channelType)) {
      await sendGoodbyeMessage(setupObject)(payload);
    }
    await saveEndMillis(payload);
  });

/**
 * Saves custom attributes of the task (for Flex Insights)
 * @param {{ task: any }} payload
 */
const saveInsights = async payload => {
  const { taskSid } = payload.task;
  const contactForm = getStateContactForms(taskSid);
  const caseForm = getStateCaseForms(taskSid);

  await saveInsightsData(payload.task, contactForm, caseForm);
};

/**
 * Submits the form to the hrm backend (if it should), and saves the insights. Used before task is completed
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 * @returns {import('@twilio/flex-ui').ActionFunction}
 */
const sendInsightsData = setupObject => async payload => {
  const { featureFlags } = setupObject;

  if (!featureFlags.enable_transfers || TransferHelpers.hasTaskControl(payload.task)) {
    if (featureFlags.enable_save_insights) {
      await saveInsights(payload);
    }
  }
};

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 * @returns {import('@twilio/flex-ui').ActionFunction}
 */
const decreaseChatCapacity = setupObject => async payload => {
  const { featureFlags } = setupObject;
  const { task } = payload;
  if (featureFlags.enable_manual_pulling && task.taskChannelUniqueName === 'chat') await adjustChatCapacity('decrease');
};

/**
 * @param {ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }} setupObject
 * @returns {import('@twilio/flex-ui').ActionFunction}
 */
export const beforeCompleteTask = setupObject => async payload => {
  await sendInsightsData(setupObject)(payload);
  await decreaseChatCapacity(setupObject)(payload);
};

/**
 * Removes the form state from the redux store. Used after a task is completed
 * @param {{ task: any }} payload
 */
export const removeContactForm = payload => {
  const manager = Manager.getInstance();
  manager.store.dispatch(GeneralActions.removeContactState(payload.task.taskSid));
};
