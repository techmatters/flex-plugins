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

import { Manager } from '@twilio/flex-ui';

import { getSwitchboardState } from '../utils/sharedState';
import { fetchBaseApi } from './fetchHrmApi';

/**
 * Activates or deactivates switchboarding for a specific queue
 * Calls the backend API to update the TaskRouter workflow and updates Twilio Sync state
 *
 * @param queueSid The SID of the queue to switchboard
 * @returns Promise that resolves when the operation is complete
 */
/**
 * Constructs the account-scoped lambda path with the proper prefix and account SID
 * @param path The path to the lambda function, without prefix or account SID
 * @returns The full path including prefix and account SID
 */
const getAccountScopedPath = (path: string): string => {
  const accountSid = Manager.getInstance().serviceConfiguration.account_sid;
  return `/lambda/twilio/account-scoped/${accountSid}/${path}`;
};

export const toggleSwitchboardingForQueue = async (queueSid: string): Promise<void> => {
  try {
    if (!queueSid || typeof queueSid !== 'string') {
      throw new Error('Invalid queue SID provided');
    }

    const currentState = await getSwitchboardState();
    const isDisabling = currentState.isSwitchboardingActive && currentState.queueSid === queueSid;
    const operation = isDisabling ? 'disable' : 'enable';

    const body = {
      originalQueueSid: queueSid,
      operation,
    };

    await fetchBaseApi(getAccountScopedPath('/toggleSwitchboardQueue'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('403')) {
        throw new Error('You do not have permission to control switchboarding. Please contact an administrator.');
      } else if (err.message.includes('500')) {
        throw new Error(
          'The switchboarding service is currently unavailable. Please try again later or contact support.',
        );
      } else if (err.message.includes('token')) {
        throw new Error('Your session may have expired. Please refresh the page and try again.');
      }
    }

    throw err;
  }
};
