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

/**
 * In order to make post surveys work, we need to disable the Channel Janitor (see https://www.twilio.com/docs/flex/developer/messaging/manage-flows#channel-janitor).
 * However, once the post survey is finished we want to mimic this feature to clear the channel and the proxy session, to enable future conversations from the same customer
 * Ths file exposes functionalities to achieve this. chatChannelJanitor will:
 * - Label the chat channel as INACTIVE.
 * - Delete the associated proxy session if there is one.
 */

// eslint-disable-next-line prettier/prettier
import {AccountSID, ChatChannelSID, ConversationSID} from '@tech-matters/twilio-types';
import {
  getChatServiceSid,
  getFlexProxyServiceSid,
  getTwilioClient,
} from '@tech-matters/twilio-configuration';

export type Event =
  | {
      channelSid?: ChatChannelSID;
      conversationSid: ConversationSID;
    }
  | {
      channelSid: ChatChannelSID;
      conversationSid?: ConversationSID;
    };

const deleteProxySession = async (accountSid: AccountSID, proxySession: string) => {
  try {
    const client = await getTwilioClient(accountSid);
    const ps = await client.proxy.v1.services
      .get(await getFlexProxyServiceSid(accountSid))
      .sessions.get(proxySession)
      .fetch();

    if (!ps) {
      // eslint-disable-next-line no-console
      console.log(`Tried to remove proxy session ${proxySession} but couldn't find it.`);
      return false;
    }

    return await ps.remove();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('deleteProxySession error: ', err);
    return false;
  }
};

const deactivateChannel = async (accountSid: AccountSID, channelSid: ChatChannelSID) => {
  const client = await getTwilioClient(accountSid);
  const serviceSid = await getChatServiceSid(accountSid);
  const channel = await client.chat.v2.services
    .get(serviceSid)
    .channels.get(channelSid)
    .fetch();

  const attributes = JSON.parse(channel.attributes);

  if (attributes.status !== 'INACTIVE') {
    if (attributes.proxySession) {
      await deleteProxySession(accountSid, attributes.proxySession);
    }

    const newAttributes = { ...attributes, status: 'INACTIVE' };
    const updated = await channel.update({
      attributes: JSON.stringify(newAttributes),
      xTwilioWebhookEnabled: 'true',
    });

    return { message: 'Channel deactivated', updated };
  }

  return { message: 'Channel already INACTIVE, event ignored' };
};

const deactivateConversation = async (
  accountSid: AccountSID,
  conversationSid: ConversationSID,
) => {
  const client = await getTwilioClient(accountSid);
  const conversation = await client.conversations.v1.conversations
    .get(conversationSid)
    .fetch();
  const attributes = JSON.parse(conversation.attributes);

  if (conversation.state !== 'closed') {
    if (attributes.proxySession) {
      await deleteProxySession(accountSid, attributes.proxySession);
    }
    console.log('Attempting to deactivate active conversation', conversationSid);
    const updated = await conversation.update({
      state: 'closed',
      xTwilioWebhookEnabled: 'true',
    });

    return { message: 'Conversation deactivated', updated };
  }

  return { message: 'Conversation already closed, event ignored' };
};

export const chatChannelJanitor = async (
  accountSid: AccountSID,
  { channelSid, conversationSid }: Event,
) => {
  if (conversationSid) {
    const result = await deactivateConversation(accountSid, conversationSid);

    return {
      message: `Deactivation attempted for conversation ${conversationSid}`,
      result,
    };
  }
  const result = await deactivateChannel(accountSid, channelSid);

  return { message: `Deactivation attempted for channel ${channelSid}`, result };
};
