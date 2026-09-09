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
import { AccountSID, CallSid, TaskQueueSID, TaskSID } from '@tech-matters/twilio-types';
import TwilioSDK from 'twilio';
import { TASK_COMPLETED, TASK_WRAPUP } from '../taskrouter/eventTypes';
import { EventFields } from '../taskrouter';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { isChatCaptureControlTask } from '../channelCapture/channelCaptureHandlers';
import VoiceResponse = TwilioSDK.twiml.VoiceResponse;
import { patchTaskAttributes } from '../task/patchTaskAttributes';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { AccountScopedHandler } from '../httpTypes';
import { newOk } from '@tech-matters/result-type';

// TODO: factor out
type TransferMeta = {
  mode: 'COLD' | 'WARM';
  transferStatus: 'transferring' | 'accepted' | 'rejected';
  sidWithTaskControl: string;
};

const isTriggerPostStudioFlow = ({
  taskAttributes,
}: {
  taskAttributes: {
    transferMeta?: TransferMeta;
    isChatCaptureControl?: boolean;
    postStudioFlowTriggered?: boolean;
  };
}) =>
  !isChatCaptureControlTask(taskAttributes) && !taskAttributes.postStudioFlowTriggered;

const triggerPostStudioFlow = async ({
  accountSid,
  taskSid,
  taskQueueSid,
  taskChannelUniqueName,
  taskAttributes,
  targetCallSid,
}: {
  accountSid: AccountSID;
  taskSid: TaskSID;
  taskChannelUniqueName: string;
  taskQueueSid: TaskQueueSID;
  taskAttributes: Record<string, any>;
  targetCallSid?: CallSid;
}) => {
  const client = await getTwilioClient(accountSid);
  const logPrefix = `[Post Survey Studio Flow - ${accountSid}/${taskSid}]:`;
  const isOutbound = taskAttributes.direction === 'outbound';
  try {
    if (isTriggerPostStudioFlow({ taskAttributes })) {
      console.info(`${logPrefix} Handling post studio flow trigger...`);
      console.debug('[SENSITIVE] taskAttributes', taskAttributes);

      // This task is a candidate to trigger post survey. Check feature flags for the account.
      const serviceConfigAttributes =
        await retrieveServiceConfigurationAttributes(client);
      const { postStudioFlows, hrm_base_url: hrmBaseUrl } = serviceConfigAttributes;
      const { conference, contactId } = taskAttributes;
      const studioFlowIdentifier =
        postStudioFlows?.[taskQueueSid] ?? postStudioFlows?.[taskChannelUniqueName];

      if (studioFlowIdentifier?.flowTrigger === 'inProgressCall') {
        const { studioFlowSid } = studioFlowIdentifier;
        const studioWebhookUrl = `https://webhooks.twilio.com/v1/Accounts/${accountSid}/Flows/${studioFlowSid}`;

        if (taskChannelUniqueName === 'voice' && conference) {
          const conferenceContext = client.conferences.get(conference.sid);
          // 1. Fetch all active participants in the conference
          const allParticipants = await conferenceContext.participants.list();
          console.debug(
            `${logPrefix} ${allParticipants.length} participants on conference: ${conference.sid}.`,
            allParticipants,
          );
          const targetParticipants = allParticipants.filter(
            p =>
              (!targetCallSid || p.callSid === targetCallSid) && p.status === 'connected',
          );
          console.debug(
            `${logPrefix} ${targetParticipants.length} participants on conference: ${conference.sid}.`,
            targetParticipants,
          );
          if (targetParticipants.length === 1) {
            const [participant] = targetParticipants;
            try {
              const twiml = new VoiceResponse();
              twiml.redirect(
                `${studioWebhookUrl}?Trigger=inProgressCall&contactId=${contactId}&taskSid=${taskSid}`,
              );
              await client.calls.get(participant.callSid).update({
                twiml,
                statusCallback: `${hrmBaseUrl}/lambda/twilio/account-scoped/${accountSid}/conference/postStudioFlowCallStatusCallback`,
              });
              console.debug(
                `${logPrefix} Dialed ${studioFlowIdentifier} passing ${contactId} and ${taskSid} to start post survey.`,
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
              `${logPrefix} Only valid for redirecting to studio flow if there is only one connected participant on the conference or a connected target specified`,
            );
          }
        } else {
          console.warn(
            `${logPrefix} Only tasks with a taskChannelUniqueName of 'voice' and a conference object in the attributes are supported for post task studio flows`,
            `taskChannelUniqueName: ${taskChannelUniqueName}`,
            `conference: ${conference}`,
          );
        }
      } else if (studioFlowIdentifier?.flowTrigger === 'rest') {
        console.debug(
          `${logPrefix} Initiating post studio flow ${studioFlowIdentifier} configured for ${taskChannelUniqueName} via REST API - contact ${contactId}, task: ${taskSid}`,
        );
        await client.studio.v2.flows
          .get(studioFlowIdentifier.studioFlowSid)
          .executions.create({
            from: isOutbound ? taskAttributes.from : taskAttributes.to,
            parameters: {
              contactId,
              contactTaskSid: taskSid,
              taskQueueSid,
              taskLanguage: taskAttributes.language ?? '',
            },
            to: isOutbound ? taskAttributes.outbound_to : taskAttributes.from,
          });
        console.debug(
          `${logPrefix} Initiated post studio flow ${studioFlowIdentifier} configured for ${taskChannelUniqueName} via REST API - contact ${contactId}, task: ${taskSid}, removing participants`,
        );
        client.conferences.get(conference.sid).participants.each(p => p.remove());
        console.debug(
          `${logPrefix} Removed participants from conference ${conference.sid}.`,
        );
      } else {
        console.debug(
          `No / Invalid post studio flow configured for ${taskQueueSid}: ${studioFlowIdentifier}`,
        );
      }
      console.info(`${logPrefix} Finished handling post studio flow trigger.`);
      await patchTaskAttributes(accountSid, taskSid, ta => ({
        ...ta,
        postStudioFlowTriggered: true,
      }));
    }
  } catch (err) {
    console.error(
      `[Post Survey Studio Flow - ${accountSid}/${taskSid}]: triggerPostStudioFlowTaskRouterListener failed`,
      err,
    );
  }
};

const triggerPostStudioFlowTaskRouterListener: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
) => {
  const {
    EventType: eventType,
    TaskChannelUniqueName: taskChannelUniqueName,
    TaskAttributes: taskAttributesString,
    TaskSid: taskSid,
    TaskQueueSid: taskQueueSid,
  } = event;

  const taskAttributes = JSON.parse(taskAttributesString);

  console.info(
    `[Post Survey Studio Flow - ${accountSid}/${taskSid}]: Handling post studio flow trigger for task router event ${eventType}...`,
  );
  await triggerPostStudioFlow({
    accountSid,
    taskSid,
    taskQueueSid,
    taskChannelUniqueName,
    taskAttributes,
  });
};

registerTaskRouterEventHandler(
  [TASK_WRAPUP, TASK_COMPLETED],
  triggerPostStudioFlowTaskRouterListener,
);

export const triggerPostStudioFlowHandler: AccountScopedHandler = async (
  event,
  accountSid,
) => {
  const { taskSid, targetCallSid } = event.body;
  const client = await getTwilioClient(accountSid);
  const { taskChannelUniqueName, taskQueueSid, attributes } =
    await client.taskrouter.v1.workspaces
      .get(await getWorkspaceSid(accountSid))
      .tasks.get(taskSid)
      .fetch();

  await triggerPostStudioFlow({
    accountSid,
    taskSid,
    taskAttributes: JSON.parse(attributes),
    taskQueueSid: taskQueueSid as TaskQueueSID,
    taskChannelUniqueName,
    targetCallSid,
  });
  return newOk({ message: 'Post Studio Flow Triggered' });
};
