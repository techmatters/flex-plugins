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

import { Dispatch } from 'redux';

import { subscribeSwitchboardState } from '../utils/sharedState';
import { 
  updateSwitchboardState, 
  setSwitchboardLoading, 
  setSwitchboardError 
} from '../states/switchboard/actions';
import { toggleSwitchboardingForQueue } from './SwitchboardService';

/**
 * Initialize the switchboard state in Redux by subscribing to the Twilio Sync service
 * @param dispatch Redux dispatch function
 * @returns Function to unsubscribe from updates
 */
export const initializeSwitchboardState = async (dispatch: Dispatch): Promise<() => void> => {
  try {
    dispatch(setSwitchboardLoading(true));
    
    // Subscribe to the switchboard state updates from Twilio Sync
    const unsubscribe = await subscribeSwitchboardState(state => {
      // Update the Redux state when the Twilio Sync state changes
      dispatch(updateSwitchboardState({
        isSwitchboardingActive: state.isSwitchboardingActive,
        queueSid: state.queueSid,
        queueName: state.queueName,
        startTime: state.startTime,
        supervisorWorkerSid: state.supervisorWorkerSid,
      }));
      
      dispatch(setSwitchboardLoading(false));
    });

    return unsubscribe;
  } catch (err) {
    const errorMessage = 'Failed to connect to switchboard state. Please refresh the page or contact support.';
    console.error('Error initializing switchboard subscription:', err);
    dispatch(setSwitchboardError(errorMessage));
    dispatch(setSwitchboardLoading(false));
    throw err;
  }
};

/**
 * Toggle switchboarding for a queue through the Redux dispatch
 * @param queueSid The SID of the queue to switchboard
 * @param dispatch Redux dispatch function
 */
export const toggleSwitchboardingForQueueRedux = async (queueSid: string, dispatch: Dispatch): Promise<void> => {
  try {
    dispatch(setSwitchboardLoading(true));
    dispatch(setSwitchboardError(null));
    
    await toggleSwitchboardingForQueue(queueSid);
    
    // Note: State will be updated via the Sync subscription
  } catch (error) {
    console.error('Error in switchboarding:', error);
    const errorMessage = 'Failed to activate switchboarding. Please try again or contact support.';
    dispatch(setSwitchboardError(errorMessage));
    dispatch(setSwitchboardLoading(false));
    throw error;
  }
};
