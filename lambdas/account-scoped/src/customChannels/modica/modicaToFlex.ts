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
import { getChannelStudioFlowSid } from '../configuration';

export type Body = {
  source: string; // The child's phone number
  destination: string; // The helpline short code
  content: string; // The message text
  testSessionId?: string; // Only used in Aselo integration tests, not sent from Modica
};

export const modicaToFlexHandler: AccountScopedHandler = async (
  { body }: HttpRequest,
  accountSid: AccountSID,
) => {
  console.info('==== ModicaToFlex handler ====');
  console.debug('ModicaToFlex: received event:', body);

  const event: Body = body;
  const { source, destination, content } = event;

  const messageText = content;
  const channelType = AseloCustomChannel.Modica;
  const subscribedExternalId = destination; // The helpline short code
  const senderExternalId = source; // The child phone number
  const chatFriendlyName = senderExternalId;
  const uniqueUserName = `${channelType}:${senderExternalId}`;
  const senderScreenName = 'child';
  const onMessageSentWebhookUrl = `${process.env.WEBHOOK_BASE_URL}/lambda/twilio/account-scoped/${accountSid}/customChannels/modica/flexToModica?recipientId=${senderExternalId}`;
  const studioFlowSid = await getChannelStudioFlowSid(
    accountSid,
    AseloCustomChannel.Modica,
  );
  console.debug(
    'ModicaToFlex: sending message from',
    uniqueUserName,
    'to studio flow',
    studioFlowSid,
  );

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
    testSessionId: event.testSessionId,
  });

  console.debug('ModicaToFlex: result status:', result.status);
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
