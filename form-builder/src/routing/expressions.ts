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
 * Reads TaskRouter expressions into the designer's building blocks, and writes them back
 * (docs/routing-designer.md, "How TaskRouter expressions are read"):
 *
 * - a target's expression: who can get the task (skills, roles, capacity, transfers...);
 * - a filter's expression: the task's conditions (channel, service, language...);
 * - a queue's target_workers: the skills needed to work in it.
 *
 * Whatever isn't one of the blocks is kept as a custom condition, as written.
 */
import type { Condition, QueueWorkers, Role, WhoBlock } from './model';

// Spaces as TaskRouter ignores them: single spaces, none just inside brackets, single quotes
const canonical = (text: string) =>
  text.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/"/g, "'").trim();

// Outer brackets around the whole expression, if they're a pair
const unwrap = (text: string): string => {
  let result = text.trim();
  for (;;) {
    if (!result.startsWith('(') || !result.endsWith(')')) return result;
    let depth = 0;
    let wraps = true;
    for (let index = 0; index < result.length; index += 1) {
      if (result[index] === '(') depth += 1;
      if (result[index] === ')') depth -= 1;
      if (depth === 0 && index < result.length - 1) {
        wraps = false;
        break;
      }
    }
    if (!wraps) return result;
    result = result.slice(1, -1).trim();
  }
};

// The parts of an expression joined by AND (or OR) outside brackets and quotes
export const splitTopLevel = (text: string, operator: 'AND' | 'OR'): string[] => {
  const parts: string[] = [];
  const separator = ` ${operator} `;
  let depth = 0;
  let quote: string | undefined;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (char === quote) quote = undefined;
    } else if (char === "'" || char === '"') quote = char;
    else if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth -= 1;
    else if (depth === 0 && text.startsWith(separator, index)) {
      parts.push(text.slice(start, index).trim());
      start = index + separator.length;
      index += separator.length - 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
};

const TRANSFERS = canonical(
  "((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker' AND worker.sid != task.ignoreAgent))",
);
const TRANSFERS_KEEP_AGENT = canonical(
  "((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker'))",
);
const VOICE_CHAT = [
  "((task.channelType == 'voice' AND worker.channel.chat.assigned_tasks == 0) OR (task.channelType != 'voice' AND worker.channel.voice.assigned_tasks == 0))",
  "((task.channelType == 'voice' AND worker.channel.chat.assigned_tasks == 0) OR (task.channelType == 'chat' AND worker.channel.voice.assigned_tasks == 0))",
].map(canonical);
const VOICEMAIL = canonical("(task.channelType == 'voicemail' AND worker.channel.voicemail.assigned_tasks == 0)");
const NOT_WAITING_OFFLINE = 'worker.waitingOfflineContact != true';
// "...or it's the offline contact this counselor is recording", added as an alternative (… OR …)
const OFFLINE_CONTACT =
  'worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true';

const TARGET_WORKER = /^(?:task\.targetSid == worker\.sid|worker\.sid == task\.targetSid)$/;
const CONTACTLESS = 'task.isContactlessTask == true';

const SKILL = /^'([^']+)' IN worker\.routing\.skills$/;
const ROLE = /^worker\.roles HAS '(agent|supervisor)'$/;

const readClause = (clause: string): WhoBlock => {
  const text = canonical(clause);
  const inner = unwrap(text);
  if (inner === NOT_WAITING_OFFLINE) return { kind: 'notWaitingOffline' };
  if (`(${inner})` === TRANSFERS || text === TRANSFERS) return { kind: 'transfers', ignoreAgent: true };
  if (`(${inner})` === TRANSFERS_KEEP_AGENT || text === TRANSFERS_KEEP_AGENT)
    return { kind: 'transfers', ignoreAgent: false };
  if (VOICE_CHAT.includes(`(${inner})`) || VOICE_CHAT.includes(text)) return { kind: 'voiceChatExclusive' };
  if (`(${inner})` === VOICEMAIL) return { kind: 'voicemailOneAtATime' };
  if (TARGET_WORKER.test(inner)) return { kind: 'targetWorker' };
  const parts = splitTopLevel(inner, 'AND').map((part) => unwrap(part));
  if (parts.length === 2 && parts.some((part) => TARGET_WORKER.test(part)) && parts.includes(CONTACTLESS)) {
    return { kind: 'offlineContactOwner' };
  }
  const skills = splitTopLevel(inner, 'AND').map((part) => unwrap(part).match(SKILL)?.[1]);
  if (skills.every(Boolean)) return { kind: 'skills', skills: skills as string[] };
  const roles = splitTopLevel(inner, 'OR').map((part) => unwrap(part).match(ROLE)?.[1]);
  if (roles.every(Boolean)) return { kind: 'roles', roles: roles as Role[] };
  return { kind: 'custom', expression: clause.trim() };
};

// Who can get a task, from a target's expression
export const readWho = (expression: string | undefined): WhoBlock[] => {
  if (!expression?.trim()) return [];
  const alternatives = splitTopLevel(unwrap(expression), 'OR');
  // (blocks) OR (the offline contact alternative)
  if (alternatives.length === 2 && unwrap(canonical(alternatives[1])) === OFFLINE_CONTACT) {
    const first = readWho(alternatives[0]);
    if (!first.some((block) => block.kind === 'offlineContactAlternative')) {
      return [...first, { kind: 'offlineContactAlternative' }];
    }
  }
  const clauses = splitTopLevel(unwrap(expression), 'AND');
  // Several alternatives (… OR …) at the top don't split into blocks
  if (clauses.length === 1 && alternatives.length > 1) {
    return [{ kind: 'custom', expression: expression.trim() }];
  }
  const blocks: WhoBlock[] = [];
  clauses.forEach((clause) => {
    const block = readClause(clause);
    // Skills written as separate clauses are one set of skills
    const previous = blocks[blocks.length - 1];
    if (block.kind === 'skills' && previous?.kind === 'skills') previous.skills.push(...block.skills);
    else blocks.push(block);
  });
  // "the counselor it was sent to" and "an offline contact", written as separate clauses
  const contactless = blocks.findIndex(
    (block) => block.kind === 'custom' && unwrap(canonical(block.expression)) === CONTACTLESS,
  );
  const target = blocks.findIndex((block) => block.kind === 'targetWorker');
  if (contactless >= 0 && target >= 0) {
    return blocks
      .map((block, index): WhoBlock => (index === target ? { kind: 'offlineContactOwner' } : block))
      .filter((_, index) => index !== contactless);
  }
  return blocks;
};

const writeBlock = (block: WhoBlock): string => {
  switch (block.kind) {
    case 'notWaitingOffline':
      return NOT_WAITING_OFFLINE;
    case 'transfers':
      return block.ignoreAgent
        ? "((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker' AND worker.sid != task.ignoreAgent))"
        : "((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker'))";
    case 'voiceChatExclusive':
      return "((task.channelType == 'voice' AND worker.channel.chat.assigned_tasks == 0) OR (task.channelType != 'voice' AND worker.channel.voice.assigned_tasks == 0))";
    case 'voicemailOneAtATime':
      return "(task.channelType == 'voicemail' AND worker.channel.voicemail.assigned_tasks == 0)";
    case 'skills':
      return `(${block.skills.map((skill) => `'${skill}' IN worker.routing.skills`).join(' AND ')})`;
    case 'roles':
      return `(${block.roles.map((role) => `worker.roles HAS '${role}'`).join(' OR ')})`;
    case 'offlineContactAlternative':
      return '';
    case 'offlineContactOwner':
      return 'task.targetSid == worker.sid AND task.isContactlessTask == true';
    case 'targetWorker':
      return 'task.targetSid == worker.sid';
    default:
      return splitTopLevel(unwrap(block.expression), 'OR').length > 1 ? `(${block.expression})` : block.expression;
  }
};

export const writeWho = (blocks: WhoBlock[]): string | undefined => {
  // Custom conditions left empty in the editor aren't written
  const rest = blocks.filter(
    (block) => block.kind !== 'offlineContactAlternative' && !(block.kind === 'custom' && !block.expression.trim()),
  );
  const main = rest.length === 0 ? undefined : `(${rest.map(writeBlock).join(' AND ')})`;
  if (!blocks.some((block) => block.kind === 'offlineContactAlternative')) return main;
  return `${main ?? '(1==1)'} OR (${OFFLINE_CONTACT})`;
};

// ---------------------------------------------------------------------------------------------
// Task conditions

const VALUE = /^(?:'([^']*)'|"([^"]*)"|(true|false)|(-?\d+(?:\.\d+)?))$/;
const parseValue = (text: string): string | number | boolean | undefined => {
  const found = text.trim().match(VALUE);
  if (!found) return undefined;
  if (found[1] !== undefined) return found[1];
  if (found[2] !== undefined) return found[2];
  if (found[3] !== undefined) return found[3] === 'true';
  return Number(found[4]);
};

const readCondition = (clause: string): Condition => {
  const text = unwrap(clause.trim());
  const list = text.match(/^([A-Za-z_][\w.]*) (NOT IN|IN) \[(.*)\]$/);
  if (list) {
    const values = list[3].split(',').map(parseValue);
    if (values.every((value) => value !== undefined)) {
      return {
        kind: 'compare',
        attribute: list[1],
        operator: list[2] as 'IN' | 'NOT IN',
        values: values as string[],
      };
    }
  }
  const compare = text.match(/^([A-Za-z_][\w.]*)\s*(==|!=)\s*(.+)$/);
  if (compare) {
    const value = parseValue(compare[3]);
    if (value !== undefined)
      return {
        kind: 'compare',
        attribute: compare[1],
        operator: compare[2] as '==' | '!=',
        values: [value],
      };
  }
  return { kind: 'custom', expression: clause.trim() };
};

const EVERY_TASK = /^1\s*==?\s*1$/;

const readGroup = (expression: string): Condition[] =>
  EVERY_TASK.test(unwrap(expression)) ? [] : splitTopLevel(unwrap(expression), 'AND').map(readCondition);

// A filter's conditions, as alternative groups (… OR …) of conditions that must all match; "1==1"
// (every task) is no groups
export const readConditions = (expression: string | undefined): Condition[][] => {
  if (!expression?.trim() || EVERY_TASK.test(expression.trim())) return [];
  return splitTopLevel(unwrap(expression), 'OR').map(readGroup);
};

const writeValue = (value: string | number | boolean) => (typeof value === 'string' ? `'${value}'` : String(value));

const writeGroup = (conditions: Condition[]): string =>
  conditions.length === 0
    ? '1==1'
    : conditions
        .map((condition) => {
          if (condition.kind === 'custom') {
            return splitTopLevel(unwrap(condition.expression), 'OR').length > 1
              ? `(${condition.expression})`
              : condition.expression;
          }
          if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
            return `${condition.attribute} ${condition.operator} [${condition.values.map(writeValue).join(', ')}]`;
          }
          return `${condition.attribute} ${condition.operator} ${writeValue(condition.values[0])}`;
        })
        .join(' AND ');

export const writeConditions = (groups: Condition[][]): string => {
  // An empty group is every task
  if (groups.length === 0 || groups.some((group) => group.length === 0)) return '1==1';
  if (groups.length === 1) return writeGroup(groups[0]);
  return groups.map((group) => `(${writeGroup(group)})`).join(' OR ');
};

// ---------------------------------------------------------------------------------------------
// Queues: who can work in them

const QUEUE_SKILL = /^routing\.skills HAS ['"]([^'"]+)['"]$/;

export const readQueueWorkers = (expression: string | undefined): QueueWorkers => {
  const text = (expression ?? '').trim();
  if (/^1\s*==?\s*0$/.test(text)) return { kind: 'nobody' };
  const groups = splitTopLevel(unwrap(text), 'AND').map((group) =>
    splitTopLevel(unwrap(group), 'OR').map((part) => unwrap(part).match(QUEUE_SKILL)?.[1]),
  );
  if (text && groups.every((group) => group.every(Boolean))) return { kind: 'skills', allOf: groups as string[][] };
  return { kind: 'custom', expression: text };
};

export const writeQueueWorkers = (workers: QueueWorkers): string => {
  if (workers.kind === 'nobody') return '1==0';
  if (workers.kind === 'custom') return workers.expression;
  if (workers.allOf.length === 0) return '1==1';
  return workers.allOf
    .map((group) => {
      const skills = group.map((skill) => `routing.skills HAS '${skill}'`);
      return skills.length > 1 ? `(${skills.join(' OR ')})` : skills[0];
    })
    .join(' AND ');
};

// Every skill named in an expression (for the helpline's skills list)
export const skillsIn = (blocks: WhoBlock[]): string[] =>
  blocks.flatMap((block) => (block.kind === 'skills' ? block.skills : []));
