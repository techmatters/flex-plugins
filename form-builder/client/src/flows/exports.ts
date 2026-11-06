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
 * What a board turns into outside the builder:
 * - the JSON a Claude agent reads to write or update the helpline's Studio flow templates;
 * - the recordings and scripts list, as a spreadsheet for the helpline.
 * See docs/flow-designer.md, "Outputs".
 */
import {
  type Board,
  type BoardContent,
  type Channel,
  exitsOf,
  flowDetailsOf,
  type FlowNaming,
  type FlowObject,
  type Frame,
  hasFromField,
  isImportedBoard,
  messageChannelOf,
  OBJECT_TYPES,
  statusOf,
  templateTargetOf,
  toSnake,
} from '@tech-matters/form-builder-shared/flows/model';
import { type DesignStatus, statusLabel } from '@tech-matters/form-builder-shared/designStatus';
import { boardChecks, flowScopeOf, splitIgnored } from '@tech-matters/form-builder-shared/flows/checks';
import { taskAttributesSourceOf } from '@tech-matters/form-builder-shared/flows/taskAttributes';
import {
  type MessageStatus,
  messageStatus,
  recordingOf,
  type RecordingsList,
  variantRecordingsUrls,
} from '@tech-matters/form-builder-shared/flows/recordings';

import { type FlowVarChange, type TaskAttributesChange, toStudioFlows } from './studioTemplate';

const FLOW_EXPORT_SCHEMA_VERSION = 1;

type ExportedExit = {
  // The way out ("Yes", "failed"...); "" when the object has a single one
  name: string;
  // Where it leads: the object's id and Studio name
  to?: string;
  toStudioName?: string;
  // Left unconnected on purpose: the flow ends there
  endsFlow?: boolean;
};

type ExportedObject = {
  id: string;
  type: FlowObject['type'];
  kind: string;
  studioWidget?: string;
  studioName?: string;
  text: string;
  frame?: string;
  stage?: Frame['stage'];
  message?: FlowObject['message'] & {
    status?: MessageStatus;
    // Send message, Question (messaging), Send message and close: who it's from (${helpline}, Bot or
    // the text chosen; empty when it isn't set, which the checks flag)
    from?: string;
    recordingFile?: string;
    // Where the recording can be played, when it's been uploaded (staging) or published (production)
    recordingUrls?: { staging?: string; production?: string };
  };
  // For checks that call an account-scoped lambda route: the route and its request body
  call?: { route: string; urlTemplate: string; body: Record<string, string> };
  // For "Set variable": what it sets ({{flow.variables.<key>}})
  variables?: FlowObject['variables'];
  exits: ExportedExit[];
  openComments?: { author: string; text: string }[];
  // For "Send to queue": the task's attributes as JSON (Studio fills in {{…}}; Terraform ${helpline}
  // and ${task_language}), and where twilio-iac keeps them
  taskAttributes?: Omit<NonNullable<FlowObject['taskAttributes']>, 'imported'> & { changed?: boolean };
  // The live Studio widget it was imported from, as it is in the template today
  currentStudioWidget?: FlowObject['studio'];
  // A check or Repeat imported with its split: that split widget, as it is live
  currentStudioSplit?: FlowObject['studioSplit'];
};

type ExportedFlow = {
  // Frames with the same channel are one Studio flow
  key: string;
  channel?: Channel;
  // What its messages' names are built from: <prefix><channel>_<language>_<service>_<what it is>
  naming?: FlowNaming;
  frames: { id: string; title: string; stage?: Frame['stage'] }[];
  objects: ExportedObject[];
};

type FlowExport = {
  schemaVersion: number;
  about: string;
  board: {
    helpline: string;
    id: string;
    title: string;
    // Only "ready" ("Ready for Claude") is agreed and finished; see designStatus.ts
    status: DesignStatus;
    statusLabel: string;
    // Not imported from the live config
    isNew: boolean;
    updatedAt: string;
    updatedBy: string;
  };
  // The recordings folders: what each environment's recordings URL variable points at
  recordingsBaseUrl?: RecordingsList['baseUrls'];
  // Studio flows sharing this board's template (one template, several studio_flows entries): each
  // one's own flow_vars, and its recordings folder (what its recordings URL variable should be)
  sharedTemplate?: {
    template?: string;
    // The flow_vars variable voice widgets read their recordings folder from, e.g. post_survey_assets_url
    recordingsUrlVariable?: string;
    flows: {
      key: string;
      label: string;
      flowVars?: Partial<Record<'staging' | 'production', Record<string, string>>>;
      recordingsUrls?: Partial<RecordingsList['baseUrls']>;
      // Added on the board (another language): its studio_flows entry has to be added
      added?: boolean;
    }[];
  };
  // A flow split off from a shared template: make it a template of its own
  ownTemplate?: { from: string; suggested: string; studioFlow?: string };
  flows: ExportedFlow[];
  checks: { severity: string; message: string; objectId?: string }[];
  // Sticky notes and open widget comments that mention @claude: requests from the team to whoever
  // implements the board
  forClaude?: { text: string; from: 'note' | 'comment'; author?: string; objectId?: string; frame?: string }[];
  // The Studio flow template generated for each frame, ready to write into twilio-iac
  studioTemplates: {
    title: string;
    // Under twilio-iac/helplines, when the frame was imported from it
    template?: string;
    // Where to write it if it changed: the template itself, or (a shared template, not to be changed
    // for everyone) a copy of the helpline's own with the same name, its config pointed at it
    writeTo?: string;
    // The other helplines using a shared template
    sharedWith?: string[];
    changeShared?: boolean;
    channels: string[];
    // The .tftpl file's contents
    text: string;
    // Texts to set in the helpline's .hcl files
    // Each with where it goes in twilio-iac (addTo)
    variables: (FlowVarChange & { addTo: string[] })[];
    // "Send to queue" task attributes that are new or changed, for the channel-attributes templates
    taskAttributes: TaskAttributesChange[];
    // What still has to be filled in or decided
    todo: string[];
  }[];
  // Where things are on the board; not needed to build the flows
  layout: Record<string, { x: number; y: number; width: number; height: number; frame?: string; color?: string }>;
};

const ABOUT = [
  'A contact flow design from the Aselo flow designer. Implement it only when board.status is "ready" (Ready for',
  'Claude); any other status means it is not finished or agreed yet, so ask before going on. Each flow is one',
  'Twilio Studio flow (frames with the same channel are parts of it, e.g. pre-queue and post-queue); objects are',
  'its widgets, with the Studio names to use,',
  'and exits say where each way out leads. Build or update the helpline twilio-iac Studio flow templates (.tftpl)',
  'following twilio-iac/AGENTS.md ("Studio flow standards"); calls to account-scoped lambda routes are described in',
  'lambdas/account-scoped/STUDIO_ROUTES.md. Voice recordings are named after their widget (recordingFile) and play',
  'from the Aselo recordings bucket (recordingsBaseUrl), through a flow_vars variable listed in "variables"',
  '(recordings_url, unless the flow already has one pointing there), never from Twilio Serverless. A voice message',
  'with a script but no recording uploaded yet (no recordingUrls) says its script (in "variables") until it is',
  'uploaded; export the board again then, and it plays the recording.',
  'Messages (Send message, Question, Send message and close) say who they are from in message.from: ${helpline},',
  'Bot or the text chosen, exactly as the template writes it.',
  'Objects imported from a live helpline carry currentStudioWidget: the widget as it is in the template today.',
  'A check (client profile, operating hours, skilled worker) or Repeat imported with the split on its answer is one',
  'object: currentStudioSplit is that split widget, and studioTemplates writes both back as they are live.',
  '"studioTemplates" has each frame already written as a .tftpl (rebuilt exactly as it is live for widgets nobody',
  'changed), the texts to set in the .hcl variables, and the TODOs it could not fill in: start from those.',
  'Its "variables" are every value the template reads from the helpline config that is new or changed, each with',
  '"addTo": the file and block to set it in (flow_vars, the flow_vars of a studio_flows entry, or the',
  'channel_flow_vars of each channel; a few helplines keep these in common.hcl instead). "environmentSpecific" ones',
  'were typed into a widget (a SID, a staging or Twilio Functions address): value is for staging, ask for the',
  'production one, unless they come with "values" for each environment (the recordings folder): use those.',
  '"Send to queue" objects carry taskAttributes: the task attributes as JSON (as Studio sends them: {{…}} is',
  'Liquid filled in from the contact, ${helpline} and ${task_language} come from the helpline config). When their',
  'source is a channel-attributes template, the widget keeps "attributes": "${channel_attributes.default}" and',
  'Terraform fills it in with that template, picked by channel_attributes in common.hcl (or defaults.hcl) for the',
  'channel: "<channel>-conversations" for Conversations channels, otherwise "<channel>", falling back to',
  '"default-conversations" / "default". Any other source means the widget\'s own attributes: written inline in',
  'the widget, and the channel-attributes templates stay as they are.',
  '"sharedTemplate" (when present) lists the Studio flows built from this one template (studio_flows entries in',
  'staging.hcl / production.hcl, e.g. a survey in English and Spanish): the template is ONE file for all of them,',
  'so a change to widgets or connections is made once there; each flow keeps its own flow_vars ("variables" with',
  '"flow" say which entry a text goes in), and its recordings folder: set recordingsUrlVariable in each flow\'s',
  'flow_vars to its recordingsUrls for that environment. A flow with "added" is a new language: add its',
  'studio_flows entry (its key, the same templatefile, its flowVars: those of the first flow, with its language and',
  'recordings folder changed), and list as TODO any text still in the language of the first flow. On a new board',
  '(no "template"), every flow is "added": write the template once, as for any new board, and give each flow a',
  'studio_flows entry pointing at it (no channel uses it unless the board says so).',
  '"ownTemplate" (when present) means this flow was split',
  'off a shared template: write it as a new template (suggested name), a copy of "from" with the board\'s changes,',
  'and point its studio_flows entry at it; the other flows keep the old template.',
  'A template under templates/ can be shared by helplines ("sharedWith"): if its text changed (more than widget',
  'positions), write it to "writeTo", which is a copy of this helpline\'s own (same name, under its folder) unless',
  'Aselo staff chose "changeShared"; then point this helpline\'s templatefile entries at the copy. With',
  '"changeShared", the shared file itself changes, and every helpline in sharedWith with it: ask first.',
  '"forClaude" (when present) has the sticky notes and open comments that mention @claude: requests from the team',
  'about this board. Do each one, or say why not, as part of the work.',
  '"checks" lists what the design still lacks; "layout" is only where things sit on the board.',
].join(' ');

// Where a flow variable is set in twilio-iac: flow_vars (the studio_flows entry's, for flows sharing a
// template), or each channel's channel_flow_vars, in both environments' files
const variableTargetsOf = (code: string, variable: FlowVarChange, channels: string[]) => {
  const blocks =
    // eslint-disable-next-line no-nested-ternary
    variable.scope === 'channel_flow_vars'
      ? channels.length > 0
        ? channels.map(channel => `channels.${channel}.channel_flow_vars`)
        : ['channels.<channel>.channel_flow_vars']
      : variable.flow
      ? [`studio_flows.${variable.flow}.flow_vars`]
      : ['flow_vars'];
  return ['staging', 'production'].flatMap(environment =>
    blocks.map(block => `${code}/${environment}.hcl: ${block}.${variable.name}`),
  );
};

const mentionsClaude = (text: string) => /@claude\b/i.test(text);

// Sticky notes stay on the board, except the ones (and open comments) addressed to @claude
const forClaudeOf = (content: BoardContent): FlowExport['forClaude'] => [
  ...content.stickies
    .filter(sticky => mentionsClaude(sticky.text))
    .map(({ text, id, frameId }) => ({
      text,
      from: 'note' as const,
      objectId: id,
      ...(frameId ? { frame: frameId } : {}),
    })),
  ...content.objects.flatMap(object =>
    object.thread && !object.thread.resolved
      ? object.thread.comments
          .filter(comment => mentionsClaude(comment.text))
          .map(({ text, author }) => ({ text, from: 'comment' as const, author, objectId: object.id }))
      : [],
  ),
];

// The uploaded file when there is one (MP3 or WAV), otherwise the MP3 it should be
const recordingFileOf = (object: FlowObject, frame?: Pick<Frame, 'channel'>, recordings?: RecordingsList) => {
  const channel = messageChannelOf(object, frame);
  if (!OBJECT_TYPES[object.type].hasMessage || channel !== 'voice' || !object.studioName) return undefined;
  return recordingOf(object, recordings?.recordings)?.fileName ?? `${object.studioName}.mp3`;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const toFlowExport = (board: Board, recordings?: RecordingsList): FlowExport => {
  const { content } = board;
  const byId = new Map(content.objects.map(object => [object.id, object]));
  const frameOf = (object: FlowObject) => flowDetailsOf(content, object.frameId);

  // eslint-disable-next-line complexity
  const exportObject = (object: FlowObject): ExportedObject => {
    const info = OBJECT_TYPES[object.type];
    const frame = frameOf(object);
    const out = content.connections.filter(connection => connection.from === object.id);
    const ended = new Set(object.endedExits ?? []);
    const exits = exitsOf(object).map((name): ExportedExit => {
      const connection = out.find(candidate => (candidate.exit ?? '') === name);
      const target = connection && byId.get(connection.to);
      return {
        name,
        ...(target ? { to: target.id, ...(target.studioName ? { toStudioName: target.studioName } : {}) } : {}),
        ...(!target && ended.has(name) ? { endsFlow: true } : {}),
      };
    });
    const recordingFile = recordingFileOf(object, frame, recordings);
    const recording = recordingOf(object, recordings?.recordings);
    const recordingUrls = recording && {
      ...(recording.staging ? { staging: recording.staging.url } : {}),
      ...(recording.production ? { production: recording.production.url } : {}),
    };
    const openComments = object.thread && !object.thread.resolved ? object.thread.comments : [];
    return {
      id: object.id,
      type: object.type,
      kind: info.label,
      ...(info.studioWidget ? { studioWidget: info.studioWidget } : {}),
      ...(object.studioName ? { studioName: object.studioName } : {}),
      text: object.text,
      ...(object.frameId ? { frame: object.frameId } : {}),
      ...(frame?.stage ? { stage: frame.stage } : {}),
      ...(object.message || recordingFile || hasFromField(object.type)
        ? {
            message: {
              ...object.message,
              ...(info.hasMessage ? { status: messageStatus(object, frame, recordings?.recordings) } : {}),
              ...(hasFromField(object.type) ? { from: object.settings?.from ?? '' } : {}),
              ...(recordingFile ? { recordingFile } : {}),
              ...(recordingUrls ? { recordingUrls } : {}),
            },
          }
        : {}),
      ...(info.studioRoute
        ? {
            call: {
              route: info.studioRoute,
              urlTemplate: `\${lambda_twilio_account_scoped_url}/${info.studioRoute}`,
              body: object.settings ?? {},
            },
          }
        : {}),
      exits,
      ...(object.taskAttributes
        ? {
            taskAttributes: {
              json: object.taskAttributes.json,
              source: taskAttributesSourceOf(object.taskAttributes),
              ...(object.taskAttributes.otherChannels ? { otherChannels: object.taskAttributes.otherChannels } : {}),
              ...(object.taskAttributes.imported === undefined ||
              object.taskAttributes.imported !== object.taskAttributes.json ||
              taskAttributesSourceOf(object.taskAttributes).kind !== object.taskAttributes.source.kind
                ? { changed: true }
                : {}),
            },
          }
        : {}),
      ...(object.variables?.length ? { variables: object.variables } : {}),
      ...(object.studio ? { currentStudioWidget: object.studio } : {}),
      ...(object.studioSplit ? { currentStudioSplit: object.studioSplit } : {}),
      ...(openComments.length > 0 ? { openComments: openComments.map(({ author, text }) => ({ author, text })) } : {}),
    };
  };

  // One flow per Studio flow: frames sharing a channel, other frames, and what's outside frames
  const flows = new Map<string, ExportedFlow>();
  const flowFor = (object: Pick<FlowObject, 'frameId'>) => {
    const key = flowScopeOf(object, content.frames);
    const frame = flowDetailsOf(content, object.frameId);
    if (!flows.has(key))
      flows.set(key, {
        key,
        ...(frame?.channel ? { channel: frame.channel } : {}),
        ...(frame?.naming ? { naming: frame.naming } : {}),
        frames: [],
        objects: [],
      });
    return flows.get(key)!;
  };
  content.frames.forEach(frame =>
    flowFor({ frameId: frame.id }).frames.push({
      id: frame.id,
      title: frame.title,
      ...(frame.stage ? { stage: frame.stage } : {}),
    }),
  );
  content.objects.forEach(object => flowFor(object).objects.push(exportObject(object)));

  const layout: FlowExport['layout'] = {};
  // Sticky notes are the team's own (comments on widgets are exported with them)
  [...content.frames, ...content.objects].forEach(item => {
    const { x, y, width, height } = item;
    const frame = 'frameId' in item ? item.frameId : undefined;
    const color = 'color' in item ? item.color : undefined;
    layout[item.id] = { x, y, width, height, ...(frame ? { frame } : {}), ...(color ? { color } : {}) };
  });

  const forClaude = forClaudeOf(content);

  return {
    schemaVersion: FLOW_EXPORT_SCHEMA_VERSION,
    about: ABOUT,
    board: {
      helpline: board.code,
      id: board.id,
      title: content.title,
      status: statusOf(content),
      statusLabel: statusLabel(statusOf(content)),
      isNew: !isImportedBoard(content),
      updatedAt: board.meta.updatedAt,
      updatedBy: board.meta.updatedBy,
    },
    ...(recordings ? { recordingsBaseUrl: recordings.baseUrls } : {}),
    ...sharedTemplateOf(content, recordings),
    ...(forClaude && forClaude.length > 0 ? { forClaude } : {}),
    flows: [...flows.values()].filter(flow => flow.objects.length > 0 || flow.frames.length > 0),
    studioTemplates: toStudioFlows(content, recordings).map(
      ({ title, template, sharedWith, changeShared, channels, text, flowVars, taskAttributes, todo }) => ({
        title,
        ...(template
          ? { template, writeTo: templateTargetOf(board.code, { template, sharedWith, changeShared }) }
          : {}),
        ...(sharedWith ? { sharedWith } : {}),
        ...(changeShared ? { changeShared } : {}),
        channels,
        text,
        variables: flowVars.map(variable => ({
          ...variable,
          addTo: variableTargetsOf(board.code, variable, channels),
        })),
        taskAttributes,
        todo,
      }),
    ),
    // The warnings the team marked as not needed aren't listed
    checks: splitIgnored(boardChecks(content, recordings?.recordings), content.ignoredChecks).active.map(
      ({ severity, message, objectId }) => ({
        severity,
        message,
        ...(objectId ? { objectId } : {}),
      }),
    ),
    layout,
  };
};

// The flows sharing the board's template, and the one split off from it (see FlowExport)
const sharedTemplateOf = (content: BoardContent, recordings?: RecordingsList): Partial<FlowExport> => {
  const { flow } = content;
  const variants = flow?.variants ?? [];
  const parts: Partial<FlowExport> = {};
  if (flow?.ownTemplate && flow.studio) {
    parts.ownTemplate = {
      from: flow.studio.template,
      suggested: flow.ownTemplate.suggested,
      ...(variants[0] ? { studioFlow: variants[0].key } : {}),
    };
  }
  if (variants.length === 0) return parts;
  const recordingsUrlVariable = content.objects
    .map(
      object => String(object.studio?.properties?.play ?? '').match(/^\$\{\s*flow_vars\.([A-Za-z0-9_]+)\s*\}\//)?.[1],
    )
    .find(Boolean);
  parts.sharedTemplate = {
    ...(flow?.studio ? { template: flow.studio.template } : {}),
    ...(recordingsUrlVariable ? { recordingsUrlVariable } : {}),
    flows: variants.map(variant => ({
      key: variant.key,
      label: variant.label,
      ...(variant.flowVars ? { flowVars: variant.flowVars } : {}),
      ...(variant.added ? { added: true } : {}),
      ...(recordings
        ? { recordingsUrls: variantRecordingsUrls(recordings.baseUrls, variants, variant.recordingsFolder) }
        : {}),
    })),
  };
  return parts;
};

// ---------------------------------------------------------------------------------------------
// Recordings and scripts

const SCRIPT_COLUMNS = [
  'Frame',
  'Studio name',
  'Recording file',
  'Kind',
  'Channel',
  'Language',
  'Text on the board',
  'Script',
  'Status',
] as const;

type ScriptRow = Record<(typeof SCRIPT_COLUMNS)[number], string>;

/**
 * One row per message or question: what to record (voice) or to approve (messaging), in board
 * order (by frame, then top to bottom).
 */
export const scriptRows = (content: BoardContent, recordings?: RecordingsList): ScriptRow[] => {
  const frameOrder = new Map(content.frames.map((frame, index) => [frame.id, index]));
  return content.objects
    .filter(object => OBJECT_TYPES[object.type].hasMessage)
    .sort(
      (a, b) =>
        (frameOrder.get(a.frameId ?? '') ?? Infinity) - (frameOrder.get(b.frameId ?? '') ?? Infinity) ||
        a.y - b.y ||
        a.x - b.x,
    )
    .map(object => {
      const frame = content.frames.find(candidate => candidate.id === object.frameId);
      const details = flowDetailsOf(content, object.frameId);
      return {
        Frame: frame?.title ?? '',
        'Studio name': object.studioName ?? '',
        'Recording file': recordingFileOf(object, details, recordings) ?? '',
        Kind: OBJECT_TYPES[object.type].label,
        Channel: messageChannelOf(object, details) ?? '',
        Language: object.message?.language ?? '',
        'Text on the board': object.text,
        Script: object.message?.script ?? '',
        Status: messageStatus(object, frame, recordings?.recordings),
      };
    });
};

// ---------------------------------------------------------------------------------------------
// Downloads

export const exportFileName = (board: Board, suffix: string) =>
  `${board.code === '_templates' ? 'template' : board.code}-${toSnake(board.content.title) || board.id}${suffix}`;

const download = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadFlowExport = (board: Board, recordings?: RecordingsList) =>
  download(
    new Blob([`${JSON.stringify(toFlowExport(board, recordings), null, 2)}\n`], { type: 'application/json' }),
    exportFileName(board, '.flows.json'),
  );

export const downloadScripts = async (board: Board, recordings?: RecordingsList) => {
  const XLSX = await import('xlsx');
  const rows = scriptRows(board.content, recordings);
  const sheet = XLSX.utils.aoa_to_sheet([
    [...SCRIPT_COLUMNS],
    ...rows.map(row => SCRIPT_COLUMNS.map(column => row[column])),
  ]);
  sheet['!cols'] = SCRIPT_COLUMNS.map(column => ({ wch: column === 'Script' ? 60 : 24 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Recordings and scripts');
  XLSX.writeFile(workbook, exportFileName(board, '-scripts.xlsx'));
};
