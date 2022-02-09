import { getConfig } from '../HrmFormPlugin';
import type * as t from '../types/types';
import * as zmRules from './zm';
import * as zaRules from './za';
import * as etRules from './et';
import * as mwRules from './mw';
import * as brRules from './br';
import * as inRules from './in';
import * as jmRules from './jm';
import * as caRules from './ca';

export const PermissionActions = {
  CLOSE_CASE: 'closeCase',
  REOPEN_CASE: 'reopenCase',
  CASE_STATUS_TRANSITION: 'caseStatusTransition',
  ADD_NOTE: 'addNote',
  ADD_REFERRAL: 'addReferral',
  ADD_HOUSEHOLD: 'addHousehold',
  ADD_PERPETRATOR: 'addPerpetrator',
  ADD_INCIDENT: 'addIncident',
  ADD_DOCUMENT: 'addDocument',
  EDIT_CASE_SUMMARY: 'editCaseSummary',
  EDIT_CHILD_IS_AT_RISK: 'editChildIsAtRisk',
  EDIT_FOLLOW_UP_DATE: 'editFollowUpDate',
};

type PermissionActionsKeys = keyof typeof PermissionActions;
export type PermissionActionType = typeof PermissionActions[PermissionActionsKeys];
type PermissionConfig = 'zm' | 'za' | 'et' | 'mw' | 'br' | 'in' | 'jm'| 'ca';
type Rule = (isSupervisor: boolean, isCreator: boolean, isCaseOpen: boolean) => boolean;
type Rules = {
  canEditCaseSummary: Rule;
  canEditGenericField: Rule;
  canReopenCase: Rule;
};

const rulesMap: { [permissionConfig in PermissionConfig]: Rules } = {
  zm: zmRules,
  za: zaRules,
  et: etRules,
  mw: mwRules,
  br: brRules,
  in: inRules,
  jm: jmRules,
  ca: caRules,
};

const fallbackRules = zaRules;

export const getPermissionsForCase = (twilioWorkerId: t.Case['twilioWorkerId'], status: t.Case['status']) => {
  const { workerSid, isSupervisor, permissionConfig } = getConfig();
  if (!permissionConfig || !twilioWorkerId || !status) return { can: undefined };

  const isCreator = workerSid === twilioWorkerId;
  const isCaseOpen = status !== 'closed';
  let rules = rulesMap[permissionConfig];

  if (!rules) {
    console.error(`Cannot find rules for ${permissionConfig}. Using fallback rules.`);
    rules = fallbackRules;
  }

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
