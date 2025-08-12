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

import {
  ConferenceStatusEventHandler,
  registerTaskRouterEventHandler,
} from './conferenceStatusCallback';

const handler: ConferenceStatusEventHandler = async (event, _accountSid, client) => {
  if (event.StatusCallbackEvent !== 'participant-leave') {
    console.warn(
      `stopRecordingWhenLastAgentLeave called for ${event.StatusCallbackEvent} on ${event.ConferenceSid}, should only be called for 'participant-leave'`,
    );
    return;
  }
  const {
    ConferenceSid: conferenceSid,
    CallSid: callSid,
    CustomerCallSid: customerCallSid,
  } = event;
  const remainingParticipants = await client.conferences
    .get(conferenceSid)
    .participants.list();
  let agentStillInConference = false;
  for (const participant of remainingParticipants) {
    console.debug('Remaining participant', participant);
    if (
      participant.label?.startsWith('External party') ||
      participant.label === 'external party'
    ) {
      // This was added via our addParticipant function
      console.debug(
        `Participant ${participant.label} (${participant.callSid}) identified as external party`,
      );
      continue;
    }
    if (participant.callSid === callSid) {
      // This is the participant firing the event
      console.warn(
        `Participant ${participant.label} (${participant.callSid}) still in conference, despite leave event for them`,
      );
      continue;
    }
    // TODO: Detect caller vs agent
    if (participant.callSid === customerCallSid) {
      console.debug(
        `Participant ${participant.label} (${participant.callSid}) identified as service user, because their call sid is the customer call sid`,
      );
      continue;
    }
    console.debug(
      `Participant ${participant.label} (${participant.callSid}) not identified as the service user or an external party, so must be an agent, keep recording`,
    );
    agentStillInConference = true;
    break;
  }
  if (!agentStillInConference) {
    const conferenceRecordings = await client.conferences
      .get(conferenceSid)
      .recordings.list();
    await Promise.all(
      conferenceRecordings.map(async recording => {
        try {
          if (recording.status === 'in-progress') {
            console.debug(
              `Pausing recording ${recording.sid} for call ${recording.callSid} on conference ${conferenceSid}`,
              recording,
            );
            return await recording.update({
              status: 'paused', // 'stopped' not supported for conferences
            });
          } else {
            console.debug(
              `Recording ${recording.sid} for call ${recording.callSid} on conference ${conferenceSid} in status '${recording.status}' so not attempting to pause`,
              recording,
            );
          }
        } catch (error) {
          console.error(
            `Error pausing recording ${recording.sid} for call ${recording.callSid} on conference ${conferenceSid}`,
            error,
          );
        }
      }),
    );
    console.info(
      `No participants identified as Aselo agents still in conference ${conferenceSid}, stopping all recordings`,
    );
  }
};

registerTaskRouterEventHandler(['participant-leave'], handler);
