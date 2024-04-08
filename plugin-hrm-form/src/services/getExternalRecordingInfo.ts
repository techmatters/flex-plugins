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

import { TaskHelper } from '@twilio/flex-ui';

import { getHrmConfig } from '../hrmConfig';
import { isVoiceChannel } from '../states/DomainConstants';
import { CustomITask, InMyBehalfITask, isOfflineContactTask, isTwilioTask } from '../types/types';
import { getExternalRecordingS3Location } from './ServerlessService';
import { recordEvent } from '../fullStory';

export type ExternalRecordingInfoSuccess = {
  status: 'success';
  recordingSid: string;
  bucket: string;
  key: string;
};

type ExternalRecordingInfoFailure = {
  status: 'failure';
  name: string;
  error: string;
};

export const isSuccessfulExternalRecordingInfo = (r: any): r is ExternalRecordingInfoSuccess => {
  return r && r.status === 'success';
};

export const isFailureExternalRecordingInfo = (r: any): r is ExternalRecordingInfoFailure => {
  return r && r.status === 'failure';
};

export type ExternalRecordingInfo = ExternalRecordingInfoSuccess | ExternalRecordingInfoFailure;

/* eslint-disable sonarjs/prefer-single-boolean-return */
export const shouldGetExternalRecordingInfo = (task: CustomITask): task is InMyBehalfITask => {
  if (isOfflineContactTask(task)) return false;

  const { channelType } = task;
  if (!isVoiceChannel(channelType)) return false;

  const { externalRecordingsEnabled } = getHrmConfig();
  return Boolean(externalRecordingsEnabled);
};
/* eslint-enable sonarjs/prefer-single-boolean-return */
const recordDebugEvent = (task: InMyBehalfITask, message: string, recordingInfo: ExternalRecordingInfo | {} = {}) => {
  recordEvent(`[Temporary Debug Event] Getting External Recording Info: ${message}`, {
    ...recordingInfo,
    taskSid: task.taskSid,
    taskStatus: task.status,
    reservationSid: task.sid,
    isCallTask: TaskHelper.isCallTask(task),
    isChatBasedTask: TaskHelper.isChatBasedTask(task),
    conferenceAttributes: JSON.stringify(task.attributes.conference),
    conversationAttributes: JSON.stringify(task.attributes.conversations),
    taskAttributes: JSON.stringify(task.attributes),
  });
};

export const getExternalRecordingInfo = async (task: CustomITask): Promise<ExternalRecordingInfo> => {
  if (!shouldGetExternalRecordingInfo(task)) {
    return {
      status: 'failure',
      name: 'InvalidTask',
      error: 'Invalid task',
    };
  }
  recordDebugEvent(task, 'Starting');

  // The call id related to the worker is always the one with the recording, as far as I can tell (rbd)
  const { conference, conversation } = isTwilioTask(task) && task.attributes;
  if (conversation?.segment_link) {
  }
  if (!conference) {
    const result: ExternalRecordingInfo = {
      status: 'failure',
      name: 'NoConference',
      error: `Could not find a conference attached to task attributes ${task.taskSid}`,
    };
    recordDebugEvent(task, 'Error', result);
    return result;
  }

  const { participants } = isTwilioTask(task) && conference;
  if (!participants) {
    const result: ExternalRecordingInfo = {
      status: 'failure',
      name: 'NoParticipants',
      error: `Could not find a participants attached to conference for task ${task.taskSid}`,
    };
    recordDebugEvent(task, 'Error', result);
    return result;
  }

  const callSid = participants.worker;
  if (!callSid) {
    const result: ExternalRecordingInfo = {
      status: 'failure',
      name: 'NoCallSid',
      error: 'Could not find call sid',
    };
    recordDebugEvent(task, 'Error', result);
    return result;
  }

  const { bucket, key, recordingSid } = await getExternalRecordingS3Location(callSid);

  const successResult: ExternalRecordingInfo = {
    status: 'success',
    recordingSid,
    bucket,
    key,
  };
  recordDebugEvent(task, 'Success', successResult);
  return successResult;
};
