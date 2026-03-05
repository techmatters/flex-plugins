/**
 * Copyright (C) 2021-2026 Technology Matters
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

export const transitionAgentParticipants = async (
  client: Twilio,
  taskAttributes: { flexInteractionSid?: string; flexInteractionChannelSid?: string },
  targetStatus: string,
  interactionChannelParticipantSid?: string,
) => {
  const { flexInteractionSid, flexInteractionChannelSid } = taskAttributes;

  if (!flexInteractionSid || !flexInteractionChannelSid) {
    console.warn(
      'transitionAgentParticipants called without flexInteractionSid or flexInteractionChannelSid - is it a Programmable Chat task?',
    );
    return;
  }

  const participants = await client.flexApi.v1.interaction
    .get(flexInteractionSid)
    .channels.get(flexInteractionChannelSid)
    .participants.list();

  const agentParticipants = participants.filter(
    p =>
      p.type === 'agent' &&
      (!interactionChannelParticipantSid || p.sid === interactionChannelParticipantSid),
  );

  await Promise.allSettled(
    agentParticipants.map(p => p.update({ status: targetStatus as any })),
  );
};
