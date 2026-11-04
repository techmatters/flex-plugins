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
 * What a helpline's postStudioFlows (service configuration) can point at: its queues and its post-call
 * survey flows (studio_flows keys starting post_call_survey_), from its twilio-iac config and from
 * the builder (its routing design's queues, its boards' flows, e.g. a language added on a board).
 */
import type { BoardStore } from './boards';
import type { RoutingStore } from './routingStore';
import { readHelplineConfigs } from './flowImport';
import type { HclObject, HclValue } from './hcl';
import { isObject } from './hcl';
import type { ConfigEnvironment, PostFlowChoices } from '@tech-matters/form-builder-shared';
export type { ConfigEnvironment, PostFlowChoices };

export const POST_CALL_SURVEY_PREFIX = 'post_call_survey_';

const objectOf = (value: HclValue | undefined): HclObject => (isObject(value) ? value : {});

export const loadPostFlowChoices = async (
  stores: { helplinesConfigDir?: string; routing?: RoutingStore; boards?: BoardStore },
  code: string,
): Promise<PostFlowChoices> => {
  const queues = new Map<string, PostFlowChoices['queues'][number]>();
  const flows = new Map<string, PostFlowChoices['flows'][number]>();
  const queue = (key: string, name: string) => {
    if (!queues.has(key)) queues.set(key, { key, name, environments: [], inRoutingDesign: false });
    return queues.get(key)!;
  };
  const flow = (key: string) => {
    if (!flows.has(key)) flows.set(key, { key, environments: [], boards: [] });
    return flows.get(key)!;
  };

  if (stores.helplinesConfigDir) {
    try {
      const { configs } = await readHelplineConfigs(stores.helplinesConfigDir, code);
      (['staging', 'production'] as const).forEach(environment => {
        const config = configs[environment];
        if (!config) return;
        Object.entries(objectOf(config.task_queues)).forEach(([key, settings]) => {
          const name = objectOf(settings).friendly_name;
          queue(key, typeof name === 'string' ? name : key).environments.push(environment);
        });
        Object.keys(objectOf(config.studio_flows))
          .filter(key => key.startsWith(POST_CALL_SURVEY_PREFIX))
          .forEach(key => flow(key).environments.push(environment));
      });
    } catch {
      // A helpline without staging.hcl or production.hcl yet: only what the builder has
    }
  }

  const routing = await stores.routing?.get(code).catch(() => undefined);
  routing?.design.queues.forEach(({ key, name }) => {
    queue(key, name).inRoutingDesign = true;
  });

  if (stores.boards) {
    const summaries = (await stores.boards.list().catch(() => [])).filter(summary => summary.code === code);
    for (const summary of summaries) {
      const board = await stores.boards.get(code, summary.id).catch(() => undefined);
      (board?.content.flow?.variants ?? [])
        .filter(variant => variant.key.startsWith(POST_CALL_SURVEY_PREFIX))
        .forEach(variant => {
          const found = flow(variant.key);
          if (!found.boards.includes(summary.title)) found.boards.push(summary.title);
        });
    }
  }

  return {
    queues: [...queues.values()].sort((a, b) => a.key.localeCompare(b.key)),
    flows: [...flows.values()].sort((a, b) => a.key.localeCompare(b.key)),
  };
};
