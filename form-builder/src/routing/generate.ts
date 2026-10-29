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
 * A routing design written out for twilio-iac: each workflow's template (.tftpl), and the
 * workflows and task_queues blocks of the helpline's common.hcl. A design imported from a live
 * helpline and not changed gives back exactly its live config.
 */
import { hclString, toHcl } from '../flows/studioTemplate';
import { writeQueue, writeWorkflowSettings, writeWorkflowTemplate } from './convert';
import type { RoutingDesign } from './model';

export type GeneratedWorkflow = {
  key: string;
  name: string;
  // Under twilio-iac/helplines; shared templates are used by other helplines too
  template?: string;
  shared?: boolean;
  // The .tftpl file's contents
  text: string;
};

export type GeneratedRouting = {
  workflows: GeneratedWorkflow[];
  // The workflows = {...} and task_queues = {...} blocks for common.hcl
  workflowsBlock: string;
  queuesBlock: string;
  // The skills Flex needs (checked in each account's settings)
  skills: string[];
  // The ones with levels turned on (Flex: multivalue skills with a minimum and maximum level)
  skillsWithLevels: string[];
};

const hclValue = (value: unknown, indent: string): string =>
  typeof value === 'string' ? hclString(value) : toHcl(value, indent);

// Keys that aren't plain names (e.g. 988_en) have to be quoted in HCL
const keyOf = (key: string) => (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(key) ? key : JSON.stringify(key));

// A common.hcl block: name = { key : { "attribute" = value, ... }, ... }
const block = (name: string, entries: [string, Record<string, unknown>][]) =>
  `${name} = {\n${entries
    .map(
      ([key, settings]) =>
        `  ${keyOf(key)} : {\n${Object.entries(settings)
          .map(([attribute, value]) => `    ${JSON.stringify(attribute)} = ${hclValue(value, '    ')}`)
          .join(',\n')}\n  }`,
    )
    .join(',\n')}\n}\n`;

export const generateRouting = (design: RoutingDesign): GeneratedRouting => ({
  workflows: design.workflows.map((workflow) => {
    const value = writeWorkflowTemplate(workflow);
    return {
      key: workflow.key,
      name: workflow.name,
      ...(workflow.template ? { template: workflow.template } : {}),
      ...(workflow.shared ? { shared: true } : {}),
      // JSON-shaped either way; interpolations (${...}) are kept exactly as written
      text:
        workflow.templateText ??
        (workflow.templateStyle === 'jsonencode'
          ? `\${\n  jsonencode(${toHcl(value, '  ')})\n}\n`
          : `${toHcl(value)}\n`),
    };
  }),
  workflowsBlock: block(
    'workflows',
    design.workflows.map((workflow) => [workflow.key, writeWorkflowSettings(workflow)]),
  ),
  queuesBlock: block(
    'task_queues',
    design.queues.map((queue) => [queue.key, writeQueue(queue)]),
  ),
  skills: design.skills.map((skill) => skill.name),
  skillsWithLevels: design.skills.filter((skill) => skill.levels).map((skill) => skill.name),
});
