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
import {
  ConferenceStatusEventHandler,
  registerTaskRouterEventHandler,
} from './conferenceStatusCallback';
import type RestException from 'twilio/lib/base/RestException';
import { hasTaskControl } from '../transfer/hasTaskControl';

const isAgentInConference = ({
  callSid,
  customerCallSid,
  participant,
}: {
  callSid: string;
  customerCallSid: string;
  participant: ParticipantInstance;
}): boolean => {
  console.debug('Remaining participant', participant);

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
    TaskSid: taskSid,
    WorkspaceSid: workspaceSid,
  } = event;
  const remainingParticipants = await client.conferences
    .get(conferenceSid)
    .participants.list();
  const agentStillInConference = remainingParticipants.some(participant =>
    isAgentInConference({ callSid, customerCallSid, participant }),
  );

  if (agentStillInConference) {
    return;
  }

  console.info(
    `No participants identified as Aselo agents still in conference ${conferenceSid}, candidate to stop recordings`,
  );
  const isTaskInControl = await hasTaskControl({
    client,
    taskSid,
    workspaceSid,
  });

  if (!isTaskInControl) {
    return;
  }

  console.info(`Task ${taskSid} is not a transfer, stopping recordings`);

  const conferenceRecordings = await client.conferences
    .get(conferenceSid)
    .recordings.list();
  console.info(`Stopping all ${conferenceRecordings.length} recordings`);
  await Promise.all(
    conferenceRecordings.map(async recording => {
      try {
        if (['in-progress', 'processing'].includes(recording.status)) {
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
        const restError = error as RestException;
        if (restError.status === 400 && restError.code === 21220) {
          // Often errors of this type are thrown but the recording appears to pause at the correct point.
          console.debug(
            `An error was thrown pausing recording ${recording.sid} for call ${recording.callSid} on conference ${conferenceSid}, but the pause operation would normally be successful or redundant when this type or error is thrown`,
            error,
          );
        } else {
          console.error(
            `Error pausing recording ${recording.sid} for call ${recording.callSid} on conference ${conferenceSid}`,
            error,
          );
        }
      }
    }),
  );
};

registerTaskRouterEventHandler(['participant-leave'], handler);
