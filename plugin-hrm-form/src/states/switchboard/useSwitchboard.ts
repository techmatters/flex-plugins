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

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';

import { subscribeSwitchboardState, initSwitchboardSyncDocument } from '../../utils/sharedState';
import { updateSwitchboardState, setSwitchboardLoading, setSwitchboardError } from './actions';
import { toggleSwitchboardingForQueue } from '../../services/SwitchboardService';
import { RootState } from '..';
import { SwitchboardState } from './types';
import { namespace, switchboardBase } from '../storeNamespaces';

export const useSwitchboardState = (): SwitchboardState => {
  return useSelector((state: RootState) => state[namespace][switchboardBase]);
};

/**
 * Hook to initialize the switchboard state in Redux by subscribing to the Twilio Sync service
 * @returns Cleanup function to unsubscribe from updates
 */
export const useInitializeSwitchboard = (): void => {
  const dispatch = useDispatch();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      try {
        dispatch(setSwitchboardLoading(true));

        unsubscribe = await subscribeSwitchboardState(state => {
          dispatch(
            updateSwitchboardState({
              isSwitchboardingActive: state.isSwitchboardingActive,
              queueSid: state.queueSid,
              queueName: state.queueName,
              startTime: state.startTime,
              supervisorWorkerSid: state.supervisorWorkerSid,
            }),
          );

          dispatch(setSwitchboardLoading(false));
        });
      } catch (err) {
        const errorMessage = 'Failed to connect to switchboard state. Please refresh the page or contact support.';
        console.error('Error initializing switchboard subscription:', err);
        dispatch(setSwitchboardError(errorMessage));
        dispatch(setSwitchboardLoading(false));
      }
    };

    initialize();

    // Cleanup function to unsubscribe
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch]);
};

/**
 * Hook that provides a function to toggle switchboarding for a queue
 * @returns Function to toggle switchboarding for a queue
 */
export const useToggleSwitchboardingForQueue = (): ((queueSid: string, supervisorWorkerSid?: string) => Promise<void>) => {
  const dispatch = useDispatch();

  return useCallback(
    async (queueSid: string, supervisorWorkerSid?: string): Promise<void> => {
      try {
        dispatch(setSwitchboardLoading(true));
        dispatch(setSwitchboardError(null));

        const response = await toggleSwitchboardingForQueue(queueSid, supervisorWorkerSid);

        if (response && typeof response === 'object') {
          const newState = {
            isSwitchboardingActive: response.isSwitchboardingActive,
            queueSid: response.queueSid,
            queueName: response.queueName,
            startTime: response.startTime,
            supervisorWorkerSid: response.supervisorWorkerSid,
          };
          
          dispatch(updateSwitchboardState(newState));
          
          try {
            const syncDoc = await initSwitchboardSyncDocument();
            await syncDoc.update(newState);
          } catch (syncError) {
            console.error('Failed to update Sync document:', syncError);
          }
        }

        dispatch(setSwitchboardLoading(false));
      } catch (error) {
        const errorMessage = 'Failed to activate switchboarding. Please try again or contact support.';
        dispatch(setSwitchboardError(errorMessage));
        dispatch(setSwitchboardLoading(false));
        throw error;
      }
    },
    [dispatch],
  );
};
