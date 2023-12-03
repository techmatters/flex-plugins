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
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { LocationDescriptorObject } from 'history';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

import { RootState } from '../..';
import { RouterTask } from '../../../types/types';
import { selectRoutingStateByTaskId } from '../selectors';

// Remove the key from the location object, as it changes on every route change
const standardizeLocation = (location: LocationDescriptorObject) => omit(location, ['key', 'state']);

const useRoutingHistory = () => {
  const history = useHistory();
  const { goBack, push: pushRoute, replace: replaceRoute } = history;

  return {
    history,
    goBack,
    pushRoute,
    replaceRoute,
  };
};

const useRoutingLocation = () => {
  const fullLocation = useLocation();
  const location = standardizeLocation(fullLocation);

  return {
    fullLocation,
    location,
  };
};

const useModalRouting = (task: RouterTask) => {
  const { pushRoute } = useRoutingHistory();
  const { location } = useRoutingLocation();

  const getSearchParams = useCallback(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);
  const searchParams = getSearchParams();

  const getActiveModals = useCallback(() => {
    return searchParams.get('activeModals')?.split(',') || [];
  }, [searchParams]);
  const activeModals = getActiveModals();
  const activeModal = activeModals[activeModals.length - 1];

  const getModalParams = useCallback(() => {
    const modalParams = searchParams.get('modalParams');
    return modalParams ? JSON.parse(atob(modalParams)) : undefined;
  }, [searchParams]);
  const modalParams = getModalParams();
  const activeModalParams = modalParams?.[activeModal];

  const openModal = useCallback(
    <T>(modal: string, params: T) => {
      if (!activeModals.includes(modal)) {
        activeModals.push(modal);
      }
      searchParams.set('activeModals', activeModals.join(','));
      const newModalParams = {
        ...modalParams,
        [modal]: params,
      };
      searchParams.set('modalParams', btoa(JSON.stringify(newModalParams)));

      pushRoute({ search: searchParams.toString() });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams],
  );

  const closeModal = useCallback(() => {
    activeModals.pop();
    searchParams.set('activeModals', activeModals.join(','));

    const modalParams = omit(activeModalParams, [activeModal]);
    searchParams.set('modalParams', btoa(JSON.stringify(modalParams)));

    pushRoute({ search: searchParams.toString() });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateModalParams = useCallback(
    <T>(params: T) => {
      searchParams.set(
        'modalParams',
        btoa(JSON.stringify({ ...modalParams, [activeModal]: { activeModalParams, ...params } })),
      );
      pushRoute({ search: searchParams.toString() });
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams],
  );

  return {
    activeModal,
    activeModalParams,
    openModal,
    closeModal,
    updateModalParams,
  };
};

const useRouting = (task: RouterTask) => {
  const dispatch = useDispatch();
  // @ts-ignore
  const taskSid = task?.sid || task?.taskSid;
  const routingHistory = useRoutingHistory();
  const { replaceRoute, history } = routingHistory;

  const routingLocation = useRoutingLocation();
  const { location } = routingLocation;

  const { basePath, current } = useSelector((state: RootState) => selectRoutingStateByTaskId(state, taskSid)) || {};

  useEffect(() => {
    console.log('>>>useRouting-listenerUseEffect', { taskSid, basePath, current, location });
    const unregister = history.listen(location => {
      console.log('>>>history.listen', { location });
      if (!location.pathname.startsWith(basePath)) return;
      dispatch({ type: 'HistoryChange', payload: { taskSid, location } });
    });
    return () => {
      console.log('>>>useRouting-listenerUseEffect-unregister', { taskSid });
      unregister();
    };
  }, [basePath, dispatch, history, taskSid]);

  const initRouting = useCallback(
    (newBasePath: string) => {
      if (!taskSid) return;
      console.log('>>>initRouting', {
        taskSid,
        newBasePath,
        current,
        location,
        isEqual: isEqual(standardizeLocation(location), current),
      });

      if (!basePath) {
        dispatch({
          type: 'HistoryInit',
          payload: {
            taskSid,
            basePath: newBasePath,
            current: location,
          },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [basePath, current, dispatch, location, taskSid],
  );

  return {
    basePath,
    current,
    taskSid,
    initRouting,
    ...routingHistory,
    ...routingLocation,
    ...useModalRouting(task),
  };
};

export default useRouting;
