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

import { getAseloFeatureFlags } from '../hrmConfig';
import fetchProtectedApi from './fetchProtectedApi';

/**
 * Sends a new message to the channel bounded to the provided taskSid. Optionally you can change the "from" value (default is "system").
 */
export const sendSystemMessage = async (body: { taskSid: ITask['taskSid']; message: string; from?: string }) => {
  const { use_twilio_lambda_to_send_messages: useTwilioLambda } = getAseloFeatureFlags();
  const pathRoot = useTwilioLambda ? '/conversation' : '';
  return fetchProtectedApi(`${pathRoot}/sendSystemMessage`, body, { useTwilioLambda });
};
