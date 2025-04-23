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
import { AccountSID } from '../twilioTypes';
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
  getServerlessBaseUrl,
  getSurveyWorkflowSid,
  getTwilioWorkspaceSid,
} from '../configuration/twilioConfiguration';

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

const isTriggerPostSurvey = ({
  eventType,
  taskAttributes,
  taskChannelUniqueName,
}: {
  eventType: EventType;
  taskChannelUniqueName: string;
  taskAttributes: {
    transferMeta?: TransferMeta;
    isChatCaptureControl?: boolean;
  };
}) => {
  if (eventType !== TASK_WRAPUP) return false;

  // Post survey is for chat tasks only. This will change when we introduce voice based post surveys
  if (taskChannelUniqueName !== 'chat') return false;

  if (isChatCaptureControlTask(taskAttributes)) {
    return false;
  }

  return true;
};

const getTriggerMessage = async ({
  taskLanguage,
  serverlessBaseUrl,
}: {
  taskLanguage: string;
  serverlessBaseUrl: string;
}): Promise<string> => {
  // Try to retrieve the triggerMessage for the approapriate language (if any)
  if (taskLanguage) {
    try {
      // TODO: factor out to "get translations"
      const response = await fetch(
        `${serverlessBaseUrl}/translations/${taskLanguage}/postSurveyMessages.json`,
      );
      const translation = (await response.json()) as { [k: string]: string };

      console.log('translation', translation);

      if (translation.triggerMessage) return translation.triggerMessage;
    } catch {
      console.info(`Couldn't retrieve triggerMessage translation for ${taskLanguage}`);
    }
  }

  return 'Before you leave, would you be willing to answer a few questions about the service you received today? Please answer Yes or No.';
};

export const postSurveyInitHandler = async ({
  accountSid,
  channelType,
  chatServiceSid,
  client,
  environment,
  helplineCode,
  serverlessBaseUrl,
  surveyWorkflowSid,
  taskLanguage,
  taskSid,
  twilioWorkspaceSid,
  webhookBaseUrl,
  channelSid,
  conversationSid,
}: {
  accountSid: string;
  client: Twilio;
  taskSid: string;
  taskLanguage: string;
  channelType: string;
  environment: string;
  webhookBaseUrl: string;
  serverlessBaseUrl: string;
  chatServiceSid: string;
  helplineCode: string;
  surveyWorkflowSid: string;
  twilioWorkspaceSid: string;
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
  const triggerMessage = await getTriggerMessage({ serverlessBaseUrl, taskLanguage });

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
    twilioWorkspaceSid,
    webhookBaseUrl,
  };

  const result = await handleChannelCapture(client, params);

  return result;
};

const triggerPostSurvey: TaskRouterEventHandler = async (
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

    if (isTriggerPostSurvey({ eventType, taskAttributes, taskChannelUniqueName })) {
      console.log('Handling post survey trigger...');
      console.log('taskAttributes', taskAttributes);

      // This task is a candidate to trigger post survey. Check feature flags for the account.
      const serviceConfig = await retrieveServiceConfigurationAttributes(client);
      const { feature_flags: featureFlags, helplineLanguage } = serviceConfig.attributes;
      const { enable_post_survey: enablePostSurvey } = featureFlags;

      if (enablePostSurvey) {
        const { channelSid, conversationSid, channelType, customChannelType } =
          taskAttributes;

        const taskLanguage = getTaskLanguage(helplineLanguage)(taskAttributes);

        const environment = process.env.NODE_ENV!;
        const webhookBaseUrl = process.env.WEBHOOK_BASE_URL!;
        const serverlessBaseUrl = await getServerlessBaseUrl(accountSid);
        const chatServiceSid = await getChatServiceSid(accountSid);
        const helplineCode = await getHelplineCode(accountSid);
        const surveyWorkflowSid = await getSurveyWorkflowSid(accountSid);
        const twilioWorkspaceSid = await getTwilioWorkspaceSid(accountSid);

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
          serverlessBaseUrl,
          surveyWorkflowSid,
          twilioWorkspaceSid,
          webhookBaseUrl,
        });

        console.log('Finished handling post survey trigger.');
      } else {
        console.log('Bypassing post survey trigger - they are disabled');
      }
    }
  } catch (err) {
    console.error('postSurveyListener failed', err);
  }
};

registerTaskRouterEventHandler([TASK_WRAPUP], triggerPostSurvey);
