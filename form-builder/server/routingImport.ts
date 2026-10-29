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
 * A routing design from a live helpline's twilio-iac config (docs/routing-designer.md): its
 * workflows (settings in the .hcl files, rules in their templates), queues (task_queues), and the
 * skills and capacity rules they use. Production's config is read; differences with staging go in
 * the report.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { readQueue, readWorkflow } from '../src/routing/convert';
import { levelOrderOf } from '../src/routing/describe';
import { skillsIn } from '../src/routing/expressions';
import type { RoutingDesign } from '../src/routing/model';
import { ROUTING_SCHEMA_VERSION } from '../src/routing/model';
import { readHelplineConfigs, templatePathOf } from './flowImport';
import { HclObject, isObject, parseTemplate } from './hcl';

export type RoutingImportReport = {
  helpline: string;
  // The environment the design was read from, and the others found
  readFrom: string;
  environments: string[];
  workflows: { key: string; name: string; template?: string; shared: boolean; rules: number }[];
  queues: number;
  skills: string[];
  notes: string[];
};

export type RoutingImport = { design: RoutingDesign; report: RoutingImportReport };

const objectOf = (value: unknown): HclObject => (isObject(value as never) ? (value as HclObject) : {});

export const importRouting = async (helplinesDir: string, code: string): Promise<RoutingImport> => {
  const { configs, environments } = await readHelplineConfigs(helplinesDir, code);
  const notes: string[] = [];
  const readFrom = environments[0];
  const config = configs[readFrom]!;
  const other = environments.find((environment) => environment !== readFrom);
  if (other) {
    (['workflows', 'task_queues'] as const).forEach((key) => {
      if (JSON.stringify(configs[other]![key]) !== JSON.stringify(config[key])) {
        notes.push(
          `${other} has different ${key === 'workflows' ? 'workflows' : 'queues'} from ${readFrom}; ${readFrom}'s were read.`,
        );
      }
    });
  }

  const design: RoutingDesign = {
    imported: true,
    status: 'imported',
    schemaVersion: ROUTING_SCHEMA_VERSION,
    helpline: code,
    skills: [],
    capacity: { voiceAndChatExclusive: false, voicemailOneAtATime: false },
    queues: Object.entries(objectOf(config.task_queues)).map(([key, settings]) => readQueue(key, objectOf(settings))),
    workflows: [],
  };

  for (const [key, value] of Object.entries(objectOf(config.workflows))) {
    const settings = objectOf(value);
    const templatefile = typeof settings.templatefile === 'string' ? settings.templatefile : undefined;
    const template = templatefile && templatePathOf(templatefile);
    if (!template) {
      notes.push(
        `Workflow “${key}”: its template ${templatefile ?? '(none)'} isn't under twilio-iac/helplines, so it wasn't read.`,
      );
      continue;
    }
    let text: string;
    try {
      text = await fs.readFile(path.join(helplinesDir, template), 'utf8');
    } catch {
      notes.push(`Workflow “${key}”: couldn't read ${template}.`);
      continue;
    }
    const shared = !template.startsWith(`${code}/`);
    // Built by template code (%{ for ... }): kept as it is
    if (text.includes('%{')) {
      design.workflows.push({
        key,
        name: typeof settings.friendly_name === 'string' ? settings.friendly_name : key,
        rules: [],
        template,
        shared,
        templateText: text,
        original: settings,
        ...(typeof settings.task_reservation_timeout === 'number'
          ? { reservationTimeout: settings.task_reservation_timeout }
          : {}),
      });
      continue;
    }
    const parsed = parseTemplate(text);
    if (shared) {
      notes.push(
        `Workflow “${key}” uses the shared template ${template}: changing it would change every helpline that uses it, so changes are written to a template of this helpline's own.`,
      );
    }
    design.workflows.push(
      readWorkflow(key, settings, objectOf(parsed), {
        template,
        shared,
        templateStyle: text.trim().startsWith('${') ? 'jsonencode' : 'json',
      }),
    );
  }

  // The skills and capacity rules in use
  const targets = design.workflows.flatMap((workflow) => workflow.rules.flatMap((rule) => rule.targets));
  const skills = new Set<string>([
    ...design.queues.flatMap((queue) => (queue.workers.kind === 'skills' ? queue.workers.allOf.flat() : [])),
    ...targets.flatMap((target) => skillsIn(target.who)),
  ]);
  // Skills that steps prefer by level (order_by worker.routing.levels.<skill>) have levels
  const levelled = new Set(
    targets.map((target) => levelOrderOf(target.orderBy)?.skill).filter((skill): skill is string => Boolean(skill)),
  );
  levelled.forEach((skill) => skills.add(skill));
  design.skills = [...skills].sort().map((name) => (levelled.has(name) ? { name, levels: true } : { name }));
  design.capacity = {
    voiceAndChatExclusive: targets.some((target) => target.who.some((block) => block.kind === 'voiceChatExclusive')),
    voicemailOneAtATime: targets.some((target) => target.who.some((block) => block.kind === 'voicemailOneAtATime')),
  };

  const customTargets = targets.filter((target) => target.who.some((block) => block.kind === 'custom')).length;
  if (customTargets > 0) {
    notes.push(
      `${customTargets} target${customTargets === 1 ? ' has' : 's have'} conditions the designer shows as written (custom).`,
    );
  }
  const offlineAlternatives = targets.filter((target) =>
    target.who.some((block) => block.kind === 'offlineContactAlternative'),
  ).length;
  if (offlineAlternatives > 0) {
    notes.push(
      `${offlineAlternatives} target${offlineAlternatives === 1 ? ' also takes' : 's also take'} "the offline contact the counselor is recording"; see Check for the ones outside the Offline Contacts rule.`,
    );
  }
  if (design.workflows.length === 0) notes.push('No workflows found.');

  return {
    design,
    report: {
      helpline: code,
      readFrom,
      environments: [...environments],
      workflows: design.workflows.map((workflow) => ({
        key: workflow.key,
        name: workflow.name,
        template: workflow.template,
        shared: Boolean(workflow.shared),
        rules: workflow.rules.length,
      })),
      queues: design.queues.length,
      skills: design.skills.map((skill) => skill.name),
      notes,
    },
  };
};
