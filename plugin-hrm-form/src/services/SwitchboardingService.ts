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
import fetchProtectedApi from './fetchProtectedApi';
import { TaskSID } from '../types/twilio';
import { ApiError } from './fetchApi';

/**
 * Switchboarding service
 */

// eslint-disable-next-line import/no-unused-modules
export const switchboardingQueue = async (taskSid: TaskSID, queueSid: string): Promise<void> => {
  // export type Body = {
  //   taskSid?: string;
  //   originalQueueSid?: string;
  //   targetSid?: string;
  //   request: { cookies: {}; headers: {} };
  //   Token: string;
  // };

  const body = {
    taskSid,
    originalQueueSid: queueSid,
  };

  // return fetchProtectedApi('/assignSwitchboarding', body);
  try {
    return await fetchProtectedApi('/assignSwitchboarding', body);
  } catch (err) {
    throw new ApiError(err.message, { response: err.response, body: err.body });
  }
};
