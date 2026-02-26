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
  ConversationWebhookEvent,
  ExternalSendResult,
  redirectConversationMessageToExternalChat,
  RedirectResult,
} from '../flexToCustomChannel';
import { AccountScopedHandler, HttpError, HttpRequest } from '../../httpTypes';
import { isErr, newOk, Result } from '../../Result';
import { newMissingParameterResult } from '../../httpErrors';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { getModicaAppName, getModicaAppPassword } from '../configuration';
import { AccountSID } from '@tech-matters/twilio-types';

const DEFAULT_MODICA_SEND_MESSAGE_URL =
  'https://api.modicagroup.com/rest/gateway/messages';

export type Body = ConversationWebhookEvent & {
  recipientId: string; // The phone number of the user that started the conversation. Provided as query parameter
};

/**
 * Adds a '+' symbol at the beginning of the recipientId if it's missing.
 * Modica expects the destination to be in E.164 format.
 * The recipientId may have a space or missing '+' due to URL encoding of query parameters.
 */
const sanitizeRecipientId = (recipientIdRaw: string) => {
  const recipientId = recipientIdRaw.trim();
  return recipientId.charAt(0) !== '+' ? `+${recipientId}` : recipientId;
};

const sendModicaMessage =
  (appName: string, appPassword: string) =>
  async (recipientId: string, messageText: string): Promise<ExternalSendResult> => {
    const payload = {
      destination: sanitizeRecipientId(recipientId),
      content: messageText,
    };

    const base64Credentials = Buffer.from(`${appName}:${appPassword}`).toString('base64');
    const response = await fetch(DEFAULT_MODICA_SEND_MESSAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${base64Credentials}`,
      },
      body: JSON.stringify(payload),
    });

    const bodyText = await response.text();
    let responseBody;
    try {
      responseBody = JSON.parse(bodyText);
    } catch (e) {
      responseBody = bodyText;
    }

    return {
      ok: response.ok,
      resultCode: response.status,
      body: responseBody,
      meta: Object.fromEntries(Object.entries(response.headers)),
    };
  };

const validateProperties = (
  event: any,
  requiredProperties: string[],
): Result<HttpError, true> => {
  for (const prop of requiredProperties) {
    if (event[prop] === undefined) {
      return newMissingParameterResult(prop);
    }
  }
  return newOk(true);
};

export const flexToModicaHandler: AccountScopedHandler = async (
  { body: event, query: { recipientId } }: HttpRequest,
  accountSid: AccountSID,
) => {
  console.info('==== FlexToModica handler ====');
  console.info('Received event:', event);

  if (!recipientId) {
    return newMissingParameterResult('recipientId');
  }

  let result: RedirectResult;
  const requiredProperties: (keyof ConversationWebhookEvent)[] = [
    'ConversationSid',
    'Body',
    'Author',
    'EventType',
    'Source',
  ];
  const validationResult = validateProperties(event, requiredProperties);
  if (isErr(validationResult)) {
    return validationResult;
  }

  const [appName, appPassword] = await Promise.all([
    getModicaAppName(accountSid),
    getModicaAppPassword(accountSid),
  ]);

  const client = await getTwilioClient(accountSid);
  result = await redirectConversationMessageToExternalChat(client, {
    event,
    recipientId,
    sendExternalMessage: sendModicaMessage(appName, appPassword),
  });

  switch (result.status) {
    case 'sent':
      return newOk(result.response);
    case 'ignored':
      return newOk({ message: 'Ignored event' });
    default:
      throw new Error('Reached unexpected default case');
  }
};
