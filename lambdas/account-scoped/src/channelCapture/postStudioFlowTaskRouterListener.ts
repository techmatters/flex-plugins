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
import { getSyncServiceSid } from '@tech-matters/twilio-configuration';
import { getPostSurveySyncDocUniqueName } from '../hrm/savePostSurvey';
import RestException from 'twilio/lib/base/RestException';

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
      TaskSid: taskSid,
    } = event;

    const taskAttributes = JSON.parse(taskAttributesString);

    if (isTriggerPostStudioFlow({ eventType, taskAttributes, taskChannelUniqueName })) {
      console.info(
        `[Post Survey Studio Flow - ${accountSid}/${taskSid}]: Handling post studio flow trigger...`,
      );
      console.debug('[SENSITIVE] taskAttributes', taskAttributes);

      // This task is a candidate to trigger post survey. Check feature flags for the account.
      const serviceConfigAttributes =
        await retrieveServiceConfigurationAttributes(client);
      const { postStudioFlows } = serviceConfigAttributes;
      const studioFlowSid = postStudioFlows?.[taskChannelUniqueName];

      if (studioFlowSid) {
        const { conference, contactId } = taskAttributes;
        const studioWebhookUrl = `https://webhooks.twilio.com/v1/Accounts/${accountSid}/Flows/${studioFlowSid}?`;
        if (taskChannelUniqueName === 'voice' && conference) {
          const conferenceContext = client.conferences.get(conference.sid);
          // 1. Fetch all active participants in the conference
          const allParticipants = await conferenceContext.participants.list();
          console.debug(
            `[Post Survey Studio Flow - ${accountSid}/${taskSid}]: ${allParticipants.length} participants on conference: ${conference.sid} at ${eventType}.`,
            allParticipants,
          );
          const connectedParticipants = allParticipants.filter(
            p => p.status === 'connected',
          );
          console.debug(
            `[Post Survey Studio Flow - ${accountSid}/${taskSid}]: ${connectedParticipants.length} participants on conference: ${conference.sid} at ${eventType}.`,
            connectedParticipants,
          );
          if (connectedParticipants.length === 1) {
            const [participant] = connectedParticipants;
            await participant.update({
              hold: true,
            });
            console.debug(
              `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: Put participant ${participant.callSid} from conference ${conference.sid} on hold.`,
            );
            const { from } = await client.calls.get(participant.callSid).fetch();
            console.debug(
              `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: Retrieved call ${participant.callSid} from conference ${conference.sid}.`,
            );
            const uniqueName = getPostSurveySyncDocUniqueName(from);
            const docList = client.sync.v1.services.get(
              await getSyncServiceSid(accountSid),
            ).documents;
            try {
              await docList.get(uniqueName).update({
                data: {
                  taskSid,
                  contactId,
                },
                ttl: 24 * 60 * 60,
              });
              console.debug(
                `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: Updated existing sync document ${uniqueName}.`,
              );
            } catch (err) {
              if ((err as RestException).status === 404) {
                console.debug(
                  `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: No existing sync document ${uniqueName} to update.`,
                );
                await docList.create({
                  uniqueName,
                  data: {
                    taskSid,
                    contactId,
                  },
                  ttl: 24 * 60 * 60,
                });
                console.debug(
                  `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: Before dialing participant ${participant.callSid} from conference ${conference.sid} into a new call, contact ID ${contactId} and task SID ${taskSid} were stashed under sync doc ${uniqueName} for use in the post flow.`,
                );
              } else {
                console.error(
                  `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: Error removing sync document ${uniqueName}`,
                  err,
                );
              }
            }

            const twiml = new VoiceResponse();
            twiml.dial(
              {
                action: studioWebhookUrl,
                method: 'POST',
              },
              '+1 206 408 3885',
            );
            await client.calls.get(participant.callSid).update({
              twiml,
            });
            console.debug(
              `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: Dialed +1 206 408 3885 to start post survey.`,
            );
            await participant.remove();
            console.debug(
              `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: Removed participant ${participant.callSid} from conference ${conference.sid}.`,
            );
          } else {
            console.debug(
              `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: Only valid for redirecting to studio flow if there is only one connected participant on the conference`,
            );
          }
        } else {
          console.warn(
            `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: Only tasks with a taskChannelUniqueName of 'voice' and a conference object in the attributes are supported for post task studio flows`,
            `taskChannelUniqueName: ${taskChannelUniqueName}`,
            `conference: ${conference}`,
          );
        }

        console.info(
          `[Post Survey Studio Flow - ${accountSid}/${event.TaskSid}]: Finished handling post studio flow trigger.`,
        );
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
