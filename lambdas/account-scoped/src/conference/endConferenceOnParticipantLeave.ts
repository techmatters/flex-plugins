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
  registerConferenceStatusEventHandler,
} from './conferenceStatusCallback';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { isAgentInConference } from './isAgentInConference';
import { hasTaskControl } from '../transfer/hasTaskControl';

const takeOffHoldAndUnmute = async (
  participants: ParticipantInstance[],
  logPrefix: string,
) => {
  await Promise.all(
    participants.map(async participant => {
      try {
        await participant.update({ hold: false, muted: false });
        console.debug(
          `${logPrefix} Took participant ${participant.label} (${participant.callSid}) off hold & mute`,
        );
      } catch (err) {
        console.error(
          `${logPrefix} Failed taking participant ${participant.label} (${participant.callSid}) off hold & mute`,
          err,
        );
      }
    }),
  );
};

/**
 * Handles ending conferences on the backend rather than relying on participants'
 * endConferenceOnExit properties managed from Flex (which requires taking participants
 * off hold to update, causing bugs & race conditions).
 * When the 'use_twilio_lambda_for_conference_ending' feature flag is set, all
 * participants are expected to have endConferenceOnExit set false, and this handler
 * explicitly ends the conference when only one participant would be left on the call,
 * except where:
 * - A transfer is in progress, where the caller needs to be left on the call waiting for the new agent
 * - An 'inProgressCall' post studio flow is configured for the queue / channel, where the caller needs to be left on the call for the post survey
 * Whenever an agent leaves a conference that is kept alive, all remaining participants
 * are taken off hold & mute.
 */
export const endConferenceOnParticipantLeaveHandler: ConferenceStatusEventHandler =
  async (event, accountSid, client) => {
    if (event.StatusCallbackEvent !== 'participant-leave') {
      console.warn(
        `endConferenceOnParticipantLeave called for ${event.StatusCallbackEvent} on ${event.ConferenceSid}, should only be called for 'participant-leave'`,
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
    const logPrefix = `[${accountSid}/${taskSid} - endConferenceOnParticipantLeave]`;

    const { feature_flags: featureFlags, postStudioFlows } =
      await retrieveServiceConfigurationAttributes(client);
    if (!featureFlags.use_twilio_lambda_for_conference_ending) {
      console.debug(
        `${logPrefix} 'use_twilio_lambda_for_conference_ending' feature flag not set, taking no action (conference ending is managed from Flex)`,
      );
      return;
    }

    const remainingParticipants = (
      await client.conferences.get(conferenceSid).participants.list()
    ).filter(participant => participant.callSid !== callSid);

    console.info(
      `${logPrefix} participant ${callSid} left conference ${conferenceSid}, ${remainingParticipants.length} participant(s) remaining (customer is ${customerCallSid})`,
    );

    if (remainingParticipants.length === 0) {
      console.debug(
        `${logPrefix} No participants remaining on conference ${conferenceSid}, nothing to do`,
      );
      return;
    }

    if (remainingParticipants.length === 1) {
      const [remainingParticipant] = remainingParticipants;
      if (remainingParticipant.callSid === customerCallSid) {
        const taskInControl = await hasTaskControl({ client, taskSid, workspaceSid });
        if (!taskInControl) {
          console.info(
            `${logPrefix} Only the customer remains on conference ${conferenceSid} but a transfer is in progress, leaving them on the call waiting for the new agent`,
          );
          return;
        }
        const task = await client.taskrouter.v1.workspaces
          .get(workspaceSid)
          .tasks.get(taskSid)
          .fetch();
        const postStudioFlowConfig =
          postStudioFlows?.[task.taskQueueSid] ??
          postStudioFlows?.[task.taskChannelUniqueName];
        if (postStudioFlowConfig?.flowTrigger === 'inProgressCall') {
          console.info(
            `${logPrefix} Only the customer remains on conference ${conferenceSid} and an 'inProgressCall' post studio flow is configured, leaving them on the call & taking them off hold & mute`,
          );
          await takeOffHoldAndUnmute(remainingParticipants, logPrefix);
          return;
        }
      }
      console.info(
        `${logPrefix} Only one participant (${remainingParticipant.label} / ${remainingParticipant.callSid}) would remain on conference ${conferenceSid}, ending the conference`,
      );
      await client.conferences.get(conferenceSid).update({ status: 'completed' });
      return;
    }

    // 2 or more participants remain, so the conference should be kept alive.
    // If no agents remain, take everyone left off hold & mute so they can keep talking.
    const agentStillInConference = remainingParticipants.some(participant =>
      isAgentInConference({ callSid, customerCallSid, participant }),
    );
    if (agentStillInConference) {
      console.debug(
        `${logPrefix} An agent is still in conference ${conferenceSid}, leaving them to manage the remaining participants`,
      );
      return;
    }
    console.info(
      `${logPrefix} No agents remain in conference ${conferenceSid} with ${remainingParticipants.length} participants still on the call, taking them all off hold & mute`,
    );
    await takeOffHoldAndUnmute(remainingParticipants, logPrefix);
  };

registerConferenceStatusEventHandler(
  ['participant-leave'],
  endConferenceOnParticipantLeaveHandler,
);
