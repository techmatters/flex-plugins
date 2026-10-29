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
 * The routing design in plain words, for people with no technical background; and "test a task":
 * which rule a task would match, and who could get it.
 */
import type { Condition, MoveOn, QueueWorkers, Role, RoutingDesign, Rule, Target, WhoBlock, Workflow } from './model';
import { attributeLabel, valueLabel } from './model';

const list = (items: string[], last = 'and') =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ${last} ${items[items.length - 1]}`;

export const describeCondition = (condition: Condition): string => {
  if (condition.kind === 'custom') return condition.expression;
  const values = condition.values.map(valueLabel);
  const attribute = attributeLabel(condition.attribute);
  switch (condition.operator) {
    case '==':
      return `${attribute}: ${values[0]}`;
    case '!=':
      return `${attribute}: not ${values[0]}`;
    case 'IN':
      return `${attribute}: ${list(values, 'or')}`;
    default:
      return `${attribute}: not ${list(values, 'or')}`;
  }
};

const describeGroup = (conditions: Condition[]) =>
  conditions.length === 0 ? 'Every task' : conditions.map(describeCondition).join(' · ');

// "Channel: Voice · Service: ChildHelp, or Transferred to: master · Channel: Voice"
export const describeConditions = (groups: Condition[][]) =>
  groups.length === 0 || groups.some((group) => group.length === 0)
    ? 'Every task'
    : groups.map(describeGroup).join(groups.length > 1 ? ', or ' : '');

const ROLE_WORDS: Record<string, string> = {
  agent: 'Counselors',
  'agent,supervisor': 'Counselors or supervisors',
  'supervisor,agent': 'Counselors or supervisors',
  supervisor: 'Supervisors',
};

export const rolesLabel = (roles: Role[]) => ROLE_WORDS[roles.join(',')] ?? roles.join(' or ');

export const describeBlock = (block: WhoBlock): string => {
  switch (block.kind) {
    case 'notWaitingOffline':
      return 'not busy with an offline contact';
    case 'transfers':
      return block.ignoreAgent
        ? 'transfers go to who they were sent to, and not back to who transferred them'
        : 'transfers go to who they were sent to';
    case 'voiceChatExclusive':
      return 'never a call and a chat at the same time';
    case 'voicemailOneAtATime':
      return 'one voicemail at a time';
    case 'skills':
      return `with ${list(block.skills)}`;
    case 'roles':
      return rolesLabel(block.roles).toLowerCase();
    case 'offlineContactAlternative':
      return 'or the offline contact the counselor is recording';
    case 'offlineContactOwner':
      return 'only the counselor who recorded the offline contact';
    case 'targetWorker':
      return 'only the counselor it was sent to';
    default:
      return `custom: ${block.expression}`;
  }
};

// "Counselors with Calls, Spanish and TYA"
export const describeWho = (blocks: WhoBlock[]): string => {
  const roles = blocks.find((block) => block.kind === 'roles');
  const skills = blocks.find((block) => block.kind === 'skills');
  const who = roles?.kind === 'roles' ? rolesLabel(roles.roles) : 'Anyone';
  return skills?.kind === 'skills' && skills.skills.length > 0 ? `${who} with ${list(skills.skills)}` : who;
};

// worker.routing.levels.<skill> DESC / ASC
const LEVEL_ORDER = /^worker\.routing\.levels\.([\w-]+)\s+(ASC|DESC)$/i;

export const levelOrderOf = (orderBy: string | undefined) => {
  const found = orderBy?.trim().match(LEVEL_ORDER);
  return found ? { skill: found[1], direction: found[2].toUpperCase() as 'ASC' | 'DESC' } : undefined;
};

export const levelOrder = (skill: string, direction: 'ASC' | 'DESC') => `worker.routing.levels.${skill} ${direction}`;

export const describeOrderBy = (orderBy: string | undefined): string | undefined => {
  if (!orderBy) return undefined;
  const level = levelOrderOf(orderBy);
  if (!level) return `Prefer: ${orderBy}`;
  return `Prefer the ${level.direction === 'DESC' ? 'highest' : 'lowest'} level of ${level.skill} first`;
};

export const describeMoveOn = (moveOn: MoveOn): string => {
  if (moveOn.kind === 'skip') {
    return /^1\s*==\s*1$/.test(moveOn.expression)
      ? 'If nobody can take it right away, try the next one'
      : `Try the next one when ${moveOn.expression}`;
  }
  if (moveOn.kind === 'timeout') {
    const minutes = moveOn.seconds / 60;
    return `If nobody takes it in ${Number.isInteger(minutes) && minutes >= 1 ? `${minutes} minute${minutes === 1 ? '' : 's'}` : `${moveOn.seconds} seconds`}, try the next one`;
  }
  return 'Wait here until someone takes it';
};

export const describeQueueWorkers = (workers: QueueWorkers): string => {
  if (workers.kind === 'nobody') return 'Nobody (a holding queue)';
  if (workers.kind === 'custom') return `Custom: ${workers.expression}`;
  if (workers.allOf.length === 0) return 'Everyone';
  return `Counselors with ${list(workers.allOf.map((group) => list(group, 'or')))}`;
};

export const queueName = (design: RoutingDesign, key: string) =>
  design.queues.find((queue) => queue.key === key)?.name ?? key;

// ---------------------------------------------------------------------------------------------
// Test a task

export type TaskAttributes = Record<string, string | number | boolean>;

export type ConditionResult = { condition: Condition; result: boolean | 'unknown' };

const matches = (condition: Condition, task: TaskAttributes): boolean | 'unknown' => {
  if (condition.kind === 'custom') return 'unknown';
  const value = task[condition.attribute];
  const found = condition.values.some((candidate) => candidate === value);
  switch (condition.operator) {
    case '==':
    case 'IN':
      return found;
    default:
      return value !== undefined && !found;
  }
};

export type GroupResult = { conditions: ConditionResult[]; matched: boolean | 'unknown' };

export type TaskTest = {
  // Each rule in order, until the one that matches
  checked: { rule: Rule; groups: GroupResult[]; matched: boolean | 'unknown' }[];
  matched?: Rule;
};

const allOf = (results: (boolean | 'unknown')[]): boolean | 'unknown' =>
  results.includes(false) ? false : results.includes('unknown') ? 'unknown' : true;

const anyOf = (results: (boolean | 'unknown')[]): boolean | 'unknown' =>
  results.includes(true) ? true : results.includes('unknown') ? 'unknown' : false;

/**
 * The rule a task with these attributes would match, as TaskRouter does: rules in order, the first
 * with a group of conditions that all hold. Custom conditions can't be tried here: they're "unknown".
 */
export const testTask = (workflow: Workflow, task: TaskAttributes): TaskTest => {
  const checked: TaskTest['checked'] = [];
  for (const rule of workflow.rules) {
    const groups = rule.when.map((group) => {
      const conditions = group.map((condition) => ({
        condition,
        result: matches(condition, task),
      }));
      return { conditions, matched: allOf(conditions.map((condition) => condition.result)) };
    });
    const matched = groups.length === 0 ? true : anyOf(groups.map((group) => group.matched));
    checked.push({ rule, groups, matched });
    if (matched === true) return { checked, matched: rule };
  }
  return { checked };
};

// The attributes the workflow's rules look at, with the values they compare to
export const attributesOf = (workflow: Workflow): Record<string, (string | number | boolean)[]> => {
  const attributes: Record<string, Set<string | number | boolean>> = {};
  workflow.rules.forEach((rule) =>
    rule.when.flat().forEach((condition) => {
      if (condition.kind !== 'compare') return;
      attributes[condition.attribute] ??= new Set();
      condition.values.forEach((value) => attributes[condition.attribute].add(value));
    }),
  );
  return Object.fromEntries(Object.entries(attributes).map(([attribute, values]) => [attribute, [...values]]));
};

// The target's skills, for checks and the diagram
export const targetSkills = (target: Target) =>
  target.who.flatMap((block) => (block.kind === 'skills' ? block.skills : []));
