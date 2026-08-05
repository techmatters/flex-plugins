/**
 * Copyright (C) 2021-2026 Technology Matters
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

import type { EventFields } from '../taskrouter';
import { AccountSID, channelTypes, ChannelType } from '@tech-matters/twilio-types';
import { registerTaskRouterEventHandler } from '../taskrouter/taskrouterEventHandler';
import { TASK_WRAPUP } from '../taskrouter/eventTypes';
import { Twilio } from 'twilio';
import { getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { inferHrmAccountId } from './hrmAccountId';
import {
  ConversationMedia,
  newPendingS3StoredTranscript,
  newS3StoredRecordingForVoiceTask,
  newTwilioStoredMedia,
  saveConversationMedia,
} from './conversationMedia';

const CHAT_CHANNEL_TYPES: string[] = [
  channelTypes.WEB,
  channelTypes.CHAT,
  channelTypes.SMS,
  channelTypes.WHATSAPP,
  channelTypes.MESSENGER,
  channelTypes.INSTAGRAM,
  channelTypes.LINE,
  channelTypes.MODICA,
  channelTypes.TELEGRAM,
];

const isChatChannel = (channel?: ChannelType | string): boolean =>
  Boolean(channel && CHAT_CHANNEL_TYPES.includes(channel));

const isVoiceChannel = (channel?: ChannelType | string): boolean =>
  channel === channelTypes.VOICE;

/**
 * Finds the sid of the reservation that currently has control of the task, so it can be used to
 * look up the conversation in the Twilio Insights overlay.
 */
const findReservationSidWithTaskControl = async (
  accountSid: AccountSID,
  client: Twilio,
  taskSid: string,
  taskAttributes: Record<string, any>,
): Promise<string | undefined> => {
  const sidWithTaskControl = taskAttributes?.transferMeta?.sidWithTaskControl;
  if (sidWithTaskControl) {
    return sidWithTaskControl;
  }
  try {
    const reservations = await client.taskrouter.v1.workspaces
      .get(await getWorkspaceSid(accountSid))
      .tasks.get(taskSid)
      .reservations.list();
    const activeReservation =
      reservations.find(r => ['wrapping', 'accepted'].includes(r.reservationStatus)) ??
      reservations[0];
    return activeReservation?.sid;
  } catch (error) {
    console.error(
      `[${accountSid}] Failed to look up reservations for task ${taskSid}, no Twilio stored conversation media will be added`,
      error,
    );
    return undefined;
  }
};

export const handleEvent = async (
  {
    TaskAttributes: taskAttributesString,
    TaskSid: taskSid,
    WorkerName: workerName,
  }: EventFields,
  accountSid: AccountSID,
  client: Twilio,
): Promise<void> => {
  const serviceConfigurationAttributes =
    await retrieveServiceConfigurationAttributes(client);
  const {
    hrm_api_version: hrmApiVersion,
    feature_flags: {
      use_twilio_lambda_for_conversation_media: useTwilioLambdaForConversationMedia,
    },
  } = serviceConfigurationAttributes;

  if (!useTwilioLambdaForConversationMedia) {
    console.debug(
      `use_twilio_lambda_for_conversation_media is not set, the conversation media for the contact associated with task ${taskSid} will be created in Flex.`,
    );
    return;
  }

  const taskAttributes = taskAttributesString ? JSON.parse(taskAttributesString) : {};
  const { contactId, channelType, customChannelType } = taskAttributes;

  if (!contactId) {
    console.debug(
      `No contactId set on task ${taskSid}, cannot add conversation media to a contact.`,
    );
    return;
  }

  const channel = customChannelType || channelType;

  if (channel === channelTypes.VOICEMAIL) {
    console.debug(
      `Task ${taskSid} is a voicemail task, its conversation media is added when the voicemail contact is created.`,
    );
    return;
  }

  const enforceZeroTranscriptRetention = Boolean(
    serviceConfigurationAttributes.enforceZeroTranscriptRetention,
  );
  const externalRecordingsEnabled = Boolean(
    serviceConfigurationAttributes.external_recordings_enabled,
  );

  const isChatTask = isChatChannel(channel);
  const isVoiceTask = isVoiceChannel(channel);
  const retainTranscript = isChatTask && !enforceZeroTranscriptRetention;

  const conversationMedia: ConversationMedia[] = [];

  if (retainTranscript) {
    conversationMedia.push(newPendingS3StoredTranscript());
  }

  if (retainTranscript || isVoiceTask) {
    // Store reservation sid to use Twilio insights overlay (recordings/transcript)
    const reservationSid = await findReservationSidWithTaskControl(
      accountSid,
      client,
      taskSid,
      taskAttributes,
    );
    if (reservationSid) {
      conversationMedia.push(newTwilioStoredMedia(reservationSid));
    }
  }

  if (isVoiceTask && externalRecordingsEnabled) {
    const recordingMedia = await newS3StoredRecordingForVoiceTask({
      accountSid,
      taskAttributes,
    });
    if (recordingMedia) {
      conversationMedia.push(recordingMedia);
    }
  }

  await saveConversationMedia({
    hrmAccountId: inferHrmAccountId(accountSid, workerName),
    hrmApiVersion,
    contactId,
    conversationMedia,
  });
};

registerTaskRouterEventHandler([TASK_WRAPUP], handleEvent);
