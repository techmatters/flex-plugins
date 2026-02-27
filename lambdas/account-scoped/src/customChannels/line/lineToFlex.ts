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
import { AccountSID } from '@tech-matters/twilio-types';
import {
  AseloCustomChannel,
  sendConversationMessageToFlex,
} from '../customChannelToFlex';
import { AccountScopedHandler, HttpRequest } from '../../httpTypes';
import { newErr, newOk } from '../../Result';
import { getChannelStudioFlowSid, getLineChannelSecret } from '../configuration';

export const LINE_SIGNATURE_HEADER = 'x-line-signature';

type LineMessage = {
  type: 'text' | string;
  id: string;
  text: string;
};

type LineSource = {
  type: 'user' | 'group' | 'room';
  userId: string;
};

type LineEvent = {
  type: 'message' | string;
  message: LineMessage;
  timestamp: number;
  replyToken: string;
  source: LineSource;
};

export type Body = {
  destination: string;
  events: LineEvent[];
};

// Line seems to have generated signatures using escaped unicode for emoji characters
// https://gist.github.com/jirawatee/366d6bef98b137131ab53dfa079bd0a4
const fixUnicodeForLine = (text: string): string =>
  text.replace(/\p{Emoji_Presentation}/gu, emojiChars =>
    emojiChars
      .split('')
      .map(c => `\\u${c.charCodeAt(0).toString(16).toUpperCase()}`)
      .join(''),
  );

/**
 * Validates that the payload is signed with LINE_CHANNEL_SECRET so we know it's coming from Line
 */
const isValidLinePayload = (
  body: Body,
  xLineSignature: string | undefined,
  lineChannelSecret: string,
): boolean => {
  if (!xLineSignature) return false;

  const payloadAsString = JSON.stringify(body);

  const expectedSignature = crypto
    .createHmac('sha256', lineChannelSecret)
    .update(fixUnicodeForLine(payloadAsString))
    .digest('base64');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(xLineSignature),
      Buffer.from(expectedSignature),
    );
  } catch (e) {
    console.warn('Unknown error validating signature (rejecting with 403):', e);
    return false;
  }
};

export const lineToFlexHandler: AccountScopedHandler = async (
  { body, headers }: HttpRequest,
  accountSid: AccountSID,
) => {
  console.info('==== LineToFlex handler ====');

  const lineChannelSecret = await getLineChannelSecret(accountSid);
  const xLineSignature = headers[LINE_SIGNATURE_HEADER];

  if (!isValidLinePayload(body, xLineSignature, lineChannelSecret)) {
    return newErr({
      message: 'Forbidden',
      error: { statusCode: 403 },
    });
  }

  const event: Body = body;
  console.debug('LineToFlex: validated event body:', event);
  const { destination, events } = event;

  const messageEvents = events.filter(e => e.type === 'message');
  console.debug(
    'LineToFlex: destination:',
    destination,
    '- message events count:',
    messageEvents.length,
    '/ total events:',
    events.length,
  );

  if (messageEvents.length === 0) {
    return newOk({ message: 'No messages to send' });
  }

  const studioFlowSid = await getChannelStudioFlowSid(
    accountSid,
    AseloCustomChannel.Line,
  );
  const responses: any[] = [];

  for (const messageEvent of messageEvents) {
    const messageText = messageEvent.message.text;
    const channelType = AseloCustomChannel.Line;
    const subscribedExternalId = destination; // AseloChat ID on Line
    const senderExternalId = messageEvent.source.userId; // The child ID on Line
    const chatFriendlyName = `${channelType}:${senderExternalId}`;
    const uniqueUserName = `${channelType}:${senderExternalId}`;
    const senderScreenName = 'child';
    const onMessageSentWebhookUrl = `${process.env.WEBHOOK_BASE_URL}/lambda/twilio/account-scoped/${accountSid}/customChannels/line/flexToLine?recipientId=${senderExternalId}`;
    console.debug(
      'LineToFlex: sending message from',
      uniqueUserName,
      'to studio flow',
      studioFlowSid,
    );

    // eslint-disable-next-line no-await-in-loop
    const result = await sendConversationMessageToFlex(accountSid, {
      studioFlowSid,
      channelType,
      uniqueUserName,
      senderScreenName,
      onMessageSentWebhookUrl,
      messageText,
      senderExternalId,
      customSubscribedExternalId: subscribedExternalId,
      conversationFriendlyName: chatFriendlyName,
    });

    console.debug(
      'LineToFlex: result status:',
      result.status,
      'for sender',
      uniqueUserName,
    );
    switch (result.status) {
      case 'sent':
        responses.push(result.response);
        break;
      case 'ignored':
        responses.push({ message: 'Ignored event.' });
        break;
      default:
        return newErr({
          message: 'Reached unexpected default case',
          error: { statusCode: 500, error: new Error('Reached unexpected default case') },
        });
    }
  }

  return newOk(responses);
};
