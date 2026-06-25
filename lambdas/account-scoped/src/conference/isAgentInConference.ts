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
import type { ParticipantInstance } from 'twilio/lib/rest/api/v2010/account/conference/participant';

export const isAgentInConference = ({
  callSid,
  customerCallSid,
  participant,
}: {
  callSid: string;
  customerCallSid: string;
  participant: ParticipantInstance;
}): boolean => {
  console.debug('Checking if participant is an agent:', participant);

  if (
    participant.label?.startsWith('External party') ||
    participant.label === 'external party'
  ) {
    // This was added via our addParticipant function
    console.debug(
      `Participant ${participant.label} (${participant.callSid}) identified as external party`,
    );
    return false;
  }

  if (participant.callSid === callSid) {
    // This is the participant firing the event
    console.warn(
      `Participant ${participant.label} (${participant.callSid}) still in conference, despite leave event for them`,
    );
    return false;
  }

  // TODO: Detect caller vs agent
  if (participant.callSid === customerCallSid) {
    console.debug(
      `Participant ${participant.label} (${participant.callSid}) identified as service user, because their call sid is the customer call sid`,
    );
    return false;
  }

  console.debug(
    `Participant ${participant.label} (${participant.callSid}) not identified as the service user or an external party, so must be an agent, keep recording`,
  );
  return true;
};
