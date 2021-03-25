import { getConfig } from '../HrmFormPlugin';
import type * as t from '../types/types';
import * as v1Rules from './v1';
import * as zaV1Rules from './za-v1';

export const PermissionActions = {
  OTHER: 'other',
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
  canEditChildIsAtRisk: Rule;
  canEditGenericField: Rule;
  canEditFollowUpDate: Rule;
};

const rulesMap: { [version in Version]: Rules } = {
  v1: v1Rules,
  'za-v1': zaV1Rules,
};

export const getPermissionsForCase = (caseObj: t.Case) => {
  const { workerSid, isSupervisor } = getConfig();
  const version = (caseObj.info.definitionVersion || 'za-v1') as Version;
  const { twilioWorkerId } = caseObj;
  const isCreator = workerSid === twilioWorkerId;
  const isCaseOpen = caseObj.status === 'open';
  const rules = rulesMap[version];

  const can = (action: PermissionActionType): boolean => {
    switch (action) {
      case PermissionActions.OTHER:
        return true;
      case PermissionActions.EDIT_CASE_SUMMARY:
        return rules.canEditCaseSummary(isSupervisor, isCreator, isCaseOpen);
      case PermissionActions.EDIT_CHILD_IS_AT_RISK:
        return rules.canEditChildIsAtRisk(isSupervisor, isCreator, isCaseOpen);
      case PermissionActions.EDIT_FOLLOW_UP_DATE:
        return rules.canEditFollowUpDate(isSupervisor, isCreator, isCaseOpen);
      default:
        return rules.canEditGenericField(isSupervisor, isCreator, isCaseOpen);
    }
  };

  return {
    can,
  };
};
