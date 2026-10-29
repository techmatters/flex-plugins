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
 * Mistakes and gaps in a routing design, in plain words. Errors are things TaskRouter would refuse
 * or that can't work; warnings are things that look unintended.
 */
import type { Rule, RoutingDesign } from './model';
import { levelOrderOf, targetSkills } from './describe';

// The Offline Contacts rule: every group of its conditions asks for an offline contact
export const isOfflineContactsRule = (rule: Rule) =>
  rule.when.length > 0 &&
  rule.when.every((group) =>
    group.some(
      (condition) =>
        condition.kind === 'compare' &&
        condition.attribute === 'isContactlessTask' &&
        condition.operator === '==' &&
        condition.values[0] === true,
    ),
  );

export type RoutingIssue = {
  key: string;
  severity: 'error' | 'warning';
  message: string;
  // Where it is: a workflow (and rule), a queue, or the skills
  workflow?: string;
  ruleId?: string;
  queue?: string;
};

export const routingChecks = (design: RoutingDesign): RoutingIssue[] => {
  const issues: RoutingIssue[] = [];
  const queueKeys = new Set(design.queues.map((queue) => queue.key));
  const skills = new Set(design.skills.map((skill) => skill.name));
  const withLevels = new Set(design.skills.filter((skill) => skill.levels).map((skill) => skill.name));
  const usedSkills = new Set<string>();
  const usedQueues = new Set<string>();

  design.workflows.forEach((workflow) => {
    if (workflow.templateText) return;
    const names = new Set<string>();
    let catchAll: string | undefined;
    workflow.rules.forEach((rule, index) => {
      const where = { workflow: workflow.key, ruleId: rule.id };
      const label = `“${workflow.name}” › “${rule.name || `rule ${index + 1}`}”`;
      if (!rule.name.trim())
        issues.push({
          key: `${rule.id}-name`,
          severity: 'error',
          message: `${label} needs a name.`,
          ...where,
        });
      else if (names.has(rule.name)) {
        issues.push({
          key: `${rule.id}-dup`,
          severity: 'warning',
          message: `${label}: another rule in this workflow has the same name.`,
          ...where,
        });
      }
      names.add(rule.name);
      if (catchAll) {
        issues.push({
          key: `${rule.id}-unreachable`,
          severity: 'warning',
          message: `${label} never gets any task: “${catchAll}” before it takes every task.`,
          ...where,
        });
      }
      const everyTask = rule.when.length === 0 || rule.when.some((group) => group.length === 0);
      if (everyTask && !catchAll) catchAll = rule.name || `rule ${index + 1}`;
      const offlineRule = isOfflineContactsRule(rule);
      if (rule.targets.length === 0) {
        issues.push({
          key: `${rule.id}-targets`,
          severity: 'error',
          message: `${label} doesn't offer the task to anyone.`,
          ...where,
        });
      }
      rule.targets.forEach((target, targetIndex) => {
        usedQueues.add(target.queue);
        targetSkills(target).forEach((skill) => {
          usedSkills.add(skill);
          if (!skills.has(skill)) {
            issues.push({
              key: `${target.id}-skill-${skill}`,
              severity: 'warning',
              message: `${label} asks for the skill “${skill}”, which isn't in the helpline's skills.`,
              ...where,
            });
          }
        });
        if (!offlineRule && target.who.some((block) => block.kind === 'offlineContactAlternative')) {
          issues.push({
            key: `${target.id}-offline`,
            severity: 'warning',
            message: `${label}: step ${targetIndex + 1} also takes "the offline contact the counselor is recording". Offline contacts should be caught by the Offline Contacts rule, before this one; here it's probably a copy-paste leftover.`,
            ...where,
          });
        }
        const level = levelOrderOf(target.orderBy);
        if (level && !withLevels.has(level.skill)) {
          issues.push({
            key: `${target.id}-levels`,
            severity: 'warning',
            message: `${label}: step ${targetIndex + 1} prefers counselors by their level of “${level.skill}”, but that skill doesn't have levels turned on.`,
            ...where,
          });
        }
        if (!target.queue) {
          issues.push({
            key: `${target.id}-queue`,
            severity: 'error',
            message: `${label}: step ${targetIndex + 1} has no queue.`,
            ...where,
          });
        } else if (/^[A-Za-z0-9_]+$/.test(target.queue) && !queueKeys.has(target.queue)) {
          issues.push({
            key: `${target.id}-unknown-queue`,
            severity: 'error',
            message: `${label}: step ${targetIndex + 1} uses the queue “${target.queue}”, which doesn't exist.`,
            ...where,
          });
        }
        const last = targetIndex === rule.targets.length - 1;
        if (last && target.moveOn.kind !== 'wait' && !target.knownWorker) {
          issues.push({
            key: `${target.id}-last`,
            severity: 'warning',
            message: `${label}: the last step moves on, but there's no next one; if nobody takes the task it may leave the workflow.`,
            ...where,
          });
        }
      });
    });
  });

  design.queues.forEach((queue) => {
    if (queue.workers.kind === 'skills') {
      queue.workers.allOf.flat().forEach((skill) => {
        usedSkills.add(skill);
        if (!skills.has(skill)) {
          issues.push({
            key: `${queue.key}-skill-${skill}`,
            severity: 'warning',
            message: `Queue “${queue.name}” asks for the skill “${skill}”, which isn't in the helpline's skills.`,
            queue: queue.key,
          });
        }
      });
    }
    if (!usedQueues.has(queue.key) && queue.workers.kind !== 'nobody') {
      issues.push({
        key: `${queue.key}-unused`,
        severity: 'warning',
        message: `No rule sends tasks to the queue “${queue.name}” (transfers to it still work).`,
        queue: queue.key,
      });
    }
  });

  design.skills
    .filter((skill) => !usedSkills.has(skill.name))
    .forEach((skill) =>
      issues.push({
        key: `skill-${skill.name}`,
        severity: 'warning',
        message: `No queue or rule uses the skill “${skill.name}”.`,
      }),
    );

  return [
    ...issues.filter((issue) => issue.severity === 'error'),
    ...issues.filter((issue) => issue.severity === 'warning'),
  ];
};
