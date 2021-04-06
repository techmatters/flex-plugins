import { getConfig } from '../HrmFormPlugin';
import type * as t from '../types/types';
import * as v1Rules from './v1';
import * as zaV1Rules from './za-v1';

export const PermissionActions = {
  CLOSE_CASE: 'closeCase',
  REOPEN_CASE: 'reopenCase',
  ADD_NOTE: 'addNote',
  ADD_REFERRAL: 'addReferral',
  ADD_HOUSEHOLD: 'addHousehold',
  ADD_PERPETRATOR: 'addPerpetrator',
  ADD_INCIDENT: 'addIncident',
  EDIT_CASE_SUMMARY: 'editCaseSummary',
  EDIT_CHILD_IS_AT_RISK: 'editChildIsAtRisk',
  EDIT_FOLLOW_UP_DATE: 'editFollowUpDate',
};

type PermissionActionsKeys = keyof typeof PermissionActions;
export type PermissionActionType = typeof PermissionActions[PermissionActionsKeys];
type Version = 'v1' | 'za-v1';
type Rule = (isSupervisor: boolean, isCreator: boolean, isCaseOpen: boolean) => boolean;
type Rules = {
  canEditCaseSummary: Rule;
  canEditGenericField: Rule;
  canReopenCase: Rule;
};

const rulesMap: { [version in Version]: Rules } = {
  v1: v1Rules,
  'za-v1': zaV1Rules,
};

export const getPermissionsForCase = (
  version: t.Case['info']['definitionVersion'],
  twilioWorkerId: t.Case['twilioWorkerId'],
  status: t.Case['status'],
) => {
  if (!version || !twilioWorkerId || !status) return { can: undefined };

  const { workerSid, isSupervisor } = getConfig();
  const isCreator = workerSid === twilioWorkerId;
  const isCaseOpen = status === 'open';
  const rules = rulesMap[version];

  const can = (action: PermissionActionType): boolean => {
    switch (action) {
      case PermissionActions.EDIT_CASE_SUMMARY:
        return rules.canEditCaseSummary(isSupervisor, isCreator, isCaseOpen);
      case PermissionActions.REOPEN_CASE:
        return rules.canReopenCase(isSupervisor, isCreator, isCaseOpen);
      default:
        return rules.canEditGenericField(isSupervisor, isCreator, isCaseOpen);
    }
  };

  return {
    can,
  };
};
