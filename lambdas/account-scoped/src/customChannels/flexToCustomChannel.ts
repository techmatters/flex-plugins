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
import { Twilio } from 'twilio';

export type ProgrammableChatWebhookEvent = {
  Body: string;
  From: string;
  ChannelSid: string;
  EventType: string;
  Source: string;
};

export type ConversationWebhookEvent = {
  Body: string;
  Author: string;
  ParticipantSid?: string;
  ConversationSid: string;
  EventType: string;
  Source: string;
};

export type ExternalSendResult = {
  ok: boolean;
  meta: Record<string, string>;
  body: any;
  resultCode: number;
};

export type WebhookEvent = ConversationWebhookEvent | ProgrammableChatWebhookEvent;

type Params<T extends WebhookEvent, TResponse = any> = {
  event: T;
  recipientId: string;
  sendExternalMessage: (
    recipientId: string,
    messageText: string,
    useTestApi?: boolean,
  ) => Promise<TResponse>;
};

export const isConversationWebhookEvent = (
  event: WebhookEvent,
): event is ConversationWebhookEvent => 'ConversationSid' in event;

export type RedirectResult = { status: 'ignored' } | { status: 'sent'; response: any };

export const redirectConversationMessageToExternalChat = async (
  client: Twilio,
  {
    event,
    recipientId,
    sendExternalMessage,
  }: Params<ConversationWebhookEvent, ExternalSendResult>,
): Promise<RedirectResult> => {
  const { Body, ConversationSid, EventType, ParticipantSid, Source, Author } = event;
  let shouldSend = false;
  if (Source === 'SDK') {
    shouldSend = true;
  } else if (Source === 'API' && EventType === 'onMessageAdded') {
    const participants = await client.conversations.v1.conversations
      .get(ConversationSid)
      .participants.list();

    const sortByDateCreated = (a: any, b: any) =>
      a.dateCreated > b.dateCreated ? 1 : -1;
    const firstParticipantSid = participants.sort(sortByDateCreated)[0]?.sid;

    // Redirect bot, system or third participant, but not self
    // conversation participantSid is being set to Author in Instagram convos for some reason?
    shouldSend =
      Boolean(firstParticipantSid) &&
      ![Author, ParticipantSid].includes(firstParticipantSid);
  }
  if (shouldSend) {
    const useTestApi =
      JSON.parse(
        (await client.conversations.v1.conversations.get(ConversationSid).fetch())
          ?.attributes ?? {},
      ).useTestApi ?? false;
    const response = await sendExternalMessage(recipientId, Body, useTestApi);
    if (response.ok) {
      return { status: 'sent', response };
    }
    console.log(
      `Failed to send message: ${response.resultCode}`,
      response.body,
      response.meta,
    );
    throw new Error(`Failed to send message: ${response.resultCode}`);
  }
  // This ignores self messages and not supported sources
  return { status: 'ignored' };
};
