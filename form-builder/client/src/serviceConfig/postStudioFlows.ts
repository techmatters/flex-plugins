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
 * The post-call surveys (attributes.postStudioFlows) in the service-configuration files, as
 * PostStudioFlowsEditor.tsx shows and changes them. Written as USNM does it:
 * ${task_queues.<key>} → { flowTrigger, studioFlowSid: ${studio_flow_sids.<key>} }, in common.json
 * (both environments) or one environment's file.
 */
import type { PostFlowChoices, ServiceConfigFileName } from '@tech-matters/form-builder-shared';
import type { DefinitionFileMap } from '../common/definitions';
import { getServiceConfigFile, isConfigObject } from './serviceConfig';

export const POST_STUDIO_FLOWS_KEYS = ['attributes', 'postStudioFlows'];

// What the Aselo lambdas (postStudioFlowTaskRouterListener) and the Flex plugin do with each
export const FLOW_TRIGGERS = [
  {
    value: 'inProgressCall',
    label: 'During the call (inProgressCall)',
    hint: 'Voice only. When the counselor leaves, the caller stays on the line and is sent into the survey.',
  },
  {
    value: 'rest',
    label: 'After the contact (rest)',
    hint: 'When the task ends, the flow is started through its REST API trigger, to the contact’s number (calls and messaging).',
  },
] as const;

// Besides queues: the lambdas fall back to the task channel (e.g. every voice task)
export const CHANNEL_KEYS = [
  { key: 'voice', label: 'Any other voice task (voice channel)' },
  { key: 'chat', label: 'Any other chat task (chat channel)' },
];

export type Where = 'both' | 'staging' | 'production';
export const FILE_OF: Record<Where, ServiceConfigFileName> = {
  both: 'common',
  staging: 'staging',
  production: 'production',
};
export const WHERE_LABELS: Record<Where, string> = {
  both: 'Staging and production (common.json)',
  staging: 'Staging only (staging.json)',
  production: 'Production only (production.json)',
};
const FILES: ServiceConfigFileName[] = ['common', 'staging', 'production'];

export const queueRef = (key: string) => `\${task_queues.${key}}`;
export const flowRef = (key: string) => `\${studio_flow_sids.${key}}`;
export const keyOf = (ref: string, kind: 'task_queues' | 'studio_flow_sids') =>
  ref.match(new RegExp(`^\\$\\{${kind}\\.([A-Za-z0-9_]+)\\}$`))?.[1];

export type Entry = {
  file: ServiceConfigFileName;
  queue: string;
  flowTrigger: string;
  studioFlowSid: string;
};

export const postStudioFlowEntries = (files: DefinitionFileMap): Entry[] =>
  FILES.flatMap(file => {
    const flows = getServiceConfigFile(files, file)?.attributes;
    const configured = isConfigObject(flows) ? flows.postStudioFlows : undefined;
    if (!isConfigObject(configured)) return [];
    return Object.entries(configured)
      .filter(([, value]) => isConfigObject(value))
      .map(([queue, value]) => {
        const settings = value as Record<string, unknown>;
        return {
          file,
          queue,
          flowTrigger: String(settings.flowTrigger ?? ''),
          studioFlowSid: String(settings.studioFlowSid ?? ''),
        };
      });
  });

// The environments a file reaches
const environmentsOf = (file: ServiceConfigFileName) =>
  file === 'common' ? (['staging', 'production'] as const) : file === 'development' ? [] : ([file] as const);

/**
 * Why an entry may not work where it's written: a queue or flow placeholder the environment's config
 * doesn't have (Terraform can't turn it into a SID there).
 */
export const entryWarnings = (entry: Pick<Entry, 'file' | 'queue' | 'studioFlowSid'>, choices?: PostFlowChoices) => {
  if (!choices) return [];
  const warnings: string[] = [];
  const queueKey = keyOf(entry.queue, 'task_queues');
  const flowKey = keyOf(entry.studioFlowSid, 'studio_flow_sids');
  environmentsOf(entry.file).forEach(environment => {
    const queue = choices.queues.find(candidate => candidate.key === queueKey);
    if (queueKey && !queue?.environments.includes(environment)) {
      warnings.push(`${environment}.hcl has no queue ${queueKey} yet.`);
    }
    const flow = choices.flows.find(candidate => candidate.key === flowKey);
    if (flowKey && !flow?.environments.includes(environment)) {
      warnings.push(`${environment}.hcl has no ${flowKey} studio flow yet.`);
    }
  });
  return warnings;
};

export const queueLabel = (ref: string, choices?: PostFlowChoices) => {
  const key = keyOf(ref, 'task_queues');
  if (!key) return CHANNEL_KEYS.find(channel => channel.key === ref)?.label ?? ref;
  const name = choices?.queues.find(queue => queue.key === key)?.name;
  return name && name !== key ? `${name} (${key})` : key;
};

export const flowOptionLabel = (flow: PostFlowChoices['flows'][number]) => {
  if (flow.environments.length === 2) return flow.key;
  if (flow.environments.length === 1) return `${flow.key} (${flow.environments[0]} only)`;
  return `${flow.key} (on a board, not in the config yet)`;
};
