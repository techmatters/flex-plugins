/*
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

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import asyncDispatch from '../../asyncDispatch';
import { selectCaseByCaseId } from '../selectCaseStateByCaseId';
import type { Case } from '../../../types/types';
import type { RootState } from '../..';
import { useLoadWithRetry } from '../../hooks/useLoadWithRetry';
import { newGetTimelineAsyncAction, PaginationSettings, selectTimeline } from '../timeline';

const useCaseSectionsLoader = ({
  caseId,
  sectionType,
  paginationSettings,
  autoload = true,
  refresh = true,
}: {
  caseId: Case['id'];
  sectionType: string;
  paginationSettings: PaginationSettings;
  autoload?: boolean;
  refresh?: boolean;
}) => {
  const dispatch = useDispatch();

  // const error = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.error);
  // const loading = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.loading);
  const connectedCase = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.connectedCase);

  const exists = Boolean(connectedCase);

  const { limit, offset } = paginationSettings;

  const loadCaseSections = useCallback(() => {
    if (!caseId) {
      return;
    }

    asyncDispatch(dispatch)(newGetTimelineAsyncAction(caseId, sectionType, [sectionType], false, { offset, limit }));
  }, [caseId, dispatch, limit, offset, sectionType]);

  const safeToLoad = Boolean(caseId) && exists;
  const shouldLoad = autoload || refresh;

  // TODO: add error and loading states
  const error = null;
  const loading = false;

  const loader = useLoadWithRetry({
    error,
    loadFunction: loadCaseSections,
    loading,
    retry: true,
    safeToLoad,
    shouldLoad,
  });

  return {
    ...loader,
    error,
    loading,
  };
};

// eslint-disable-next-line import/no-unused-modules
export const useCaseSections = ({
  caseId,
  sectionType,
  paginationSettings,
  autoload = true,
  refresh = false,
}: {
  caseId: Case['id'];
  sectionType: string;
  paginationSettings: PaginationSettings;
  autoload?: boolean;
  refresh?: boolean;
}) => {
  const sections =
    useSelector((state: RootState) => selectTimeline(state, caseId, sectionType, paginationSettings)) || [];

  return {
    sections,
    ...useCaseSectionsLoader({ caseId, sectionType, autoload, refresh, paginationSettings }),
  };
};
