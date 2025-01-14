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

import type { EventType } from './eventTypes';

export type EventFields = {
  // Default fields
  EventType: EventType;
  AccountSid: string;
  WorkspaceSid: string;
  WorkspaceName: string;
  EventDescription: string;
  ResourceType: 'Task' | 'Reservation' | 'Worker' | 'Activity' | 'Workflow' | 'Workspace';
  ResourceSid: string;
  Timestamp: string;

  // Task
  TaskSid: string;
  TaskAttributes: string;
  TaskAge: number;
  TaskPriority: number;
  TaskAssignmentStatus: string;
  TaskCanceledReason: string;
  TaskCompletedReason: string;

  // TaskChannel
  TaskChannelSid: string;
  TaskChannelName: string;
  TaskChannelUniqueName: string;
  TaskChannelOptimizedRouting: boolean;

  // Worker
  WorkerSid: string;
  WorkerName: string;
  WorkerAttributes: string;
  WorkerActivitySid: string;
  WorkerActivityName: string;
  WorkerVersion: string;
  WorkerTimeInPreviousActivity: number;
  WorkerTimeInPreviousActivityMs: number;
  WorkerPreviousActivitySid: string;
  WorkerChannelAvailable: boolean;
  WorkerChannelAvailableCapacity: number;
  WorkerChannelPreviousCapacity: number;
  WorkerChannelTaskCount: number;
};
