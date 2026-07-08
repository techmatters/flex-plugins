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
import {
  ConferenceStatusEventHandler,
  registerConferenceStatusEventHandler,
} from '../conference/conferenceStatusCallback';

const endStudioFlowExecutionsHandler: ConferenceStatusEventHandler = async (
  event,
  accountSid,
  client,
) => {
  const logPrefix = `[End Studio Flow Executions Handler - ${accountSid}/${event.ConferenceSid}]:`;
  if (event.StatusCallbackEvent === 'participant-leave') {
    try {
      const serviceConfigAttributes =
        await retrieveServiceConfigurationAttributes(client);
      const { postStudioFlows } = serviceConfigAttributes;
      for (const postStudioFlow of Object.values(postStudioFlows)) {
        if (typeof postStudioFlow === 'object') {
          const { studioFlowSid } = postStudioFlows;
          const { CallSid: leavingCallSid } = event;
          const activeExecutions = await client.studio.v2.flows
            .get(studioFlowSid)
            .executions.list({ status: 'active', limit: 50 } as any);

          for (const execution of activeExecutions) {
            const { context } = await execution.executionContext().get().fetch();
            const { CallSid: flowCallSid } = context.trigger.call ?? {};
            if (flowCallSid === leavingCallSid) {
              // If the execution is for a call that's leaving the conference, end the execution
              await execution.remove();
            }
          }
        }
      }
    } catch (err) {
      console.error(`${logPrefix} endStudioFlowExecutionsHandler failed`, err);
    }
  } else {
    console.warn(
      `${logPrefix} endStudioFlowExecutionsHandler failed, only participant-leave events are supposed to be routed to this handler, got ${event.StatusCallbackEvent}`,
    );
  }
};

registerConferenceStatusEventHandler(
  ['participant-leave'],
  endStudioFlowExecutionsHandler,
);
