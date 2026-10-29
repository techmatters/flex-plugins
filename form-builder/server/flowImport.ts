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
 * Builds boards from a live helpline's twilio-iac config (docs/flow-designer.md, "Import an
 * existing helpline"):
 *
 * - its Studio flows: the channels in common.hcl / staging.hcl / production.hcl (channels sharing
 *   a template are one flow), the system-down subflow and the other Studio flows (e.g. post-call
 *   surveys), each on its own board, as in Studio;
 * - each widget becomes an object of the matching kind, keeping its Studio name, settings and
 *   events (its ways out), at Studio's own position;
 * - message texts come from ${flow_vars...} / ${channel_flow_vars...}, production first;
 * - the recordings' current addresses (today Twilio Serverless), for both environments, so they
 *   can be copied into the recordings bucket.
 *
 * What needs a person (texts that differ between environments, unknown widgets, names that don't
 * follow the standards...) goes in the report.
 */
import { promises as fs } from 'fs';
import path from 'path';
import type {
  BoardContent,
  Channel,
  Connection,
  FlowObject,
  FlowObjectType,
  FlowDetails,
  FlowVariant,
  Side,
  TaskAttributes,
} from '../src/flows/model';
import { emptyBoard, OBJECT_TYPES, variesByVariant } from '../src/flows/model';
import { importedRecordingKey, RECORDING_FILE_PATTERN } from '../src/flows/recordings';
import { studioNameProblems } from '../src/flows/checks';
import {
  CHANNEL_ATTRIBUTES_REFERENCE,
  channelAttributesKeys,
  isChannelAttributesReference,
} from '../src/flows/taskAttributes';
import { HclObject, HclValue, isObject, localsOf, parseHcl, parseTemplate } from './hcl';

export type ImportedRecording = {
  fileName: string;
  environment: 'staging' | 'production';
  sourceUrl: string;
  // The flow's own recordings folder, for flows sharing a template (see recordingStores.ts)
  folder?: string;
};

export type ImportedFlow = {
  title: string;
  name: string;
  template: string;
  channels: string[];
  widgets: number;
  // Where the flow is live: the environment files that use it
  environments: Environment[];
  // For each channel, the environments it's in (they can differ, e.g. a channel only in staging)
  channelEnvironments: Record<string, Environment[]>;
  // The Studio flows sharing this template, when there are several (one board, a variant each)
  variants?: string[];
};

export type ImportReport = {
  helpline: string;
  // The environment files found
  environments: string[];
  flows: ImportedFlow[];
  // What a person should look at, in plain language
  notes: string[];
};

// One board per Studio flow, as in Studio
export type ImportedBoard = {
  title: string;
  content: BoardContent;
  // The recordings its voice messages play ("<folder>/<file>" for variants), to copy only those of the boards chosen
  recordingFiles: string[];
};

export type HelplineImport = {
  boards: ImportedBoard[];
  report: ImportReport;
  recordings: ImportedRecording[];
};

const ENVIRONMENTS = ['production', 'staging'] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

// Templates are referenced by their path in the deploy container
const CONTAINER_HELPLINES_DIR = '/app/twilio-iac/helplines/';

const FRAME_PADDING = 80;

const CHANNEL_TYPES: Record<string, Channel> = {
  voice: 'voice',
  sms: 'sms',
  modica: 'sms',
  whatsapp: 'whatsapp',
  facebook: 'messenger',
  messenger: 'messenger',
  instagram: 'instagram',
  telegram: 'telegram',
  line: 'line',
  web: 'webchat',
  chat: 'webchat',
  webchat: 'webchat',
};

const PREFIXES = [
  'split_',
  'set_var_',
  'run_subflow_',
  'gather_input_',
  'connect_to_',
  'play_message_',
  'send_message_',
  'send_wait_',
  'http_get_',
  'http_post_',
  'send_to_queue_',
  'record_voicemail_',
  'f_',
];
const LANGUAGES = ['en', 'es', 'fr', 'pt', 'mt', 'zh', 'ar', 'th', 'sw'];

type Vars = { flow_vars: HclObject; channel_flow_vars: HclObject };
type FlowSource = {
  title: string;
  templatefile: string;
  channels: string[];
  channelEnvironments: Record<string, Environment[]>;
  channel?: Channel;
  vars: Partial<Record<Environment, Vars>>;
  // Each channel's channel-attributes template (under twilio-iac/helplines), as Terraform picks it
  channelAttributes: Record<string, string>;
  // For studio_flows entries: its key and its own flow_vars, per environment
  flowName?: string;
  ownVars?: Partial<Record<Environment, HclObject>>;
  // Studio flows sharing this template (the first is this one): one board, a variant each
  variants?: FlowSource[];
};

const readLocals = async (file: string): Promise<HclObject | undefined> => {
  try {
    return localsOf(parseHcl(await fs.readFile(file, 'utf8')));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw new Error(`Couldn't read ${path.basename(file)}: ${(err as Error).message}`);
  }
};

// A Terragrunt file's own settings: local_config (merged over the shared ones), or config
const configOf = (locals?: HclObject): HclObject => {
  if (!locals) return {};
  if (isObject(locals.local_config)) return locals.local_config;
  return isObject(locals.config) ? locals.config : {};
};

const objectOf = (value: HclValue | undefined): HclObject => (isObject(value) ? value : {});

/**
 * A helpline's settings for each environment: common.hcl, with the environment's file merged over
 * it as Terraform's merge() does (key by key). Production first.
 */
export const readHelplineConfigs = async (helplinesDir: string, code: string) => {
  if (!/^[a-z0-9]+$/.test(code)) throw new Error(`Invalid helpline ${code}`);
  const dir = path.join(helplinesDir, code);
  const common = configOf(await readLocals(path.join(dir, 'common.hcl')));
  const configs: Partial<Record<Environment, HclObject>> = {};
  for (const environment of ENVIRONMENTS) {
    const locals = await readLocals(path.join(dir, `${environment}.hcl`));
    if (locals) configs[environment] = { ...common, ...configOf(locals) };
  }
  const environments = ENVIRONMENTS.filter((environment) => configs[environment]);
  if (environments.length === 0) throw new Error(`No staging.hcl or production.hcl for ${code}.`);
  return { configs, environments };
};

// Templates are referenced by their path in the deploy container; this is it under twilio-iac/helplines
export const templatePathOf = (templatefile: string) =>
  templatefile.startsWith(CONTAINER_HELPLINES_DIR) ? templatefile.slice(CONTAINER_HELPLINES_DIR.length) : undefined;
const textOf = (value: HclValue | undefined) => (typeof value === 'string' ? value : undefined);

// ${flow_vars.x} and ${channel_flow_vars.x} with the environment's values; the rest stays as written
const resolve = (text: string, vars?: Vars) =>
  text.replace(
    /\$\{\s*(flow_vars|channel_flow_vars|system_down_flow_vars)\.([A-Za-z0-9_]+)\s*\}/g,
    (found, scope, key) => {
      const source = scope === 'channel_flow_vars' ? vars?.channel_flow_vars : vars?.flow_vars;
      const value = source?.[key];
      return typeof value === 'string' || typeof value === 'number' ? String(value) : found;
    },
  );

const humanize = (name: string) => {
  let rest = name.replace(/^postqueue_/, '');
  const prefix = PREFIXES.find((candidate) => rest.startsWith(candidate));
  if (prefix) rest = rest.slice(prefix.length);
  const words = rest
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
  while (words.length > 1 && ['voice', 'sms', 'chat'].includes(words[0])) words.shift();
  const text = words.join(' ');
  return text ? text[0].toUpperCase() + text.slice(1) : name;
};

const languageOf = (name: string, properties: HclObject, vars?: Vars) => {
  const fromName = name.split('_').find((word) => LANGUAGES.includes(word));
  if (fromName) return fromName;
  const written = textOf(properties.language) ?? textOf(properties.say_language);
  // e.g. ${flow_vars.gather_language}: what the flow sets it to
  const spoken = written && resolve(written, vars);
  return spoken && !spoken.includes('${') ? spoken.split('-')[0].toLowerCase() : undefined;
};

// A variant's name for people: its language when it says one (gather_language es-US), else its key
const LANGUAGE_NAMES: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', pt: 'Portuguese' };
const variantLabelOf = (source: FlowSource) => {
  const vars = source.vars.production ?? source.vars.staging;
  const language = Object.entries(vars?.flow_vars ?? {}).find(
    ([key, value]) => /language/i.test(key) && typeof value === 'string',
  )?.[1] as string | undefined;
  const code = language?.split('-')[0].toLowerCase() ?? source.flowName?.match(/_([a-z]{2})$/)?.[1];
  return (code && LANGUAGE_NAMES[code]) ?? source.flowName ?? source.title;
};

const typeOf = (widget: HclObject): FlowObjectType | undefined => {
  const name = textOf(widget.name) ?? '';
  const properties = objectOf(widget.properties);
  const target = `${name} ${textOf(properties.url) ?? ''} ${textOf(properties.function_sid) ?? ''} ${textOf(properties.flow_sid) ?? ''}`;
  switch (widget.type) {
    case 'trigger':
      return 'incoming';
    case 'split-based-on':
      return /country/i.test(name) ? 'checkCountry' : 'decision';
    case 'make-http-request':
    case 'run-function':
      if (/webhook_url_studio_errors|notify/i.test(target)) return 'notifyError';
      if (/operatingHours/.test(target)) return 'checkOperatingHours';
      if (/getProfileFlagsForIdentifier/.test(target)) return 'checkClientProfile';
      if (/isSkilledWorkerAvailable/.test(target)) return 'checkQueueAvailability';
      if (/isSkilledWorker(LoggedIn|Online)/.test(target)) return 'checkWorkerLoggedIn';
      return 'function';
    case 'say-play':
      return 'playMessage';
    case 'send-message':
      return 'sendMessage';
    case 'send-and-wait-for-reply':
      return 'questionMessaging';
    case 'gather-input-on-call':
      return 'menuVoice';
    case 'record-voicemail':
      return 'recordVoicemail';
    case 'send-to-flex':
      return 'sendToQueue';
    case 'set-variables':
      return 'setVariable';
    case 'run-subflow':
      return /system_down/i.test(target) ? 'systemDown' : 'subflow';
    case 'connect-call-to':
      return 'forwardCall';
    default:
      return undefined;
  }
};

// A transition's way out: its event, or for a split's matches, the condition's name
const exitNameOf = (transition: HclObject, index: number) => {
  if (transition.event !== 'match') return textOf(transition.event) ?? `event ${index + 1}`;
  const [condition] = Array.isArray(transition.conditions) ? transition.conditions.filter(isObject) : [];
  return textOf(condition?.friendly_name) ?? textOf(condition?.value) ?? `match ${index + 1}`;
};

const sidesBetween = (from: { x: number; y: number }, to: { x: number; y: number }): [Side, Side] => {
  if (to.y - from.y >= 40) return ['bottom', 'top'];
  if (from.y - to.y >= 40 && Math.abs(to.x - from.x) < 120) return ['top', 'bottom'];
  return to.x >= from.x ? ['right', 'left'] : ['left', 'right'];
};

// Studio's widgets are much taller than the board's objects, so its vertical gaps (~280px) leave
// the board mostly empty: heights are halved, keeping the order and the columns.
const VERTICAL_SCALE = 0.5;
// The least space between an object and the one above it in its column
const MIN_VERTICAL_SPACE = 24;

type Box = { x: number; y: number; width: number; height: number };

/**
 * Moves objects down, top to bottom, until none overlaps another: halving Studio's heights can
 * bring two widgets of a column too close, and Studio sometimes has two at the very same place.
 */
export const separate = (boxes: Box[]) => {
  const placed: Box[] = [];
  [...boxes]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .forEach((box) => {
      let moved = true;
      while (moved) {
        moved = false;
        for (const other of placed) {
          const sideBySide = box.x >= other.x + other.width || other.x >= box.x + box.width;
          const tooClose = box.y < other.y + other.height + MIN_VERTICAL_SPACE && other.y < box.y + box.height;
          if (!sideBySide && tooClose) {
            box.y = other.y + other.height + MIN_VERTICAL_SPACE;
            moved = true;
          }
        }
      }
      placed.push(box);
    });
};

const offsetOf = (properties: HclObject) => {
  const offset = objectOf(properties.offset);
  return {
    x: typeof offset.x === 'number' ? offset.x : 0,
    y: typeof offset.y === 'number' ? offset.y : 0,
  };
};

// A public https address, if that's what the setting resolved to
const sourceUrlOf = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.includes('.') && !/[\s${}]/.test(url) ? url : undefined;
  } catch {
    return undefined;
  }
};
const fileNameOf = (url: string) => decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');

/**
 * Reads a helpline's config and templates from twilio-iac/helplines (a checkout, or the Lambda's
 * copy of master) and builds its boards (one per Studio flow), the report and the recordings to copy.
 */
/**
 * The other helplines whose config uses a template (templates/studio-flows/... is shared): any of
 * their .hcl files names it. The baseline (a model for new helplines) doesn't count.
 */
const helplinesUsing = async (helplinesDir: string, code: string) => {
  const texts = new Map<string, string>();
  const folders = await fs.readdir(helplinesDir, { withFileTypes: true });
  for (const folder of folders) {
    if (!folder.isDirectory() || !/^[a-z0-9]+$/.test(folder.name) || ['baseline', code].includes(folder.name)) continue;
    const files = await fs.readdir(path.join(helplinesDir, folder.name)).catch(() => [] as string[]);
    const hcl = await Promise.all(
      files
        .filter((file) => file.endsWith('.hcl'))
        .map((file) => fs.readFile(path.join(helplinesDir, folder.name, file), 'utf8').catch(() => '')),
    );
    texts.set(folder.name, hcl.join('\n'));
  }
  return (templatefile: string) =>
    [...texts.entries()]
      .filter(([, text]) => text.includes(templatefile))
      .map(([helpline]) => helpline)
      .sort();
};

export const importHelpline = async (helplinesDir: string, code: string): Promise<HelplineImport> => {
  const notes: string[] = [];
  // Recordings whose address isn't a URL (yet), by flow and address
  const unresolvedRecordings = new Map<
    string,
    { title: string; written: string; resolved?: string; names: Set<string>; environments: Set<string> }
  >();
  const { configs, environments } = await readHelplineConfigs(helplinesDir, code);
  // Which other helplines use a shared template (templates/studio-flows/...)
  const usersOf = await helplinesUsing(helplinesDir, code);

  // The Studio flows: one per template, with each environment's variables
  const sources = new Map<string, FlowSource>();
  const addSource = (
    key: string,
    title: string,
    templatefile: string | undefined,
    environment: Environment,
    vars: Vars,
    channelName?: string,
    channel?: Channel,
  ) => {
    if (!templatefile) return;
    const source = sources.get(key) ?? {
      title,
      templatefile,
      channels: [],
      channelEnvironments: {},
      channel,
      vars: {},
      channelAttributes: {},
    };
    if (channelName && !source.channels.includes(channelName)) source.channels.push(channelName);
    if (channelName) {
      const environmentsOfChannel = source.channelEnvironments[channelName] ?? [];
      if (!environmentsOfChannel.includes(environment)) environmentsOfChannel.push(environment);
      source.channelEnvironments[channelName] = environmentsOfChannel;
    }
    source.vars[environment] ??= vars;
    sources.set(key, source);
  };
  // channel_attributes: the helpline's (it replaces the whole map), or defaults.hcl's
  const defaults = await readLocals(path.join(helplinesDir, 'defaults.hcl'));
  environments.forEach((environment) => {
    const config = configs[environment]!;
    const flowVars = objectOf(config.flow_vars);
    const attributesMap: HclObject = isObject(config.channel_attributes)
      ? (config.channel_attributes as HclObject)
      : objectOf(defaults?.channel_attributes);
    Object.entries(objectOf(config.channels)).forEach(([channelName, value]) => {
      const settings = objectOf(value);
      const templatefile = textOf(settings.templatefile);
      const channelType = textOf(settings.channel_type) ?? '';
      const { key, fallback } = channelAttributesKeys(channelName, settings.messaging_mode === 'conversations');
      const attributesFile = templatePathOf(textOf(attributesMap[key]) ?? textOf(attributesMap[fallback]) ?? '');
      addSource(
        `channel:${templatefile}`,
        path.basename(templatefile ?? channelName, '.tftpl'),
        templatefile,
        environment,
        { flow_vars: flowVars, channel_flow_vars: objectOf(settings.channel_flow_vars) },
        channelName,
        CHANNEL_TYPES[channelType],
      );
      const source = sources.get(`channel:${templatefile}`);
      // Production's, when both have the channel (production is read first)
      if (source && attributesFile) source.channelAttributes[channelName] ??= attributesFile;
    });
    if (config.enable_system_down === true) {
      addSource('systemDown', 'System down', textOf(config.system_down_templatefile), environment, {
        flow_vars: { ...flowVars, ...objectOf(config.system_down_flow_vars) },
        channel_flow_vars: {},
      });
    }
    Object.entries(objectOf(config.studio_flows)).forEach(([flowName, value]) => {
      const settings = objectOf(value);
      addSource(`studioFlow:${flowName}`, flowName, textOf(settings.templatefile), environment, {
        flow_vars: { ...flowVars, ...objectOf(settings.flow_vars) },
        channel_flow_vars: {},
      });
      const source = sources.get(`studioFlow:${flowName}`);
      if (source) {
        source.flowName = flowName;
        source.ownVars = { ...source.ownVars, [environment]: objectOf(settings.flow_vars) };
      }
    });
  });

  // Studio flows sharing a template (e.g. a post-call survey in English and Spanish) are one board:
  // the template drawn once, each flow a variant with its own flow_vars and recordings folder
  const byTemplate = new Map<string, FlowSource[]>();
  [...sources.entries()]
    .filter(([key]) => key.startsWith('studioFlow:'))
    .forEach(([, source]) =>
      byTemplate.set(source.templatefile, [...(byTemplate.get(source.templatefile) ?? []), source]),
    );
  byTemplate.forEach((shared, templatefile) => {
    if (shared.length < 2) return;
    const [first, ...others] = shared;
    others.forEach((other) => sources.delete(`studioFlow:${other.flowName}`));
    sources.set(`studioFlow:${first.flowName}`, {
      ...first,
      title: path.basename(templatefile, '.tftpl'),
      variants: shared,
    });
  });
  if (sources.size === 0) notes.push('No Studio flows found: no channels, system-down subflow or other Studio flows.');

  const boards: ImportedBoard[] = [];
  const recordings = new Map<string, ImportedRecording>();
  const reportFlows: ImportReport['flows'] = [];
  let legacyNames = 0;

  for (const [flowIndex, source] of [...sources.values()].entries()) {
    if (!source.templatefile.startsWith(CONTAINER_HELPLINES_DIR)) {
      notes.push(
        `${source.title}: its template ${source.templatefile} isn't under twilio-iac/helplines, so it wasn't read.`,
      );
      continue;
    }
    const templatePath = path.join(helplinesDir, source.templatefile.slice(CONTAINER_HELPLINES_DIR.length));
    let flow: HclValue;
    try {
      flow = parseTemplate(await fs.readFile(templatePath, 'utf8'));
    } catch (err) {
      notes.push(`${source.title}: couldn't read ${source.templatefile} (${(err as Error).message}).`);
      continue;
    }
    const flowStates = isObject(flow) ? (flow as HclObject).states : undefined;
    const states = Array.isArray(flowStates) ? flowStates.filter(isObject) : [];
    const idOf = new Map(
      states.map((state, index) => [textOf(state.name) ?? `#${index}`, `o-${flowIndex + 1}-${index + 1}`]),
    );
    const offsets = states.map((state) => offsetOf(objectOf(state.properties)));
    const minX = Math.min(...offsets.map((offset) => offset.x));
    const minY = Math.min(...offsets.map((offset) => offset.y));
    const flowRecordingFiles = new Set<string>();
    const primary = source.vars.production ?? source.vars.staging;

    // The channel-attributes templates its "Send to queue" widgets use
    const attributesTemplates = [...new Set(Object.values(source.channelAttributes))];
    const attributesTexts = new Map<string, string>();
    for (const template of attributesTemplates) {
      try {
        attributesTexts.set(
          template,
          (await fs.readFile(path.join(helplinesDir, template), 'utf8')).replace(/\r\n/g, '\n').trimEnd(),
        );
      } catch {
        notes.push(`${source.title}: couldn't read the task attributes template ${template}.`);
      }
    }
    const taskAttributesOf = (name: string, attributes: unknown): TaskAttributes | undefined => {
      if (typeof attributes === 'string' && !isChannelAttributesReference(attributes)) {
        return { json: attributes, source: { kind: 'inline' }, imported: attributes };
      }
      if (!isChannelAttributesReference(attributes)) return undefined;
      const [template, ...others] = attributesTemplates.filter((candidate) => attributesTexts.has(candidate));
      if (!template) {
        notes.push(
          `${source.title}: “${name}” uses ${CHANNEL_ATTRIBUTES_REFERENCE}, but no channel uses this flow, so its task attributes can't be told.`,
        );
        return undefined;
      }
      const channelsOf = (candidate: string) =>
        Object.keys(source.channelAttributes).filter((channel) => source.channelAttributes[channel] === candidate);
      const json = attributesTexts.get(template)!;
      return {
        json,
        source: { kind: 'channelAttributes', template, channels: channelsOf(template) },
        imported: json,
        ...(others.length > 0
          ? {
              otherChannels: others.map((other) => ({
                template: other,
                channels: channelsOf(other),
                json: attributesTexts.get(other)!,
              })),
            }
          : {}),
      };
    };

    const objects: FlowObject[] = states.map((state, index) => {
      const name = textOf(state.name) ?? `widget ${index + 1}`;
      const properties = objectOf(state.properties);
      let type = typeOf(state);
      if (!type) {
        notes.push(
          `${source.title}: “${name}” is a ${String(state.type)} widget, which the designer has no kind for; kept as “Other”.`,
        );
        type = 'other';
      }
      const info = OBJECT_TYPES[type];
      const transitions = Array.isArray(state.transitions) ? state.transitions.filter(isObject) : [];
      const named = transitions.map((transition, transitionIndex) => exitNameOf(transition, transitionIndex));
      // A trigger lists every event; only the ones this flow uses matter
      const exits = (type === 'incoming' ? named.filter((_, i) => transitions[i].next) : named).map((exit, i, all) =>
        all.indexOf(exit) === i ? exit : `${exit} (${i + 1})`,
      );
      const { offset, ...studioProperties } = properties;
      const object: FlowObject = {
        id: idOf.get(name)!,
        type,
        text: type === 'incoming' ? `Incoming ${source.channel ?? 'contact'}` : humanize(name),
        x: offsets[index].x - minX + FRAME_PADDING,
        y: Math.round((offsets[index].y - minY) * VERTICAL_SCALE) + FRAME_PADDING,
        ...info.defaultSize,
        ...(type !== 'incoming' ? { studioName: name } : {}),
        exits,
        studio: {
          name,
          type: String(state.type),
          properties: studioProperties as Record<string, unknown>,
          ...(isObject(offset) ? { offset: offsets[index] } : {}),
          transitions: transitions as Record<string, unknown>[],
        },
      };

      if (type !== 'incoming' && studioNameProblems(object).length > 0) legacyNames += 1;

      // Messages: the text, and for voice the recording
      if (info.hasMessage || type === 'incoming') {
        const raw = textOf(properties.say) ?? textOf(properties.body);
        const isVoice = ['say-play', 'gather-input-on-call'].includes(String(state.type));
        const channel = isVoice ? 'voice' : source.channel;
        const scripts = Object.fromEntries(
          ENVIRONMENTS.filter((environment) => source.vars[environment]).map((environment) => [
            environment,
            raw ? resolve(raw, source.vars[environment]) : undefined,
          ]),
        ) as Partial<Record<Environment, string>>;
        const script = scripts.production ?? scripts.staging;
        if (scripts.production && scripts.staging && scripts.production !== scripts.staging) {
          notes.push(
            `${source.title}: “${name}” has a different text in staging and production; the production one was used.`,
          );
        }
        if (script && /\$\{\s*(flow_vars|channel_flow_vars)\./.test(script)) {
          notes.push(`${source.title}: “${name}” uses a variable that isn't set: ${script.match(/\$\{[^}]*\}/)![0]}.`);
        }
        let recordingFile: string | undefined;
        const play = textOf(properties.play);
        // Each variant plays its own recordings (its flow_vars' address), copied into its own folder
        const playing = source.variants ?? [source];
        if (play) {
          playing.forEach((variant, variantIndex) => {
            const folder = source.variants ? variant.flowName : undefined;
            const flowTitle = folder ?? source.title;
            ENVIRONMENTS.forEach((environment) => {
              const vars = variant.vars[environment];
              if (!vars) return;
              const url = sourceUrlOf(resolve(play, vars));
              if (!url) {
                // One note per flow and address (e.g. a flow_vars URL still a placeholder), not per recording
                // The address without the file name, e.g. ${flow_vars.post_survey_assets_url}/
                const where = play.includes('/') ? play.replace(/[^/]*$/, '') : play;
                const key = `${flowTitle}|${where}`;
                const missing = unresolvedRecordings.get(key) ?? {
                  title: flowTitle,
                  written: where === play ? play : `${where}…`,
                  resolved: resolve(where, vars),
                  names: new Set<string>(),
                  environments: new Set<string>(),
                };
                missing.names.add(name);
                missing.environments.add(environment);
                unresolvedRecordings.set(key, missing);
                return;
              }
              const fileName = fileNameOf(url);
              if (!RECORDING_FILE_PATTERN.test(fileName)) {
                notes.push(
                  `${flowTitle}: “${name}” plays ${fileName}, which isn't an MP3 or WAV named with letters, numbers and underscores; not copied.`,
                );
                return;
              }
              const recording = { fileName, environment, sourceUrl: url, ...(folder ? { folder } : {}) };
              recordings.set(`${environment}/${importedRecordingKey(recording)}`, recording);
              flowRecordingFiles.add(importedRecordingKey(recording));
              if (variantIndex === 0) recordingFile = fileName;
            });
          });
          if (recordingFile && recordingFile.replace(/\.(mp3|wav)$/, '') !== name) {
            notes.push(
              `${source.title}: “${name}” plays ${recordingFile}, which isn't named after the widget; kept as it is.`,
            );
          }
        }
        object.message = {
          ...(channel ? { channel } : {}),
          ...(isVoice || info.hasMessage ? { language: languageOf(name, properties, primary) } : {}),
          ...(script ? { script } : {}),
          ...(recordingFile && recordingFile.replace(/\.(mp3|wav)$/, '') !== name ? { recordingFile } : {}),
        };
        if (!object.message.language) delete object.message.language;
        // So regenerating the flow only touches the text if it's changed on the board
        if (script !== undefined && object.studio) object.studio.importedScript = script;

        // The other variants' texts (from their flow_vars) and languages, where the message varies
        if (source.variants && variesByVariant(object)) {
          source.variants.slice(1).forEach((variant) => {
            const vars = variant.vars.production ?? variant.vars.staging;
            const variantScript = raw ? resolve(raw, vars) : undefined;
            const language = languageOf(name, properties, vars);
            object.variantMessages = {
              ...object.variantMessages,
              [variant.flowName!]: {
                ...(language ? { language } : {}),
                ...(variantScript ? { script: variantScript, importedScript: variantScript } : {}),
              },
            };
          });
        }
      }

      if (type === 'sendToQueue') {
        const taskAttributes = taskAttributesOf(name, properties.attributes);
        if (taskAttributes) object.taskAttributes = taskAttributes;
      }

      // Other HTTP requests: their method, address and body as written (variables kept)
      if (type === 'function') {
        if (state.type === 'make-http-request') {
          const settings = Object.fromEntries(
            (['method', 'url', 'body'] as const)
              .filter((key) => typeof properties[key] === 'string')
              .map((key) => [key, String(properties[key])]),
          );
          if (Object.keys(settings).length > 0) object.settings = settings;
        }
      } else if (info.fields) {
        // The route's settings, from the request body
        try {
          const body = JSON.parse(resolve(textOf(properties.body) ?? '{}', primary));
          const settings = Object.fromEntries(
            info.fields
              .filter((field) => typeof body[field.key] === 'string')
              .map((field) => [field.key, body[field.key]]),
          );
          if (Object.keys(settings).length > 0) object.settings = settings;
        } catch {
          // A body that isn't JSON: its settings stay in the widget's properties
        }
      }
      return object;
    });

    separate(objects);

    const byName = new Map(objects.map((object) => [object.studio!.name, object]));
    const connections: Connection[] = states.flatMap((state, index) => {
      const from = objects[index];
      const transitions = Array.isArray(state.transitions) ? state.transitions.filter(isObject) : [];
      return transitions.flatMap((transition, transitionIndex): Connection[] => {
        const next = textOf(transition.next);
        const to = next ? byName.get(next) : undefined;
        if (!next) return [];
        if (!to) {
          notes.push(`${source.title}: “${from.studio!.name}” leads to “${next}”, which isn't in the flow.`);
          return [];
        }
        const exit =
          from.exits?.[
            from.type === 'incoming' ? from.exits.indexOf(exitNameOf(transition, transitionIndex)) : transitionIndex
          ];
        const [fromSide, toSide] = sidesBetween(from, to);
        return [
          {
            id: `c-${from.id}-${transitionIndex + 1}`,
            from: from.id,
            to: to.id,
            ...(exit ? { exit } : {}),
            fromSide,
            toSide,
          },
        ];
      });
    });

    // [channels] · template, e.g. "[voice_courage_first] · voice-courage-first-op-hours-sd"
    const title = source.channels.length > 0 ? `[${source.channels.join(', ')}] · ${source.title}` : source.title;
    // A template shared by helplines: who else uses it (a change to it would change them too)
    const sharedWith = source.templatefile.startsWith(`${CONTAINER_HELPLINES_DIR}templates/`)
      ? usersOf(source.templatefile)
      : [];
    // One board per Studio flow: its objects sit on the board (no frame around them), and the board
    // says what flow it is
    const flowDetails: FlowDetails = {
      ...(source.channel ? { channel: source.channel } : {}),
      ...(source.variants
        ? {
            variants: source.variants.map((variant): FlowVariant => ({
              key: variant.flowName!,
              label: variantLabelOf(variant),
              recordingsFolder: variant.flowName!,
              flowVars: Object.fromEntries(
                Object.entries(variant.ownVars ?? {}).map(([environment, vars]) => [
                  environment,
                  Object.fromEntries(
                    Object.entries(vars ?? {}).filter(([, value]) => typeof value === 'string'),
                  ) as Record<string, string>,
                ]),
              ),
            })),
          }
        : {}),
      studio: {
        template: source.templatefile.slice(CONTAINER_HELPLINES_DIR.length),
        channels: source.channels,
        ...(sharedWith.length > 0 ? { sharedWith } : {}),
        settings: Object.fromEntries(Object.entries(flow as HclObject).filter(([key]) => key !== 'states')) as Record<
          string,
          unknown
        >,
      },
    };
    const boardTitle = `${code.toUpperCase()} · ${title}`;
    boards.push({
      title: boardTitle,
      content: { ...emptyBoard(boardTitle), flow: flowDetails, objects, connections, status: 'imported' },
      recordingFiles: [...flowRecordingFiles],
    });
    reportFlows.push({
      title,
      // The template's name, without its folder; the title is "[channels] · name" when it has channels
      name: source.title,
      template: source.templatefile.slice(CONTAINER_HELPLINES_DIR.length),
      channels: source.channels,
      widgets: objects.length,
      // Staging first, as it's read in the builder
      environments: (['staging', 'production'] as const).filter((environment) => source.vars[environment]),
      channelEnvironments: Object.fromEntries(
        Object.entries(source.channelEnvironments).map(([name, found]) => [
          name,
          (['staging', 'production'] as const).filter((environment) => found.includes(environment)),
        ]),
      ),
      ...(source.variants ? { variants: source.variants.map((variant) => variant.flowName!) } : {}),
    });
  }

  unresolvedRecordings.forEach(({ title, written, resolved: value, names, environments: where }) => {
    const shown = value && value !== written.replace(/…$/, '') ? ` (it's “${value}”)` : '';
    const what =
      names.size === 1
        ? '1 recording not copied, as its address'
        : `${names.size} recordings not copied, as their address`;
    notes.push(
      `${title}: ${what} isn't a URL yet in ${[...where].sort().reverse().join(' and ')}: ${written}${shown}. Upload them in the builder once recorded.`,
    );
  });

  if (legacyNames > 0) {
    notes.push(
      `${legacyNames} widget name${legacyNames === 1 ? " doesn't" : "s don't"} follow the Studio flow standards. They're kept as they are, since they're live; renaming one later means changing the widget, its recording and the template together.`,
    );
  }
  const singleEnvironment = ENVIRONMENTS.filter((environment) => !configs[environment]);
  if (singleEnvironment.length > 0)
    notes.push(`There's no ${singleEnvironment.join(' or ')}.hcl, so only ${environments.join(' and ')} was read.`);

  return {
    boards,
    report: {
      helpline: code,
      environments: [...environments],
      flows: reportFlows,
      notes: [...new Set(notes)],
    },
    recordings: [...recordings.values()],
  };
};
