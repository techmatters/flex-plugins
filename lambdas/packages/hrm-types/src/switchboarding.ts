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

export const SWITCHBOARD_QUEUE_NAME = 'Switchboard Queue';
export const SWITCHBOARD_WORKFLOW_FILTER_PREFIX = 'Switchboard Workflow';

export const SWITCHBOARD_STATE_DOCUMENT = 'switchboard-state';
export const SWITCHBOARD_NOTIFY_DOCUMENT = 'switchboard-notify';

export type SwitchboardSyncState = {
  isSwitchboardingActive: boolean;
  queueSid: string | null;
  queueName: string | null;
  supervisorWorkerSid: string | null;
  startTime: string | null;
};
