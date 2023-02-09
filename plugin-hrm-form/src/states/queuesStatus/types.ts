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

import { newQueueEntry } from '../../components/queuesStatus/helpers';

// Action types
export const QUEUES_STATUS_UPDATE = 'QUEUES_STATUS_UPDATE';
export const QUEUES_STATUS_FAILURE = 'QUEUES_STATUS_FAILURE';

type QueueEntry = typeof newQueueEntry;

export type QueuesStatus = { [qName: string]: QueueEntry };

type QueuesUpdateAction = {
  type: typeof QUEUES_STATUS_UPDATE;
  queuesStatus: QueuesStatus;
};

type QueuesFailureAction = {
  type: typeof QUEUES_STATUS_FAILURE;
  error: string;
};

export type QueuesStatusActionType = QueuesUpdateAction | QueuesFailureAction;
