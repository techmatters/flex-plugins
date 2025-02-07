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
import { EventType, RESERVATION_ACCEPTED } from '../taskrouter/eventTypes';
import type { EventFields } from '../taskrouter';
import twilio from 'twilio';
import { AccountSID } from '../twilioTypes';
import { getSsmParameter } from '../ssmCache';
import { getWorkspaceSid } from '../configuration/twilioConfiguration';

export const eventTypes: EventType[] = [RESERVATION_ACCEPTED];

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
      channel: 'web',
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
  }: EventFields,
  accountSid: AccountSID,
  client: twilio.Twilio,
): Promise<void> => {
  const taskAttributes = taskAttributesString ? JSON.parse(taskAttributesString) : {};
  const {
    channelSid,
    isContactlessTask,
    transferTargetType,
    channelType,
    customChannelType,
  } = taskAttributes;

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
  const formDefinitionsVersionUrl =
    configFormDefinitionsVersionUrl ||
    `${assetsBucketUrl}/form-definitions/${helplineCode}/v1`;
  if (!enableBackendHrmContactCreation) {
    console.debug(
      `enable_backend_hrm_contact_creation is not set, the contact associated with task ${taskSid} will be created from Flex.`,
    );
    return;
  }

  const [hrmStaticKey, twilioWorkspaceSid] = await Promise.all([
    getSsmParameter(`/${process.env.NODE_ENV}/twilio/${accountSid}/static_key`),
    getWorkspaceSid(accountSid),
  ]);
  const contactUrl = `${process.env.INTERNAL_HRM_URL}/internal/${hrmApiVersion}/accounts/${accountSid}/contacts`;

  console.debug('Creating HRM contact for task', taskSid, contactUrl);

  const newContact: HrmContact = {
    ...BLANK_CONTACT,
    definitionVersion,
    channel: (customChannelType || channelType) as HrmContact['channel'],
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
  const options: RequestInit = {
    method: 'POST',
    body: JSON.stringify(populatedContact),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${hrmStaticKey}`,
    },
  };
  const response = await fetch(contactUrl, options);
  if (!response.ok) {
    console.error(
      `Failed to create HRM contact for task ${taskSid} - status: ${response.status} - ${response.statusText}`,
      await response.text(),
    );
    return;
  }
  const { id } = (await response.json()) as HrmContact;
  console.info(`Created HRM contact with id ${id} for task ${taskSid}`);

  const taskContext = client.taskrouter.v1.workspaces
    .get(twilioWorkspaceSid)
    .tasks.get(taskSid);
  const currentTaskAttributes = (await taskContext.fetch()).attributes; // Less chance of race conditions if we fetch the task attributes again, still not the best...
  const updatedAttributes = {
    ...JSON.parse(currentTaskAttributes),
    contactId: id.toString(),
  };
  await taskContext.update({ attributes: JSON.stringify(updatedAttributes) });
};

registerTaskRouterEventHandler([RESERVATION_ACCEPTED], handleEvent);
