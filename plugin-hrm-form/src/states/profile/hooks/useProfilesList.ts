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
import { useCallback } from 'react';

import { ProfilesListState } from '../types';
import * as profilesListActions from '../profilesList';
import { selectProfileListState, selectProfileListSettings } from '../selectors';
import { useProfilesListLoader } from './useProfilesListLoader';

export const useProfilesList = ({ autoload = true }: { autoload?: boolean }) => {
  const dispatch = useDispatch();
  useProfilesListLoader({ autoload });

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

  const updateProfilesListSettings = useCallback(
    (settings: Partial<ProfilesListState['settings']>) => {
      dispatch(profilesListActions.updateProfileListSettings(settings));
    },
    [dispatch],
  );

  return {
    ...useSelector(selectProfileListState),
    updateProfilesListPage,
    updateProfilesListSettings,
  };
};

export const useProfilesListSettings = (): ProfilesListState['settings'] => {
  return useSelector(selectProfileListSettings);
};
