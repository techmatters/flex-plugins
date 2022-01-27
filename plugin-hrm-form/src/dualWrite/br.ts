import { ITask, Manager } from '@twilio/flex-ui';

import { saveContactToSaferNet } from '../services/ServerlessService';
import { getConfig } from '../HrmFormPlugin';
import { getMessage } from '../utils/pluginHelpers';
import { getTaskLanguage } from '../utils/setUpActions';
import { setCustomGoodbyeMessage } from '../states/dualWrite/actions';

const saveContact = async (task: ITask, payload: any) => {
  const { channelSid } = task.attributes;
  if (!channelSid) return;

  const postSurveyUrl = await saveContactToSaferNet(payload);
  const { helplineLanguage } = getConfig();
  const language = getTaskLanguage({ helplineLanguage })({ task });
  const message = await getMessage('SaferNet-CustomGoodbyeMsg')(language);
  const customGoodbyeMessage = `${message} ${postSurveyUrl}`;
  Manager.getInstance().store.dispatch(setCustomGoodbyeMessage(task.taskSid, customGoodbyeMessage));
};

export default saveContact;
