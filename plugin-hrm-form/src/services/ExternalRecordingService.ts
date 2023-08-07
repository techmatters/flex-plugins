import { getHrmConfig } from '../hrmConfig';
import { isVoiceChannel } from '../states/DomainConstants';
import { CustomITask, ExternalRecordingInfo, isOfflineContactTask } from '../types/types';
import { getExternalRecordingS3Location } from './ServerlessService';

export const getExternalRecordingInfo = async (task: CustomITask): Promise<ExternalRecordingInfo | {}> => {
  if (isOfflineContactTask(task)) return {};

  const { channelType } = task;
  if (!isVoiceChannel(channelType)) return {};

  const { externalRecordingsEnabled, hrmBaseUrl } = getHrmConfig();
  if (!externalRecordingsEnabled) return {};

  console.log(JSON.stringify(task.attributes));

  // The call id related to the worker is always the one with the recording, as far as I can tell (rbd)
  const callSid = task.attributes.conference?.participants?.worker;
  if (!callSid) return {};

  const { bucket, key, recordingSid } = await getExternalRecordingS3Location(callSid);

  return {
    recordingSid,
    bucket,
    key,
    urlProvider: `${hrmBaseUrl}/lambda/getSignedS3Url?method=getObject&bucket=${bucket}&key=${key}`,
  };
};
