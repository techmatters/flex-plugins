import { TaskQueueSID } from './types/twilio';
import { getHrmConfig } from './hrmConfig';

export const getVoicePostStudioFlowSettings = (
  queueSid: TaskQueueSID,
): ReturnType<typeof getHrmConfig>['postStudioFlows']['voice'] => {
  const { postStudioFlows } = getHrmConfig();
  return postStudioFlows[queueSid] ?? postStudioFlows.voice;
};
