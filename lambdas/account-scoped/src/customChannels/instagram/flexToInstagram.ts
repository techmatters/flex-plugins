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

/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import '@twilio-labs/serverless-runtime-types';

import {
  ConversationWebhookEvent,
  ExternalSendResult,
  redirectConversationMessageToExternalChat,
  RedirectResult,
  WebhookEvent,
} from '../flexToCustomChannel';
import { AccountScopedHandler, HttpError, HttpRequest } from '../../httpTypes';
import { isErr, newOk, Result } from '../../Result';
import { newMissingParameterResult } from '../../httpErrors';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { getFacebookPageAccessToken } from '../configuration';

export type Body = WebhookEvent & {
  recipientId: string; // The IGSID of the user that started the conversation. Provided as query parameter
};

const sendInstagramMessage =
  (facebookPageAccessToken: string) =>
  async (recipientId: string, messageText: string): Promise<ExternalSendResult> => {
    const body = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: messageText,
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${facebookPageAccessToken}`,
      {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      ok: response.ok,
      resultCode: response.status,
      body: await response.json(),
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

export const flexToInstagramHandler: AccountScopedHandler = async (
  { body: event }: HttpRequest,
  accountSid,
) => {
  console.info('==== FlexToInstagram handler ====');
  console.info('Received event:', event);

  let result: RedirectResult;
  const requiredProperties: (keyof ConversationWebhookEvent | 'recipientId')[] = [
    'ConversationSid',
    'Body',
    'Author',
    'EventType',
    'Source',
    'recipientId',
  ];
  const validationResult = validateProperties(event, requiredProperties);
  if (isErr(validationResult)) {
    return validationResult;
  }
  const facebookPageAccessToken = await getFacebookPageAccessToken(accountSid);

  const { recipientId, ...eventToSend } = event;
  const client = await getTwilioClient(accountSid);
  result = await redirectConversationMessageToExternalChat(client, {
    event: eventToSend,
    recipientId,
    sendExternalMessage: sendInstagramMessage(facebookPageAccessToken),
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
