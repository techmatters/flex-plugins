import { getConfig } from '../HrmFormPlugin';
import type * as t from '../types/types';
import { fetchRules } from './fetchRules';

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
  EDIT_NOTE: 'editNote',
  EDIT_REFERRAL: 'editReferral',
  EDIT_HOUSEHOLD: 'editHousehold',
  EDIT_PERPETRATOR: 'editPerpetrator',
  EDIT_INCIDENT: 'editIncident',
  EDIT_DOCUMENT: 'editDocument',
  EDIT_CONTACT: 'editContact',
};

type PermissionActionsKeys = keyof typeof PermissionActions;
export type PermissionActionType = typeof PermissionActions[PermissionActionsKeys];
type Condition = 'isSupervisor' | 'isCreator' | 'isCaseOpen' | 'isOwner' | 'everyone';
type ConditionSet = Condition[];
type ConditionSets = ConditionSet[];

export const getPermissionsForCase = (twilioWorkerId: t.Case['twilioWorkerId'], status: t.Case['status']) => {
  const { workerSid, isSupervisor, permissionConfig } = getConfig();

  if (!permissionConfig || !twilioWorkerId || !status) return { can: undefined };

  const isCreator = workerSid === twilioWorkerId;
  const isCaseOpen = status !== 'closed';

  const conditionsState: Partial<{ [condition in Condition]: boolean }> = {
    isSupervisor,
    isCreator,
    isCaseOpen,
    everyone: true,
  };

  const checkCondition = (condition: Condition) => conditionsState[condition];
  const checkConditionsSet = (conditionsSet: ConditionSet) => conditionsSet.every(checkCondition);
  const checkConditionsSets = (conditionsSets: ConditionSets) => conditionsSets.some(checkConditionsSet);

  const rules = fetchRules(permissionConfig);

  const rulesAreValid = Object.values(PermissionActions).every(action => rules[action]);
  if (!rulesAreValid) throw new Error(`Rules file for ${permissionConfig} is incomplete.`);

  const can = (action: PermissionActionType): boolean => {
    if (!rules[action]) {
      console.error(`Cannot find rules for ${action}. Returning false.`);
      return isSupervisor || (isCreator && isCaseOpen);
    }

    return checkConditionsSets(rules[action]);
  };

  return {
    can,
  };
};

export const getPermissionsForContact = (twilioWorkerId: t.SearchContact['overview']['counselor']) => {
  const { workerSid, isSupervisor, permissionConfig } = getConfig();

  if (!permissionConfig || !twilioWorkerId) return { can: undefined };

  const isOwner = workerSid === twilioWorkerId;

  const conditionsState: Partial<{ [condition in Condition]: boolean }> = {
    isSupervisor,
    isOwner,
    everyone: true,
  };

  const checkCondition = (condition: Condition) => conditionsState[condition];
  const checkConditionsSet = (conditionsSet: ConditionSet) => conditionsSet.every(checkCondition);
  const checkConditionsSets = (conditionsSets: ConditionSets) => conditionsSets.some(checkConditionsSet);

  const rules = fetchRules(permissionConfig);

  const rulesAreValid = Object.values(PermissionActions).every(action => rules[action]);
  if (!rulesAreValid) throw new Error(`Rules file for ${permissionConfig} is incomplete.`);

  const can = (action: PermissionActionType): boolean => {
    if (!rules[action]) {
      console.error(`Cannot find rules for ${action}. Returning false.`);
      return isSupervisor || isOwner;
    }

    return checkConditionsSets(rules[action]);
  };

  return {
    can,
  };
};
