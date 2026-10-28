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
  };

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

export const TASK_STATUSES: Record<TaskStatus, string> = { todo: 'To do', doing: 'In progress', done: 'Done' };

export type StickyColor = 'yellow' | 'pink' | 'green' | 'blue' | 'purple';

export type BoardContent = {
  schemaVersion: number;
  title: string;
  frames: Frame[];
  objects: FlowObject[];
  connections: Connection[];
  stickies: Sticky[];
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

export type BoardSummary = Pick<Board, 'code' | 'id' | 'meta'> & { title: string };

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
  | 'wait'
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
  properties?: Record<string, unknown>;
};

export type ObjectField = {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  // A choice between these, instead of free text
  options?: string[];
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
    editableExits: true,
    exits: ['1', '2', 'noMatch', 'timeout'],
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
  chatbot: {
    label: 'Chatbot',
    group: 'Checks and calls',
    shape: 'predefined',
    icon: 'Bot',
    family: 'chatbot',
    studioWidget: 'Lex chatbot',
    exits: ['finished', 'failed'],
    defaultSize: { width: 180, height: 72 },
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
    exits: ['post-queue', 'failed to enqueue'],
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
  wait: {
    label: 'Wait / repeat',
    group: 'Queues',
    shape: 'delay',
    icon: 'Timer',
    family: 'neutral',
    studioWidget: 'Post-queue loop',
    defaultSize: { width: 170, height: 64 },
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
    const queue = toSnake(object.text.replace(/\bqueue\b/i, ''));
    return queue ? `send_to_queue_${queue}` : 'send_to_queue';
  }
  const channel = info.hasMessage ? (object.message?.channel ?? frame?.channel) : undefined;
  const language = info.hasMessage ? object.message?.language : undefined;
  // Text that repeats the prefix (e.g. a new "Play message (voice)") doesn't say it twice
  const prefixWords = info.studioPrefix.replace(/_$/, '');
  let described = toSnake(object.text).replace(new RegExp(`^${prefixWords}(_|$)`), '');
  // ...nor repeats the channel or language (a new voice message's text says "voice")
  [channel, language].forEach((word) => {
    if (word) described = described.replace(new RegExp(`(^|_)${word}(?=_|$)`), '').replace(/^_+/, '');
  });
  const parts = [channel, language, described].filter(Boolean);
  return `${postqueue}${info.studioPrefix}${parts.join('_')}`;
};
