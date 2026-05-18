/**
 * Copyright (C) 2021-2025 Technology Matters
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
  registerServiceScopedConversationEventHandler,
  ServiceScopedConversationEventHandler,
} from './serviceScopedConversationEventHandler';
import type { AccountSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import {
  CHANNEL_UPDATED,
  ChannelUpdatedEvent,
  ConversationStateUpdatedEvent,
} from './eventTypes';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { getChatServiceSid } from '@tech-matters/twilio-configuration';

const deleteClosedConversationEventHandler: ServiceScopedConversationEventHandler =
  async (
    {
      StateTo: stateTo,
      StateFrom: stateFrom,
      ConversationSid: conversationSid,
    }: ConversationStateUpdatedEvent,
    accountSid: AccountSID,
    client: Twilio,
  ): Promise<void> => {
    const serviceConfigAttributes = await retrieveServiceConfigurationAttributes(client);

    const zeroTranscriptRetention = Boolean(
      serviceConfigAttributes.enforceZeroTranscriptRetention,
    );
    if (zeroTranscriptRetention && stateTo === 'closed') {
      console.debug(
        `Conversation state for ${conversationSid} updated from ${stateFrom} to ${stateTo} and account ${accountSid} has a zero transcript retention policy, deleting conversation`,
      );
      await client.conversations.v1.conversations
        .get(conversationSid)
        .remove({ xTwilioWebhookEnabled: 'true' });
      console.debug(
        `Deleted ${conversationSid} when it's state was updated from ${stateFrom} to ${stateTo} because account ${accountSid} has a zero transcript retention policy.`,
      );
    }
  };

registerServiceScopedConversationEventHandler(
  ['onConversationStateUpdated'],
  deleteClosedConversationEventHandler,
);

const deleteInactiveChatChannelEventHandler: ServiceScopedConversationEventHandler =
  async (
    { Attributes: attributesJson, ChannelSid: channelSid }: ChannelUpdatedEvent,
    accountSid: AccountSID,
    client: Twilio,
  ): Promise<void> => {
    const serviceConfigAttributes = await retrieveServiceConfigurationAttributes(client);

    const zeroTranscriptRetention = Boolean(
      serviceConfigAttributes.enforceZeroTranscriptRetention,
    );
    if (zeroTranscriptRetention) {
      const { status } = JSON.parse(attributesJson || '{}');
      if (status === 'INACTIVE') {
        console.debug(
          `Status attribute for ${channelSid} set to INACTIVE and account ${accountSid} has a zero transcript retention policy, deleting conversation`,
        );
        await client.chat.v2.services
          .get(await getChatServiceSid(accountSid))
          .channels.get(channelSid)
          .remove({ xTwilioWebhookEnabled: 'true' });
        console.debug(
          `Deleted ${channelSid} when it's status attribute was set to INACTIVE because account ${accountSid} has a zero transcript retention policy.`,
        );
      }
    }
  };

registerServiceScopedConversationEventHandler(
  [CHANNEL_UPDATED],
  deleteInactiveChatChannelEventHandler,
);
