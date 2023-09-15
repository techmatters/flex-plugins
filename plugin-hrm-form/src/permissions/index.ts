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

import type * as t from '../types/types';
import { fetchRules } from './fetchRules';
import { getHrmConfig } from '../hrmConfig';

export { canOnlyViewOwnCases, canOnlyViewOwnContacts } from './search-permissions';

export const CaseActions = {
  VIEW_CASE: 'viewCase',
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
type CaseActions = typeof CaseActions;
export const ContactActions = {
  VIEW_CONTACT: 'viewContact',
  EDIT_CONTACT: 'editContact',
  VIEW_EXTERNAL_TRANSCRIPT: 'viewExternalTranscript',
  VIEW_RECORDING: 'viewRecording',
} as const;
type ContactActions = typeof ContactActions;
export const ViewIdentifiersAction = {
  VIEW_IDENTIFIERS: 'viewIdentifiers',
} as const;
type ViewIdentifiersAction = typeof ViewIdentifiersAction;

export const PermissionActions = {
  ...CaseActions,
  ...ContactActions,
  ...ViewIdentifiersAction,
} as const;

type PermissionActionsKeys = keyof typeof PermissionActions;
export type PermissionActionType = typeof PermissionActions[PermissionActionsKeys];
type Condition = 'isSupervisor' | 'isCreator' | 'isCaseOpen' | 'isOwner' | 'everyone';
export type ConditionsSet = Condition[];
type ConditionsSets = ConditionsSet[];

type ConditionsState = Partial<{
  isSupervisor: boolean;
  isCreator: boolean;
  isCaseOpen: boolean;
  isOwner: boolean;
  everyone: boolean;
}>;

const checkCondition = (conditionsState: ConditionsState) => (condition: Condition) => conditionsState[condition];
const checkConditionsSet = (conditionsState: ConditionsState) => (conditionsSet: ConditionsSet) =>
  conditionsSet.every(checkCondition(conditionsState));
const checkConditionsSets = (conditionsState: ConditionsState) => (conditionsSets: ConditionsSets) =>
  conditionsSets.some(checkConditionsSet(conditionsState));

export const actionsMaps = {
  case: CaseActions,
  contact: ContactActions,
  postSurvey: {
    /* TODO: add when used */
  },
  viewIdentifiers: ViewIdentifiersAction,
} as const;

// Defines which actions are supported on each TargetKind
const supportedTargetKindActions = {
  case: ['isSupervisor', 'isCreator', 'isCaseOpen', 'everyone'],
  contact: ['isSupervisor', 'isOwner', 'everyone'],
  postSurvey: ['isSupervisor', 'everyone'],
  viewIdentifiers: ['isSupervisor', 'everyone'],
};

const isValidTargetKind = (kind: string, css: ConditionsSets) =>
  css.every(cs => cs.every(c => supportedTargetKindActions[kind].includes(c)));

const validateTargetKindActions = (rules, kind: keyof typeof actionsMaps) =>
  Object.values(actionsMaps[kind]).reduce<{ [k in keyof typeof actionsMaps]: boolean }>((accum, action) => {
    return {
      ...accum,
      [action]: isValidTargetKind(kind, rules[action]),
    };
  }, {} as any);

const isValidTargetKindActions = (validated: { [k in keyof typeof actionsMaps]: boolean }) =>
  Object.values(validated).every(Boolean);

export const validateRules = (permissionConfig: string, kind: keyof typeof actionsMaps) => {
  const rules = fetchRules(permissionConfig);

  const rulesAreValid = Object.values(PermissionActions).every(action => rules[action]);
  if (!rulesAreValid) throw new Error(`Rules file for ${permissionConfig} is incomplete. Missing actions for ${kind}`);

  const validated = validateTargetKindActions(rules, kind);

  if (!isValidTargetKindActions(validated)) {
    const invalidActions = Object.entries(validated)
      .filter(([, val]) => !val)
      .map(([key]) => key);
    throw new Error(
      `Error: rules file for ${permissionConfig} contains invalid actions mappings: ${JSON.stringify(invalidActions)}`,
    );
  }
  return rules;
};

export const getPermissionsForCase = (twilioWorkerId: t.Case['twilioWorkerId'], status: t.Case['status']) => {
  const { workerSid, isSupervisor, permissionConfig } = getHrmConfig();

  if (!permissionConfig || !twilioWorkerId || !status) return { can: undefined };

  const isCreator = workerSid === twilioWorkerId;
  const isCaseOpen = status !== 'closed';

  const conditionsState: Partial<{ [condition in Condition]: boolean }> = {
    isSupervisor,
    isCreator,
    isCaseOpen,
    everyone: true,
  };

  const rules = validateRules(permissionConfig, 'case');

  const can = (action: PermissionActionType): boolean => {
    if (!rules[action]) {
      console.error(`Cannot find rules for ${action}. Returning false.`);
      return isSupervisor || (isCreator && isCaseOpen);
    }

    return checkConditionsSets(conditionsState)(rules[action]);
  };

  return {
    can,
  };
};

export const getPermissionsForContact = (twilioWorkerId: t.SearchAPIContact['overview']['counselor']) => {
  const { workerSid, isSupervisor, permissionConfig } = getHrmConfig();

  if (!permissionConfig || !twilioWorkerId) return { can: undefined };

  const isOwner = workerSid === twilioWorkerId;

  const conditionsState: Partial<{ [condition in Condition]: boolean }> = {
    isSupervisor,
    isOwner,
    everyone: true,
  };

  const rules = validateRules(permissionConfig, 'contact');

  const can = (action: PermissionActionType): boolean => {
    if (!rules[action]) {
      console.error(`Cannot find rules for ${action}. Returning false.`);
      return isSupervisor || isOwner;
    }

    return checkConditionsSets(conditionsState)(rules[action]);
  };

  return {
    can,
  };
};

export const getPermissionsForViewingIdentifiers = () => {
  const { isSupervisor, permissionConfig } = getHrmConfig();

  if (!permissionConfig) return { canView: undefined };

  const conditionsState: Partial<{ [condition in Condition]: boolean }> = {
    isSupervisor,
    everyone: true,
  };

  const rules = validateRules(permissionConfig, 'viewIdentifiers');

  const canView = (action: PermissionActionType): boolean => {
    if (!rules[action]) {
      console.error(`Cannot find rules for ${action}. Returning false.`);
      return isSupervisor;
    }

    return checkConditionsSets(conditionsState)(rules[action]);
  };

  return {
    canView,
  };
};
