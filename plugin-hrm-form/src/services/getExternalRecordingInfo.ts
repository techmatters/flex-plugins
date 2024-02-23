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

import { getHrmConfig } from '../hrmConfig';
import { isVoiceChannel } from '../states/DomainConstants';
import { CustomITask, InMyBehalfITask, isOfflineContactTask, isTwilioTask } from '../types/types';
import { getExternalRecordingS3Location } from './ServerlessService';

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
  if (!externalRecordingsEnabled) return false;

  return true;
};
/* eslint-enable sonarjs/prefer-single-boolean-return */

export const getExternalRecordingInfo = async (task: CustomITask): Promise<ExternalRecordingInfo> => {
  if (!shouldGetExternalRecordingInfo(task)) {
    return {
      status: 'failure',
      name: 'InvalidTask',
      error: 'Invalid task',
    };
  }

  // The call id related to the worker is always the one with the recording, as far as I can tell (rbd)
  const callSid = isTwilioTask(task) && task.attributes.conference?.participants?.worker;
  if (!callSid) {
    return {
      status: 'failure',
      name: 'NoCallSid',
      error: 'Could not find call sid',
    };
  }

  const { bucket, key, recordingSid } = await getExternalRecordingS3Location(callSid);

  return {
    status: 'success',
    recordingSid,
    bucket,
    key,
  };
};
