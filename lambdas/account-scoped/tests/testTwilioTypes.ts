/**
 * Copyright (C) 2021-2023 Technology Matters
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

import { TaskPage } from 'twilio/lib/rest/taskrouter/v1/workspace/task';

const CONFIG_FIELDS = [
  'definitionVersion',
  'hrm_api_version',
  'form_definitions_version_url',
  'assets_bucket_url',
  'helpline_code',
] as const;

export type AseloServiceConfigurationAttributes = Record<
  (typeof CONFIG_FIELDS)[number],
  string
> & {
  feature_flags: Record<string, boolean | undefined>;
};

export type TaskResource = TaskPage['_payload']['tasks'][number];
