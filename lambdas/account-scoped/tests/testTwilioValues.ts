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

import { AccountSID, TaskSID, WorkerSID } from '../src/twilioTypes';
import { AseloServiceConfigurationAttributes, TaskResource } from './testTwilioTypes';

export const TEST_ACCOUNT_SID: AccountSID = 'ACut';
export const TEST_AUTH_TOKEN: string = 'unit_test_auth_token';
export const TEST_TASK_SID: TaskSID = 'WTut';
export const TEST_WORKER_SID: WorkerSID = 'WKut';
export const TEST_CONTACT_ID = '1337';
export const TEST_WORKSPACE_SID = 'WSut';
export const TEST_CONVERSATION_SID = 'CHut';
export const TEST_CHAT_SERVICE_SID = 'ISut';
export const TEST_CHANNEL_SID = 'CHut';
export const DEFAULT_CONFIGURATION_ATTRIBUTES: AseloServiceConfigurationAttributes = {
  definitionVersion: 'ut-v1',
  hrm_api_version: 'v1',
  form_definitions_version_url: 'http://mock-assets-bucket/form-definitions/ut/v1',
  assets_bucket_url: 'http://mock-assets-bucket',
  helpline_code: 'ut',
  feature_flags: {
    enable_backend_hrm_contact_creation: true,
  },
};

export const EMPTY_TASK: TaskResource = {
  account_sid: TEST_ACCOUNT_SID,
  age: 0,
  assignment_status: 'pending',
  attributes: '{}',
  addons: '',
  date_created: new Date(0),
  date_updated: new Date(0),
  task_queue_entered_date: new Date(0),
  priority: 0,
  reason: '',
  sid: TEST_TASK_SID,
  task_queue_sid: '',
  task_queue_friendly_name: '',
  task_channel_sid: '',
  task_channel_unique_name: '',
  timeout: 0,
  workflow_sid: '',
  workflow_friendly_name: '',
  workspace_sid: TEST_WORKSPACE_SID,
  url: '',
  links: {},
  virtual_start_time: new Date(0),
  ignore_capacity: false,
  routing_target: '',
};
