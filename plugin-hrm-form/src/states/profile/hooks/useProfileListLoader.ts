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
import { useCallback, useEffect } from 'react';

import { RootState } from '../..';
import asyncDispatch from '../../asyncDispatch';
import * as ProfileSelectors from '../selectors';
import { loadProfileListAsync } from '../profileList';

type UseProfileListLoaderParams = {
  skipAutoload?: boolean;
  options?: any; // filters, pagination, etc
};

type UseProfileListLoaderReturn = {
  error?: any;
  loading: boolean;
  loadProfileList: () => void;
};

/**
 * Load a complete profile list with pagination into redux
 * @param {UseProfileListLoaderParams}
 * @returns {UseProfileListLoaderReturn} - State and actions for the profile list
 */
export const useProfileListLoader = ({
  skipAutoload = false,
  options, // filters, pagination, etc
}: UseProfileListLoaderParams = {}): UseProfileListLoaderReturn => {
  const dispatch = useDispatch();

  const error = useSelector((state: RootState) => ProfileSelectors.selectProfileListState(state)?.error);
  const loading = useSelector((state: RootState) => ProfileSelectors.selectProfileListState(state)?.loading);

  const loadProfileList = useCallback(() => {
    if (!loading && !error) {
      dispatch(loadProfileListAsync());
    }
  }, [dispatch, loading, error]);

  useEffect(() => {
    if (!skipAutoload && !loading) {
      loadProfileList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    error,
    loading,
    loadProfileList,
  };
};
