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
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';

import { isAgentInConference } from './isAgentInConference';

const handler: ConferenceStatusEventHandler = async (event, accountSid, client) => {
  if (event.StatusCallbackEvent !== 'participant-join') {
    return;
  }
  const {
    ConferenceSid: conferenceSid,
    CallSid: callSid,
    CustomerCallSid: customerCallSid,
  } = event;
  // This is NOT the service user joining the call
  const { postStudioFlows = {} } = await retrieveServiceConfigurationAttributes(client);
  if (postStudioFlows.voice) {
    // A post studio flow is set up so don't end the call when the agent leaves
    const participant = await client.conferences
      .get(conferenceSid)
      .participants.get(callSid)
      .fetch();
    if (
      isAgentInConference({ callSid, customerCallSid, participant }) &&
      participant.endConferenceOnExit
    ) {
      console.info(
        `Post studio flows set up for voice on ${accountSid}, and ${callSid} is an agent in ${conferenceSid} with endConferenceOnExit set true so setting endConferenceOnExit to false for them`,
      );
      await participant.update({ endConferenceOnExit: false });
    } else {
    }
  } else {
    console.debug(`No post studio flows set up for voice on ${accountSid}`);
  }
};

registerConferenceStatusEventHandler(['participant-join'], handler);
