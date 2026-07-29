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
import {
  retrieveServiceConfiguration,
  retrieveServiceConfigurationAttributes,
} from '../configuration/aseloConfiguration';
import {
  handleChannelCapture,
  HandleChannelCaptureParams,
  isChatCaptureControlTask,
} from './channelCaptureHandlers';
import {
  getChatServiceSid,
  getHelplineCode,
  getSurveyWorkflowSid,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { getTranslation } from '../translations/translationLookup';
import { getCurrentDefinitionVersion } from '../hrm/formDefinitionsCache';
import { newOk } from '../Result';
import { AccountScopedHandler } from '../httpTypes';

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
  // Post survey is for chat tasks only. This will change when we introduce voice based post surveys
  if (taskChannelUniqueName !== 'chat') return false;

  return !isChatCaptureControlTask(taskAttributes);
};

const postSurveyInitHandler = async ({
  accountSid,
  channelType,
  chatServiceSid,
  client,
  environment,
  helplineCode,
  surveyWorkflowSid,
  taskLanguage,
  taskSid,
  twilioWorkspaceSid,
  webhookBaseUrl,
  channelSid,
  conversationSid,
  contactId,
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
  twilioWorkspaceSid: string;
  contactId: string;
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
      contactId,
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

  return handleChannelCapture(client, params);
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
      console.info('Handling post survey trigger...');
      console.debug('[SENSITIVE] taskAttributes', taskAttributes);

      // This task is a candidate to trigger post survey. Check feature flags for the account.
      const serviceConfig = await retrieveServiceConfiguration(client);
      const { attributes: serviceConfigAttributes } = serviceConfig;
      const { feature_flags: featureFlags, helplineLanguage } = serviceConfigAttributes;
      const { enable_post_survey: enablePostSurvey } = featureFlags;

      if (enablePostSurvey) {
        const definition = await getCurrentDefinitionVersion({ accountSid });
        const postSurveyConfigSpecs = definition?.insights?.postSurveySpecs;

        if (!postSurveyConfigSpecs?.length) {
          const errorMessage = `No defined or invalid postSurveyConfigJson found for account ${accountSid}.`;
          throw new Error(errorMessage);
        }

        const { channelSid, conversationSid, channelType, customChannelType, contactId } =
          taskAttributes;

        const taskLanguage = getTaskLanguage(helplineLanguage)(taskAttributes);

        const environment = process.env.NODE_ENV!;
        const webhookBaseUrl = process.env.WEBHOOK_BASE_URL!;
        const chatServiceSid = await getChatServiceSid(accountSid);
        const helplineCode = await getHelplineCode(accountSid);
        const surveyWorkflowSid = await getSurveyWorkflowSid(accountSid);
        const twilioWorkspaceSid = await getWorkspaceSid(accountSid);

        await postSurveyInitHandler({
          channelSid,
          contactId,
          conversationSid,
          taskSid,
          taskLanguage,
          channelType: customChannelType || channelType,
          accountSid,
          chatServiceSid,
          client,
          environment,
          helplineCode,
          surveyWorkflowSid,
          twilioWorkspaceSid,
          webhookBaseUrl,
        });

        console.info(`Finished handling post survey trigger for task ${taskSid}.`);
      } else {
        console.debug(
          `Bypassing post survey trigger for task ${taskSid} - they are disabled`,
        );
      }
    }
  } catch (err) {
    console.error('postSurveyListener failed', err);
  }
};

registerTaskRouterEventHandler([TASK_WRAPUP], triggerPostSurvey);

export const startPostSurveyChatbotHandler: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const { channelType, language, contactId, conversationSid, taskSid } = body;
  const client = await getTwilioClient(accountSid);

  const { helplineLanguage } = await retrieveServiceConfigurationAttributes(client);
  const taskLanguage = getTaskLanguage(helplineLanguage)({ language });

  const environment = process.env.NODE_ENV!;
  const webhookBaseUrl = process.env.WEBHOOK_BASE_URL!;
  const chatServiceSid = await getChatServiceSid(accountSid);
  const helplineCode = await getHelplineCode(accountSid);
  const surveyWorkflowSid = await getSurveyWorkflowSid(accountSid);
  const twilioWorkspaceSid = await getWorkspaceSid(accountSid);

  await postSurveyInitHandler({
    conversationSid,
    contactId,
    taskSid,
    taskLanguage,
    channelType,
    accountSid,
    chatServiceSid,
    client,
    environment,
    helplineCode,
    surveyWorkflowSid,
    twilioWorkspaceSid,
    webhookBaseUrl,
  });

  console.info(
    `[Post Survey Studio Flow - ${accountSid}/${taskSid}]: Finished handling post survey request for task ${taskSid}, contact ${contactId}.`,
  );
  return newOk({});
};
