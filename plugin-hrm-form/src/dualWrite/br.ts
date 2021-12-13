import { ITask } from '@twilio/flex-ui';

import { saveContactToSaferNet } from '../services/ServerlessService';
import { getConfig } from '../HrmFormPlugin';
import { getMessage } from '../utils/pluginHelpers';
import { setCustomGoodbyeMessage, getTaskLanguage } from '../utils/setUpActions';

const saveContact = async (task: ITask, payload: any) => {
  const { channelSid } = task.attributes;
  if (!channelSid) return;

  const postSurveyUrl = await saveContactToSaferNet(payload);

  const { helplineLanguage } = getConfig();
  const language = getTaskLanguage({ helplineLanguage })({ task });
  const message = await getMessage('SaferNet-CustomGoodbyeMsg')(language);

  setCustomGoodbyeMessage(`${message} ${postSurveyUrl}`);
};

export default saveContact;
