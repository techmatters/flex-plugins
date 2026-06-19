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

      // 1. Fetch all active participants in the conference
      const { conference, contactId } = taskAttributes;
      const conferenceContext = client.conferences.get(conference.sid);
      if (taskChannelUniqueName === 'voice' && conference) {
        // This task is a candidate to trigger post survey. Check feature flags for the account.
        const serviceConfigAttributes =
          await retrieveServiceConfigurationAttributes(client);
        const { postStudioFlows } = serviceConfigAttributes;
        const studioFlowIdentifier: string =
          postStudioFlows?.[taskChannelUniqueName] ?? '';

        if (studioFlowIdentifier.startsWith('+')) {
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
              const { from } = await client.calls.get(participant.callSid).fetch();
              console.debug(
                `${logPrefix} Retrieved call ${participant.callSid} from conference ${conference.sid}.`,
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
                  `${logPrefix} Updated existing sync document ${uniqueName}.`,
                );
              } catch (err) {
                if ((err as RestException).status === 404) {
                  console.debug(
                    `${logPrefix} No existing sync document ${uniqueName} to update.`,
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
                    `${logPrefix} Before dialing participant ${participant.callSid} from conference ${conference.sid} into a new call, contact ID ${contactId} and task SID ${taskSid} were stashed under sync doc ${uniqueName} for use in the post flow.`,
                  );
                } else {
                  console.error(
                    `${logPrefix} Error updating sync document ${uniqueName}`,
                    err,
                  );
                }
              }
              const twiml = new VoiceResponse();
              twiml.dial(studioFlowIdentifier);
              await client.calls.get(participant.callSid).update({
                twiml,
              });
              console.debug(
                `${logPrefix} Dialed ${studioFlowIdentifier} to start post survey.`,
              );
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
        } else if (studioFlowIdentifier.startsWith('FW')) {
          await client.studio.v2.flows.get(studioFlowIdentifier).executions.create({
            from: taskAttributes.to,
            parameters: {
              contactId,
              contactTaskSid: taskSid,
            },
            to: taskAttributes.from,
          });
          conferenceContext.participants.each(p => p.remove());
        } else {
          console.debug(`No post studio flow configured for ${taskChannelUniqueName}`);
        }

        console.info(`${logPrefix} Finished handling post studio flow trigger.`);
      } else {
        console.warn(
          `${logPrefix} Only tasks with a taskChannelUniqueName of 'voice' and a conference object in the attributes are supported for post task studio flows`,
          `taskChannelUniqueName: ${taskChannelUniqueName}`,
          `conference: ${conference}`,
        );
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
