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
import type { Board, BoardContent, Channel, FlowObject, Frame } from './model';
import { exitsOf, OBJECT_TYPES, toSnake } from './model';
import { boardChecks, flowScopeOf } from './checks';
import type { FlowVarChange } from './studioTemplate';
import { toStudioFlows } from './studioTemplate';
import type { MessageStatus, RecordingsList } from './recordings';
import { messageStatus, recordingOf } from './recordings';

export const FLOW_EXPORT_SCHEMA_VERSION = 1;

export type ExportedExit = {
  // The way out ("Yes", "failed"...); "" when the object has a single one
  name: string;
  // Where it leads: the object's id and Studio name
  to?: string;
  toStudioName?: string;
  // Left unconnected on purpose: the flow ends there
  endsFlow?: boolean;
};

export type ExportedObject = {
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
    recordingFile?: string;
    // Where the recording can be played, when it's been uploaded (staging) or published (production)
    recordingUrls?: { staging?: string; production?: string };
  };
  // For checks that call an account-scoped lambda route: the route and its request body
  call?: { route: string; urlTemplate: string; body: Record<string, string> };
  exits: ExportedExit[];
  openComments?: { author: string; text: string }[];
  // The live Studio widget it was imported from, as it is in the template today
  currentStudioWidget?: FlowObject['studio'];
};

export type ExportedFlow = {
  // Frames with the same channel are one Studio flow
  key: string;
  channel?: Channel;
  frames: { id: string; title: string; stage?: Frame['stage'] }[];
  objects: ExportedObject[];
};

export type FlowExport = {
  schemaVersion: number;
  about: string;
  board: { helpline: string; id: string; title: string; updatedAt: string; updatedBy: string };
  // The recordings folders: what each environment's recordings URL variable points at
  recordingsBaseUrl?: RecordingsList['baseUrls'];
  flows: ExportedFlow[];
  notes: { text: string; frame?: string; task?: NonNullable<BoardContent['stickies'][number]['task']> }[];
  checks: { severity: string; message: string; objectId?: string }[];
  // The Studio flow template generated for each frame, ready to write into twilio-iac
  studioTemplates: {
    title: string;
    // Under twilio-iac/helplines, when the frame was imported from it
    template?: string;
    channels: string[];
    // The .tftpl file's contents
    text: string;
    // Texts to set in the helpline's .hcl files
    variables: FlowVarChange[];
    // What still has to be filled in or decided
    todo: string[];
  }[];
  // Where things are on the board; not needed to build the flows
  layout: Record<string, { x: number; y: number; width: number; height: number; frame?: string; color?: string }>;
};

const ABOUT = [
  'A contact flow design from the Aselo flow designer. Each flow is one Twilio Studio flow (frames with the same',
  'channel are parts of it, e.g. pre-queue and post-queue); objects are its widgets, with the Studio names to use,',
  'and exits say where each way out leads. Build or update the helpline twilio-iac Studio flow templates (.tftpl)',
  'following twilio-iac/AGENTS.md ("Studio flow standards"); calls to account-scoped lambda routes are described in',
  'lambdas/account-scoped/STUDIO_ROUTES.md. Voice recordings are named after their widget (recordingFile).',
  'Objects imported from a live helpline carry currentStudioWidget: the widget as it is in the template today.',
  '"studioTemplates" has each frame already written as a .tftpl (rebuilt exactly as it is live for widgets nobody',
  'changed), the texts to set in the .hcl variables, and the TODOs it could not fill in: start from those.',
  '"checks" lists what the design still lacks; "layout" is only where things sit on the board.',
].join(' ');

// The uploaded file when there is one (MP3 or WAV), otherwise the MP3 it should be
const recordingFileOf = (object: FlowObject, frame?: Frame, recordings?: RecordingsList) => {
  const channel = object.message?.channel ?? frame?.channel;
  if (!OBJECT_TYPES[object.type].hasMessage || channel !== 'voice' || !object.studioName) return undefined;
  return recordingOf(object, recordings?.recordings)?.fileName ?? `${object.studioName}.mp3`;
};

export const toFlowExport = (board: Board, recordings?: RecordingsList): FlowExport => {
  const { content } = board;
  const byId = new Map(content.objects.map((object) => [object.id, object]));
  const frameOf = (object: FlowObject) => content.frames.find((frame) => frame.id === object.frameId);

  const exportObject = (object: FlowObject): ExportedObject => {
    const info = OBJECT_TYPES[object.type];
    const frame = frameOf(object);
    const out = content.connections.filter((connection) => connection.from === object.id);
    const ended = new Set(object.endedExits ?? []);
    const exits = exitsOf(object).map((name): ExportedExit => {
      const connection = out.find((candidate) => (candidate.exit ?? '') === name);
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
      ...(frame ? { frame: frame.id, ...(frame.stage ? { stage: frame.stage } : {}) } : {}),
      ...(object.message || recordingFile
        ? {
            message: {
              ...object.message,
              ...(info.hasMessage ? { status: messageStatus(object, frame, recordings?.recordings) } : {}),
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
      ...(object.studio ? { currentStudioWidget: object.studio } : {}),
      ...(openComments.length > 0 ? { openComments: openComments.map(({ author, text }) => ({ author, text })) } : {}),
    };
  };

  // One flow per Studio flow: frames sharing a channel, other frames, and what's outside frames
  const flows = new Map<string, ExportedFlow>();
  const flowFor = (object: Pick<FlowObject, 'frameId'>) => {
    const key = flowScopeOf(object, content.frames);
    const frame = object.frameId ? content.frames.find((candidate) => candidate.id === object.frameId) : undefined;
    if (!flows.has(key))
      flows.set(key, { key, ...(frame?.channel ? { channel: frame.channel } : {}), frames: [], objects: [] });
    return flows.get(key)!;
  };
  content.frames.forEach((frame) =>
    flowFor({ frameId: frame.id }).frames.push({
      id: frame.id,
      title: frame.title,
      ...(frame.stage ? { stage: frame.stage } : {}),
    }),
  );
  content.objects.forEach((object) => flowFor(object).objects.push(exportObject(object)));

  const layout: FlowExport['layout'] = {};
  [...content.frames, ...content.objects, ...content.stickies].forEach((item) => {
    const { x, y, width, height } = item;
    const frame = 'frameId' in item ? item.frameId : undefined;
    const color = 'color' in item ? item.color : undefined;
    layout[item.id] = { x, y, width, height, ...(frame ? { frame } : {}), ...(color ? { color } : {}) };
  });

  return {
    schemaVersion: FLOW_EXPORT_SCHEMA_VERSION,
    about: ABOUT,
    board: {
      helpline: board.code,
      id: board.id,
      title: content.title,
      updatedAt: board.meta.updatedAt,
      updatedBy: board.meta.updatedBy,
    },
    ...(recordings ? { recordingsBaseUrl: recordings.baseUrls } : {}),
    flows: [...flows.values()].filter((flow) => flow.objects.length > 0 || flow.frames.length > 0),
    notes: content.stickies
      .filter((sticky) => sticky.text.trim())
      .map((sticky) => ({
        text: sticky.text,
        ...(sticky.frameId ? { frame: sticky.frameId } : {}),
        ...(sticky.task ? { task: sticky.task } : {}),
      })),
    studioTemplates: toStudioFlows(content).map(({ title, template, channels, text, flowVars, todo }) => ({
      title,
      ...(template ? { template } : {}),
      channels,
      text,
      variables: flowVars,
      todo,
    })),
    checks: boardChecks(content, recordings?.recordings).map(({ severity, message, objectId }) => ({
      severity,
      message,
      ...(objectId ? { objectId } : {}),
    })),
    layout,
  };
};

// ---------------------------------------------------------------------------------------------
// Recordings and scripts

export const SCRIPT_COLUMNS = [
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

export type ScriptRow = Record<(typeof SCRIPT_COLUMNS)[number], string>;

/**
 * One row per message or question: what to record (voice) or to approve (messaging), in board
 * order (by frame, then top to bottom).
 */
export const scriptRows = (content: BoardContent, recordings?: RecordingsList): ScriptRow[] => {
  const frameOrder = new Map(content.frames.map((frame, index) => [frame.id, index]));
  return content.objects
    .filter((object) => OBJECT_TYPES[object.type].hasMessage)
    .sort(
      (a, b) =>
        (frameOrder.get(a.frameId ?? '') ?? Infinity) - (frameOrder.get(b.frameId ?? '') ?? Infinity) ||
        a.y - b.y ||
        a.x - b.x,
    )
    .map((object) => {
      const frame = content.frames.find((candidate) => candidate.id === object.frameId);
      return {
        Frame: frame?.title ?? '',
        'Studio name': object.studioName ?? '',
        'Recording file': recordingFileOf(object, frame, recordings) ?? '',
        Kind: OBJECT_TYPES[object.type].label,
        Channel: object.message?.channel ?? frame?.channel ?? '',
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
    ...rows.map((row) => SCRIPT_COLUMNS.map((column) => row[column])),
  ]);
  sheet['!cols'] = SCRIPT_COLUMNS.map((column) => ({ wch: column === 'Script' ? 60 : 24 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Recordings and scripts');
  XLSX.writeFile(workbook, exportFileName(board, '-scripts.xlsx'));
};
