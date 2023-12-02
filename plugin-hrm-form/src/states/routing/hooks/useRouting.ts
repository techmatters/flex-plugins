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
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import { LocationDescriptor, LocationDescriptorObject } from 'history';

import { RootState } from '../..';
import { RouterTask } from '../../../types/types';
import { selectRoutingStateByTaskId } from '../selectors';

type UseRoutingParams = {
  taskSid: string;
};

const useRouting = ({ taskSid }: RouterTask) => {
  const history = useHistory();
  const fullLocation = useLocation();
  const dispatch = useDispatch();

  // Remove the key from the location object, as it changes on every route change
  const location = omit(fullLocation, ['key']);

  const { basePath, current } = useSelector((state: RootState) => selectRoutingStateByTaskId(state, taskSid)) || {};

  const initRouting = useCallback(
    (basePath: string) => {
      dispatch({ type: 'HistoryInit', payload: { basePath } });
    },
    [dispatch],
  );

  useEffect(() => {
    const cleanup = history.listen(location => {
      console.log('>>>history.listen', { location });
      dispatch({ type: 'HistoryChange', payload: { location } });
    });
    return () => {
      cleanup();
    };
  }, [history, dispatch]);

  return {
    basePath,
    current,
    fullLocation,
    location,
    history,
    initRouting,
  };
};

export default useRouting;
