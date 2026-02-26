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

import { AccountSID } from '@tech-matters/twilio-types';
import {
  AseloCustomChannel,
  sendConversationMessageToFlex,
} from '../customChannelToFlex';
import { AccountScopedHandler, HttpRequest } from '../../httpTypes';
import { newErr, newOk } from '../../Result';
import { getChannelStudioFlowSid, getTelegramBotApiSecretToken } from '../configuration';

export const TELEGRAM_BOT_API_SECRET_TOKEN_HEADER = 'x-telegram-bot-api-secret-token';

export type Body = {
  message: {
    chat: { id: string; first_name?: string; username?: string };
    text: string;
  };
};

const isValidTelegramPayload = (
  headers: Record<string, string | undefined>,
  botApiSecretToken: string,
): boolean =>
  Boolean(headers[TELEGRAM_BOT_API_SECRET_TOKEN_HEADER] === botApiSecretToken);

export const telegramToFlexHandler: AccountScopedHandler = async (
  { body, headers }: HttpRequest,
  accountSid: AccountSID,
) => {
  console.info('==== TelegramToFlex handler ====');

  const botApiSecretToken = await getTelegramBotApiSecretToken(accountSid);

  if (!isValidTelegramPayload(headers, botApiSecretToken)) {
    return newErr({
      message: 'Forbidden',
      error: { statusCode: 403 },
    });
  }

  const event: Body = body;
  const {
    text: messageText,
    chat: { id: senderExternalId, username, first_name: firstName },
  } = event.message;

  const channelType = AseloCustomChannel.Telegram;
  const chatFriendlyName = username || `${channelType}:${senderExternalId}`;
  const uniqueUserName = `${channelType}:${senderExternalId}`;
  const senderScreenName = firstName || username || 'child';
  const onMessageSentWebhookUrl = `${process.env.WEBHOOK_BASE_URL}/lambda/twilio/account-scoped/${accountSid}/customChannels/telegram/flexToTelegram?recipientId=${senderExternalId}`;
  const studioFlowSid = await getChannelStudioFlowSid(
    accountSid,
    AseloCustomChannel.Telegram,
  );

  const result = await sendConversationMessageToFlex(accountSid, {
    studioFlowSid,
    channelType,
    uniqueUserName,
    senderScreenName,
    onMessageSentWebhookUrl,
    messageText,
    senderExternalId,
    conversationFriendlyName: chatFriendlyName,
  });

  switch (result.status) {
    case 'sent':
      return newOk(result.response);
    case 'ignored':
      return newOk({ message: `Ignored event.` });
    default:
      return newErr({
        message: 'Reached unexpected default case',
        error: { statusCode: 500, error: new Error('Reached unexpected default case') },
      });
  }
};
