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

import { getConfig } from '../HrmFormPlugin';
import type * as t from '../types/types';
import { fetchRules } from './fetchRules';

export const CaseActions = {
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
} as const;
export const ContactActions = {
  EDIT_CONTACT: 'editContact',
  VIEW_EXTERNAL_TRANSCRIPT: 'viewExternalTranscript',
} as const;
export const ViewIdentifiersAction = {
  VIEW_IDENTIFIERS: 'viewIdentifiers',
} as const;

export const PermissionActions = {
  ...CaseActions,
  ...ContactActions,
  ...ViewIdentifiersAction,
} as const;

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

export const getPermissionsForContact = (twilioWorkerId: t.SearchAPIContact['overview']['counselor']) => {
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

export const getPermissionsForViewingIdentifiers = () => {
  const { isSupervisor, permissionConfig } = getConfig();

  if (!permissionConfig) return { canView: undefined };

  const conditionsState: Partial<{ [condition in Condition]: boolean }> = {
    isSupervisor,
    everyone: true,
  };

  const checkCondition = (condition: Condition) => conditionsState[condition];
  const checkConditionsSet = (conditionsSet: ConditionSet) => conditionsSet.every(checkCondition);
  const checkConditionsSets = (conditionsSets: ConditionSets) => conditionsSets.some(checkConditionsSet);

  const rules = fetchRules(permissionConfig);

  const rulesAreValid = Object.values(PermissionActions).every(action => rules[action]);
  if (!rulesAreValid) throw new Error(`Rules file for ${permissionConfig} is incomplete.`);

  const canView = (action: PermissionActionType): boolean => {
    if (!rules[action]) {
      console.error(`Cannot find rules for ${action}. Returning false.`);
      return isSupervisor;
    }

    return checkConditionsSets(rules[action]);
  };

  return {
    canView,
  };
};
