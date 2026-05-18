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

import { ITask, Manager } from '@twilio/flex-ui';

import { saveContactToSaferNet } from '../services/ServerlessService';
import { getMessage } from '../translations';
import { setCustomGoodbyeMessage } from '../states/dualWrite/actions';
import { getHrmConfig } from '../hrmConfig';
import { getTaskLanguage } from '../utils/task';

const saveContact = async (task: ITask, payload: any) => {
  const { channelSid } = task.attributes;
  if (!channelSid) return;

  const postSurveyUrl = await saveContactToSaferNet(payload);
  const { helplineLanguage } = getHrmConfig();
  const language = getTaskLanguage({ helplineLanguage })(task);
  const message = await getMessage('SaferNet-CustomGoodbyeMsg')(language);
  const customGoodbyeMessage = `${message} ${postSurveyUrl}`;
  Manager.getInstance().store.dispatch(setCustomGoodbyeMessage(task.taskSid, customGoodbyeMessage));
};

export default saveContact;
