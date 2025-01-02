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

/**
 * Tasrouter EventTypes: https://www.twilio.com/docs/taskrouter/api/event/reference#event-types
 */

// Activity
export const ACTIVITY_CREATED = 'activity.created';
export const ACTIVITY_UPDATED = 'activity.updated';
export const ACTIVITY_DELETED = 'activity.deleted';

// Reservation
export const RESERVATION_CREATED = 'reservation.created';
export const RESERVATION_ACCEPTED = 'reservation.accepted';
export const RESERVATION_REJECTED = 'reservation.rejected';
export const RESERVATION_TIMEOUT = 'reservation.timeout';
export const RESERVATION_CANCELED = 'reservation.canceled';
export const RESERVATION_RESCINDED = 'reservation.rescinded';
export const RESERVATION_COMPLETED = 'reservation.completed';
export const RESERVATION_FAILED = 'reservation.failed';
export const RESERVATION_WRAPUP = 'reservation.wrapup';

// Task
export const TASK_CREATED = 'task.created';
export const TASK_UPDATED = 'task.updated';
export const TASK_CANCELED = 'task.canceled';
export const TASK_WRAPUP = 'task.wrapup';
export const TASK_COMPLETED = 'task.completed';
export const TASK_DELETED = 'task.deleted';
export const TASK_SYSTEM_DELETED = 'task.system-deleted';
export const TASK_TRANSFER_INITIATED = 'task.transfer-initiated';
export const TASK_TRANSFER_ATTEMPT_FAILED = 'task.transfer-attempt-failed';
export const TASK_TRANSFER_FAILED = 'task.transfer-failed';
export const TASK_TRANSFER_CANCELED = 'task.transfer-canceled';
export const TASK_TRANSFER_COMPLETED = 'task.transfer-completed';

// Task Channel
export const TASK_CHANNEL_CREATED = 'task-channel.created';
export const TASK_CHANNEL_UPDATED = 'task-channel.updated';
export const TASK_CHANNEL_DELETED = 'task-channel.deleted';

// Task Queue
export const TASK_QUEUE_CREATED = 'task-queue.created';
export const TASK_QUEUE_DELETED = 'task-queue.deleted';
export const TASK_QUEUE_ENTERED = 'task-queue.entered';
export const TASK_QUEUE_TIMEOUT = 'task-queue.timeout';
export const TASK_QUEUE_MOVED = 'task-queue.moved';
export const TASK_QUEUE_EXPRESSION_UPDATED = 'task-queue.expression.updated';

// Worker
export const WORKER_CREATED = 'worker.created';
export const WORKER_ACTIVITY_UPDATE = 'worker.activity.update';
export const WORKER_ATTRIBUTES_UPDATE = 'worker.attributes.update';
export const WORKER_CAPACITY_UPDATE = 'worker.capacity.update';
export const WORKER_CHANNEL_AVAILABILITY_UPDATE = 'worker.channel.availability.update';
export const WORKER_DELETED = 'worker.deleted';

// Workflow
export const WORKFLOW_CREATED = 'workflow.created';
export const WORKFLOW_UPDATED = 'workflow.updated';
export const WORKFLOW_DELETED = 'workflow.deleted';
export const WORKFLOW_TARGET_MATCHED = 'workflow.target-matched';
export const WORKFLOW_ENTERED = 'workflow.entered';
export const WORKFLOW_TIMEOUT = 'workflow.timeout';
export const WORKFLOW_SKIPPED = 'workflow.skipped';

// Workspace
export const WORKSPACE_CREATED = 'workspace.created';
export const WORKSPACE_UPDATED = 'workspace.updated';
export const WORKSPACE_DELETED = 'workspace.deleted';

export const eventTypes = {
  // Activity
  ACTIVITY_CREATED,
  ACTIVITY_UPDATED,
  ACTIVITY_DELETED,

  // Reservation
  RESERVATION_CREATED,
  RESERVATION_ACCEPTED,
  RESERVATION_REJECTED,
  RESERVATION_TIMEOUT,
  RESERVATION_CANCELED,
  RESERVATION_RESCINDED,
  RESERVATION_COMPLETED,
  RESERVATION_FAILED,
  RESERVATION_WRAPUP,

  // Task
  TASK_CREATED,
  TASK_UPDATED,
  TASK_CANCELED,
  TASK_WRAPUP,
  TASK_COMPLETED,
  TASK_DELETED,
  TASK_SYSTEM_DELETED,
  TASK_TRANSFER_INITIATED,
  TASK_TRANSFER_ATTEMPT_FAILED,
  TASK_TRANSFER_FAILED,
  TASK_TRANSFER_CANCELED,
  TASK_TRANSFER_COMPLETED,

  // Task Channel
  TASK_CHANNEL_CREATED,
  TASK_CHANNEL_UPDATED,
  TASK_CHANNEL_DELETED,

  // Task Queue
  TASK_QUEUE_CREATED,
  TASK_QUEUE_DELETED,
  TASK_QUEUE_ENTERED,
  TASK_QUEUE_TIMEOUT,
  TASK_QUEUE_MOVED,
  TASK_QUEUE_EXPRESSION_UPDATED,

  // Worker
  WORKER_CREATED,
  WORKER_ACTIVITY_UPDATE,
  WORKER_ATTRIBUTES_UPDATE,
  WORKER_CAPACITY_UPDATE,
  WORKER_CHANNEL_AVAILABILITY_UPDATE,
  WORKER_DELETED,

  // Workflow
  WORKFLOW_CREATED,
  WORKFLOW_UPDATED,
  WORKFLOW_DELETED,
  WORKFLOW_TARGET_MATCHED,
  WORKFLOW_ENTERED,
  WORKFLOW_TIMEOUT,
  WORKFLOW_SKIPPED,

  // Workspace
  WORKSPACE_CREATED,
  WORKSPACE_UPDATED,
  WORKSPACE_DELETED,
} as const;

export type EventType = (typeof eventTypes)[keyof typeof eventTypes];
