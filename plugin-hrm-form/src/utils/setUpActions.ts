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

import {
  Manager,
  TaskHelper,
  StateHelper,
  ChatOrchestrator,
  ITask,
  ActionFunction,
  ReplacedActionFunction,
  ChatOrchestratorEvent,
} from '@twilio/flex-ui';
import { Conversation } from '@twilio/conversations';
import { callTypes } from 'hrm-form-definitions';
import type { ChatOrchestrationsEvents } from '@twilio/flex-ui/src/ChatOrchestrator';

import {
  transferChatStart,
  adjustChatCapacity,
  sendSystemMessage,
  getDefinitionVersion,
  postSurveyInit,
} from '../services/ServerlessService';
import { namespace, contactFormsBase, configurationBase, dualWriteBase } from '../states';
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
import { CustomITask, FeatureFlags } from '../types/types';
import { getAseloFeatureFlags, getHrmConfig } from '../hrmConfig';
import { subscribeAlertOnConversationJoined } from '../notifications/newMessage';
import { reactivateAseloListeners } from '../conversationListeners';

type SetupObject = ReturnType<typeof getHrmConfig>;
type GetMessage = (key: string) => (key: string) => Promise<string>;
type ActionPayload = { task: ITask };
type ActionPayloadWithOptions = ActionPayload & { options: { mode: string }; targetSid: string };
const DEFAULT_TRANSFER_MODE = transferModes.cold;

export const loadCurrentDefinitionVersion = async () => {
  const { definitionVersion } = getHrmConfig();
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
 * @param task
 */
export const shouldSendInsightsData = (task: ITask) => {
  const featureFlags = getAseloFeatureFlags();
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
  const convo = StateHelper.getConversationStateForTask(task);
  if (convo?.source) {
    reactivateAseloListeners(convo.source);
  }
  await restoreFormIfTransfer(task);
};

export const getTaskLanguage = ({ helplineLanguage }: Pick<SetupObject, 'helplineLanguage'>) => ({
  task,
}: ActionPayload) => task.attributes.language || helplineLanguage;

const sendMessageOfKey = (messageKey: string) => (
  setupObject: SetupObject,
  conversation: Conversation,
  getMessage: (key: string) => (key: string) => Promise<string>,
): ActionFunction => async (payload: ActionPayload) => {
  const taskLanguage = getTaskLanguage(setupObject)(payload);
  const message = await getMessage(messageKey)(taskLanguage);
  await conversation.sendMessage(message);
};

const sendSystemMessageOfKey = (messageKey: string) => (
  setupObject: SetupObject,
  getMessage: (key: string) => (key: string) => Promise<string>,
) => async (payload: ActionPayload) => {
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
const sendGoodbyeMessage = (taskSid: string) => {
  const { enable_dual_write: enableDualWrite } = getAseloFeatureFlags();

  const customGoodbyeMessage =
    enableDualWrite &&
    Manager.getInstance().store.getState()[namespace][dualWriteBase].tasks[taskSid]?.customGoodbyeMessage;
  return customGoodbyeMessage
    ? sendSystemCustomGoodbyeMessage(customGoodbyeMessage)
    : sendSystemMessageOfKey('GoodbyeMsg');
};

const sendWelcomeMessageOnConversationJoined = (
  setupObject: SetupObject,
  getMessage: GetMessage,
  payload: ActionPayload,
) => {
  const manager = Manager.getInstance();
  const { task } = payload;
  const trySendWelcomeMessage = (convo: Conversation, ms: number, retries: number) => {
    setTimeout(() => {
      const convoState = StateHelper.getConversationStateForTask(task);
      // if channel is not ready, wait 200ms and retry
      if (convoState.isLoadingConversation) {
        if (retries < 10) trySendWelcomeMessage(convo, 200, retries + 1);
        else console.error('Failed to send welcome message: max retries reached.');
      } else {
        sendWelcomeMessage(setupObject, convo, getMessage)(payload);
      }
    }, ms);
  };

  // Ignore event payload as we already have everything we want in afterAcceptTask arguments. Start at 0ms as many users are able to send the message right away
  manager.conversationsClient.once('conversationJoined', (c: Conversation) => trySendWelcomeMessage(c, 0, 0));
};

export const afterAcceptTask = (featureFlags: FeatureFlags, setupObject: SetupObject, getMessage: GetMessage) => async (
  payload: ActionPayload,
) => {
  const { task } = payload;

  if (TaskHelper.isChatBasedTask(task)) {
    subscribeAlertOnConversationJoined(task);
  }

  if (featureFlags.enable_transfers && TransferHelpers.hasTransferStarted(task)) handleTransferredTask(task);
  else prepopulateForm(task);

  // If this is the first counsellor that gets the task, say hi
  if (TaskHelper.isChatBasedTask(task) && !TransferHelpers.hasTransferStarted(task)) {
    sendWelcomeMessageOnConversationJoined(setupObject, getMessage, payload);
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

  const { workerSid, counselorName } = setupObject;

  // save current form state as sync document (if there is a form)
  const form = getStateContactForms(payload.task.taskSid);
  const documentName = await saveFormSharedState(form, payload.task);

  // set metadata for the transfer
  await TransferHelpers.setTransferMeta(payload, documentName, counselorName);

  if (TaskHelper.isCallTask(payload.task)) {
    const disableTransfer = payload.task.conference.liveParticipantCount >= 3;

    if (disableTransfer) {
      window.alert(Manager.getInstance().strings['Transfer-CannotTransferTooManyParticipants']);
    } else {
      return safeTransfer(() => original(payload), payload.task);
    }
  }

  const body = {
    mode,
    taskSid: payload.task.taskSid,
    targetSid: payload.targetSid,
    ignoreAgent: workerSid,
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
export const wrapupTask = (setupObject: SetupObject, getMessage: GetMessage) =>
  fromActionFunction(async payload => {
    if (TaskHelper.isChatBasedTask(payload.task)) {
      await sendGoodbyeMessage(payload.task.taskSid)(setupObject, getMessage)(payload);
    }
    await saveEndMillis(payload);
  });

const decreaseChatCapacity = (featureFlags: FeatureFlags): ActionFunction => async (
  payload: ActionPayload,
): Promise<void> => {
  const { task } = payload;
  if (featureFlags.enable_manual_pulling && task.taskChannelUniqueName === 'chat') await adjustChatCapacity('decrease');
};

export const beforeCompleteTask = (featureFlags: FeatureFlags) => async (payload: ActionPayload): Promise<void> => {
  await decreaseChatCapacity(featureFlags)(payload);
};

const isAseloCustomChannelTask = (task: CustomITask) =>
  (<string[]>Object.values(customChannelTypes)).includes(task.channelType);

/**
 * This function manipulates the default chat orchetrations to allow our implementation of post surveys.
 * Since we rely on the same chat channel as the original contact for it, we don't want it to be "deactivated" by Flex.
 * Hence this function modifies the following orchestration events:
 * - task wrapup: removes DeactivateConversation
 * - task completed: removes DeactivateConversation
 */
const setChatOrchestrationsForPostSurvey = () => {
  const setExcludedDeactivateConversation = (event: keyof ChatOrchestrationsEvents) => {
    const excludeDeactivateConversation = (orchestrations: ChatOrchestratorEvent[]) =>
      orchestrations.filter(e => e !== ChatOrchestratorEvent.DeactivateConversation);

    const defaultOrchestrations = ChatOrchestrator.getOrchestrations(event);

    if (Array.isArray(defaultOrchestrations)) {
      ChatOrchestrator.setOrchestrations(event, task => {
        return isAseloCustomChannelTask(task)
          ? defaultOrchestrations
          : excludeDeactivateConversation(defaultOrchestrations);
      });
    }
  };

  setExcludedDeactivateConversation('wrapup');
  setExcludedDeactivateConversation('completed');
};

export const setUpPostSurvey = (featureFlags: FeatureFlags) => {
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
    const channelSid = TaskHelper.getTaskConversationSid(task);

    const taskLanguage = getTaskLanguage(setupObject)(payload);

    const body = taskLanguage ? { channelSid, taskSid, taskLanguage } : { channelSid, taskSid };

    await postSurveyInit(body);
  }
};

export const afterCompleteTask = (payload: ActionPayload): void => {
  const manager = Manager.getInstance();
  manager.store.dispatch(GeneralActions.removeContactState(payload.task.taskSid));
};

export const afterWrapupTask = (featureFlags: FeatureFlags, setupObject: SetupObject) => async (
  payload: ActionPayload,
): Promise<void> => {
  // TODO: Remove this once all accounts are handled by taskrouter
  if (featureFlags.enable_post_survey && !featureFlags.post_survey_serverless_handled) {
    await triggerPostSurvey(setupObject, payload);
  }
};
