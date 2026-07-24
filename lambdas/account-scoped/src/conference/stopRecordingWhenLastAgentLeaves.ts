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
  registerConferenceStatusEventHandler,
} from './conferenceStatusCallback';
import type RestException from 'twilio/lib/base/RestException';
import { hasTaskControl } from '../transfer/hasTaskControl';
import { isAgentInConference } from './isAgentInConference';
import {
  registerTaskRouterEventHandler,
  TaskRouterEventHandler,
} from '../taskrouter/taskrouterEventHandler';
import {
  AccountSID,
  CallSid,
  ConferenceSid,
  TaskSID,
  WorkspaceSID,
} from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import { EventFields } from '../taskrouter';
import {
  TASK_CANCELED,
  TASK_CREATED,
  TASK_DELETED,
  TASK_SYSTEM_DELETED,
  TASK_WRAPUP,
} from '../taskrouter/eventTypes';

const stopRecordingIfNotTransferring = async (
  client: Twilio,
  {
    conferenceSid,
    callSid,
    customerCallSid,
    taskSid,
    workspaceSid,
  }: {
    conferenceSid: ConferenceSid;
    callSid?: CallSid;
    customerCallSid: CallSid;
    taskSid: TaskSID;
    workspaceSid: WorkspaceSID;
  },
) => {
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
          console.info(
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

const conferenceStatusEventHandler: ConferenceStatusEventHandler = async (
  event,
  accountSid,
  client,
) => {
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
    StatusCallbackEvent: statusCallbackEvent,
    TaskSid: taskSid,
    WorkspaceSid: workspaceSid,
  } = event;

  console.info(
    `[${accountSid}/${taskSid}] ${statusCallbackEvent} on conference ${conferenceSid} for participant ${callSid} where customer is ${customerCallSid}. Checking if recording needs to be stopped`,
  );
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
    `[${taskSid} - ] No participants identified as Aselo agents still in conference ${conferenceSid}, candidate to stop recordings`,
  );
  await stopRecordingIfNotTransferring(client, {
    conferenceSid,
    callSid,
    customerCallSid,
    taskSid,
    workspaceSid,
  });
};

registerConferenceStatusEventHandler(['participant-leave'], conferenceStatusEventHandler);

const taskRouterEventHandler: TaskRouterEventHandler = async (
  {
    TaskSid: taskSid,
    TaskAttributes: attributesJson,
    WorkspaceSid: workspaceSid,
    TaskChannelUniqueName,
    EventType: eventType,
  }: EventFields,
  accountSid: AccountSID,
  client: Twilio,
) => {
  console.debug(
    `[${accountSid}/${taskSid} - stopRecordingWhenLastAgentLeaves]  handler fired on ${eventType}.`,
  );

  const { conference } = JSON.parse(attributesJson);
  const customerCallSid: CallSid = conference?.participants?.customer;
  if (TaskChannelUniqueName === 'voice' && customerCallSid) {
    console.info(
      `[${accountSid}/${taskSid} - stopRecordingWhenLastAgentLeaves] ${eventType} on voice task with customer call sid ${customerCallSid}. Checking if recording needs to be stopped`,
    );
    await stopRecordingIfNotTransferring(client, {
      taskSid,
      conferenceSid: conference.sid,
      customerCallSid,
      workspaceSid,
    });
  }
};

registerTaskRouterEventHandler(
  [TASK_WRAPUP, TASK_CREATED, TASK_CANCELED, TASK_DELETED, TASK_SYSTEM_DELETED],
  taskRouterEventHandler,
);
