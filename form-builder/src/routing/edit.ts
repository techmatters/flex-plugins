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
 * Changes to a routing design, as plain functions (the editor calls them; tests can too).
 */
import type { Capacity, Role, RoutingDesign, Rule, Target, WhoBlock, Workflow } from './model';

let nextId = 0;
export const newRoutingId = (prefix: string) => {
  nextId += 1;
  return `${prefix}-${Date.now().toString(36)}-${nextId}`;
};

// The blocks every new target starts with: the way the helplines' targets are usually written
export const STANDARD_BLOCKS: WhoBlock[] = [
  { kind: 'notWaitingOffline' },
  { kind: 'voiceChatExclusive' },
  { kind: 'skills', skills: [] },
  { kind: 'roles', roles: ['agent'] },
  { kind: 'transfers', ignoreAgent: true },
];

export const newTarget = (queue = ''): Target => ({
  id: newRoutingId('t'),
  queue,
  who: structuredClone(STANDARD_BLOCKS),
  moveOn: { kind: 'wait' },
});

export const newRule = (name: string): Rule => ({
  id: newRoutingId('r'),
  name,
  when: [],
  targets: [newTarget()],
});

export const updateWorkflow = (
  design: RoutingDesign,
  key: string,
  change: (workflow: Workflow) => Workflow,
): RoutingDesign => ({
  ...design,
  workflows: design.workflows.map((workflow) => (workflow.key === key ? change(workflow) : workflow)),
});

export const updateRule = (workflow: Workflow, ruleId: string, change: (rule: Rule) => Rule): Workflow => ({
  ...workflow,
  rules: workflow.rules.map((rule) => (rule.id === ruleId ? change(rule) : rule)),
});

export const updateTarget = (rule: Rule, targetId: string, change: (target: Target) => Target): Rule => ({
  ...rule,
  targets: rule.targets.map((target) => (target.id === targetId ? change(target) : target)),
});

// ---------------------------------------------------------------------------------------------
// Who: the blocks of a target

const ORDER: WhoBlock['kind'][] = [
  'notWaitingOffline',
  'voiceChatExclusive',
  'voicemailOneAtATime',
  'skills',
  'roles',
  'transfers',
  'targetWorker',
  'offlineContactOwner',
  'custom',
  // Written last, as an alternative: (the rest) OR (the offline contact)
  'offlineContactAlternative',
];

export const hasBlock = (target: Target, kind: WhoBlock['kind']) => target.who.some((block) => block.kind === kind);

// Adds or removes a block, keeping the usual order
export const toggleBlock = (target: Target, block: WhoBlock, on: boolean): Target => {
  const others = target.who.filter((candidate) => candidate.kind !== block.kind);
  if (!on) return { ...target, who: others };
  const who = [...others, block].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  return { ...target, who };
};

export const skillsOf = (target: Target) =>
  target.who.flatMap((block) => (block.kind === 'skills' ? block.skills : []));

export const setSkills = (target: Target, skills: string[]): Target =>
  hasBlock(target, 'skills')
    ? {
        ...target,
        who: target.who.map((block) => (block.kind === 'skills' ? { kind: 'skills', skills } : block)),
      }
    : toggleBlock(target, { kind: 'skills', skills }, true);

export const rolesOf = (target: Target): Role[] | undefined => {
  const block = target.who.find((candidate) => candidate.kind === 'roles');
  return block?.kind === 'roles' ? block.roles : undefined;
};

export const setRoles = (target: Target, roles: Role[] | undefined): Target =>
  roles
    ? toggleBlock(target, { kind: 'roles', roles }, true)
    : toggleBlock(target, { kind: 'roles', roles: [] }, false);

// ---------------------------------------------------------------------------------------------
// Capacity: helpline-wide settings, applied to every target they concern

const isVoicemailRule = (rule: Rule) =>
  rule.when
    .flat()
    .some(
      (condition) =>
        condition.kind === 'compare' &&
        condition.attribute === 'channelType' &&
        (condition.operator === '==' || condition.operator === 'IN') &&
        condition.values.every((value) => value === 'voicemail'),
    );

export const setCapacity = (design: RoutingDesign, changes: Partial<Capacity>): RoutingDesign => {
  const capacity = { ...design.capacity, ...changes };
  const apply = (rule: Rule, target: Target): Target => {
    let result = target;
    if (changes.voiceAndChatExclusive !== undefined && !isVoicemailRule(rule)) {
      result = toggleBlock(result, { kind: 'voiceChatExclusive' }, changes.voiceAndChatExclusive);
    }
    if (changes.voicemailOneAtATime !== undefined && isVoicemailRule(rule)) {
      result = toggleBlock(result, { kind: 'voicemailOneAtATime' }, changes.voicemailOneAtATime);
    }
    return result;
  };
  return {
    ...design,
    capacity,
    workflows: design.workflows.map((workflow) =>
      workflow.templateText
        ? workflow
        : {
            ...workflow,
            rules: workflow.rules.map((rule) => ({
              ...rule,
              // Transfers and offline contacts go to one counselor: capacity isn't for them
              targets: rule.targets.map((target) => (target.knownWorker ? target : apply(rule, target))),
            })),
          },
    ),
  };
};

// Renames a skill everywhere it's used
export const renameSkill = (design: RoutingDesign, from: string, to: string): RoutingDesign => {
  const rename = (skill: string) => (skill === from ? to : skill);
  return {
    ...design,
    skills: design.skills.map((skill) => (skill.name === from ? { ...skill, name: to } : skill)),
    queues: design.queues.map((queue) =>
      queue.workers.kind === 'skills'
        ? {
            ...queue,
            workers: {
              kind: 'skills',
              allOf: queue.workers.allOf.map((group) => group.map(rename)),
            },
          }
        : queue,
    ),
    workflows: design.workflows.map((workflow) => ({
      ...workflow,
      rules: workflow.rules.map((rule) => ({
        ...rule,
        targets: rule.targets.map((target) =>
          skillsOf(target).includes(from) ? setSkills(target, skillsOf(target).map(rename)) : target,
        ),
      })),
    })),
  };
};
