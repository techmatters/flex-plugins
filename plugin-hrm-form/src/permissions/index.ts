import { getConfig } from '../HrmFormPlugin';
import type * as t from '../types/types';
import * as zmRules from './zm';
import * as zaRules from './za';
import * as etRules from './et';
import * as mwRules from './mw';
import * as brRules from './br';
import * as inRules from './in';
import * as jmRules from './jm';

const zmJsonRules = require('./zm.json');

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
};

type PermissionActionsKeys = keyof typeof PermissionActions;
export type PermissionActionType = typeof PermissionActions[PermissionActionsKeys];
type PermissionConfig = 'zm' | 'za' | 'et' | 'mw' | 'br' | 'in' | 'jm';
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
};

const fallbackRules = zaRules;

export const getPermissionsForCase = (twilioWorkerId: t.Case['twilioWorkerId'], status: t.Case['status']) => {
  const { workerSid, isSupervisor, permissionConfig } = getConfig();
  if (!permissionConfig || !twilioWorkerId || !status) return { can: undefined };

  const isCreator = workerSid === twilioWorkerId;
  const isCaseOpen = status !== 'closed';

  const conditionsState: { [condition: string]: boolean } = {
    isSupervisor,
    isCreator,
    isCaseOpen,
  };

  const checkCondition = (condition: string) => conditionsState[condition];
  const checkConditionsSet = (conditionsSet: string[]) => conditionsSet.every(checkCondition);
  const checkConditionsSets = (conditionsSets: string[][]) => conditionsSets.some(checkConditionsSet);

  const rules = zmJsonRules;
  // let rules = rulesMap[permissionConfig];

  /*
   *TODO: Uncomment
   * if (!rules) {
   *   console.error(`Cannot find rules for ${permissionConfig}. Using fallback rules.`);
   *   rules = fallbackRules;
   * }
   */

  const rulesAreValid = Object.values(PermissionActions).every(action => rules[action]);
  if (!rulesAreValid) throw new Error(`Rules file for ${permissionConfig} is incomplete.`);

  // TODO: remove debug log
  console.log('>>>>>>>>> permissions results');
  Object.values(PermissionActions).forEach(action => console.log(action, checkConditionsSets(rules[action])));

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

console.log('zmJsonRules', zmJsonRules);
