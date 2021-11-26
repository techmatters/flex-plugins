import { Actions as FlexActions, ITask } from '@twilio/flex-ui';

import { saveContactToSaferNet } from '../services/ServerlessService';

const saveContact = async (task: ITask, payload: any) => {
  const { channelSid } = task.attributes;
  if (!channelSid) return;

  const postSurveyUrl = await saveContactToSaferNet(payload);

  // TODO: Pre-pend something like 'Please answer the following survey: '
  await FlexActions.invokeAction('SendMessage', {
    body: postSurveyUrl,
    channelSid,
  });
};

export default saveContact;
