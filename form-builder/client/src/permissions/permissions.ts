/**
 * Copyright (C) 2021-2026 Technology Matters
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

/**
 * A helpline's HRM permissions (hrm repo, hrm-domain/hrm-core/permission-rules/<name>.json), as
 * HRM reads them (hrm-core/permissions/rulesMap.ts, initializeCanForRules.ts): each action has
 * ways to be allowed. Any one way is enough, every condition in a way must hold, and no ways means
 * nobody. HRM won't start if an action is missing or has a condition it doesn't take, so the same
 * checks are made here.
 *
 * Field rules (viewContactField, editContactField) work the other way round: fields not named are
 * allowed, and a named field is hidden (or locked) unless one of its ways holds.
 */
import {
  isPermissionRulesPath,
  type PermissionCondition,
  type PermissionRules,
} from '@tech-matters/form-builder-shared';

import type { DefinitionFileMap } from '../common/definitions';

type PermissionTarget =
  | 'case'
  | 'contact'
  | 'contactField'
  | 'profile'
  | 'profileSection'
  | 'postSurvey'
  | 'identifiers';

export type PermissionAction = { key: string; target: PermissionTarget; label: string; description: string };

type PermissionGroupId = 'cases' | 'contacts' | 'fields' | 'profiles' | 'other';

export type PermissionGroup = {
  id: PermissionGroupId;
  title: string;
  description: string;
  actions: PermissionAction[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'cases',
    title: 'Cases',
    description: 'Who sees and works on cases.',
    actions: [
      { key: 'viewCase', target: 'case', label: 'See a case', description: 'Open it and read what’s in it' },
      { key: 'closeCase', target: 'case', label: 'Close a case', description: 'Set it to a closed status' },
      { key: 'reopenCase', target: 'case', label: 'Reopen a case', description: 'Take a closed case back to open' },
      {
        key: 'caseStatusTransition',
        target: 'case',
        label: 'Change a case’s status',
        description: 'Between the statuses that aren’t closed',
      },
      {
        key: 'addCaseSection',
        target: 'case',
        label: 'Add to a case',
        description: 'Notes, referrals, households and the other case sections',
      },
      {
        key: 'editCaseSection',
        target: 'case',
        label: 'Edit what was added to a case',
        description: 'Change a note, referral or other case section',
      },
      {
        key: 'editCaseOverview',
        target: 'case',
        label: 'Edit a case’s overview',
        description: 'Its summary, follow-up date and other overview fields',
      },
      {
        key: 'updateCaseContacts',
        target: 'case',
        label: 'Change a case’s contacts',
        description: 'Which contacts are in the case',
      },
    ],
  },
  {
    id: 'contacts',
    title: 'Contacts',
    description: 'Who sees and changes saved contacts.',
    actions: [
      { key: 'viewContact', target: 'contact', label: 'See a contact', description: 'Open a saved contact' },
      { key: 'editContact', target: 'contact', label: 'Edit a contact', description: 'Change a saved contact' },
      {
        key: 'editInProgressContact',
        target: 'contact',
        label: 'Edit a contact still in progress',
        description: 'Carry on with a contact that wasn’t finished',
      },
      {
        key: 'viewExternalTranscript',
        target: 'contact',
        label: 'Read a transcript',
        description: 'The chat’s messages, kept with the contact',
      },
      { key: 'viewRecording', target: 'contact', label: 'Listen to a recording', description: 'The call’s recording' },
      {
        key: 'addContactToCase',
        target: 'contact',
        label: 'Add a contact to a case',
        description: 'Link it to a new or existing case',
      },
      {
        key: 'removeContactFromCase',
        target: 'contact',
        label: 'Remove a contact from a case',
        description: 'Unlink it from its case',
      },
    ],
  },
  {
    id: 'fields',
    title: 'Contact fields',
    description:
      'Fields kept from some people. Fields not named here are seen and edited by whoever can see or edit the contact.',
    actions: [
      {
        key: 'viewContactField',
        target: 'contactField',
        label: 'See a field',
        description: 'A named field is hidden from anyone it doesn’t allow',
      },
      {
        key: 'editContactField',
        target: 'contactField',
        label: 'Edit a field',
        description: 'A named field can’t be changed by anyone it doesn’t allow',
      },
    ],
  },
  {
    id: 'profiles',
    title: 'Client profiles',
    description: 'Who sees client profiles, flags them and writes in them.',
    actions: [
      { key: 'viewProfile', target: 'profile', label: 'See a profile', description: 'Open a client’s profile' },
      { key: 'flagProfile', target: 'profile', label: 'Flag a profile', description: 'e.g. as blocked or abusive' },
      { key: 'unflagProfile', target: 'profile', label: 'Remove a flag', description: 'Take a flag off a profile' },
      {
        key: 'viewProfileSection',
        target: 'profileSection',
        label: 'See a profile’s sections',
        description: 'Its summary and the other sections',
      },
      {
        key: 'createProfileSection',
        target: 'profileSection',
        label: 'Write in a profile',
        description: 'Fill in a section that’s empty',
      },
      {
        key: 'editProfileSection',
        target: 'profileSection',
        label: 'Edit a profile’s sections',
        description: 'Change what a section says',
      },
    ],
  },
  {
    id: 'other',
    title: 'Other',
    description: '',
    actions: [
      {
        key: 'viewPostSurvey',
        target: 'postSurvey',
        label: 'See post-survey answers',
        description: 'What the contact answered after the conversation',
      },
      {
        key: 'viewIdentifiers',
        target: 'identifiers',
        label: 'See identifiers',
        description: 'Phone numbers, emails and other IDs; hidden (masked) from anyone else. Used by Flex only.',
      },
    ],
  },
];

export const PERMISSION_ACTIONS = PERMISSION_GROUPS.flatMap(group => group.actions);
const ACTION_BY_KEY = new Map(PERMISSION_ACTIONS.map(action => [action.key, action]));

const actionOf = (key: string) => ACTION_BY_KEY.get(key);

export type ConditionKind =
  | 'everyone'
  | 'nobody'
  | 'isSupervisor'
  | 'isOwner'
  | 'isCreator'
  | 'isCaseOpen'
  | 'isCaseContactOwner'
  | 'createdHoursAgo'
  | 'createdDaysAgo'
  | 'sectionType'
  | 'field';

export const CONDITION_LABELS: Record<ConditionKind, string> = {
  everyone: 'Everyone',
  nobody: 'Nobody',
  isSupervisor: 'Supervisors',
  isOwner: 'The contact’s owner',
  isCreator: 'The case’s creator',
  isCaseOpen: 'The case is open',
  isCaseContactOwner: 'Owns a contact in the case',
  createdHoursAgo: 'Created less than … hours ago',
  createdDaysAgo: 'Created less than … days ago',
  sectionType: 'Sections of a kind',
  field: 'The field',
};

const VALUE_KINDS: ConditionKind[] = ['createdHoursAgo', 'createdDaysAgo', 'sectionType', 'field'];
const COMMON: ConditionKind[] = ['everyone', 'isSupervisor', 'nobody', 'createdHoursAgo', 'createdDaysAgo'];

const TARGET_CONDITIONS: Record<PermissionTarget, ConditionKind[]> = {
  case: [...COMMON, 'isCreator', 'isCaseOpen', 'isCaseContactOwner'],
  contact: [...COMMON, 'isOwner'],
  contactField: ['field', ...COMMON, 'isOwner'],
  profile: COMMON,
  profileSection: [...COMMON, 'sectionType'],
  postSurvey: COMMON,
  // Checked by the Flex plugin only, which knows no more than these
  identifiers: ['everyone', 'isSupervisor', 'nobody'],
};

// The conditions an action takes (HRM doesn't take a section type for writing a new section)
export const conditionsFor = (actionKey: string): ConditionKind[] => {
  const action = actionOf(actionKey);
  if (!action) return [];
  const kinds = TARGET_CONDITIONS[action.target];
  return actionKey === 'createProfileSection' ? kinds.filter(kind => kind !== 'sectionType') : kinds;
};

export const kindOf = (condition: PermissionCondition): ConditionKind | undefined => {
  if (typeof condition === 'string') {
    return condition in CONDITION_LABELS && !VALUE_KINDS.includes(condition as ConditionKind)
      ? (condition as ConditionKind)
      : undefined;
  }
  if (!condition || typeof condition !== 'object' || Array.isArray(condition)) return undefined;
  const keys = Object.keys(condition);
  return keys.length === 1 && VALUE_KINDS.includes(keys[0] as ConditionKind) ? (keys[0] as ConditionKind) : undefined;
};

export const valueOf = (condition: PermissionCondition) =>
  typeof condition === 'object' && condition ? Object.values(condition)[0] : undefined;

// A new condition of a kind, with a value to start from
export const newCondition = (kind: ConditionKind): PermissionCondition => {
  switch (kind) {
    case 'createdHoursAgo':
      return { createdHoursAgo: 24 };
    case 'createdDaysAgo':
      return { createdDaysAgo: 7 };
    case 'sectionType':
      return { sectionType: 'summary' };
    case 'field':
      return { field: 'rawJson.caseInformation.' };
    default:
      return kind;
  }
};

// The forms a contact's fields are in, as HRM names them
export const FIELD_FORMS = [
  { key: 'callerInformation', label: 'Help seeker information' },
  { key: 'childInformation', label: 'Service user information' },
  { key: 'caseInformation', label: 'Case information' },
];

// 'rawJson.caseInformation.lastName' -> { form: 'caseInformation', name: 'lastName' }
export const splitField = (field: string) => {
  const [, form = '', name = ''] = field.split('.');
  return { form, name };
};

const FIELD_PATTERN = /^rawJson\.[A-Za-z0-9_]+\.[A-Za-z0-9_]+$/;

const describeCondition = (condition: PermissionCondition): string => {
  const kind = kindOf(condition);
  const value = valueOf(condition);
  switch (kind) {
    case undefined:
      return `“${JSON.stringify(condition)}” (unknown)`;
    case 'createdHoursAgo':
      return `created less than ${value} hour${value === 1 ? '' : 's'} ago`;
    case 'createdDaysAgo':
      return `created less than ${value} day${value === 1 ? '' : 's'} ago`;
    case 'sectionType':
      return `${value} sections`;
    case 'field': {
      const { form, name } = splitField(String(value));
      const formLabel = FIELD_FORMS.find(each => each.key === form)?.label ?? form;
      return `“${name}” (${formLabel})`;
    }
    default:
      return CONDITION_LABELS[kind].toLowerCase();
  }
};

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// One way to be allowed, in words, e.g. "supervisors and created less than 24 hours ago"
const describeWay = (way: PermissionCondition[]) => {
  if (way.length === 0) return 'no one (a way with no conditions never allows anyone)';
  const words = way.filter(condition => kindOf(condition) !== 'field').map(describeCondition);
  return words.length === 0 ? 'everyone' : words.join(' and ');
};

// The whole rule in words, e.g. "Supervisors; or the contact’s owner"
export const describeRule = (ways: PermissionCondition[][] | undefined) => {
  if (!ways || ways.length === 0) return 'Nobody';
  return capitalise(ways.map(describeWay).join('; or '));
};

// A field rule in words: who sees (or edits) every field, and who each named field is kept for
export const describeFieldRule = (ways: PermissionCondition[][] | undefined) => {
  const all: PermissionCondition[][] = [];
  const byField = new Map<string, PermissionCondition[][]>();
  (ways ?? []).forEach(way => {
    const field = way.find(condition => kindOf(condition) === 'field');
    if (!field) {
      all.push(way);
      return;
    }
    const name = describeCondition(field);
    byField.set(name, [...(byField.get(name) ?? []), way.filter(condition => condition !== field)]);
  });
  return {
    everyField: all.length > 0 ? describeRule(all) : undefined,
    fields: [...byField].map(([field, fieldWays]) => ({
      field,
      who: fieldWays.some(way => way.length === 0) ? 'Everyone' : describeRule(fieldWays),
    })),
  };
};

type PermissionIssue = { action?: string; severity: 'error' | 'warning'; message: string };

const isNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0;

const conditionProblem = (actionKey: string, condition: PermissionCondition) => {
  const kind = kindOf(condition);
  if (!kind) return `“${JSON.stringify(condition)}” isn’t a condition HRM knows`;
  if (!conditionsFor(actionKey).includes(kind)) return `“${CONDITION_LABELS[kind]}” can’t be used here`;
  const value = valueOf(condition);
  if ((kind === 'createdHoursAgo' || kind === 'createdDaysAgo') && !isNumber(value)) {
    return `“${CONDITION_LABELS[kind]}” needs a number above 0`;
  }
  if (kind === 'sectionType' && (typeof value !== 'string' || !value.trim())) return 'The section kind is empty';
  if (kind === 'field' && (typeof value !== 'string' || !FIELD_PATTERN.test(value))) {
    return 'A field needs its form and name';
  }
  return undefined;
};

// What HRM would refuse (errors: it won't start) or quietly ignore (warnings)
export const permissionIssues = (rules: PermissionRules): PermissionIssue[] => {
  const issues: PermissionIssue[] = [];
  PERMISSION_ACTIONS.forEach(action => {
    const ways = rules[action.key];
    if (ways === undefined) {
      issues.push({ action: action.key, severity: 'error', message: `${action.label}: missing. HRM won’t start.` });
      return;
    }
    if (!Array.isArray(ways) || !ways.every(Array.isArray)) {
      issues.push({ action: action.key, severity: 'error', message: `${action.label}: not a list of ways.` });
      return;
    }
    ways.forEach((way, index) => {
      const where = ways.length > 1 ? ` (way ${index + 1})` : '';
      way.forEach(condition => {
        const problem = conditionProblem(action.key, condition);
        if (problem)
          issues.push({ action: action.key, severity: 'error', message: `${action.label}${where}: ${problem}.` });
      });
      if (way.length === 0) {
        issues.push({
          action: action.key,
          severity: 'warning',
          message: `${action.label}${where}: a way with no conditions never allows anyone.`,
        });
      }
      if (action.target === 'contactField' && way.filter(condition => kindOf(condition) === 'field').length > 1) {
        issues.push({
          action: action.key,
          severity: 'error',
          message: `${action.label}${where}: one field per way (HRM ignores a way naming two).`,
        });
      }
    });
  });
  return issues;
};

// Keys HRM doesn't know (older ones some files still have): kept as they are
export const unknownKeys = (rules: PermissionRules) => Object.keys(rules).filter(key => !actionOf(key));

// Nobody can do anything with cases: the helpline doesn't use them
export const casesUnused = (rules: PermissionRules) =>
  PERMISSION_GROUPS[0].actions.every(action => Array.isArray(rules[action.key]) && rules[action.key].length === 0);

const compact = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(compact).join(', ')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .map(([key, each]) => `${JSON.stringify(key)}: ${compact(each)}`)
      .join(', ')}}`;
  }
  return JSON.stringify(value);
};

// The blank-line-separated blocks the hrm repo's files have: cases, contacts (fields with them),
// profiles, post-survey, identifiers
const blockOf = (key: string) => {
  const action = actionOf(key);
  if (!action) return 'unknown';
  if (action.target === 'contactField') return 'contact';
  if (action.target === 'profileSection') return 'profile';
  return action.target;
};

/**
 * The file as the hrm repo writes them: one action per line, its ways on that line, a blank line
 * between blocks. Keys stay in the file's own order (an action added is at the end).
 */
export const formatPermissionRules = (rules: PermissionRules) => {
  const blocks: string[][] = [];
  let last: string | undefined;
  Object.keys(rules).forEach(key => {
    const block = blockOf(key);
    // Keys HRM doesn't know stay with the block they're in
    if (blocks.length === 0 || (block !== last && block !== 'unknown')) blocks.push([]);
    if (block !== 'unknown') last = block;
    blocks[blocks.length - 1].push(`  ${JSON.stringify(key)}: ${compact(rules[key])}`);
  });
  return `{\n${blocks.map(block => block.join(',\n')).join(',\n\n')}\n}\n`;
};

export const getPermissionRules = (files: DefinitionFileMap) => {
  const filePath = Object.keys(files).find(isPermissionRulesPath);
  return filePath ? { filePath, rules: files[filePath] as PermissionRules } : undefined;
};

// What changed, one line per action, e.g. "See a case: Nobody → Supervisors"
export const summarizePermissionChanges = (before: PermissionRules | undefined, after: PermissionRules) => {
  const keys = [...new Set([...PERMISSION_ACTIONS.map(action => action.key), ...Object.keys(after)])];
  return keys
    .filter(key => JSON.stringify(before?.[key]) !== JSON.stringify(after[key]))
    .map(key => {
      const action = actionOf(key);
      const describe = action?.target === 'contactField' ? describeFieldRuleShort : describeRule;
      return `${action?.label ?? key}: ${describe(before?.[key])} → ${describe(after[key])}`;
    });
};

function describeFieldRuleShort(ways: PermissionCondition[][] | undefined) {
  const { everyField, fields } = describeFieldRule(ways);
  const parts = [
    ...(everyField ? [`every field: ${everyField}`] : []),
    ...fields.map(({ field, who }) => `${field}: ${who}`),
  ];
  return parts.length > 0 ? parts.join('; ') : 'no fields named';
}
