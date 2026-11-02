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
 * The rules most helplines' workflows have, to add in one click. They're written as in the shared
 * master workflow (twilio-iac/helplines/templates/workflows/master.tftpl), which most helplines
 * copy: Direct Transfers, Offline Contacts and E2E Test are in 12, 20 and 15 of their workflows.
 */
import { readRule } from './convert';
import type { RoutingDesign, Rule, Workflow } from './model';

// Who can get a task in master.tftpl: not waiting to record an offline contact, never a call and a
// chat at once, and transfers go to their counselor (and never back to who transferred it)
const STANDARD_WHO =
  "(worker.waitingOfflineContact != true AND ((task.channelType == 'voice' AND worker.channel.chat.assigned_tasks == 0) OR (task.channelType != 'voice' AND worker.channel.voice.assigned_tasks == 0)) AND ((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker' AND worker.sid != task.ignoreAgent)))";
const OFFLINE_CONTACT_OWNER = '(task.targetSid == worker.sid AND task.isContactlessTask == true)';

export type CommonRule = {
  name: string;
  description: string;
  // Where it goes in the workflow: before the helpline's own rules, or after them (a catch-all)
  at: 'start' | 'end';
  filter: (queue: (preferred?: string) => string) => Record<string, unknown>;
};

export const COMMON_RULES: CommonRule[] = [
  {
    name: 'Direct Transfers',
    description: 'A contact transferred to one counselor goes only to them.',
    at: 'start',
    filter: (queue) => ({
      filter_friendly_name: 'Direct Transfers',
      expression: "transferTargetType =='worker' AND isContactlessTask != true",
      targets: [
        {
          queue: queue(),
          known_worker_sid: 'task.targetSid',
          expression: 'worker.waitingOfflineContact != true',
          priority: 150,
        },
      ],
    }),
  },
  {
    name: 'Offline Contacts',
    description: 'An offline contact goes back to the counselor recording it.',
    at: 'start',
    filter: (queue) => ({
      filter_friendly_name: 'Offline Contacts',
      expression: 'isContactlessTask == true',
      targets: [{ expression: OFFLINE_CONTACT_OWNER, queue: queue() }],
    }),
  },
  {
    name: 'E2E Test',
    description: "The automated end-to-end tests' webchats, to their own queue.",
    at: 'start',
    filter: (queue) => ({
      filter_friendly_name: 'E2E Test',
      expression: "channelType=='web' AND e2eTestMode=='true'",
      targets: [
        {
          expression: `${STANDARD_WHO} OR (worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true)`,
          queue: queue('e2e_test'),
        },
      ],
    }),
  },
  {
    name: 'Everyone else',
    description: 'Every other task, to the main queue (the last rule, when nothing before took it).',
    at: 'end',
    filter: (queue) => ({
      filter_friendly_name: 'Everyone else',
      expression: '1==1',
      targets: [{ expression: STANDARD_WHO, queue: queue() }],
    }),
  },
];

const queueReference = (key: string) =>
  /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? `\${task_queues.${key}}` : `\${task_queues["${key}"]}`;

// The helpline's queue for it: the one asked for if the helpline has it, otherwise its main queue
const queueFor = (design: RoutingDesign) => (preferred?: string) => {
  const keys = design.queues.map((queue) => queue.key);
  const key = (preferred && keys.includes(preferred) && preferred) || (keys.includes('master') ? 'master' : keys[0]);
  return queueReference(key ?? 'master');
};

export const commonRule = (design: RoutingDesign, common: CommonRule): Rule =>
  readRule(common.filter(queueFor(design)));

// Whether the workflow already has it: by name, or by its task conditions
export const hasCommonRule = (workflow: Workflow, design: RoutingDesign, common: CommonRule) => {
  const when = JSON.stringify(commonRule(design, common).when);
  return workflow.rules.some(
    (rule) => rule.name.trim().toLowerCase() === common.name.toLowerCase() || JSON.stringify(rule.when) === when,
  );
};

export const addCommonRule = (workflow: Workflow, design: RoutingDesign, common: CommonRule): Workflow => {
  const rule = commonRule(design, common);
  if (common.at === 'end') return { ...workflow, rules: [...workflow.rules, rule] };
  // Before the helpline's own rules, after the common ones already at the start, in the usual order
  const commonAtStart = COMMON_RULES.filter((candidate) => candidate.at === 'start');
  const order = commonAtStart.indexOf(common);
  let index = 0;
  while (
    index < workflow.rules.length &&
    commonAtStart.some(
      (candidate) =>
        commonAtStart.indexOf(candidate) < order &&
        workflow.rules[index].name.trim().toLowerCase() === candidate.name.toLowerCase(),
    )
  ) {
    index += 1;
  }
  return { ...workflow, rules: [...workflow.rules.slice(0, index), rule, ...workflow.rules.slice(index)] };
};
