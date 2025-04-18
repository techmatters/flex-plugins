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
import twilio from 'twilio';
import {
  getAccountAuthToken,
  getChatServiceSid,
  getHelplineCode,
  getServerlessBaseUrl,
  getSurveyWorkflowSid,
  getTwilioWorkspaceSid,
} from '../configuration/twilioConfiguration';
import { AccountScopedHandler, HttpError } from '../httpTypes';
import { isErr, newErr, newOk, Result } from '../Result';
import {
  handleChannelCapture,
  HandleChannelCaptureParams,
} from './channelCaptureHandlers';

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

export const handlePostSurveyInit: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, {}>> => {
  try {
    const { channelSid, conversationSid, taskSid, taskLanguage, channelType } =
      request.body;

    const authToken = await getAccountAuthToken(accountSid);
    const twilioClient = twilio(accountSid, authToken);

    const environment = process.env.NODE_ENV!;
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL!;
    const serverlessBaseUrl = await getServerlessBaseUrl(accountSid);
    const chatServiceSid = await getChatServiceSid(accountSid);
    const helplineCode = await getHelplineCode(accountSid);
    const surveyWorkflowSid = await getSurveyWorkflowSid(accountSid);
    const twilioWorkspaceSid = await getTwilioWorkspaceSid(accountSid);
    // const studioFlowSid = await getStudioFlow

    const triggerMessage = await getTriggerMessage({ serverlessBaseUrl, taskLanguage });

    const params: HandleChannelCaptureParams = {
      channelSid,
      conversationSid,
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

    const result = await handleChannelCapture(twilioClient, params);

    if (isErr(result)) {
      if (result.error instanceof Error) {
        return newErr({
          message: result.message,
          error: { statusCode: 500, cause: result.error },
        });
      } else {
        return newErr({
          message: result.message,
          error: { statusCode: 400, cause: new Error(result.message) },
        });
      }
    }
    console.info(`[${accountSid}] channel ${channelSid} captured`);
    return newOk({});
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
