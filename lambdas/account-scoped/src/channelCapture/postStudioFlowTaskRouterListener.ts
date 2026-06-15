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
  registerTaskRouterEventHandler,
  TaskRouterEventHandler,
} from '../taskrouter/taskrouterEventHandler';
import { AccountSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import { EventType, TASK_WRAPUP } from '../taskrouter/eventTypes';
import { EventFields } from '../taskrouter';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { isChatCaptureControlTask } from './channelCaptureHandlers';

// TODO: factor out
type TransferMeta = {
  mode: 'COLD' | 'WARM';
  transferStatus: 'transferring' | 'accepted' | 'rejected';
  sidWithTaskControl: string;
};

const isTriggerPostStudioFlow = ({
  taskAttributes,
}: {
  eventType: EventType;
  taskChannelUniqueName: string;
  taskAttributes: {
    transferMeta?: TransferMeta;
    isChatCaptureControl?: boolean;
  };
}) => {
  return !isChatCaptureControlTask(taskAttributes);
};

const triggerPostStudioFlowTaskRouterListener: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
  client: Twilio,
) => {
  try {
    const {
      EventType: eventType,
      TaskChannelUniqueName: taskChannelUniqueName,
      TaskAttributes: taskAttributesString,
    } = event;

    const taskAttributes = JSON.parse(taskAttributesString);

    if (isTriggerPostStudioFlow({ eventType, taskAttributes, taskChannelUniqueName })) {
      console.info('Handling post studio flow trigger...');
      console.info('taskAttributes', taskAttributes);

      // This task is a candidate to trigger post survey. Check feature flags for the account.
      const serviceConfigAttributes =
        await retrieveServiceConfigurationAttributes(client);
      const { postStudioFlows } = serviceConfigAttributes;
      const studioFlowSid = postStudioFlows?.[taskChannelUniqueName];

      if (studioFlowSid) {
        const studioWebhookUrl = `https://webhooks.twilio.com/v1/Accounts/${accountSid}/Flows/${studioFlowSid}`;
        const { conferenceSid } = taskAttributes;
        if (taskChannelUniqueName === 'voice') {
          // 1. Fetch all active participants in the conference
          const allParticipants = await client.conferences
            .get(conferenceSid)
            .participants.list();
          const connectedParticipants = allParticipants.filter(
            p => p.status === 'connected',
          );
          if (connectedParticipants.length === 1) {
            const [participant] = connectedParticipants;
            await client.calls.get(participant.callSid).update({
              url: studioWebhookUrl,
              method: 'POST',
            });
          }
        }

        console.info('Finished handling post studio flow trigger.');
      } else {
        console.debug(`No post studio flow configured for ${taskChannelUniqueName}`);
      }
    }
  } catch (err) {
    console.error('postSurveyListener failed', err);
  }
};

registerTaskRouterEventHandler([TASK_WRAPUP], triggerPostStudioFlowTaskRouterListener);
