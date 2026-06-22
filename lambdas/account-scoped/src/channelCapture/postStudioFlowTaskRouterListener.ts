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
import TwilioSDK, { Twilio } from 'twilio';
import { EventType, TASK_WRAPUP } from '../taskrouter/eventTypes';
import { EventFields } from '../taskrouter';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { isChatCaptureControlTask } from './channelCaptureHandlers';
import VoiceResponse = TwilioSDK.twiml.VoiceResponse;

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
  const logPrefix = `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]:`;
  try {
    const {
      EventType: eventType,
      TaskChannelUniqueName: taskChannelUniqueName,
      TaskAttributes: taskAttributesString,
      TaskSid: taskSid,
    } = event;

    const taskAttributes = JSON.parse(taskAttributesString);

    if (isTriggerPostStudioFlow({ eventType, taskAttributes, taskChannelUniqueName })) {
      console.info(`${logPrefix} Handling post studio flow trigger...`);
      console.debug('[SENSITIVE] taskAttributes', taskAttributes);

      // This task is a candidate to trigger post survey. Check feature flags for the account.
      const serviceConfigAttributes =
        await retrieveServiceConfigurationAttributes(client);
      const { postStudioFlows } = serviceConfigAttributes;
      const studioFlowIdentifier: string = postStudioFlows?.[taskChannelUniqueName] ?? '';

      if (studioFlowIdentifier.startsWith('+')) {
        const { conference, contactId } = taskAttributes;
        if (taskChannelUniqueName === 'voice' && conference) {
          const conferenceContext = client.conferences.get(conference.sid);
          // 1. Fetch all active participants in the conference
          const allParticipants = await conferenceContext.participants.list();
          console.debug(
            `${logPrefix} ${allParticipants.length} participants on conference: ${conference.sid} at ${eventType}.`,
            allParticipants,
          );
          const connectedParticipants = allParticipants.filter(
            p => p.status === 'connected',
          );
          console.debug(
            `${logPrefix} ${connectedParticipants.length} participants on conference: ${conference.sid} at ${eventType}.`,
            connectedParticipants,
          );
          if (connectedParticipants.length === 1) {
            const [participant] = connectedParticipants;
            try {
              await participant.update({
                hold: true,
              });
              console.debug(
                `${logPrefix} Put participant ${participant.callSid} from conference ${conference.sid} on hold.`,
              );
              const { hrm_base_url: hrmBaseUrl } =
                await retrieveServiceConfigurationAttributes(client);
              await client.calls.get(participant.callSid).update({
                url: `${hrmBaseUrl}/lambda/twilio/account-scoped/${accountSid}/hrm/voicePostSurveyAction?contactId=${contactId}&contactTaskSid=${taskSid}`,
              });
              console.debug(`${logPrefix} Started custom twiml to start post survey.`);
            } catch (err) {
              await participant.remove();
              console.debug(
                `${logPrefix} Removed participant ${participant.callSid} from conference ${conference.sid}.`,
              );
              console.error(
                `${logPrefix} triggerPostStudioFlowTaskRouterListener for participant ${participant.callSid} failed`,
                err,
              );
            }
          } else {
            console.debug(
              `${logPrefix} Only valid for redirecting to studio flow if there is only one connected participant on the conference`,
            );
          }
        } else {
          console.warn(
            `${logPrefix} Only tasks with a taskChannelUniqueName of 'voice' and a conference object in the attributes are supported for post task studio flows`,
            `taskChannelUniqueName: ${taskChannelUniqueName}`,
            `conference: ${conference}`,
          );
        }

        console.info(`${logPrefix} Finished handling post studio flow trigger.`);
      } else {
        console.debug(`No post studio flow configured for ${taskChannelUniqueName}`);
      }
    }
  } catch (err) {
    console.error(
      `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: triggerPostStudioFlowTaskRouterListener failed`,
      err,
    );
  }
};

registerTaskRouterEventHandler([TASK_WRAPUP], triggerPostStudioFlowTaskRouterListener);
