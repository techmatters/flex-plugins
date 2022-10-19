/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
import {
  Manager,
  TaskHelper,
  Actions as FlexActions,
  StateHelper,
  ChatOrchestrator,
  ITask,
  ActionFunction,
  ReplacedActionFunction,
  ChatOrchestratorEvent,
} from '@twilio/flex-ui';
import { callTypes } from 'hrm-form-definitions';
import type { ChatOrchestrationsEvents } from '@twilio/flex-ui/src/ChatOrchestrator';

import { DEFAULT_TRANSFER_MODE, getConfig } from '../HrmFormPlugin';
import {
  transferChatStart,
  adjustChatCapacity,
  sendSystemMessage,
  getDefinitionVersion,
  postSurveyInit,
} from '../services/ServerlessService';
import { namespace, contactFormsBase, connectedCaseBase, configurationBase, dualWriteBase } from '../states';
import * as Actions from '../states/contacts/actions';
import { populateCurrentDefinitionVersion, updateDefinitionVersion } from '../states/configuration/actions';
import { changeRoute } from '../states/routing/actions';
import { clearCustomGoodbyeMessage } from '../states/dualWrite/actions';
import * as GeneralActions from '../states/actions';
import { transferModes, customChannelTypes } from '../states/DomainConstants';
import * as TransferHelpers from './transfer';
import { saveFormSharedState, loadFormSharedState } from './sharedState';
import { prepopulateForm } from './prepopulateForm';
import { recordEvent } from '../fullStory';
import { CustomITask } from '../types/types';

type SetupObject = ReturnType<typeof getConfig> & {
  translateUI: (language: string) => Promise<void>;
  getMessage: (messageKey: string) => (language: string) => Promise<string>;
};
type ActionPayload = { task: ITask };
type ActionPayloadWithOptions = ActionPayload & { options: { mode: string }; targetSid: string };

export const loadCurrentDefinitionVersion = async () => {
  const { definitionVersion } = getConfig();
  const definitions = await getDefinitionVersion(definitionVersion);
  // populate current version
  Manager.getInstance().store.dispatch(populateCurrentDefinitionVersion(definitions));
  // already populate this to be consumed for data display components
  Manager.getInstance().store.dispatch(updateDefinitionVersion(definitionVersion, definitions));
};

/**
 * Given a taskSid, retrieves the state of the form (stored in redux) for that task
 */
const getStateContactForms = (taskSid: string) => {
  return Manager.getInstance().store.getState()[namespace][contactFormsBase].tasks[taskSid];
};

/**
 * @param {import('../types/types').CustomITask} task
 */
export const shouldSendInsightsData = (task: ITask) => {
  const { featureFlags } = getConfig();
  const hasTaskControl = !featureFlags.enable_transfers || TransferHelpers.hasTaskControl(task);

  return hasTaskControl && featureFlags.enable_save_insights && !task.attributes?.skipInsights;
};

const saveEndMillis = async (payload: ActionPayload) => {
  Manager.getInstance().store.dispatch(Actions.saveEndMillis(payload.task.taskSid));
};

const fromActionFunction = (fun: ActionFunction) => async (payload: ActionPayload, original: ActionFunction) => {
  await fun(payload);
  await original(payload);
};

/**
 * Initializes an empty form (in redux store) for the task within payload
 */
export const initializeContactForm = (payload: ActionPayload) => {
  const { currentDefinitionVersion } = Manager.getInstance().store.getState()[namespace][configurationBase];

  Manager.getInstance().store.dispatch(
    GeneralActions.initializeContactState(currentDefinitionVersion)(payload.task.taskSid),
  );
};

const restoreFormIfTransfer = async (task: ITask) => {
  const form = await loadFormSharedState(task);
  if (form) {
    Manager.getInstance().store.dispatch(Actions.restoreEntireForm(form, task.taskSid));

    if (form.callType === callTypes.child) {
      Manager.getInstance().store.dispatch(
        changeRoute({ route: 'tabbed-forms', subroute: 'childInformation' }, task.taskSid),
      );
    } else if (form.callType === callTypes.caller) {
      Manager.getInstance().store.dispatch(
        changeRoute({ route: 'tabbed-forms', subroute: 'callerInformation' }, task.taskSid),
      );
    }
  }
};

const takeControlIfTransfer = async (task: ITask) => {
  if (TransferHelpers.isColdTransfer(task)) await TransferHelpers.takeTaskControl(task);
};

const handleTransferredTask = async (task: ITask) => {
  await takeControlIfTransfer(task);
  await restoreFormIfTransfer(task);
};

export const getTaskLanguage = ({ helplineLanguage }) => ({ task }) => task.attributes.language || helplineLanguage;

const sendMessageOfKey = (messageKey: string) => (setupObject: SetupObject): ActionFunction => async (
  payload: ActionPayload,
) => {
  const { getMessage } = setupObject;
  const taskLanguage = getTaskLanguage(setupObject)(payload);
  const message = await getMessage(messageKey)(taskLanguage);
  await FlexActions.invokeAction('SendMessage', {
    body: message,
    channelSid: payload.task.attributes.channelSid,
  });
};

/**
 * @param {string} messageKey
 * @returns {(setupObject: ReturnType<typeof getConfig> & { translateUI: (language: string) => Promise<void>; getMessage: (messageKey: string) => (language: string) => Promise<string>; }) => import('@twilio/flex-ui').ActionFunction}
 */
const sendSystemMessageOfKey = (messageKey: string) => (setupObject: SetupObject) => async (payload: ActionPayload) => {
  const { getMessage } = setupObject;
  const taskLanguage = getTaskLanguage(setupObject)(payload);
  const message = await getMessage(messageKey)(taskLanguage);
  await sendSystemMessage({ taskSid: payload.task.taskSid, message, from: 'Bot' });
};

const sendSystemCustomGoodbyeMessage = (customGoodbyeMessage: string) => () => async (payload: ActionPayload) => {
  const { taskSid } = payload.task;
  Manager.getInstance().store.dispatch(clearCustomGoodbyeMessage(taskSid));
  await sendSystemMessage({ taskSid, message: customGoodbyeMessage, from: 'Bot' });
};

const sendWelcomeMessage = sendMessageOfKey('WelcomeMsg');
const sendGoodbyeMessage = taskSid => {
  const { enable_dual_write } = getConfig().featureFlags;

  const customGoodbyeMessage =
    enable_dual_write &&
    Manager.getInstance().store.getState()[namespace][dualWriteBase].tasks[taskSid]?.customGoodbyeMessage;
  return customGoodbyeMessage
    ? sendSystemCustomGoodbyeMessage(customGoodbyeMessage)
    : sendSystemMessageOfKey('GoodbyeMsg');
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const afterAcceptTask = (setupObject: SetupObject) => async (payload: ActionPayload) => {
  const manager = Manager.getInstance();
  const { featureFlags } = setupObject;
  const { task } = payload;

  if (featureFlags.enable_transfers && TransferHelpers.hasTransferStarted(task)) handleTransferredTask(task);
  else prepopulateForm(task);

  if (TaskHelper.isChatBasedTask(task) && !TransferHelpers.hasTransferStarted(task)) {
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

const safeTransfer = async (transferFunction: () => Promise<any>, task: ITask): Promise<void> => {
  try {
    await transferFunction();
  } catch (err) {
    await TransferHelpers.clearTransferMeta(task);
  }
};

/**
 * Custom override for TransferTask action. Saves the form to share with another counseler (if possible) and then starts the transfer
 */
export const customTransferTask = (setupObject: SetupObject): ReplacedActionFunction => async (
  payload: ActionPayloadWithOptions,
  original: ActionFunction,
) => {
  const mode = payload.options.mode || DEFAULT_TRANSFER_MODE;

  /*
   * Currently (as of 2 Dec 2020) warm text transfers are not supported.
   * We shortcut the rest of the function to save extra time and unnecessary visual changes.
   */
  if (!TaskHelper.isCallTask(payload.task) && mode === transferModes.warm) {
    recordEvent('Transfer Warm Chat Blocked', {});
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

export const afterCancelTransfer = (payload: ActionPayload) => {
  TransferHelpers.clearTransferMeta(payload.task);
};

export const hangupCall = fromActionFunction(saveEndMillis);

/**
 * Override for WrapupTask action. Sends a message before leaving (if it should) and saves the end time of the conversation
 */
export const wrapupTask = (setupObject: SetupObject) =>
  fromActionFunction(async payload => {
    if (TaskHelper.isChatBasedTask(payload.task)) {
      await sendGoodbyeMessage(payload.task.taskSid)(setupObject)(payload);
    }
    await saveEndMillis(payload);
  });

const decreaseChatCapacity = (setupObject: SetupObject): ActionFunction => async (
  payload: ActionPayload,
): Promise<void> => {
  const { featureFlags } = setupObject;
  const { task } = payload;
  if (featureFlags.enable_manual_pulling && task.taskChannelUniqueName === 'chat') await adjustChatCapacity('decrease');
};

export const beforeCompleteTask = (setupObject: SetupObject) => async (payload: ActionPayload): Promise<void> => {
  await decreaseChatCapacity(setupObject)(payload);
};

const isAseloCustomChannelTask = (task: CustomITask) =>
  (<string[]>Object.values(customChannelTypes)).includes(task.channelType);

/**
 * This function manipulates the default chat orchetrations to allow our implementation of post surveys.
 * Since we rely on the same chat channel as the original contact for it, we don't want it to be "deactivated" by Flex.
 * Hence this function modifies the following orchestration events:
 * - task wrapup: removes DeactivateChatChannel
 * - task completed: removes DeactivateChatChannel
 */
const setChatOrchestrationsForPostSurvey = () => {
  const setExcludedDeactivateChatChannel = (event: keyof ChatOrchestrationsEvents) => {
    const excludeDeactivateChatChannel = (orchestrations: ChatOrchestratorEvent[]) =>
      orchestrations.filter(e => e !== ChatOrchestratorEvent.DeactivateChatChannel);

    const defaultOrchestrations = ChatOrchestrator.getOrchestrations(event);

    if (Array.isArray(defaultOrchestrations)) {
      ChatOrchestrator.setOrchestrations(event, task => {
        return isAseloCustomChannelTask(task)
          ? defaultOrchestrations
          : excludeDeactivateChatChannel(defaultOrchestrations);
      });
    }
  };

  setExcludedDeactivateChatChannel('wrapup');
  setExcludedDeactivateChatChannel('completed');
};

export const setUpPostSurvey = (setupObject: SetupObject) => {
  const { featureFlags } = setupObject;
  if (featureFlags.enable_post_survey) {
    setChatOrchestrationsForPostSurvey();
  }
};

const triggerPostSurvey = async (setupObject: SetupObject, payload: ActionPayload): Promise<void> => {
  const { task } = payload;

  const shouldTriggerPostSurvey =
    TaskHelper.isChatBasedTask(task) && !isAseloCustomChannelTask(task) && TransferHelpers.hasTaskControl(task);

  if (shouldTriggerPostSurvey) {
    const { taskSid } = task;
    const channelSid = TaskHelper.getTaskChatChannelSid(task);
    const taskLanguage = getTaskLanguage(setupObject)(payload);

    const body = taskLanguage ? { channelSid, taskSid, taskLanguage } : { channelSid, taskSid };

    await postSurveyInit(body);
  }
};

export const afterCompleteTask = (payload: ActionPayload): void => {
  const manager = Manager.getInstance();
  manager.store.dispatch(GeneralActions.removeContactState(payload.task.taskSid));
};

export const afterWrapupTask = (setupObject: SetupObject) => async (payload: ActionPayload): Promise<void> => {
  const { featureFlags } = setupObject;

  if (featureFlags.enable_post_survey) {
    await triggerPostSurvey(setupObject, payload);
  }
};
