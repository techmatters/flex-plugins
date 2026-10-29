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

import type { DesignStatus } from '../designStatus';

/**
 * A helpline's routing design: TaskRouter workflows, queues, skills and capacity, in terms people
 * without a technical background can work with (docs/routing-designer.md). Shared by the page and
 * the API, so no browser or server code.
 *
 * Everything read from a live helpline keeps what it was (`original`), so whatever isn't changed in
 * the designer is written back exactly as it is live.
 */

export const ROUTING_SCHEMA_VERSION = 1;

// Who can get a task, as building blocks of a target's expression
export type WhoBlock =
  | { kind: 'notWaitingOffline' }
  | { kind: 'transfers'; ignoreAgent: boolean }
  | { kind: 'voiceChatExclusive' }
  | { kind: 'voicemailOneAtATime' }
  | { kind: 'skills'; skills: string[] }
  | { kind: 'roles'; roles: Role[] }
  // "...or it's the offline contact this counselor is recording": belongs in the Offline Contacts
  // filter only; anywhere else it's a misconfiguration (see routingChecks)
  | { kind: 'offlineContactAlternative' }
  // The Offline Contacts rule's step: only the counselor who recorded the offline contact
  | { kind: 'offlineContactOwner' }
  // Only the counselor the task was sent to (task.targetSid)
  | { kind: 'targetWorker' }
  | { kind: 'custom'; expression: string };

export type Role = 'agent' | 'supervisor';

// What happens when nobody takes the task at this target
export type MoveOn = { kind: 'skip'; expression: string } | { kind: 'timeout'; seconds: number } | { kind: 'wait' };

export type Target = {
  id: string;
  // The queue's key in task_queues (e.g. en_std), or what the template has when it isn't one
  queue: string;
  who: WhoBlock[];
  priority?: number;
  moveOn: MoveOn;
  // Prefer some workers over others (TaskRouter's order_by), as written; e.g. the highest level of a
  // skill first: worker.routing.levels.<skill> DESC
  orderBy?: string;
  // Offered to one worker only (TaskRouter's known_worker_sid), as written: e.g. direct transfers
  knownWorker?: string;
  original?: Record<string, unknown>;
};

// A task condition: "Channel is Voice", "Language is one of Spanish, English"
export type Condition =
  | {
      kind: 'compare';
      attribute: string;
      operator: '==' | '!=' | 'IN' | 'NOT IN';
      values: (string | number | boolean)[];
    }
  | { kind: 'custom'; expression: string };

export type Rule = {
  id: string;
  name: string;
  // The task conditions: any of the groups (OR), each one all of its conditions (AND). No groups, or
  // one empty group, is every task
  when: Condition[][];
  targets: Target[];
  original?: Record<string, unknown>;
};

export type Workflow = {
  // The key in common.hcl's workflows (master, sms...)
  key: string;
  name: string;
  // Seconds a counselor has to accept (task_reservation_timeout)
  reservationTimeout?: number;
  rules: Rule[];
  // Its template, under twilio-iac/helplines (e.g. usnm/templates/workflows/sms.tftpl)
  template?: string;
  // Shared by several helplines (templates/workflows/...): changing it changes them all
  shared?: boolean;
  // How the template is written: plain JSON, or ${ jsonencode({...}) }
  templateStyle?: 'json' | 'jsonencode';
  // Templates built by template code (%{ for ... }, e.g. queue transfers, made from the queues)
  // aren't a fixed list of rules: kept as written, and not edited in the designer
  templateText?: string;
  // The rest of the workflow's settings and template, as written (default_filter...)
  settings?: Record<string, unknown>;
  templateSettings?: Record<string, unknown>;
  // The workflow's own settings in common.hcl, as written
  original?: Record<string, unknown>;
};

// Who can work in a queue: skills (every group needed, any skill of a group), nobody, or custom
export type QueueWorkers =
  { kind: 'skills'; allOf: string[][] } | { kind: 'nobody' } | { kind: 'custom'; expression: string };

export type Queue = {
  key: string;
  name: string;
  workers: QueueWorkers;
  // Other settings it has in task_queues, as written
  settings?: Record<string, unknown>;
  original?: Record<string, unknown>;
};

export type Skill = {
  name: string;
  description?: string;
  // Counselors have a level of it (Flex skills with levels); steps can prefer the highest level first
  levels?: boolean;
};

export type Capacity = {
  // Never a call and a chat at the same time
  voiceAndChatExclusive: boolean;
  // One voicemail at a time
  voicemailOneAtATime: boolean;
  // Chats a counselor can have at once (the maxMessageCapacity worker attribute)
  maxChats?: number;
};

export type RoutingDesign = {
  schemaVersion: number;
  helpline: string;
  skills: Skill[];
  capacity: Capacity;
  queues: Queue[];
  workflows: Workflow[];
  // Imported, in progress, ready for Claude, implemented (designStatus.ts); absent: worked out
  status?: DesignStatus;
  // Read from the live config (else started empty, so it's new)
  imported?: boolean;
  // The flex-plugins branch it was imported from, when not the default (master)
  importedFrom?: { branch: string; sha: string };
};

// As set, else Imported for an imported design and In progress for one started empty
export const routingStatusOf = (design: RoutingDesign): DesignStatus =>
  design.status ?? (design.imported ? 'imported' : 'in-progress');

// A helpline's routing design, for the start page
export type RoutingSummary = {
  code: string;
  meta: RoutingMeta;
  status: DesignStatus;
  isNew: boolean;
  workflows: number;
  queues: number;
};

export type RoutingMeta = {
  revision: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type StoredRouting = { code: string; meta: RoutingMeta; design: RoutingDesign };

// ---------------------------------------------------------------------------------------------
// Words for the task attributes and values the helplines route on

// The task attributes every helpline routes on; others (e.g. NZ's clinical) are the helpline's own,
// shown and typed as they are
export const ATTRIBUTE_LABELS: Record<string, string> = {
  channelType: 'Channel',
  service: 'Service',
  serviceLanguage: 'Language',
  // Voicemail tasks carry their service and language here
  'routingAttributes.service': 'Voicemail service',
  'routingAttributes.serviceLanguage': 'Voicemail language',
  transferTargetType: 'Transfer to',
  isContactlessTask: 'Offline contact',
  targetSid: 'Transferred to',
};

export const VALUE_LABELS: Record<string, string> = {
  voice: 'Voice',
  sms: 'SMS',
  web: 'Webchat',
  chat: 'Chat',
  voicemail: 'Voicemail',
  whatsapp: 'WhatsApp',
  facebook: 'Messenger',
  instagram: 'Instagram',
  telegram: 'Telegram',
  line: 'LINE',
  modica: 'SMS (Modica)',
  std: 'Standard',
  tya: 'TYA',
  fcg: 'FCG',
  english: 'English',
  spanish: 'Spanish',
  worker: 'A counselor',
  queue: 'A queue',
};

export const attributeLabel = (attribute: string) => ATTRIBUTE_LABELS[attribute] ?? attribute;
export const valueLabel = (value: string | number | boolean) =>
  typeof value === 'string'
    ? (VALUE_LABELS[value] ?? value)
    : value === true
      ? 'yes'
      : value === false
        ? 'no'
        : String(value);

export const emptyRouting = (helpline: string): RoutingDesign => ({
  schemaVersion: ROUTING_SCHEMA_VERSION,
  helpline,
  skills: [],
  capacity: { voiceAndChatExclusive: true, voicemailOneAtATime: true },
  queues: [],
  workflows: [],
});
