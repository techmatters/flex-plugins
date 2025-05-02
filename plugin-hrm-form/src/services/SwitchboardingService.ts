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

import fetchProtectedApi from './fetchProtectedApi';
import { updateSwitchboardState, getSwitchboardState } from '../utils/sharedState';

/**
 * Activates or deactivates switchboarding for a specific queue
 * Updates the shared state for all supervisors
 *
 * @param queueSid The SID of the queue to switchboard
 * @returns Promise that resolves when the operation is complete
 */
export const switchboardQueue = async (queueSid: string): Promise<void> => {
  try {
    // Get the current switchboarding state
    const currentState = await getSwitchboardState();
    const isToggling = currentState.isSwitchboardingActive && currentState.queueSid === queueSid;

    // If we're toggling the switchboarding state, we need to call the API
    const body = {
      originalQueueSid: queueSid,
    };

    console.log(`${isToggling ? 'Deactivating' : 'Activating'} switchboarding for queue: ${queueSid}`);
    await fetchProtectedApi('/assignSwitchboarding', body);

    // Get queue details
    const queues = Manager.getInstance()?.store.getState()?.flex?.realtimeQueues?.queuesList;
    const queue = queues ? queues[queueSid] : null;
    const queueName = queue?.friendly_name || queueSid;

    // Get worker details
    const { workerSid } = Manager.getInstance().workerClient;
    const { identity } = Manager.getInstance().user;

    if (isToggling) {
      // Turning off switchboarding
      await updateSwitchboardState({
        isSwitchboardingActive: false,
        queueSid: null,
        queueName: null,
        startTime: null,
        supervisorWorkerSid: null,
      });
    } else {
      // Turning on switchboarding
      const startTime = new Date().toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      await updateSwitchboardState({
        isSwitchboardingActive: true,
        queueSid,
        queueName,
        startTime,
        supervisorWorkerSid: workerSid,
      });
    }
  } catch (err) {
    console.error('Error in switchboardQueue:', err);
    throw err;
  }
};
