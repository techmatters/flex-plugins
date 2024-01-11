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
import * as ProfileSelectors from '../selectors';
import * as profilesListActions from '../profilesList';
import { PAGE_SIZE } from '../profiles';
import asyncDispatch from '../../asyncDispatch';
import usePrevious from '../../../hooks/usePreviousValue';

type UseProfilesListLoaderParams = {
  skipAutoload?: boolean;
};

type UseProfilesListLoaderReturn = {
  updateProfilesListPage: (page: number) => void;
  // loadProfileList: (page: number) => void;
};

/**
 * Load a complete profile list with pagination into redux
 * @param {UseProfilesListLoaderParams}
 * @returns {UseProfilesListLoaderReturn} - State and actions for the profile list
 */
export const useProfilesListLoader = ({
  skipAutoload = false,
}: UseProfilesListLoaderParams = {}): UseProfilesListLoaderReturn => {
  const dispatch = useDispatch();

  const { page, loading, error } =
    useSelector((state: RootState) => ProfileSelectors.selectProfileListState(state)) || {};

  const previousPage = usePrevious(page);

  const updateProfilesListPage = useCallback(
    (page: number) => {
      dispatch(
        profilesListActions.updateProfilesListPage({
          page,
        }),
      );
    },
    [dispatch],
  );

  const loadProfileList = useCallback(
    (page: number) => {
      const offset = page * PAGE_SIZE;
      const limit = PAGE_SIZE;

      asyncDispatch(dispatch)(profilesListActions.loadProfilesListAsync({ offset, limit }));
    },
    [dispatch],
  );

  // Allways trigger load on initial mount
  useEffect(() => {
    if (!skipAutoload && !loading) {
      loadProfileList(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger load only if the page number changed
  useEffect(() => {
    if (previousPage === page || loading || error) return;

    loadProfileList(page);
  }, [error, loadProfileList, loading, page, previousPage]);

  return {
    updateProfilesListPage,
  };
};
