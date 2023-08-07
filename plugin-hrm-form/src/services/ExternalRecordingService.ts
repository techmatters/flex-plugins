import { getHrmConfig } from '../hrmConfig';
import { isVoiceChannel } from '../states/DomainConstants';
import { CustomITask, isOfflineContactTask } from '../types/types';
import { getExternalRecordingS3Location } from './ServerlessService';

export type ExternalRecordingUnneeded = {
  status: 'unneeded';
};

export type ExternalRecordingInfoSuccess = {
  status: 'success';
  recordingSid: string;
  bucket: string;
  key: string;
};

type ExternalRecordingInfoFailure = {
  status: 'failure';
  error: string;
};

export const isSuccessfulExternalRecordingInfo = (r) => r && r.status === 'success';
export const isUnneededExternalRecordingInfo = (r) => r && r.status === 'unneeded';
export const isFailureExternalRecordingInfo = (r) => r && r.status === 'failure';

export type ExternalRecordingInfo = ExternalRecordingInfoSuccess | ExternalRecordingUnneeded | ExternalRecordingInfoFailure;

const unneededRecordingInfo: ExternalRecordingUnneeded = {
  status: 'unneeded',
};

export const getExternalRecordingInfo = async (task: CustomITask): Promise<ExternalRecordingInfo> => {
  if (isOfflineContactTask(task)) return unneededRecordingInfo;

  const { channelType } = task;
  if (!isVoiceChannel(channelType)) return unneededRecordingInfo;

  const { externalRecordingsEnabled, hrmBaseUrl } = getHrmConfig();
  if (!externalRecordingsEnabled) return unneededRecordingInfo;

  console.log(JSON.stringify(task.attributes));

  // The call id related to the worker is always the one with the recording, as far as I can tell (rbd)
  const callSid = task.attributes.conference?.participants?.worker;
  if (!callSid) {
    return {
      status: 'failure',
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
