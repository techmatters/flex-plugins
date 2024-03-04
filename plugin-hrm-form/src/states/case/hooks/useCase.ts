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

import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import asyncDispatch from '../../asyncDispatch';
import * as CaseActions from '../case';
import * as CaseSelectors from '../selectors';
import type { Case } from '../../../types/types';
import type { RootState } from '../..';
import { PermissionActions, getInitializedCan } from '../../../permissions';

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

const calculateCasePermissions = ({
  can,
  connectedCase,
}: {
  can: ReturnType<typeof getInitializedCan>;
  connectedCase: Case;
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => ({
  canView: connectedCase && can(PermissionActions.VIEW_CASE, connectedCase),
  canClose: connectedCase && can(PermissionActions.CLOSE_CASE, connectedCase),
  canReopen: connectedCase && can(PermissionActions.REOPEN_CASE, connectedCase),
  canCaseStatusTransition: connectedCase && can(PermissionActions.CASE_STATUS_TRANSITION, connectedCase),
  canAddNote: connectedCase && can(PermissionActions.ADD_NOTE, connectedCase),
  canEditNote: connectedCase && can(PermissionActions.EDIT_NOTE, connectedCase),
  canAddReferral: connectedCase && can(PermissionActions.ADD_REFERRAL, connectedCase),
  canEditReferral: connectedCase && can(PermissionActions.EDIT_REFERRAL, connectedCase),
  canAddHousehold: connectedCase && can(PermissionActions.ADD_HOUSEHOLD, connectedCase),
  canEditHousehold: connectedCase && can(PermissionActions.EDIT_HOUSEHOLD, connectedCase),
  canAddPerpetrator: connectedCase && can(PermissionActions.ADD_PERPETRATOR, connectedCase),
  canEditPerpetrator: connectedCase && can(PermissionActions.EDIT_PERPETRATOR, connectedCase),
  canAddIncident: connectedCase && can(PermissionActions.ADD_INCIDENT, connectedCase),
  canEditIncident: connectedCase && can(PermissionActions.EDIT_INCIDENT, connectedCase),
  canAddDocument: connectedCase && can(PermissionActions.ADD_DOCUMENT, connectedCase),
  canEditDocument: connectedCase && can(PermissionActions.EDIT_DOCUMENT, connectedCase),
  canEditCaseOverview: connectedCase && can(PermissionActions.EDIT_CASE_OVERVIEW, connectedCase),
  canUpdateCaseContacts: connectedCase && can(PermissionActions.UPDATE_CASE_CONTACTS, connectedCase),
});

export const useCase = ({ caseId }: { caseId: Case['id'] }) => {
  const can = useMemo(() => {
    return getInitializedCan();
  }, []);

  const { error, loading } = useCaseLoader({ caseId, autoload: true });

  const connectedCase = useSelector((state: RootState) => CaseSelectors.selectCaseById(state, caseId)?.connectedCase);

  return {
    connectedCase,
    error,
    loading,
    permissions: calculateCasePermissions({ can, connectedCase }),
  };
};
