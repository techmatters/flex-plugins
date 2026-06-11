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
  registerTaskRouterEventHandler,
  TaskRouterEventHandler,
} from '../taskrouter/taskrouterEventHandler';
import { AccountSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import { EventType, TASK_WRAPUP } from '../taskrouter/eventTypes';
import { EventFields } from '../taskrouter';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import {
  handleChannelCapture,
  HandleChannelCaptureParams,
  isChatCaptureControlTask,
} from './channelCaptureHandlers';
import {
    getChatServiceSid,
    getHelplineCode,
    getSurveyWorkflowSid,
    getTwilioWorkspaceSid, getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { getTranslation } from '../translations/translationLookup';

const GLOBAL_DEFAULT_LANGUAGE = 'en-US';

// ================== //
// TODO: unify this code with Flex codebase
const getTaskLanguage =
  (helplineLanguage: string) => (taskAttributes: { language?: string }) =>
    taskAttributes.language || helplineLanguage || GLOBAL_DEFAULT_LANGUAGE;
// ================== //

// TODO: factor out
type TransferMeta = {
  mode: 'COLD' | 'WARM';
  transferStatus: 'transferring' | 'accepted' | 'rejected';
  sidWithTaskControl: string;
};

const isTriggerPostStudioFlow = ({
  taskAttributes,
}: {
  eventType: EventType;
  taskChannelUniqueName: string;
  taskAttributes: {
    transferMeta?: TransferMeta;
    isChatCaptureControl?: boolean;
  };
}) => {
  return !isChatCaptureControlTask(taskAttributes);
};

export const postSurveyInitHandler = async ({
  accountSid,
  channelType,
  chatServiceSid,
  client,
  environment,
  helplineCode,
  surveyWorkflowSid,
  taskLanguage,
  taskSid,
  workspaceSid,
  webhookBaseUrl,
  channelSid,
  conversationSid,
}: {
  accountSid: AccountSID;
  client: Twilio;
  taskSid: string;
  taskLanguage: string;
  channelType: string;
  environment: string;
  webhookBaseUrl: string;
  chatServiceSid: string;
  helplineCode: string;
  surveyWorkflowSid: string;
  workspaceSid: string;
} & (
  | {
      channelSid: string;
      conversationSid?: string;
    }
  | {
      channelSid?: string;
      conversationSid: string;
    }
)) => {
  const triggerMessage = await getTranslation(accountSid, taskLanguage, 'triggerMessage');

  const params: HandleChannelCaptureParams = {
    accountSid,
    channelSid,
    conversationSid: conversationSid || '',
    message: triggerMessage,
    language: taskLanguage,
    botSuffix: 'post_survey',
    triggerType: 'withNextMessage',
    releaseType: 'postSurveyComplete',
    memoryAttribute: 'postSurvey',
    releaseFlag: 'postSuveyComplete',
    additionControlTaskAttributes: JSON.stringify({
      isSurveyTask: true,
      contactTaskId: taskSid,
      conversations: { conversation_id: taskSid },
      language: taskLanguage, // if there's a task language, attach it to the post survey task
    }),
    controlTaskTTL: 3600,
    channelType,
    chatServiceSid,
    environment,
    helplineCode,
    surveyWorkflowSid,
    workspaceSid,
    webhookBaseUrl,
  };

  return handleChannelCapture(client, params);
};

const triggerPostStudioFlowTaskRouterListener: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
  client: Twilio,
) => {
  try {
    const {
      EventType: eventType,
      TaskChannelUniqueName: taskChannelUniqueName,
      TaskSid: taskSid,
      TaskAttributes: taskAttributesString,
    } = event;

    const taskAttributes = JSON.parse(taskAttributesString);

    if (isTriggerPostStudioFlow({ eventType, taskAttributes, taskChannelUniqueName })) {
      console.info('Handling post survey trigger...');
      console.info('taskAttributes', taskAttributes);

      // This task is a candidate to trigger post survey. Check feature flags for the account.
      const serviceConfigAttributes =
        await retrieveServiceConfigurationAttributes(client);
      const { helplineLanguage, postStudioFlows } = serviceConfigAttributes;
      const studioFlowSid = postStudioFlows?.[taskChannelUniqueName];

      if (studioFlowSid) {
        const { channelSid, conversationSid, channelType, customChannelType } =
          taskAttributes;

        const taskLanguage = getTaskLanguage(helplineLanguage)(taskAttributes);

        const environment = process.env.NODE_ENV!;
        const webhookBaseUrl = process.env.WEBHOOK_BASE_URL!;
        const chatServiceSid = await getChatServiceSid(accountSid);
        const helplineCode = await getHelplineCode(accountSid);
        const workspaceSid = await getWorkspaceSid(accountSid);

        await postSurveyInitHandler({
          channelSid,
          conversationSid,
          taskSid,
          taskLanguage,
          channelType: customChannelType || channelType,
          accountSid,
          chatServiceSid,
          client,
          environment,
          helplineCode,
          workspaceSid,
          webhookBaseUrl,
        });

        console.info('Finished handling post studio flow trigger.');
      } else {
        console.debug(`No post studio flow configured for ${taskChannelUniqueName}`);
      }
    }
  } catch (err) {
    console.error('postSurveyListener failed', err);
  }
};

registerTaskRouterEventHandler([TASK_WRAPUP], triggerPostStudioFlowTaskRouterListener);
