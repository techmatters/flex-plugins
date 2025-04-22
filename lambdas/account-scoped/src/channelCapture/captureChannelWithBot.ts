/* eslint-disable import/no-dynamic-require */
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
import { handleChannelCapture } from './channelCaptureHandlers';
import { AccountScopedHandler, HttpError } from '../httpTypes';
import { isErr, newErr, newOk, Result } from '../Result';
import {
  getAccountAuthToken,
  getChatServiceSid,
  getHelplineCode,
  getSurveyWorkflowSid,
  getTwilioWorkspaceSid,
} from '../configuration/twilioConfiguration';

export const handleCaptureChannelWithBot: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, {}>> => {
  try {
    const authToken = await getAccountAuthToken(accountSid);
    const twilioClient = twilio(accountSid, authToken);

    const environment = process.env.NODE_ENV!;
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL!;

    const {
      channelSid,
      message,
      triggerType,
      releaseType,
      studioFlowSid,
      language,
      botSuffix,
      additionControlTaskAttributes,
      controlTaskTTL,
      memoryAttribute,
      releaseFlag,
      isConversation: isConversationValue,
      channelType,
    } = request.body;

    const isConversation =
      (typeof isConversationValue === 'string' && isConversationValue === 'true') ||
      (typeof isConversationValue === 'boolean' && isConversationValue);

    const chatServiceSid = await getChatServiceSid(accountSid);
    const helplineCode = await getHelplineCode(accountSid);
    const surveyWorkflowSid = await getSurveyWorkflowSid(accountSid);
    const twilioWorkspaceSid = await getTwilioWorkspaceSid(accountSid);

    const result = await handleChannelCapture(twilioClient, {
      accountSid,
      channelSid,
      conversationSid: isConversation ? channelSid : '',
      message,
      language,
      botSuffix,
      triggerType,
      releaseType,
      studioFlowSid,
      memoryAttribute,
      releaseFlag,
      additionControlTaskAttributes,
      controlTaskTTL,
      channelType,
      environment,
      webhookBaseUrl,
      chatServiceSid,
      helplineCode,
      surveyWorkflowSid,
      twilioWorkspaceSid,
    });

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
