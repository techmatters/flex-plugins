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

import { updateSwitchboardState, setSwitchboardLoading, setSwitchboardError } from './actions';
import { toggleSwitchboardingForQueue } from '../../services/SwitchboardService';
import { RootState } from '..';
import { SwitchboardState } from './types';
import { namespace, switchboardBase } from '../storeNamespaces';
import { sharedSyncClient } from '../../utils/sharedState';
import { 
  SwitchboardSyncState, 
  SWITCHBOARD_DOCUMENT_NAME, 
  DEFAULT_SWITCHBOARD_STATE 
} from '@tech-matters/hrm-types';

/**
 * Initialize or get the switchboard document from Twilio Sync
 * @returns Twilio Sync document
 */
const initSwitchboardSyncDocument = () => {
  try {
    return sharedSyncClient.document(SWITCHBOARD_DOCUMENT_NAME);
  } catch (error) {
    return sharedSyncClient.document({
      id: SWITCHBOARD_DOCUMENT_NAME,
      data: DEFAULT_SWITCHBOARD_STATE,
      ttl: 48 * 60 * 60, // 48 hours
    });
  }
};

/**
 * Get the current switchboard state
 * @returns Current switchboarding state
 */
export const getSwitchboardState = async (): Promise<SwitchboardSyncState> => {
  try {
    const doc = await initSwitchboardSyncDocument();
    return doc.data as SwitchboardSyncState;
  } catch (error) {
    console.error('Error getting switchboard state:', error);
    throw error;
  }
};

/**
 * Subscribe to switchboarding state changes
 * @param callback Function to call when switchboarding state changes: (state: SwitchboardSyncState) => void
 * @returns Function to unsubscribe from updates: () => void
 */
const subscribeSwitchboardState = async (callback: (state: SwitchboardSyncState) => void): Promise<() => void> => {
  try {
    const doc = await initSwitchboardSyncDocument();

    const handler = (event: { data: unknown }) => {
      callback(event.data as SwitchboardSyncState);
    };

    doc.on('updated', handler);
    callback(doc.data as SwitchboardSyncState);

    return () => {
      doc.off('updated', handler);
    };
  } catch (error) {
    console.error('Error subscribing to switchboard state:', error);
    throw error;
  }
};

export const useSwitchboardState = (): SwitchboardState => {
  return useSelector((state: RootState) => state[namespace][switchboardBase]);
};

/**
 * Hook to subscribe to the switchboard state from the Twilio Sync service and update the Redux store
 * @returns Cleanup function to unsubscribe from updates
 */
export const useSubscribeToSwitchboardState = (): void => {
  const dispatch = useDispatch();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeSwitchboardState = async () => {
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

    initializeSwitchboardState();

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
export const useToggleSwitchboardingForQueue = (): ((
  queueSid: string,
  supervisorWorkerSid?: string,
) => Promise<void>) => {
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
