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
import { useCallback, useRef } from 'react';

import { RootState } from '../..';
import * as ProfileSelectors from '../selectors';
import * as profilesListActions from '../profilesList';
import { PAGE_SIZE } from '../profiles';
import asyncDispatch from '../../asyncDispatch';
import usePrevious from '../../../hooks/usePreviousValue';
import { useLoadWithRetry } from '../../hooks/useLoadWithRetry';

type UseProfilesListLoaderParams = {
  autoload?: boolean;
};

/**
 * Load a complete profile list with pagination into redux
 */
export const useProfilesListLoader = ({ autoload = false }: UseProfilesListLoaderParams = {}) => {
  const { page, settings, loading, error } =
    useSelector((state: RootState) => ProfileSelectors.selectProfileListState(state)) || {};

  const previousPage = usePrevious(page);
  const previousSettings = usePrevious(settings);

  const dispatch = useDispatch();

  const firstLoad = useRef(true);

  const loadProfileList = useCallback(() => {
    firstLoad.current = false;
    const offset = page * PAGE_SIZE;
    const limit = PAGE_SIZE;

    const {
      sort: { sortBy, sortDirection },
      filter: { statuses },
    } = settings;

    asyncDispatch(dispatch)(
      profilesListActions.loadProfilesListAsync({ offset, limit, sortBy, sortDirection, profileFlagIds: statuses }),
    );
  }, [dispatch, page, settings]);

  const safeToLoad = true;

  const isOnFirstLoad = firstLoad.current && autoload && !loading;
  const shouldTriggerOnUpdate = autoload && (previousPage !== page || previousSettings !== settings); // Trigger load only if the page number or the settings changed
  const isOnUpdateLoad = shouldTriggerOnUpdate && !loading && !error;
  const shouldLoad = isOnFirstLoad || isOnUpdateLoad;

  return useLoadWithRetry({
    error,
    loading,
    loadFunction: loadProfileList,
    retry: true,
    safeToLoad,
    shouldLoad,
  });
};
