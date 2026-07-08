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

import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
/*
import {
  ConferenceStatusEventHandler,
  registerConferenceStatusEventHandler,
} from '../conference/conferenceStatusCallback';
 */
import { Twilio } from 'twilio';
import { AccountSID, CallSid } from '@tech-matters/twilio-types';

export const endActiveStudioFlowExecutionsForCall = async (
  client: Twilio,
  { accountSid, callSid }: { accountSid: AccountSID; callSid: CallSid },
) => {
  const logPrefix = `[End Studio Flow Executions Handler - ${accountSid}/${callSid}]:`;
  try {
    const serviceConfigAttributes = await retrieveServiceConfigurationAttributes(client);
    const { postStudioFlows } = serviceConfigAttributes;
    for (const postStudioFlow of Object.values(postStudioFlows ?? {})) {
      const { studioFlowSid } = postStudioFlow;
      const activeExecutions = await client.studio.v2.flows
        .get(studioFlowSid)
        .executions.list({ status: 'active', limit: 50 } as any);
      (activeExecutions.length ? console.info : console.debug)(
        `${logPrefix} ${activeExecutions.length} active executions detected for flow ${studioFlowSid}`,
      );
      for (const execution of activeExecutions) {
        const { context } = await execution.executionContext().get().fetch();
        const { CallSid: flowCallSid } = context.trigger.call ?? {};
        if (flowCallSid === callSid) {
          console.info(
            `${logPrefix} ${activeExecutions.length} ending active execution ${execution.sid} for flow ${studioFlowSid} because call sid on execution ${flowCallSid} matches that of leaving participant.`,
          );
          // If the execution is for a call that's leaving the conference, end the execution
          await execution.update({
            status: 'ended',
          });
        } else {
          console.debug(
            `${logPrefix} ${activeExecutions.length} leaving active execution ${execution.sid} for flow ${studioFlowSid} executing because call sid on execution ${flowCallSid} doesn't matches that of leaving participant ${callSid}`,
          );
        }
      }
    }
  } catch (err) {
    console.error(`${logPrefix} endStudioFlowExecutionsHandler failed`, err);
  }
};

/*

const endStudioFlowExecutionsHandler: ConferenceStatusEventHandler = async (
  event,
  accountSid,
  client,
) => {
  if (event.StatusCallbackEvent === 'participant-leave') {
    console.debug(
      `[End Studio Flow Executions Handler - ${accountSid}/${event.ConferenceSid}]: starting for ${event.StatusCallbackEvent}`,
    );
    await endActiveStudioFlowExecutionsForCall(client, {
      accountSid,
      callSid: event.CallSid,
    });
  } else {
    console.warn(
      `[End Studio Flow Executions Handler - ${accountSid}/${event.ConferenceSid}]: endStudioFlowExecutionsHandler failed, only participant-leave events are supposed to be routed to this handler, got ${event.StatusCallbackEvent}`,
    );
  }
};
registerConferenceStatusEventHandler(
  ['participant-leave'],
  endStudioFlowExecutionsHandler,
);
*/
