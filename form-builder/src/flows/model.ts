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
 * A flow designer board, as saved. Shared by the canvas, the API and the exports, so it has no
 * React or browser code. See docs/flow-designer.md.
 *
 * Positions are in canvas pixels. Objects and stickies inside a frame are positioned relative to
 * the frame's top left corner (so moving a frame moves its contents); the rest are absolute.
 */

import type { DesignStatus } from '../designStatus';
import { STATUS_AFTER_CHANGE } from '../designStatus';

export const BOARD_SCHEMA_VERSION = 1;

export type Position = { x: number; y: number };
export type Size = { width: number; height: number };

export type Channel = 'voice' | 'sms' | 'webchat' | 'whatsapp' | 'messenger' | 'instagram' | 'telegram' | 'line';
export type FlowStage = 'prequeue' | 'postqueue';

export type Frame = Position &
  Size & {
    id: string;
    title: string;
    // What the frame designs, when it's a flow (used by the exports)
    channel?: Channel;
    stage?: FlowStage;
    // The Studio flow it was imported from
    studio?: StudioFlowSource;
    // The channels, languages and services its messages' names are built from
    naming?: FlowNaming;
  };

/**
 * What a flow's message widgets' names are built from, set for the flow:
 * <prefix><channel>_<language>_<service>_<what it is>, e.g. gather_input_voice_en_childhelp_service_menu.
 * Each part is optional; one value is filled in by itself, several are chosen from.
 */
export type FlowNaming = { channels?: string[]; languages?: string[]; services?: string[] };

/**
 * What a flow is (its channel, pre- or post-queue, the Studio flow it was imported from): set on a
 * frame, or on the board itself for the objects outside frames. An imported board is one Studio
 * flow, so its objects sit on the board and the board says what flow it is.
 */
export type FlowDetails = Pick<Frame, 'channel' | 'stage' | 'studio' | 'naming'> & {
  // Studio flows built from this one template (e.g. the English and Spanish post-call surveys):
  // the board draws the template once, and each variant has what tells them apart
  variants?: FlowVariant[];
  // A flow split off from a shared template: it gets a template of its own, a copy of studio.template
  // (the export asks for it, e.g. post-call-survey-es.tftpl, and to point its studio_flows entry at it)
  ownTemplate?: { suggested: string };
};

/**
 * One Studio flow among several sharing a template: its studio_flows entry, its own flow_vars and
 * its recordings folder. Changes to widgets and connections are changes to the shared template
 * (every variant); texts from flow_vars, and voice messages' scripts and recordings, are each
 * variant's own. The first variant is the board's main one (FlowObject.message).
 */
export type FlowVariant = {
  // The studio_flows key, e.g. post_call_survey_es
  key: string;
  // e.g. Spanish
  label: string;
  // Where its recordings are: <code>/<environment>/<folder>/ (the recordings library "<code>/<folder>")
  recordingsFolder: string;
  // Its own flow_vars (its studio_flows entry's), per environment, as written
  flowVars?: Partial<Record<'staging' | 'production', Record<string, string>>>;
};

export type StudioFlowSource = {
  // Its template, under twilio-iac/helplines, e.g. usnm/templates/studio-flows/voice.tftpl
  template: string;
  // The channels (in the helpline's config) that use it
  channels: string[];
  // The flow's own settings besides its widgets (initial_state, flags, description), as written
  settings: Record<string, unknown>;
  // A template shared by helplines (templates/studio-flows/...): the other helplines using it
  sharedWith?: string[];
  // Aselo staff chose to change the shared template itself (every helpline using it); otherwise a
  // change to its widgets or connections makes this helpline a copy of its own
  changeShared?: boolean;
};

// Where a changed template goes: the shared one is only written when Aselo staff chose to change it
// for every helpline; otherwise the helpline gets a copy of its own, with the same name
export const templateTargetOf = (
  code: string,
  studio: Pick<StudioFlowSource, 'template' | 'sharedWith' | 'changeShared'>,
) =>
  studio.template.startsWith('templates/') && (studio.sharedWith?.length ?? 0) > 0 && !studio.changeShared
    ? `${code}/${studio.template}`
    : studio.template;

export type BoardComment = {
  id: string;
  author: string;
  at: string;
  text: string;
};

export type CommentThread = {
  comments: BoardComment[];
  resolved: boolean;
};

export type MessageContent = {
  channel?: Channel;
  // e.g. en, es
  language?: string;
  script?: string;
  // Messaging scripts are approved by Aselo staff; the approval holds while the script is the same
  approved?: { by: string; at: string; script: string };
  // The recording's file, when it isn't named after the widget (helplines whose recordings
  // predate the naming standards)
  recordingFile?: string;
};

export type FlowObject = Position &
  Size & {
    id: string;
    type: FlowObjectType;
    frameId?: string;
    text: string;
    // Overrides the type's colour
    color?: string;
    // The Studio widget name it becomes, e.g. play_message_voice_en_welcome
    studioName?: string;
    // For incoming contacts, messages and questions
    message?: MessageContent;
    // Ways out, for types whose exits are set per object (decisions, menus...)
    exits?: string[];
    thread?: CommentThread;
    // The Studio call's parameters, for types that have some (e.g. targetSkills); see ObjectTypeInfo.fields
    settings?: Record<string, string>;
    // Ways out deliberately left unconnected: the flow ends there ('' for a single way out)
    endedExits?: string[];
    // The Studio widget it was imported from: its name, type and settings, as in the template
    studio?: StudioWidget;
    // For "Send to queue": the task's attributes (see taskAttributes.ts)
    taskAttributes?: TaskAttributes;
    // The message as each other variant has it (FlowDetails.variants), by key: its script and
    // language, and the script as imported (to tell what changed)
    variantMessages?: Record<string, VariantMessage>;
  };

export type VariantMessage = Pick<MessageContent, 'language' | 'script' | 'approved'> & { importedScript?: string };

export type TaskAttributes = {
  // As JSON, as Studio sends them: {{…}} is filled in from the contact (Liquid); ${helpline} and
  // ${task_language} are the helpline's settings
  json: string;
  // Where twilio-iac keeps them: a channel-attributes template (under twilio-iac/helplines) that the
  // widget uses through ${channel_attributes.default}, for these channels; or the widget itself
  source: { kind: 'channelAttributes'; template: string; channels: string[] } | { kind: 'inline' };
  // As imported, to tell whether they were changed on the board
  imported?: string;
  // Channels sharing the flow whose channel_attributes point at other templates: what the widget
  // gives their tasks (shown, not edited, on the board)
  otherChannels?: { template: string; channels: string[]; json: string }[];
};

export type Connection = {
  id: string;
  from: string;
  to: string;
  // Which of the source's exits this is, e.g. "Yes", "2", "noMatch"
  exit?: string;
  // Which side of each object the line leaves from and arrives at (layout only)
  fromSide?: Side;
  toSide?: Side;
};

export type Side = 'top' | 'right' | 'bottom' | 'left';

export type Sticky = Position &
  Size & {
    id: string;
    frameId?: string;
    text: string;
    color: StickyColor;
    // A note can be a task: something to do, for someone
    task?: StickyTask;
  };

export type TaskStatus = 'todo' | 'doing' | 'done';

export type StickyTask = {
  status: TaskStatus;
  assignee?: string;
  // From the people list, when the person has one
  assigneeEmail?: string;
  // yyyy-mm-dd
  due?: string;
};

export const TASK_STATUSES: Record<TaskStatus, string> = {
  todo: 'To do',
  doing: 'In progress',
  done: 'Done',
};

export type StickyColor = 'yellow' | 'pink' | 'green' | 'blue' | 'purple';

export type BoardContent = {
  schemaVersion: number;
  title: string;
  frames: Frame[];
  objects: FlowObject[];
  connections: Connection[];
  stickies: Sticky[];
  // Where the design is (see designStatus.ts). Boards saved before statuses have none: see statusOf
  status?: DesignStatus;
  // The flow its objects outside frames make (an imported board: the Studio flow it was read from)
  flow?: FlowDetails;
  // Warnings marked as not needed for this board (their keys, checks.ts Issue.key), e.g. the
  // system-down one on a post-survey flow; they're listed apart and not counted
  ignoredChecks?: string[];
};

export type BoardMeta = {
  // Goes up by one with every save, so two people can't overwrite each other unknowingly
  revision: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type Board = {
  // Helpline code, or TEMPLATES_CODE for the Aselo templates
  code: string;
  id: string;
  meta: BoardMeta;
  content: BoardContent;
};

export type BoardSummary = Pick<Board, 'code' | 'id' | 'meta'> & {
  title: string;
  status: DesignStatus;
  // Not imported from the live config
  isNew: boolean;
};

export const TEMPLATES_CODE = '_templates';

// Someone tasks can be assigned to (see server/people.ts)
export type Person = { name: string; email?: string };

// The Aselo team's people list; the others are per helpline code
export const ASELO_PEOPLE_CODE = '_aselo';

export const emptyBoard = (title: string): BoardContent => ({
  schemaVersion: BOARD_SCHEMA_VERSION,
  title,
  frames: [],
  objects: [],
  connections: [],
  stickies: [],
});

// A board imported from a live helpline has frames read from its Studio flows; any other board
// (empty, or from a template) is new
export const isImportedBoard = (content: Pick<BoardContent, 'frames' | 'flow'>) =>
  content.flow?.studio !== undefined || content.frames.some((frame) => frame.studio !== undefined);

/**
 * Variants (FlowDetails.variants): which messages differ between them, and each variant's
 * message. A voice message's script (what's recorded, in each language) and a text from flow_vars
 * are each variant's; any other text is written in the shared template, so it's the same for all.
 */
export const variesByVariant = (object: Pick<FlowObject, 'message' | 'studio'>) => {
  if (object.message?.channel === 'voice') return true;
  const written = object.studio?.properties?.say ?? object.studio?.properties?.body;
  return typeof written === 'string' && /^\$\{\s*[a-z_]*flow_vars\./.test(written.trim());
};

// The message as a variant has it: the main variant's (or no variant's) is the object's own; another
// variant has its own script and language where the message varies (none yet: empty, to be written)
export const messageFor = (
  object: Pick<FlowObject, 'message' | 'variantMessages' | 'studio'>,
  variant?: string,
  mainVariant?: string,
): MessageContent | undefined => {
  if (!variant || variant === mainVariant || !variesByVariant(object)) return object.message;
  const own = object.variantMessages?.[variant];
  const { script, language, approved, ...shared } = object.message ?? {};
  return {
    ...shared,
    ...(own?.language ? { language: own.language } : {}),
    ...(own?.script !== undefined ? { script: own.script } : {}),
    ...(own?.approved ? { approved: own.approved } : {}),
  };
};

// The object with a variant's message changed (the main variant's is the object's own)
export const withVariantMessage = <T extends Pick<FlowObject, 'message' | 'variantMessages'>>(
  object: T,
  variant: string | undefined,
  mainVariant: string | undefined,
  message: MessageContent,
): T => {
  if (!variant || variant === mainVariant) return { ...object, message };
  const { channel, recordingFile, ...own } = message;
  return {
    ...object,
    variantMessages: {
      ...object.variantMessages,
      [variant]: { ...object.variantMessages?.[variant], ...own },
    },
  };
};

// The flow an object is part of: its frame's, or the board's own for objects outside frames
export const flowDetailsOf = (
  content: Pick<BoardContent, 'frames' | 'flow'>,
  frameId?: string,
): FlowDetails | undefined => (frameId ? content.frames.find((frame) => frame.id === frameId) : content.flow);

export const statusOf = (content: Pick<BoardContent, 'frames' | 'flow' | 'status'>): DesignStatus =>
  content.status ?? (isImportedBoard(content) ? 'imported' : STATUS_AFTER_CHANGE);

/**
 * The part of a board that is the design: what changing sets the status back to "In progress".
 * Comments (and the tasks on them), stickies, script approvals and the title are left out:
 * talking about or reviewing a design doesn't change it.
 */
export const designOf = (content: Pick<BoardContent, 'frames' | 'objects' | 'connections'>) =>
  JSON.stringify({
    frames: content.frames,
    objects: content.objects.map(({ thread, message, ...object }) => {
      if (!message) return object;
      const { approved, ...rest } = message;
      return { ...object, message: rest };
    }),
    connections: content.connections,
  });

// ---------------------------------------------------------------------------------------------
// Object types

export type FlowObjectType =
  | 'incoming'
  | 'end'
  | 'systemDown'
  | 'subflow'
  | 'checkOperatingHours'
  | 'checkClientProfile'
  | 'checkQueueAvailability'
  | 'checkWorkerLoggedIn'
  | 'checkCountry'
  | 'function'
  | 'decision'
  | 'playMessage'
  | 'sendMessage'
  | 'menuVoice'
  | 'questionMessaging'
  | 'recordVoicemail'
  | 'chatbot'
  | 'preSurvey'
  | 'sendToQueue'
  | 'setVariable'
  | 'repeat'
  | 'forwardCall'
  | 'notifyError'
  | 'goToFrame'
  | 'text'
  | 'other';

export type Shape =
  | 'pill'
  | 'rectangle'
  | 'rounded'
  | 'predefined'
  | 'diamond'
  | 'parallelogram'
  | 'manualInput'
  | 'document'
  | 'cylinder'
  | 'delay'
  | 'offPage'
  | 'none';

export type ColorFamily = 'terminal' | 'decision' | 'check' | 'message' | 'voicemail' | 'queue' | 'chatbot' | 'neutral';

export type ObjectTypeInfo = {
  label: string;
  // Groups in the palette
  group: 'Start and end' | 'Checks and calls' | 'Decisions' | 'Messages' | 'Queues' | 'Other';
  shape: Shape;
  // A Lucide icon name (see objectIcons.tsx)
  icon: string;
  family: ColorFamily;
  // The Studio widget it usually becomes, shown as a caption
  studioWidget?: string;
  // Start of its Studio name, per the Studio flow standards (twilio-iac/AGENTS.md)
  studioPrefix?: string;
  // Fixed ways out; when undefined the object has one unnamed way out
  exits?: string[];
  // Exits are set per object (e.g. a decision's answers); these are the starting ones
  editableExits?: boolean;
  // Holds a script (and, for voice, a recording)
  hasMessage?: boolean;
  defaultSize: Size;
  // The account-scoped lambda route it calls (lambdas/account-scoped/STUDIO_ROUTES.md), e.g.
  // worker/isSkilledWorkerAvailable; its Studio name is f_ + the route's name, as those docs say
  studioRoute?: string;
  // The call's parameters, set per object
  fields?: ObjectField[];
  // The field whose value tells calls to the same route apart in their names
  // (f_isSkilledWorkerAvailable_tya_calls)
  nameSuffixFrom?: string;
};

export type StudioWidget = {
  name: string;
  type: string;
  // Its settings, without its position
  properties?: Record<string, unknown>;
  // Its position in Studio, kept so regenerating the flow doesn't move it
  offset?: { x: number; y: number };
  // Its transitions as written (events, split conditions); "next" is taken from the board's connections
  transitions?: Record<string, unknown>[];
  // Its text as imported (with the variables it reads resolved)
  importedScript?: string;
};

export type ObjectField = {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  // A choice between these, instead of free text
  options?: string[];
  // What's typed: a line of text (default), an address, a JSON body (several lines) or a whole number
  kind?: 'text' | 'url' | 'json' | 'number';
  // Values offered as it's typed (any other can still be typed): the helpline's chatbots, or its
  // queues, workflows and skills in its routing design (skills are added to the comma-separated list)
  suggestions?: 'chatbots' | 'queues' | 'workflows' | 'skills';
  // How a choice (options) is shown, when not as it's written
  optionLabels?: Record<string, string>;
  // Only shown (and used) when another of its settings has one of these values
  shownWhen?: { key: string; values: string[] };
};

// Whether a field applies, given the object's other settings (ObjectField.shownWhen)
export const fieldShown = (field: Pick<ObjectField, 'shownWhen'>, settings: Record<string, string> = {}) =>
  !field.shownWhen || field.shownWhen.values.includes(settings[field.shownWhen.key] ?? '');

/**
 * What's wrong with a field's value, in plain words (empty values are fine here: what's missing
 * is the check's to say). Addresses are https://..., or start with one of the helpline's
 * variables (${lambda_twilio_account_scoped_url}/...). JSON bodies may hold Studio's {{...}} and
 * Terraform's ${...}, in strings or as values.
 */
export const fieldProblem = (field: Pick<ObjectField, 'kind'>, value: string): string | undefined => {
  if (!value.trim()) return undefined;
  if (field.kind === 'number' && !/^\d+$/.test(value.trim())) return 'This has to be a whole number.';
  if (field.kind === 'url') {
    if (/^\$\{[^}]+\}(\/\S*)?$/.test(value.trim())) return undefined;
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'The address must start with https://';
      return undefined;
    } catch {
      return 'This isn’t a valid address (https://... or ${variable}/...).';
    }
  }
  if (field.kind === 'json') {
    // Placeholders standing as values (not inside quotes) become null to check the rest
    const checked = value
      .replace(/"(?:[^"\\]|\\.)*"/g, (quoted) => quoted.replace(/[{}$]/g, '_'))
      .replace(/\{\{[^}]*\}\}|\$\{[^}]*\}/g, 'null');
    try {
      JSON.parse(checked);
      return undefined;
    } catch (err) {
      return `This isn’t valid JSON: ${(err as Error).message}`;
    }
  }
  return undefined;
};

export const OBJECT_TYPES: Record<FlowObjectType, ObjectTypeInfo> = {
  incoming: {
    label: 'Incoming call / message',
    group: 'Start and end',
    shape: 'pill',
    icon: 'Phone',
    family: 'terminal',
    studioWidget: 'Trigger',
    defaultSize: { width: 180, height: 64 },
  },
  end: {
    label: 'End',
    group: 'Start and end',
    shape: 'pill',
    icon: 'CircleStop',
    family: 'terminal',
    exits: [],
    defaultSize: { width: 140, height: 56 },
  },
  systemDown: {
    label: 'System down',
    group: 'Checks and calls',
    shape: 'predefined',
    icon: 'ServerOff',
    family: 'check',
    studioWidget: 'Run Subflow',
    studioPrefix: 'run_subflow_',
    defaultSize: { width: 180, height: 72 },
  },
  subflow: {
    label: 'Other subflow',
    group: 'Checks and calls',
    shape: 'predefined',
    icon: 'Layers',
    family: 'check',
    studioWidget: 'Run Subflow',
    studioPrefix: 'run_subflow_',
    editableExits: true,
    exits: ['completed', 'failed'],
    defaultSize: { width: 180, height: 72 },
  },
  checkOperatingHours: {
    label: 'Check operating hours',
    group: 'Checks and calls',
    shape: 'predefined',
    icon: 'Clock',
    family: 'check',
    studioWidget: 'Function + Split',
    studioPrefix: 'f_',
    studioRoute: 'operatingHours',
    exits: ['open', 'closed', 'holiday', 'failed'],
    defaultSize: { width: 190, height: 72 },
  },
  checkClientProfile: {
    label: 'Check client profile',
    group: 'Checks and calls',
    shape: 'predefined',
    icon: 'UserSearch',
    family: 'check',
    studioWidget: 'Function + Split',
    studioPrefix: 'f_',
    studioRoute: 'getProfileFlagsForIdentifier',
    exits: ['blocked', 'not blocked', 'failed'],
    defaultSize: { width: 190, height: 72 },
  },
  // worker/isSkilledWorkerAvailable: someone with the skills is free to take it right now
  checkQueueAvailability: {
    label: 'Skilled worker available?',
    group: 'Checks and calls',
    shape: 'predefined',
    icon: 'Users',
    family: 'check',
    studioWidget: 'HTTP Request + Split',
    studioPrefix: 'f_',
    studioRoute: 'worker/isSkilledWorkerAvailable',
    nameSuffixFrom: 'targetSkills',
    fields: [
      {
        key: 'targetSkills',
        label: 'Skills',
        placeholder: 'TYA,Calls',
        suggestions: 'skills',
        hint: 'Comma-separated. The worker needs all of them.',
      },
      {
        key: 'targetChannel',
        label: 'Channel',
        options: ['voice', 'chat'],
        hint: 'Free for a call: no call and no chat. Free for a chat: no call, and room under their maxMessageCapacity.',
      },
    ],
    exits: ['available', 'not available', 'failed'],
    defaultSize: { width: 210, height: 72 },
  },
  // worker/isSkilledWorkerLoggedIn: someone with the skills is on shift, busy or not
  checkWorkerLoggedIn: {
    label: 'Skilled worker logged in?',
    group: 'Checks and calls',
    shape: 'predefined',
    icon: 'UserCheck',
    family: 'check',
    studioWidget: 'HTTP Request + Split',
    studioPrefix: 'f_',
    studioRoute: 'worker/isSkilledWorkerLoggedIn',
    nameSuffixFrom: 'targetSkills',
    fields: [
      {
        key: 'targetSkills',
        label: 'Skills',
        placeholder: 'Spanish,SMS',
        suggestions: 'skills',
        hint: 'Comma-separated. The worker needs all of them.',
      },
      {
        key: 'excludedActivities',
        label: 'Not counting',
        placeholder: 'Break,Unavailable',
        hint: "Activities that don't count as logged in, besides Offline (always left out). Optional.",
      },
    ],
    exits: ['logged in', 'not logged in', 'failed'],
    defaultSize: { width: 210, height: 72 },
  },
  checkCountry: {
    label: 'Check country / phone code',
    group: 'Decisions',
    shape: 'diamond',
    icon: 'Globe',
    family: 'decision',
    studioWidget: 'Split Based On',
    studioPrefix: 'split_',
    editableExits: true,
    exits: ['US', 'noMatch'],
    defaultSize: { width: 200, height: 110 },
  },
  function: {
    label: 'Other function / HTTP request',
    group: 'Checks and calls',
    shape: 'predefined',
    icon: 'Braces',
    family: 'check',
    studioWidget: 'Run Function / HTTP Request',
    studioPrefix: 'f_',
    // The request it makes (sent as application/json, without Twilio's authentication)
    fields: [
      { key: 'method', label: 'Method', options: ['POST', 'GET'] },
      {
        key: 'url',
        label: 'Address (URL)',
        kind: 'url',
        placeholder: '${lambda_twilio_account_scoped_url}/hrm/savePostSurvey',
        hint: 'https://..., or one of the helpline’s variables followed by the path.',
      },
      {
        key: 'body',
        label: 'Body (JSON)',
        kind: 'json',
        placeholder: '{\n  "contactId": "{{trigger.call.contactId}}"\n}',
        hint: 'Sent as application/json. Studio’s {{...}} can be used in it.',
      },
    ],
    editableExits: true,
    exits: ['success', 'failed'],
    defaultSize: { width: 200, height: 72 },
  },
  decision: {
    label: 'Decision',
    group: 'Decisions',
    shape: 'diamond',
    icon: 'GitBranch',
    family: 'decision',
    studioWidget: 'Split Based On',
    studioPrefix: 'split_',
    editableExits: true,
    exits: ['Yes', 'No', 'noMatch'],
    defaultSize: { width: 190, height: 110 },
  },
  playMessage: {
    label: 'Play message (voice)',
    group: 'Messages',
    shape: 'parallelogram',
    icon: 'Volume2',
    family: 'message',
    studioWidget: 'Say/Play',
    studioPrefix: 'play_message_',
    hasMessage: true,
    defaultSize: { width: 220, height: 72 },
  },
  sendMessage: {
    label: 'Send message',
    group: 'Messages',
    shape: 'parallelogram',
    icon: 'MessageSquare',
    family: 'message',
    studioWidget: 'Send Message',
    studioPrefix: 'send_message_',
    hasMessage: true,
    defaultSize: { width: 220, height: 72 },
  },
  menuVoice: {
    label: 'Menu / question (voice)',
    group: 'Messages',
    shape: 'manualInput',
    icon: 'Grid3x3',
    family: 'message',
    studioWidget: 'Gather Input on Call',
    studioPrefix: 'gather_input_',
    hasMessage: true,
    // Studio's own ways out; the options pressed are told apart by a Decision after keypress.
    // Editable for boards made when the menu's options were its ways out (1, 2, noMatch)
    editableExits: true,
    exits: ['keypress', 'speech', 'timeout'],
    defaultSize: { width: 220, height: 80 },
  },
  questionMessaging: {
    label: 'Question (messaging)',
    group: 'Messages',
    shape: 'manualInput',
    icon: 'MessageSquareReply',
    family: 'message',
    studioWidget: 'Send and Wait for Reply',
    studioPrefix: 'send_wait_',
    hasMessage: true,
    exits: ['reply', 'timeout'],
    defaultSize: { width: 220, height: 80 },
  },
  recordVoicemail: {
    label: 'Record voicemail',
    group: 'Messages',
    shape: 'parallelogram',
    icon: 'Voicemail',
    family: 'voicemail',
    studioWidget: 'Record Voicemail',
    studioPrefix: 'record_voicemail_',
    defaultSize: { width: 200, height: 72 },
  },
  // channelCapture/captureChannelWithBot: hands the conversation to a Lex bot, which hands it back
  // by triggering the flow again (with its release flag set)
  chatbot: {
    label: 'Chatbot',
    group: 'Checks and calls',
    shape: 'predefined',
    icon: 'Bot',
    family: 'chatbot',
    studioWidget: 'HTTP Request (captureChannelWithBot)',
    studioPrefix: 'f_',
    studioRoute: 'channelCapture/captureChannelWithBot',
    nameSuffixFrom: 'botSuffix',
    fields: [
      {
        key: 'botSuffix',
        label: 'Chatbot',
        placeholder: 'pre_survey',
        suggestions: 'chatbots',
        hint: 'The bot’s name (botSuffix). Lex’s bot is <helpline>_<language>_<name>.',
      },
      {
        key: 'language',
        label: 'Language',
        placeholder: 'en-US',
        hint: 'The bot’s language, e.g. en-USCH, or ${flow_vars.bot_language}.',
      },
      {
        key: 'triggerType',
        label: 'Starts',
        options: ['withUserMessage', 'withNextMessage'],
        hint: 'withUserMessage: the bot replies straight away. withNextMessage: the message is sent and the bot waits for the reply.',
      },
      {
        key: 'message',
        label: 'Message',
        placeholder: 'trigger_pre_survey',
        hint: 'Sent to the bot (withUserMessage) or to the person (withNextMessage).',
      },
      {
        key: 'releaseType',
        label: 'When it finishes',
        options: ['triggerStudioFlow', 'postSurveyComplete'],
        hint: 'triggerStudioFlow: the conversation comes back to this flow, which starts again.',
      },
      {
        key: 'releaseFlag',
        label: 'Release flag',
        placeholder: 'preSurveyComplete',
        hint: 'Set to true when the bot finishes: check it at the top of the flow so it doesn’t start the bot again.',
      },
      {
        key: 'memoryAttribute',
        label: 'Answers kept in',
        placeholder: 'memory',
        hint: 'The conversation attribute holding the answers. Optional (memory).',
      },
    ],
    exits: ['success', 'failed'],
    defaultSize: { width: 200, height: 72 },
  },
  preSurvey: {
    label: 'Pre-survey form',
    group: 'Checks and calls',
    shape: 'document',
    icon: 'ClipboardList',
    family: 'neutral',
    studioWidget: 'Pre-survey',
    defaultSize: { width: 180, height: 80 },
  },
  sendToQueue: {
    label: 'Send to queue',
    group: 'Queues',
    shape: 'cylinder',
    icon: 'Inbox',
    family: 'queue',
    studioWidget: 'Send to Flex',
    studioPrefix: 'send_to_queue',
    // The queue is where the contact should end up: the workflow's rules send it there
    fields: [
      {
        key: 'queue',
        label: 'Queue',
        placeholder: 'en_std',
        suggestions: 'queues',
        hint: 'Where the contact should end up (the workflow’s rules send it there). Names it send_to_queue_<queue>.',
      },
      {
        key: 'workflow',
        label: 'Workflow',
        placeholder: 'master',
        suggestions: 'workflows',
        hint: 'Its key in workflow_sids.',
      },
      {
        key: 'taskChannel',
        label: 'Task channel',
        options: ['voice', 'chat', 'sms', 'default'],
        hint: 'Its key in task_channel_sids.',
      },
      {
        key: 'timeout',
        label: 'Timeout (seconds)',
        kind: 'number',
        placeholder: '3600',
        hint: 'How long it can wait in the queue. 3600 (an hour) when not set.',
      },
      // What callers hear while they wait (waitUrl)
      {
        key: 'waitMusic',
        label: 'While waiting (calls)',
        options: ['recording', 'address'],
        optionLabels: {
          '': 'Twilio’s music',
          recording: 'A recording (uploaded here)',
          address: 'An address (waitUrl)',
        },
        hint: 'A recording is named after the widget, like a message’s, and played from the recordings folder.',
      },
      {
        key: 'waitUrl',
        label: 'Wait address (waitUrl)',
        kind: 'url',
        placeholder: '${flow_vars.custom_functions_url}/postQueueMonitor?Language=english',
        hint: 'What Twilio plays while the caller waits: TwiML (e.g. a function), or an audio file.',
        shownWhen: { key: 'waitMusic', values: ['address'] },
      },
      {
        key: 'waitUrlMethod',
        label: 'Its method',
        options: ['GET', 'POST'],
        shownWhen: { key: 'waitMusic', values: ['address'] },
      },
    ],
    // Studio's events: callComplete (the contact left the queue: the post-queue flow continues),
    // failedToEnqueue, callFailure (usually left unconnected)
    exits: ['callComplete', 'failedToEnqueue', 'callFailure'],
    defaultSize: { width: 150, height: 96 },
  },
  forwardCall: {
    label: 'Forward call',
    group: 'Queues',
    shape: 'rounded',
    icon: 'PhoneForwarded',
    family: 'queue',
    studioWidget: 'Connect Call To',
    studioPrefix: 'connect_to_',
    exits: ['call completed', 'hung up'],
    defaultSize: { width: 180, height: 64 },
  },
  // An HTTP request to webhook_url_studio_errors, which posts to the Aselo team's Slack: the
  // Studio flow standards ask for one on every failure, e.g. failed to enqueue
  notifyError: {
    label: 'Notify the Aselo team',
    group: 'Other',
    shape: 'rounded',
    icon: 'BellRing',
    family: 'voicemail',
    studioWidget: 'HTTP Request (Studio errors webhook)',
    studioPrefix: 'http_post_',
    defaultSize: { width: 190, height: 64 },
  },
  setVariable: {
    label: 'Set variable / counter',
    group: 'Other',
    shape: 'rectangle',
    icon: 'Variable',
    family: 'neutral',
    studioWidget: 'Set Variables',
    studioPrefix: 'set_var_',
    defaultSize: { width: 170, height: 56 },
  },
  // A counter (Set Variables) and a Split on it: goes back round until it has repeated enough
  repeat: {
    label: 'Repeat (counter)',
    group: 'Decisions',
    shape: 'delay',
    icon: 'Repeat',
    family: 'decision',
    studioWidget: 'Set Variables + Split',
    // repeat_menu becomes set_var_menu_counter (counting in menu_counter) and split_menu
    studioPrefix: 'repeat_',
    fields: [
      {
        key: 'maxRepeats',
        label: 'Times to repeat',
        kind: 'number',
        placeholder: '2',
        hint: 'How many times it goes back round before taking “max reached”.',
      },
    ],
    exits: ['repeat', 'max reached'],
    defaultSize: { width: 190, height: 64 },
  },
  goToFrame: {
    label: 'Go to frame',
    group: 'Other',
    shape: 'offPage',
    icon: 'ExternalLink',
    family: 'neutral',
    exits: [],
    defaultSize: { width: 160, height: 72 },
  },
  text: {
    label: 'Text',
    group: 'Other',
    shape: 'none',
    icon: 'Type',
    family: 'neutral',
    exits: [],
    defaultSize: { width: 200, height: 40 },
  },
  // A Studio widget the designer has no kind for (imported as it is)
  other: {
    label: 'Other Studio widget',
    group: 'Other',
    shape: 'rectangle',
    icon: 'Braces',
    family: 'neutral',
    editableExits: true,
    exits: ['next'],
    defaultSize: { width: 190, height: 64 },
  },
};

export const FAMILY_COLORS: Record<ColorFamily, string> = {
  terminal: '#c8efd4',
  decision: '#fff176',
  check: '#b3e5fc',
  message: '#ffffff',
  voicemail: '#ff8a80',
  queue: '#ffb3b8',
  chatbot: '#a7f3e4',
  neutral: '#eceff1',
};

// Colours offered when changing an object's colour
export const OBJECT_COLORS = [
  '#ffffff',
  '#eceff1',
  '#c8efd4',
  '#a7f3e4',
  '#b3e5fc',
  '#d1c4e9',
  '#fff176',
  '#ffe0b2',
  '#ffb3b8',
  '#ff8a80',
];

export const STICKY_COLORS: Record<StickyColor, string> = {
  yellow: '#fff59d',
  pink: '#f8bbd0',
  green: '#c5e1a5',
  blue: '#b3e5fc',
  purple: '#d1c4e9',
};

export const objectColor = (object: Pick<FlowObject, 'type' | 'color'>) =>
  object.color ?? FAMILY_COLORS[OBJECT_TYPES[object.type].family];

// The object's ways out: its own when it can set them, otherwise its type's. One unnamed way
// out is ['']
export const exitsOf = (object: Pick<FlowObject, 'type' | 'exits' | 'studio'>): string[] => {
  const info = OBJECT_TYPES[object.type];
  // Imported widgets keep their Studio events as ways out
  if ((info.editableExits || object.studio) && object.exits) return object.exits;
  return info.exits ?? [''];
};

/**
 * Boards saved before a kind was replaced, brought up to date: "Wait / repeat" (a picture only) is
 * now Repeat, a counter and a split, whose way back round is the one way out it had.
 */
export const upgradeContent = (content: BoardContent): BoardContent => {
  const waits = new Set(
    content.objects.filter((object) => (object.type as string) === 'wait').map((object) => object.id),
  );
  // Send to queue's ways out are Studio's events now (imported ones always were)
  const queues = new Set(
    content.objects.filter((object) => object.type === 'sendToQueue' && !object.studio).map((object) => object.id),
  );
  const queueExit = (exit?: string) => QUEUE_EXITS_BEFORE[exit ?? ''] ?? exit;
  const changes = (connection: Connection) =>
    (waits.has(connection.from) && !connection.exit) ||
    (queues.has(connection.from) && queueExit(connection.exit) !== connection.exit);
  // Repeats named after their counter (set_var_menu_counter) are named repeat_menu now
  const oldRepeat = (object: FlowObject) =>
    object.type === 'repeat' && Boolean(object.studioName?.match(/^(postqueue_)?set_var_/));
  const objectChanges = (object: FlowObject) =>
    waits.has(object.id) ||
    oldRepeat(object) ||
    (queues.has(object.id) && (object.endedExits ?? []).some((exit) => queueExit(exit) !== exit));
  if (!content.connections.some(changes) && !content.objects.some(objectChanges)) return content;
  return {
    ...content,
    objects: content.objects.map((object) => {
      if (waits.has(object.id)) return { ...object, type: 'repeat' };
      if (oldRepeat(object)) {
        const { counter: _counter, ...settings } = object.settings ?? {};
        const studioName = object.studioName!.replace(/set_var_(.*?)(_counter)?$/, 'repeat_$1');
        return { ...object, studioName, settings: Object.keys(settings).length > 0 ? settings : undefined };
      }
      if (queues.has(object.id) && object.endedExits) {
        return { ...object, endedExits: object.endedExits.map((exit) => queueExit(exit)!) };
      }
      return object;
    }),
    connections: content.connections.map((connection) => {
      if (waits.has(connection.from) && !connection.exit) return { ...connection, exit: 'repeat' };
      if (queues.has(connection.from)) return { ...connection, exit: queueExit(connection.exit) };
      return connection;
    }),
  };
};

// Send to queue's ways out before they were Studio's events
const QUEUE_EXITS_BEFORE: Record<string, string> = {
  'post-queue': 'callComplete',
  'failed to enqueue': 'failedToEnqueue',
};

/**
 * The two widgets a Repeat becomes, from its name: repeat_menu is set_var_menu_counter (adding one
 * to flow.variables.menu_counter) then split_menu. After the queue, both start with postqueue_.
 */
export const repeatWidgetNames = (studioName: string) => {
  const postqueue = studioName.startsWith('postqueue_') ? 'postqueue_' : '';
  const base = studioName.slice(postqueue.length).replace(/^repeat_/, '') || 'repeat';
  return {
    setVar: `${postqueue}set_var_${base}_counter`,
    split: `${postqueue}split_${base}`,
    counter: `${base}_counter`,
  };
};

export const CHANNEL_ICONS: Record<Channel, string> = {
  voice: 'Phone',
  sms: 'MessageSquare',
  webchat: 'Monitor',
  whatsapp: 'MessageCircle',
  messenger: 'MessageCircle',
  instagram: 'MessageCircle',
  telegram: 'MessageCircle',
  line: 'MessageCircle',
};

export const iconOf = (object: Pick<FlowObject, 'type' | 'message'>) =>
  object.type === 'incoming' && object.message?.channel
    ? CHANNEL_ICONS[object.message.channel]
    : OBJECT_TYPES[object.type].icon;

// The route's own name: worker/isSkilledWorkerAvailable -> isSkilledWorkerAvailable
export const routeName = (route: string) => route.split('/').pop() ?? route;

export const toSnake = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toCamel = (text: string) => toSnake(text).replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());

/**
 * A Studio name for the object, following the Studio flow standards: the type's prefix, then
 * the channel and language for messages, then what the object's text describes.
 * e.g. play_message_voice_en_welcome, split_language, f_checkOperatingHours,
 * postqueue_send_message_sms_en_keep_waiting.
 */
export const suggestStudioName = (
  object: Pick<FlowObject, 'type' | 'text' | 'message' | 'settings'>,
  frame?: Pick<Frame, 'stage' | 'channel'>,
  // The flow's names' parts: its only channel, language and service are in every message's name
  choices?: NamingChoices,
): string | undefined => {
  const info = OBJECT_TYPES[object.type];
  if (!info.studioPrefix) return undefined;
  const postqueue = frame?.stage === 'postqueue' ? 'postqueue_' : '';
  if (info.studioPrefix === 'f_') {
    // Named after the route it calls, plus what tells two calls apart (e.g. the skills)
    if (info.studioRoute) {
      const suffix = info.nameSuffixFrom ? toSnake(object.settings?.[info.nameSuffixFrom] ?? '') : '';
      return `${postqueue}f_${routeName(info.studioRoute)}${suffix ? `_${suffix}` : ''}`;
    }
    return `${postqueue}f_${toCamel(object.text) || 'function'}`;
  }
  if (object.type === 'sendToQueue') {
    const queue = toSnake(object.settings?.queue ?? object.text.replace(/\bqueue\b/i, ''));
    return queue ? `send_to_queue_${queue}` : 'send_to_queue';
  }
  const byParts = isNamedByParts(object.type);
  const only = (values?: string[]) => (values?.length === 1 ? values[0] : undefined);
  const channel = byParts
    ? (object.message?.channel ?? only(choices?.channels) ?? messageChannelOf(object, frame))
    : undefined;
  const language = byParts ? (object.message?.language ?? only(choices?.languages)) : undefined;
  const service = byParts ? only(choices?.services) : undefined;
  // Text that repeats the prefix (e.g. a new "Play message (voice)") doesn't say it twice
  const prefixWords = info.studioPrefix.replace(/_$/, '');
  let described = toSnake(object.text).replace(new RegExp(`^${prefixWords}(_|$)`), '');
  // ...nor repeats the channel, language or service (a new voice message's text says "voice")
  [channel, language, service].forEach((word) => {
    if (word) described = described.replace(new RegExp(`(^|_)${word}(?=_|$)`), '').replace(/^_+/, '');
  });
  const parts = [channel, language, service, described].filter(Boolean);
  return `${postqueue}${info.studioPrefix}${parts.join('_')}`;
};

// Kinds only calls have: their messages are voice, whatever the flow
const VOICE_ONLY = new Set<FlowObjectType>(['playMessage', 'menuVoice', 'recordVoicemail']);
// The channel a message is for: its own, voice for voice-only kinds, or the flow's
export const messageChannelOf = (
  object: Pick<FlowObject, 'type' | 'message'>,
  details?: Pick<Frame, 'channel'>,
): string | undefined => object.message?.channel ?? (VOICE_ONLY.has(object.type) ? 'voice' : details?.channel);

// Kinds named <prefix><channel>_<language>_<service>_<what it is> (FlowNaming)
const NAMED_BY_PARTS = new Set<FlowObjectType>([
  'playMessage',
  'sendMessage',
  'menuVoice',
  'questionMessaging',
  'recordVoicemail',
]);
export const isNamedByParts = (type: FlowObjectType) => NAMED_BY_PARTS.has(type);

export type NamingChoices = { channels: string[]; languages: string[]; services: string[] };

/**
 * The parts a flow's names can have: as set for the flow, otherwise its channel (or its messages'
 * channels) and the languages its messages are in. No services unless set.
 */
export const namingChoicesOf = (
  details: Pick<Frame, 'channel' | 'naming'> | undefined,
  objects: Pick<FlowObject, 'type' | 'message'>[],
): NamingChoices => {
  const used = (valueOf: (object: Pick<FlowObject, 'type' | 'message'>) => string | undefined) =>
    [...new Set(objects.map(valueOf).filter((value): value is string => Boolean(value)))].sort();
  // Only messages have a channel in their names
  const messages = objects.filter((object) => isNamedByParts(object.type));
  return {
    channels:
      details?.naming?.channels ??
      (details?.channel
        ? [details.channel]
        : [...new Set(messages.map((object) => messageChannelOf(object)))]
            .filter((value): value is string => Boolean(value))
            .sort()),
    languages: details?.naming?.languages ?? used((object) => object.message?.language),
    services: details?.naming?.services ?? [],
  };
};

export type NameParts = {
  postqueue: boolean;
  prefix: string;
  channel?: string;
  language?: string;
  service?: string;
  // What the widget is, e.g. service_menu
  rest: string;
};

/**
 * A name's parts, in the standard's order (undefined when it doesn't start with the prefix):
 * gather_input_voice_en_childhelp_service_menu is voice, en, childhelp and service_menu.
 */
export const nameParts = (name: string, prefix: string, choices: NamingChoices): NameParts | undefined => {
  const postqueue = name.startsWith('postqueue_');
  const unprefixed = postqueue ? name.slice('postqueue_'.length) : name;
  if (!unprefixed.startsWith(prefix)) return undefined;
  let rest = unprefixed.slice(prefix.length);
  const take = (values: string[]) => {
    const found = [...values]
      .sort((a, b) => b.length - a.length)
      .find((value) => rest === value || rest.startsWith(`${value}_`));
    if (found) rest = rest.slice(found.length).replace(/^_/, '');
    return found;
  };
  const channel = take(choices.channels);
  const language = take(choices.languages);
  const service = take(choices.services);
  return { postqueue, prefix, channel, language, service, rest };
};

export const composeName = ({ postqueue, prefix, channel, language, service, rest }: NameParts) =>
  `${postqueue ? 'postqueue_' : ''}${prefix}${[channel, language, service, rest].filter(Boolean).join('_')}`;

/**
 * The name a message widget has under the standard, from the one it has: its prefix, then its
 * channel, language and service (found anywhere in the name, or the flow's only one), then the rest.
 * play_message_childhelp_voice_welcome -> play_message_voice_en_childhelp_welcome. The same name
 * when it already follows it.
 */
export const standardStudioName = (
  object: Pick<FlowObject, 'type' | 'text' | 'message' | 'studioName'>,
  details: Pick<Frame, 'stage' | 'channel'> | undefined,
  choices: NamingChoices,
): string | undefined => {
  const prefix = OBJECT_TYPES[object.type].studioPrefix;
  if (!prefix || !isNamedByParts(object.type) || !object.studioName) return undefined;
  const postqueue = details?.stage === 'postqueue' || object.studioName.startsWith('postqueue_');
  const words = toSnake(object.studioName)
    .replace(/^postqueue_/, '')
    .split('_');
  // The prefix, or part of it (play_..., gather_...), at its start
  const prefixWords = prefix.replace(/_$/, '').split('_');
  while (words.length > 1 && prefixWords.includes(words[0])) words.shift();
  // A value found among the words (several words for e.g. tya_calls), taken out of them
  const pick = (values: (string | undefined)[]) => {
    const sorted = values.filter((value): value is string => Boolean(value)).sort((a, b) => b.length - a.length);
    for (const value of sorted) {
      const valueWords = value.split('_');
      const at = words.findIndex((_, index) => valueWords.every((word, offset) => words[index + offset] === word));
      if (at >= 0) {
        words.splice(at, valueWords.length);
        return value;
      }
    }
    return undefined;
  };
  const only = (values: string[]) => (values.length === 1 ? values[0] : undefined);
  const channel =
    pick([messageChannelOf(object, details), ...choices.channels]) ??
    object.message?.channel ??
    only(choices.channels) ??
    messageChannelOf(object, details);
  const language =
    pick([object.message?.language, ...choices.languages]) ?? object.message?.language ?? only(choices.languages);
  const service = pick(choices.services) ?? only(choices.services);
  const rest = words.join('_');
  return composeName({ postqueue, prefix, channel, language, service, rest });
};
