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
import { getSwitchboardState, subscribeSwitchboardNotify } from '../../services/SyncService';
import { isErr } from '../../types/Result';

const useSwitchboardState = (): SwitchboardState => {
  return useSelector((state: RootState) => state[namespace][switchboardBase]);
};

/**
 * Hook to subscribe to the switchboard state from the Twilio Sync service and update the Redux store
 * @returns Cleanup function to unsubscribe from updates
 */
const useSubscribeSwitchboardNotify = (): void => {
  const dispatch = useDispatch();

  const handleError = useCallback(
    err => {
      const errorMessage = 'Failed to connect to switchboard state. Please refresh the page or contact support.';
      console.error('Error initializing switchboard subscription:', err);
      dispatch(setSwitchboardError(errorMessage));
      dispatch(setSwitchboardLoading(false));
    },
    [dispatch],
  );

  const onUpdate = useCallback(async () => {
    dispatch(setSwitchboardLoading(true));
    const switchboardStateResult = await getSwitchboardState();

    if (isErr(switchboardStateResult)) {
      handleError(switchboardStateResult.error);
      return;
    }

    const { documentData } = switchboardStateResult.data;

    dispatch(updateSwitchboardState(documentData));
    dispatch(setSwitchboardLoading(false));
  }, [dispatch, handleError]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const switchboardSubscribe = async () => {
      try {
        dispatch(setSwitchboardLoading(true));

        onUpdate();
        const subscribeResult = await subscribeSwitchboardNotify({
          onUpdate,
        });

        if (isErr(subscribeResult)) {
          handleError(subscribeResult.error);
          return;
        }

        dispatch(setSwitchboardLoading(false));
        // eslint-disable-next-line prefer-destructuring
        unsubscribe = subscribeResult.data.unsubscribe;
      } catch (err) {}
    };

    switchboardSubscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch, handleError, onUpdate]);
};

/**
 * Hook that provides a function to toggle switchboarding for a queue
 * @returns Function to toggle switchboarding for a queue
 */
export const useSwitchboard = () => {
  const dispatch = useDispatch();
  const state = useSwitchboardState();
  useSubscribeSwitchboardNotify();

  const toggleSwitchboard = useCallback(
    async ({
      queueSid,
      supervisorWorkerSid,
      operation,
    }: {
      queueSid: string;
      supervisorWorkerSid?: string;
      operation: 'disable' | 'enable';
    }): Promise<void> => {
      try {
        dispatch(setSwitchboardLoading(true));
        dispatch(setSwitchboardError(null));

        const response = await toggleSwitchboardingForQueue({ queueSid, supervisorWorkerSid, operation });

        if (response && typeof response === 'object') {
          const newState = {
            isSwitchboardingActive: response.isSwitchboardingActive,
            queueSid: response.queueSid,
            queueName: response.queueName,
            startTime: response.startTime,
            supervisorWorkerSid: response.supervisorWorkerSid,
          };

          dispatch(updateSwitchboardState(newState));
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

  return { state, toggleSwitchboard };
};
