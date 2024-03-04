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

import asyncDispatch from '../../asyncDispatch';
import * as CaseActions from '../case';
import * as CaseSelectors from '../selectors';
import type { Case } from '../../../types/types';
import type { RootState } from '../..';

// TODO: REMOVE
/* eslint-disable import/no-unused-modules */

export const useCaseLoader = ({ caseId, autoload = false }: { caseId: Case['id']; autoload?: boolean }) => {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => CaseSelectors.selectCaseById(state, caseId)?.error);
  const loading = useSelector((state: RootState) => CaseSelectors.selectCaseById(state, caseId)?.loading);

  const loadCase = useCallback(() => {
    if (caseId) {
      asyncDispatch(dispatch)(CaseActions.loadCaseAsync(caseId));
    }
  }, [caseId, dispatch]);

  // Allways trigger load on initial mount
  useEffect(() => {
    if (autoload) {
      loadCase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    error,
    loading,
    loadCase,
  };
};

export const useCase = ({ caseId }: { caseId: Case['id'] }) => {
  // const can = useMemo(() => {
  //   return getInitializedCan();
  // }, []);

  const connectedCase = useSelector((state: RootState) => CaseSelectors.selectCaseById(state, caseId)?.connectedCase);


  const autoload = !connectedCase

  return {
    connectedCase,
    ...useCaseLoader({ caseId, autoload }),
  };
};
