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

/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import {
  HrmContact,
  populateHrmContactFormFromTask,
} from './populateHrmContactFormFromTask';
import { registerTaskRouterEventHandler } from '../taskrouter/taskrouterEventHandler';
import { RESERVATION_ACCEPTED } from '../taskrouter/eventTypes';
import type { EventFields } from '../taskrouter';
import twilio from 'twilio';
import { AccountSID } from '../twilioTypes';
import { getWorkspaceSid } from '../configuration/twilioConfiguration';
import { postToInternalHrmEndpoint } from './internalHrmRequest';
import { isErr } from '../Result';
import { inferHrmAccountId } from './hrmAccountId';

// Temporarily copied to this repo, will share the flex types when we move them into the same repo

const BLANK_CONTACT: HrmContact = {
  id: '',
  definitionVersion: '',
  timeOfContact: '',
  taskId: null,
  helpline: '',
  rawJson: {
    childInformation: {},
    callerInformation: {},
    caseInformation: {},
    callType: '',
    contactlessTask: {
      channel: '' as any,
      date: '',
      time: '',
      createdOnBehalfOf: '',
      helpline: '',
    },
    categories: {},
  },
  channelSid: '',
  serviceSid: '',
  channel: 'default',
  createdBy: '',
  createdAt: '',
  updatedBy: '',
  updatedAt: '',
  queueName: '',
  number: '',
  conversationDuration: 0,
  csamReports: [],
  conversationMedia: [],
};

export const handleEvent = async (
  {
    TaskAttributes: taskAttributesString,
    TaskSid: taskSid,
    WorkerSid: workerSid,
    WorkerName: workerName,
  }: EventFields,
  accountSid: AccountSID,
  client: twilio.Twilio,
): Promise<void> => {
  console.debug(
    'Creating HRM contact for task on reservation accepted handler invoked',
    taskSid,
  );
  const taskAttributes = taskAttributesString ? JSON.parse(taskAttributesString) : {};
  const {
    channelSid,
    isContactlessTask,
    transferTargetType,
    channelType,
    customChannelType,
    conference,
    direction,
  } = taskAttributes;
  console.debug('>>> 1. Task attributes:', taskAttributes);

  if (isContactlessTask) {
    console.debug(
      `Task ${taskSid} is a contactless task, contact was already created in Flex.`,
    );
    return;
  }

  if (transferTargetType) {
    console.debug(
      `Task ${taskSid} was created to receive a ${transferTargetType} transfer. The original contact will be used so a new one will not be created.`,
    );

    const taskContext = client.taskrouter.v1.workspaces
      .get(await getWorkspaceSid(accountSid))
      .tasks.get(taskSid);
    const reservations = await taskContext.reservations.list();
    const thisWorkersReservation = reservations.find(r => r.workerSid === workerSid);
    if (thisWorkersReservation) {
      await taskContext.update({
        attributes: JSON.stringify({
          ...taskAttributes,
          transferMeta: {
            ...taskAttributes.transferMeta,
            sidWithTaskControl: thisWorkersReservation.sid,
          },
        }),
      });
      console.info(
        `Set sidWithTaskControl to ${thisWorkersReservation.sid} for task ${taskSid}, giving control of it to worker ${workerSid}, who is accepting the transfer.`,
      );
    } else
      console.warn(
        `Could not find reservation on task ${taskSid} for worker ${workerSid}, even though they are accepting the task. Cannot set sidWithTaskControl to complete transfer.`,
      );

    return;
  }

  const serviceConfig = await client.flexApi.v1.configuration.get().fetch();

  const {
    definitionVersion,
    hrm_api_version: hrmApiVersion,
    form_definitions_version_url: configFormDefinitionsVersionUrl,
    assets_bucket_url: assetsBucketUrl,
    helpline_code: helplineCode,
    feature_flags: {
      enable_backend_hrm_contact_creation: enableBackendHrmContactCreation,
    },
  } = serviceConfig.attributes;

  const hrmAccountId = inferHrmAccountId(accountSid, workerName);
  const formDefinitionsVersionUrl =
    configFormDefinitionsVersionUrl ||
    `${assetsBucketUrl}/form-definitions/${helplineCode}/v1`;
  if (!enableBackendHrmContactCreation) {
    console.debug(
      `enable_backend_hrm_contact_creation is not set, the contact associated with task ${taskSid} will be created from Flex.`,
    );
    return;
  }

  const twilioWorkspaceSid = await getWorkspaceSid(accountSid);

  console.debug('Creating HRM contact for task', taskSid, 'Hrm Account:', hrmAccountId);

  const isOutboundVoiceTask = direction === 'outbound' && Boolean(conference);

  const newContact: HrmContact = {
    ...BLANK_CONTACT,
    definitionVersion,
    channel: (customChannelType ||
      (isOutboundVoiceTask && 'voice') ||
      channelType ||
      'default') as HrmContact['channel'],
    rawJson: {
      definitionVersion,
      ...BLANK_CONTACT.rawJson,
    },
    twilioWorkerId: workerSid as HrmContact['twilioWorkerId'],
    taskId: taskSid as HrmContact['taskId'],
    channelSid: channelSid ?? '',
    serviceSid: (channelSid && serviceConfig.chatServiceInstanceSid) ?? '',
    // We set createdBy to the workerSid because the contact is 'created' by the worker who accepts the task
    createdBy: workerSid as HrmContact['createdBy'],
    timeOfContact: new Date().toISOString(),
  };
  console.debug('Creating HRM contact with timeOfContact:', newContact.timeOfContact);
  const populatedContact = await populateHrmContactFormFromTask(
    taskAttributes,
    newContact,
    formDefinitionsVersionUrl,
  );
  const responseResult = await postToInternalHrmEndpoint<HrmContact, HrmContact>(
    hrmAccountId,
    hrmApiVersion,
    'contacts',
    populatedContact,
  );
  if (isErr(responseResult)) {
    console.error(
      `Failed to create HRM contact for task ${taskSid}`,
      responseResult.message,
      responseResult.error,
    );
    return;
  }
  const { id } = responseResult.data;
  console.info(`Created HRM contact with id ${id} for task ${taskSid}`);

  const taskContext = client.taskrouter.v1.workspaces
    .get(twilioWorkspaceSid)
    .tasks.get(taskSid);
  const currentTaskAttributes = (await taskContext.fetch()).attributes; // Less chance of race conditions if we fetch the task attributes again, still not the best...
  const updatedAttributes = {
    ...JSON.parse(currentTaskAttributes),
    contactId: id.toString(),
    outboundVoiceTaskStartMillis: isOutboundVoiceTask ? new Date().getTime() : null,
  };
  await taskContext.update({ attributes: JSON.stringify(updatedAttributes) });
};

registerTaskRouterEventHandler([RESERVATION_ACCEPTED], handleEvent);
