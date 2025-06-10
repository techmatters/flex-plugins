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

import { SwitchboardSyncState } from 'hrm-types';

import { getSwitchboardState } from './SyncService';
import fetchProtectedApi from './fetchProtectedApi';

/**
 * Activate or deactivate switchboarding for a specific queue
 * Calls the backend API to update the TaskRouter workflow and updates Twilio Sync state
 *
 * @param queueSid The SID of the queue to switchboard
 * @returns Promise that resolves when the operation is complete
 */

export const toggleSwitchboardingForQueue = async (
  queueSid: string,
  supervisorWorkerSid: string,
): Promise<SwitchboardSyncState> => {
  try {
    if (!queueSid || typeof queueSid !== 'string' || !supervisorWorkerSid || typeof supervisorWorkerSid !== 'string') {
      throw new Error('Invalid queue SID or supervisor worker SID provided');
    }

    const currentState = await getSwitchboardState();
    // Check if the document exists and has actual data with required properties
    const hasActiveState = Boolean(currentState?.data && Object.keys(currentState.data).length > 0);
    const isDisabling = hasActiveState;
    console.log('>>> currentState', currentState?.data);
    console.log('>>> isDisabling', isDisabling);
    const operation = isDisabling ? 'disable' : 'enable';

    const body = {
      originalQueueSid: queueSid,
      operation,
      supervisorWorkerSid,
    };
    console.log('>>> body', body);

    const response = await fetchProtectedApi('/toggleSwitchboardQueue', body, {
      useTwilioLambda: true,
    });
    console.log('>>> response from lambda', response);
    return response;
  } catch (err) {
    if (err instanceof Error) {
      const errors = {
        '403': 'You do not have permission to control switchboarding. Please contact a supervisor.',
        '500': 'The switchboarding service is currently unavailable. Please try again later or contact support.',
        token: 'Your session may have expired. Please refresh the page and try again.',
      };

      const errorKey = Object.keys(errors).find(key => err.message.includes(key));
      if (errorKey) throw new Error(errors[errorKey]);
    }
    throw err;
  }
};
