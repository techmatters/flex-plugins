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
 * Between a helpline's live TaskRouter config (workflow templates, task_queues) and a routing
 * design. Reading keeps what each part was; writing gives back exactly that for whatever wasn't
 * changed, and builds the rest from the design's blocks.
 */
import { readConditions, readQueueWorkers, readWho, writeConditions, writeQueueWorkers, writeWho } from './expressions';
import type { MoveOn, Queue, Rule, Target, Workflow } from './model';

type Json = Record<string, unknown>;

// ${task_queues.en_std}, or ${task_queues["988_en"]} for keys that aren't plain names
const QUEUE_REFERENCE = /^\$\{\s*task_queues(?:\.([A-Za-z_][A-Za-z0-9_]*)|\["([^"]+)"\])\s*\}$/;
const queueKeyOf = (queue: string) => {
  const found = queue.match(QUEUE_REFERENCE);
  return found ? (found[1] ?? found[2]) : undefined;
};
const queueReference = (key: string) =>
  /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? `\${task_queues.${key}}` : `\${task_queues["${key}"]}`;
const KEY = /^[A-Za-z0-9_]+$/;

let nextId = 0;
const newId = (prefix: string) => {
  nextId += 1;
  return `${prefix}-${Date.now().toString(36)}-${nextId}`;
};

const textOf = (value: unknown) => (typeof value === 'string' ? value : undefined);
const numberOf = (value: unknown) => (typeof value === 'number' ? value : undefined);

// ---------------------------------------------------------------------------------------------
// Targets

const moveOnOf = (target: Json): MoveOn => {
  const skipIf = textOf(target.skip_if);
  if (skipIf) return { kind: 'skip', expression: skipIf };
  const timeout = numberOf(target.timeout);
  if (timeout !== undefined) return { kind: 'timeout', seconds: timeout };
  return { kind: 'wait' };
};

export const readTarget = (target: Json): Target => {
  const queue = textOf(target.queue) ?? '';
  return {
    id: newId('t'),
    queue: queueKeyOf(queue) ?? queue,
    who: readWho(textOf(target.expression)),
    ...(numberOf(target.priority) !== undefined ? { priority: numberOf(target.priority) } : {}),
    moveOn: moveOnOf(target),
    ...(textOf(target.order_by) ? { orderBy: textOf(target.order_by) } : {}),
    ...(textOf(target.known_worker_sid) ? { knownWorker: textOf(target.known_worker_sid) } : {}),
    original: target,
  };
};

// What a target means, without its id or what it was: two targets that mean the same compare equal
const meaningOf = (target: Target) => {
  const { id, original, ...rest } = target;
  return JSON.stringify(rest);
};

const MANAGED_TARGET_KEYS = ['queue', 'expression', 'priority', 'timeout', 'skip_if', 'order_by', 'known_worker_sid'];

export const writeTarget = (target: Target): Json => {
  if (target.original && meaningOf(readTarget(target.original)) === meaningOf(target)) return target.original;
  const kept = Object.fromEntries(
    Object.entries(target.original ?? {}).filter(([key]) => !MANAGED_TARGET_KEYS.includes(key)),
  );
  const originalWho = target.original ? readWho(textOf(target.original.expression)) : undefined;
  const expression =
    originalWho && JSON.stringify(originalWho) === JSON.stringify(target.who)
      ? textOf(target.original!.expression)
      : writeWho(target.who);
  const queueWasReference = !target.original || QUEUE_REFERENCE.test(textOf(target.original.queue) ?? '');
  return {
    queue: KEY.test(target.queue) && queueWasReference ? queueReference(target.queue) : target.queue,
    ...(target.knownWorker ? { known_worker_sid: target.knownWorker } : {}),
    ...(expression ? { expression } : {}),
    ...(target.moveOn.kind === 'skip' ? { skip_if: target.moveOn.expression } : {}),
    ...(target.moveOn.kind === 'timeout' ? { timeout: target.moveOn.seconds } : {}),
    ...(target.priority !== undefined ? { priority: target.priority } : {}),
    ...(target.orderBy ? { order_by: target.orderBy } : {}),
    ...kept,
  };
};

// ---------------------------------------------------------------------------------------------
// Rules (filters)

export const readRule = (filter: Json): Rule => ({
  id: newId('r'),
  name: textOf(filter.filter_friendly_name) ?? '',
  when: readConditions(textOf(filter.expression)),
  targets: (Array.isArray(filter.targets) ? filter.targets : []).map((target) => readTarget(target as Json)),
  original: filter,
});

const ruleMeaning = (rule: Rule) =>
  JSON.stringify({ name: rule.name, when: rule.when, targets: rule.targets.map(meaningOf) });

export const writeRule = (rule: Rule): Json => {
  if (rule.original && ruleMeaning(readRule(rule.original)) === ruleMeaning(rule)) return rule.original;
  const { filter_friendly_name, expression, targets, ...kept } = rule.original ?? {};
  const conditionsUnchanged =
    rule.original && JSON.stringify(readConditions(textOf(expression))) === JSON.stringify(rule.when);
  return {
    filter_friendly_name: rule.name,
    expression: conditionsUnchanged ? (expression as string) : writeConditions(rule.when),
    targets: rule.targets.map(writeTarget),
    ...kept,
  };
};

// ---------------------------------------------------------------------------------------------
// Workflows

/**
 * A workflow from its settings in common.hcl and its template (already read into a value).
 */
export const readWorkflow = (
  key: string,
  settings: Json,
  template: Json,
  source: { template?: string; shared?: boolean; templateStyle?: 'json' | 'jsonencode' },
): Workflow => {
  const taskRouting = (template.task_routing ?? {}) as Json;
  const { filters, ...routingRest } = taskRouting;
  const { task_routing, ...templateRest } = template;
  return {
    key,
    name: textOf(settings.friendly_name) ?? key,
    ...(numberOf(settings.task_reservation_timeout) !== undefined
      ? { reservationTimeout: numberOf(settings.task_reservation_timeout) }
      : {}),
    rules: (Array.isArray(filters) ? filters : []).map((filter) => readRule(filter as Json)),
    ...source,
    settings: routingRest,
    templateSettings: templateRest,
    original: settings,
  };
};

// The workflow's template, as a value (written out by templateText)
export const writeWorkflowTemplate = (workflow: Workflow): Json => ({
  ...(workflow.templateSettings ?? {}),
  task_routing: { filters: workflow.rules.map(writeRule), ...(workflow.settings ?? {}) },
});

// Its settings in common.hcl's workflows
export const writeWorkflowSettings = (workflow: Workflow): Json => {
  const { friendly_name, task_reservation_timeout, ...kept } = workflow.original ?? {};
  return {
    friendly_name: workflow.name,
    ...(workflow.template ? { templatefile: `/app/twilio-iac/helplines/${workflow.template}` } : {}),
    ...kept,
    ...(workflow.reservationTimeout !== undefined ? { task_reservation_timeout: workflow.reservationTimeout } : {}),
  };
};

// ---------------------------------------------------------------------------------------------
// Queues

export const readQueue = (key: string, settings: Json): Queue => {
  const { friendly_name, target_workers, ...rest } = settings;
  return {
    key,
    name: textOf(friendly_name) ?? key,
    workers: readQueueWorkers(textOf(target_workers)),
    ...(Object.keys(rest).length > 0 ? { settings: rest } : {}),
    original: settings,
  };
};

export const writeQueue = (queue: Queue): Json => {
  const original = queue.original ?? {};
  const workersUnchanged =
    queue.original &&
    JSON.stringify(readQueueWorkers(textOf(original.target_workers))) === JSON.stringify(queue.workers);
  return {
    ...original,
    target_workers: workersUnchanged ? original.target_workers : writeQueueWorkers(queue.workers),
    friendly_name: queue.name,
    ...(queue.settings ?? {}),
  };
};
