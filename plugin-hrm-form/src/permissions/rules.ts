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

import parseISO from 'date-fns/parseISO';
import { differenceInDays, differenceInHours } from 'date-fns';

import { getHrmConfig } from '../hrmConfig';
import {ContactRawJson, ProfileSection} from '../types/types';
import { fetchPermissionRules } from '../services/PermissionsService';
import { actionsMaps, PermissionActions, TargetKind } from './actions';

type PermissionActionsKeys = keyof typeof PermissionActions;
export type PermissionActionType = typeof PermissionActions[PermissionActionsKeys];

type ConditionsState = {
  [k: string]: boolean;
};

const timeBasedConditions = ['createdHoursAgo', 'createdDaysAgo'] as const;
type TimeBasedCondition = { [K in typeof timeBasedConditions[number]]: number };

const isTimeBasedCondition = (c: any): c is TimeBasedCondition => {
  if (typeof c === 'object') {
    const [[cond, param]] = Object.entries(c);
    return timeBasedConditions.includes(cond as any) && typeof param === 'number';
  }

  return false;
};

const userBasedConditions = ['isSupervisor', 'everyone'] as const;
type UserBasedCondition = typeof userBasedConditions[number];

const isUserBasedCondition = (c: any): c is UserBasedCondition =>
  typeof c === 'string' && userBasedConditions.includes(c as any);

const contactSpecificConditions = ['isOwner'] as const;
type ContactSpecificCondition = typeof contactSpecificConditions[number];

const isContactSpecificCondition = (c: any): c is ContactSpecificCondition =>
  typeof c === 'string' && contactSpecificConditions.includes(c as any);
type ContactFieldSpecificCondition = {
  // eslint-disable-next-line prettier/prettier
  field: `rawJson.${keyof ContactRawJson}.${string}`;
};

const isContactFieldSpecificCondition = (c: any): c is ContactFieldSpecificCondition => {
  if (typeof c?.field === 'string') {
    const [root, ...path] = c.field.split('.');
    return root === 'rawJson' && path.length === 2;
  }

  return false;
};

const caseSpecificConditions = ['isCreator', 'isCaseOpen', 'isCaseContactOwner'] as const;
type CaseSpecificCondition = typeof caseSpecificConditions[number];

const isCaseSpecificCondition = (c: any): c is CaseSpecificCondition =>
  typeof c === 'string' && caseSpecificConditions.includes(c as any);

// const profileSectionSpecificConditions = ['sectionType'] as const;
type ProfileSectionSpecificCondition = {
  sectionType: ProfileSection['sectionType'];
};

const isProfileSectionSpecificCondition = (c: any): c is ProfileSectionSpecificCondition => {
  if (typeof c === 'object') {
    const [[cond, param]] = Object.entries(c);
    return cond === 'sectionType' && typeof param === 'string';
  }

  return false;
};

type SupportedContactCondition = TimeBasedCondition | UserBasedCondition | ContactSpecificCondition;
const isSupportedContactCondition = (c: any): c is SupportedContactCondition =>
  isTimeBasedCondition(c) || isUserBasedCondition(c) || isContactSpecificCondition(c);


type SupportedContactFieldCondition = SupportedContactCondition;
const isSupportedContactFieldCondition = (c: any): c is SupportedContactFieldCondition =>
    isSupportedContactCondition(c) || isContactFieldSpecificCondition(c);

type SupportedCaseCondition = TimeBasedCondition | UserBasedCondition | CaseSpecificCondition;
const isSupportedCaseCondition = (c: any): c is SupportedCaseCondition =>
  isTimeBasedCondition(c) || isUserBasedCondition(c) || isCaseSpecificCondition(c);

type SupportedPostSurveyCondition = TimeBasedCondition | UserBasedCondition;
const isSupportedPostSurveyCondition = (c: any): c is SupportedPostSurveyCondition =>
  isTimeBasedCondition(c) || isUserBasedCondition(c);

type SupportedProfileCondition = TimeBasedCondition | UserBasedCondition;
const isSupportedProfileCondition = (c: any): c is SupportedProfileCondition =>
  isTimeBasedCondition(c) || isUserBasedCondition(c);

type SupportedProfileSectionCondition = TimeBasedCondition | UserBasedCondition | ProfileSectionSpecificCondition;
const isSupportedProfileSectionCondition = (c: any): c is SupportedProfileSectionCondition =>
  isTimeBasedCondition(c) || isUserBasedCondition(c) || isProfileSectionSpecificCondition(c);

type SupportedViewIdentifiersCondition = UserBasedCondition;
const isSupportedViewIdentifiersCondition = (c: any): c is SupportedPostSurveyCondition => isUserBasedCondition(c);

// Defines which actions are supported on each TargetKind
type SupportedTKCondition = {
  contact: SupportedContactCondition;
  contactField: SupportedContactFieldCondition;
  case: SupportedCaseCondition;
  profile: SupportedProfileCondition;
  profileSection: SupportedProfileSectionCondition;
  postSurvey: SupportedPostSurveyCondition;
  viewIdentifiers: SupportedViewIdentifiersCondition;
};

type TKCondition<T extends TargetKind> = SupportedTKCondition[T];
type TKConditionsSet<T extends TargetKind> = TKCondition<T>[];
type TKConditionsSets<T extends TargetKind> = TKConditionsSet<T>[];

/**
 * Given a conditionsState and a condition, returns true if the condition is true in the conditionsState
 */
const checkCondition = <T extends TargetKind>(conditionsState: ConditionsState) => (
  condition: TKCondition<T>,
): boolean => {
  if (typeof condition === 'object') {
    return conditionsState[JSON.stringify(condition)];
  }

  return conditionsState[condition as string];
};

/**
 * Given a conditionsState and a set of conditions, returns true if all the conditions are true in the conditionsState
 */
const checkConditionsSet = <T extends TargetKind>(conditionsState: ConditionsState) => (
  conditionsSet: TKConditionsSet<T>,
): boolean => conditionsSet.length > 0 && conditionsSet.every(checkCondition(conditionsState));

/**
 * Given a conditionsState and a set of conditions sets, returns true if one of the conditions sets contains conditions that are all true in the conditionsState
 */
const checkConditionsSets = <T extends TargetKind>(
  conditionsState: ConditionsState,
  conditionsSets: TKConditionsSets<T>,
): boolean => conditionsSets.some(checkConditionsSet(conditionsState));

const isTKCondition = <T extends TargetKind>(kind: T) => (c: any): c is TKCondition<T> => {
  if (!c) {
    return false;
  }

  switch (kind) {
    case 'contact': {
      return isSupportedContactCondition(c);
    }
    case 'contactField': {
      return isSupportedContactFieldCondition(c);
    }
    case 'case': {
      return isSupportedCaseCondition(c);
    }
    case 'profile': {
      return isSupportedProfileCondition(c);
    }
    case 'profileSection': {
      return isSupportedProfileSectionCondition(c);
    }
    case 'postSurvey': {
      return isSupportedPostSurveyCondition(c);
    }
    case 'viewIdentifiers': {
      return isSupportedViewIdentifiersCondition(c);
    }
    default: {
      return false;
    }
  }
};

/**
 * Utility type that given an object with any nesting depth, will return the union of all the leaves that are of type "string"
 */
type NestedStringValues<T> = T extends object
  ? { [K in keyof T]: T[K] extends string ? T[K] : NestedStringValues<T[K]> }[keyof T]
  : never;

type Action = NestedStringValues<typeof actionsMaps>;

export type RulesFile = { [k in Action]: TKConditionsSets<TargetKind> };

const isValidTKConditionsSets = <T extends TargetKind>(kind: T) => (
  css: TKConditionsSets<TargetKind>,
): css is TKConditionsSets<typeof kind> => css && css.every(cs => cs.every(isTKCondition(kind)));

/**
 * Validates that for every TK, the ConditionsSets provided are valid
 * (i.e. present in supportedTKConditions)
 */
const validateTKActions = (rules: RulesFile) =>
  Object.entries(actionsMaps)
    .map(([kind, map]) =>
      Object.values(map).reduce((accum, action) => {
        return {
          ...accum,
          [action]: rules[action] && isValidTKConditionsSets(kind as TargetKind)(rules[action]),
        };
      }, {}),
    )
    .reduce<{ [k in Action]: boolean }>((accum, obj) => ({ ...accum, ...obj }), {} as any);

let rules: RulesFile = null;
export const getRules = () => rules;

export const validateAndSetPermissionRules = async () => {
  try {
    const rulesFile = await fetchPermissionRules();
    validateTKActions(rulesFile);
    rules = rulesFile;
    return rules;
  } catch (err) {
    console.error('Error validating and setting permission rules:', err);
    throw err;
  }
};

type TwilioUser = {
  workerSid: string;

  roles: string[];
  isSupervisor: boolean;
};

const isCounselorWhoCreated = (user: TwilioUser, caseObj: any) => user.workerSid === caseObj?.twilioWorkerId;

const isCaseOpen = (caseObj: any) => caseObj?.status !== 'closed';

const isContactOwner = (user: TwilioUser, contactObj: any) => user.workerSid === contactObj?.twilioWorkerId;

const isCaseContactOwner = (caseObj: any) => caseObj?.precalculatedPermissions?.userOwnsContact;

const applyTimeBasedConditions = (conditions: TimeBasedCondition[]) => (
  performer: TwilioUser,
  target: any,
  ctx: { curentTimestamp: Date },
) =>
  conditions
    .map(c => Object.entries(c)[0])
    .reduce<Record<string, boolean>>((accum, [cond, param]) => {
      // use the stringified cond-param as key, e.g. '{ "createdHoursAgo": "4" }'
      const key = JSON.stringify({ [cond]: param });
      if (cond === 'createdHoursAgo') {
        return {
          ...accum,
          [key]: target && differenceInHours(ctx.curentTimestamp, parseISO(target.createdAt)) < param,
        };
      }

      if (cond === 'createdDaysAgo') {
        return {
          ...accum,
          [key]: target && differenceInDays(ctx.curentTimestamp, parseISO(target.createdAt)) < param,
        };
      }

      return accum;
    }, {});

const applyProfileSectionSpecificConditions = (conditions: ProfileSectionSpecificCondition[]) => (
  performer: TwilioUser,
  target: ProfileSection,
) =>
  conditions
    .map(c => Object.entries(c)[0])
    .reduce<Record<string, boolean>>((accum, [cond, param]) => {
      // use the stringified cond-param as key, e.g. '{ "sectionType": "summary" }'
      const key = JSON.stringify({ [cond]: param });
      if (cond === 'sectionType') {
        return {
          ...accum,
          [key]: target.sectionType === param,
        };
      }

      return accum;
    }, {});

const applyContactFieldSpecificConditions = (conditions: ContactFieldSpecificCondition[]) => (
    field: ContactFieldSpecificCondition['field'],
) =>
    conditions
        .map(c => Object.entries(c)[0])
        .reduce<Record<string, boolean>>((accum, [cond, param]) => {
          // use the stringified cond-param as key, e.g. '{ "sectionType": "summary" }'
          if (cond === 'field') {
            const key = JSON.stringify({ [cond]: param });
            return {
              ...accum,
              [key]: field === param,
            };
          }

          return accum;
        }, {});

const setupAllow = <T extends TargetKind>(kind: T, conditionsSets: TKConditionsSets<T>) => {
  // We could do type validation on target depending on targetKind if we ever want to make sure the "allow" is called on a proper target (same as cancan used to do)

  const timeBasedConditions = conditionsSets.flatMap(cs => cs.filter(isTimeBasedCondition)) as TimeBasedCondition[];

  return (performer: TwilioUser, target: any) => {
    const ctx = { curentTimestamp: new Date() };

    const appliedTimeBasedConditions = applyTimeBasedConditions(timeBasedConditions)(performer, target, ctx);

    // Build the proper conditionsState depending on the targetKind
    switch (kind) {
      case 'case': {
        const conditionsState: ConditionsState = {
          isSupervisor: performer.isSupervisor,
          isCreator: isCounselorWhoCreated(performer, target),
          isCaseOpen: isCaseOpen(target),
          isCaseContactOwner: isCaseContactOwner(target),
          everyone: true,
          ...appliedTimeBasedConditions,
        };

        return checkConditionsSets(conditionsState, conditionsSets);
      }
      case 'contact': {
        const conditionsState: ConditionsState = {
          isSupervisor: performer.isSupervisor,
          isOwner: isContactOwner(performer, target),
          everyone: true,
          createdDaysAgo: false,
          createdHoursAgo: false,
          ...appliedTimeBasedConditions,
        };

        return checkConditionsSets(conditionsState, conditionsSets);
      }
      case 'contactField': {
        const specificConditions = conditionsSets.flatMap(cs =>
          cs.map(c => (isContactFieldSpecificCondition(c) ? c : null)).filter(c => c !== null),
        );
        const { contact, field } = target;
        const appliedSpecificConditions = applyContactFieldSpecificConditions(specificConditions)(field);
        const conditionsState: ConditionsState = {
          isSupervisor: performer.isSupervisor,
          isOwner: isContactOwner(performer, contact),
          everyone: true,
          createdDaysAgo: false,
          createdHoursAgo: false,
          ...appliedTimeBasedConditions,
          ...appliedSpecificConditions,
        };

        return checkConditionsSets(conditionsState, conditionsSets);
      }
      case 'postSurvey':
      case 'profile': {
        const conditionsState: ConditionsState = {
          isSupervisor: performer.isSupervisor,
          everyone: true,
          ...appliedTimeBasedConditions,
        };

        return checkConditionsSets(conditionsState, conditionsSets);
      }
      case 'profileSection': {
        const specificConditions = conditionsSets.flatMap(cs =>
          cs.map(c => (isProfileSectionSpecificCondition(c) ? c : null)).filter(c => c !== null),
        );

        const appliedSpecificConditions = applyProfileSectionSpecificConditions(specificConditions)(performer, target);

        const conditionsState: ConditionsState = {
          isSupervisor: performer.isSupervisor,
          everyone: true,
          ...appliedTimeBasedConditions,
          ...appliedSpecificConditions,
        };

        return checkConditionsSets(conditionsState, conditionsSets);
      }
      case 'viewIdentifiers': {
        const conditionsState: ConditionsState = {
          isSupervisor: performer.isSupervisor,
          everyone: true,
        };

        return checkConditionsSets(conditionsState, conditionsSets);
      }
      default: {
        return false;
      }
    }
  };
};

const initializeCanForRules = (rules: RulesFile) => {
  if (!rules) {
    console.warn('Rules not loaded for initializeCanForRules');
    return () => false;
  }
  const actionCheckers = {} as { [action in Action]: ReturnType<typeof setupAllow> };

  const targetKinds = Object.keys(actionsMaps);
  targetKinds.forEach((targetKind: TargetKind) => {
    const actionsForTK = Object.values(actionsMaps[targetKind]) as Action[];
    actionsForTK.forEach(action => {
      if (rules[action]) {
        actionCheckers[action] = setupAllow(targetKind, rules[action]);
      } else {
        console.warn(`No rules defined for action: ${action}`);
      }
    });
  });

  return (performer: TwilioUser, action: Action, target: any) => actionCheckers[action](performer, target);
};

let initializedCan: ((performer: TwilioUser, action: Action, target?: any) => boolean) | null = null;

// Permission check function
export const getInitializedCan = () => {
  const { workerSid, isSupervisor } = getHrmConfig();

  if (initializedCan === null) {
    // Get rules that should have been initialized during plugin startup
    const rulesFile = getRules();
    if (!rulesFile) {
      console.warn('Rules not initialized. Make sure validateAndSetPermissionRules was called during plugin init');
      return () => false;
    }
    initializedCan = initializeCanForRules(rulesFile);
  }

  const performer = { isSupervisor, workerSid, roles: null };
  return (action: Action, target?: any) => initializedCan(performer, action, target);
};

// eslint-disable-next-line import/no-unused-modules
export const cleanupInitializedCan = () => (initializedCan = null);
