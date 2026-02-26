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

import crypto from 'crypto';
import {
  ConversationWebhookEvent,
  ExternalSendResult,
  redirectConversationMessageToExternalChat,
  RedirectResult,
  TEST_SEND_URL,
} from '../flexToCustomChannel';
import { AccountScopedHandler, HttpError, HttpRequest } from '../../httpTypes';
import { isErr, newOk, Result } from '../../Result';
import { newMissingParameterResult } from '../../httpErrors';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { getLineChannelAccessToken } from '../configuration';
import { AccountSID } from '@tech-matters/twilio-types';

const LINE_SEND_MESSAGE_URL = 'https://api.line.me/v2/bot/message/push';

export type Body = ConversationWebhookEvent & {
  recipientId: string; // The Line id of the user that started the conversation. Provided as query parameter
};

const sendLineMessage =
  (lineChannelAccessToken: string) =>
  async (
    recipientId: string,
    messageText: string,
    testSessionId?: string,
  ): Promise<ExternalSendResult> => {
    const payload = {
      to: recipientId,
      messages: [
        {
          type: 'text',
          text: messageText,
        },
      ],
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Line-Retry-Key': crypto.randomUUID(),
      Authorization: `Bearer ${lineChannelAccessToken}`,
      ...(testSessionId ? { 'x-webhook-receiver-session-id': testSessionId } : {}),
    };

    const sendUrl = testSessionId ? TEST_SEND_URL : LINE_SEND_MESSAGE_URL;
    const response = await fetch(sendUrl, {
      method: 'post',
      body: JSON.stringify(payload),
      headers,
    });

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

export const flexToLineHandler: AccountScopedHandler = async (
  { body: event, query: { recipientId } }: HttpRequest,
  accountSid: AccountSID,
) => {
  console.info('==== FlexToLine handler ====');
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

  const lineChannelAccessToken = await getLineChannelAccessToken(accountSid);
  const client = await getTwilioClient(accountSid);
  result = await redirectConversationMessageToExternalChat(client, {
    event,
    recipientId,
    sendExternalMessage: sendLineMessage(lineChannelAccessToken),
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
