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

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import asyncDispatch from '../../asyncDispatch';
import * as CaseActions from '../singleCase';
import { selectCaseByCaseId } from '../selectCaseStateByCaseId';
import type { Case } from '../../../types/types';
import type { RootState } from '../..';
import { useLoadWithRetry } from '../../hooks/useLoadWithRetry';

const useCaseLoader = ({
  caseId,
  referenceId,
  autoload = true,
  refresh = true,
}: {
  caseId: Case['id'];
  referenceId: string;
  autoload?: boolean;
  refresh?: boolean;
}) => {
  const dispatch = useDispatch();

  const error = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.error);
  const loading = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.loading);
  const connectedCase = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.connectedCase);

  const exists = Boolean(connectedCase);

  const loadCase = useCallback(() => {
    if (!caseId || !referenceId) {
      return;
    }

    if (exists && !refresh) {
      dispatch(CaseActions.referenceCaseAction({ caseId, referenceId }));
      return;
    }

    asyncDispatch(dispatch)(CaseActions.loadCaseAsync({ caseId, referenceId }));
  }, [caseId, dispatch, exists, referenceId, refresh]);

  const unloadCase = useCallback(() => {
    if (!caseId || !referenceId) {
      return;
    }

    dispatch(CaseActions.dereferenceCaseAction({ caseId, referenceId }));
  }, [caseId, dispatch, referenceId]);

  const safeToLoad = Boolean(caseId) && Boolean(referenceId);
  const shouldLoad = autoload || refresh;

  const loader = useLoadWithRetry({
    error,
    loadFunction: loadCase,
    loading,
    retry: true,
    safeToLoad,
    shouldLoad,
  });

  // Cleanup case reference on unmount. This is done in a separate effect since the cleanup is triggered every time an effect is triggered, and this should happen only on "unmount"
  useEffect(() => {
    return () => {
      // setImmediate allows for computing next state before derefencing, preventing concurrently trying to ref/deref in transitions between two components that consume the same case
      setImmediate(() => unloadCase());
    };
  }, [unloadCase]);

  return {
    ...loader,
    error,
    loading,
  };
};

// eslint-disable-next-line import/no-unused-modules
export const useCase = ({
  caseId,
  referenceId,
  autoload = true,
  refresh = false,
}: {
  caseId: Case['id'];
  referenceId: string;
  autoload?: boolean;
  refresh?: boolean;
}) => {
  // const can = useMemo(() => {
  //   return getInitializedCan();
  // }, []);

  const connectedCase = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.connectedCase);

  return {
    connectedCase,
    ...useCaseLoader({ caseId, referenceId, autoload, refresh }),
  };
};
