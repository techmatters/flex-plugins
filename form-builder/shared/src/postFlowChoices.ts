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
 * What a post-call survey can be set to (server/src/postStudioFlowChoices.ts works it out).
 */
export type ConfigEnvironment = 'staging' | 'production';

export type PostFlowChoices = {
  // task_queues keys: in which environments' config, and whether the routing design has it
  queues: { key: string; name: string; environments: ConfigEnvironment[]; inRoutingDesign: boolean }[];
  // studio_flows keys: in which environments' config, and the boards that have it (not in the config yet, maybe)
  flows: { key: string; environments: ConfigEnvironment[]; boards: string[] }[];
};
