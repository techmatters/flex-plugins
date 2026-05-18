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
import * as CaseActions from '../singleCase';
import { selectCaseByCaseId } from '../selectCaseStateByCaseId';
import type { Case } from '../../../types/types';
import type { RootState } from '../..';
import { useLoadWithRetry } from '../../hooks/useLoadWithRetry';

const useCaseLoader = ({ caseId, autoload = true }: { caseId: Case['id']; autoload?: boolean }) => {
  const dispatch = useDispatch();

  const error = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.error);
  const loading = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.loading);
  const isAlreadyInState = useSelector((state: RootState) => Boolean(selectCaseByCaseId(state, caseId)?.connectedCase));

  const loadCase = useCallback(() => {
    if (!caseId) {
      return;
    }

    asyncDispatch(dispatch)(CaseActions.loadCaseAsync({ caseId }));
  }, [caseId, dispatch]);

  const safeToLoad = Boolean(caseId);
  const shouldLoad = autoload && !isAlreadyInState;

  const loader = useLoadWithRetry({
    error,
    loadFunction: loadCase,
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
export const useCase = ({ caseId, autoload = true }: { caseId: Case['id']; autoload?: boolean }) => {
  const connectedCase = useSelector((state: RootState) => selectCaseByCaseId(state, caseId)?.connectedCase);

  return {
    connectedCase,
    ...useCaseLoader({ caseId, autoload }),
  };
};
