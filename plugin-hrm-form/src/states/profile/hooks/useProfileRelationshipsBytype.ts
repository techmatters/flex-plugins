/* eslint-disable import/no-unused-modules */
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

import { selectProfileRelationshipsByType } from '../selectors';
import asyncDispatch from '../../asyncDispatch';
import { ProfileRelationships } from '../types';
import * as ProfileActions from '../profiles';
import { RootState } from '../..';
import { UseProfileCommonParams } from './types';

export type UseProfileRelationsByType = UseProfileCommonParams & {
  type: ProfileRelationships;
  page: number;
};

export const useProfileRelationshipsLoaderByType = ({ profileId, type, page }: UseProfileRelationsByType) => {
  const dispatch = useDispatch();

  const loadProfileRelationshipsByTypeAsync = useCallback(
    (params: ProfileActions.LoadRelationshipAsyncParams) => {
      asyncDispatch(dispatch)(ProfileActions.loadRelationshipAsync(params));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!profileId) return;

    loadProfileRelationshipsByTypeAsync({ profileId, type, page });
  }, [profileId, loadProfileRelationshipsByTypeAsync, type, page]);

  const error = useSelector((state: RootState) => selectProfileRelationshipsByType(state, profileId, type))?.error;
  const loading = useSelector((state: RootState) => selectProfileRelationshipsByType(state, profileId, type))?.loading;

  return {
    error,
    loading,
    loadProfileRelationshipsByTypeAsync,
  };
};

export const useProfileRelationshipsByType = ({ profileId, type, page }: UseProfileRelationsByType) => {
  // Triggerr a load on the profile relationships
  useProfileRelationshipsLoaderByType({ profileId, type, page });

  const data = useSelector((state: RootState) => selectProfileRelationshipsByType(state, profileId, type))?.data;
  const error = useSelector((state: RootState) => selectProfileRelationshipsByType(state, profileId, type))?.error;
  const loading = useSelector((state: RootState) => selectProfileRelationshipsByType(state, profileId, type))?.loading;
  const currentPage = useSelector((state: RootState) => selectProfileRelationshipsByType(state, profileId, type))?.page;
  const total = useSelector((state: RootState) => selectProfileRelationshipsByType(state, profileId, type))?.total;

  return {
    data,
    error,
    loading,
    page: currentPage,
    total,
  };
};
