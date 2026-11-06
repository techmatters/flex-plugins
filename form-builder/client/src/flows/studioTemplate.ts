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
 * Turns a board's frame into a Twilio Studio flow template (.tftpl) for twilio-iac, as
 * `${ jsonencode({...}) }` like the helplines' own templates:
 *
 * - widgets imported from a live flow are rebuilt from what the import kept (their settings,
 *   position and transitions), with "next" taken from the board's connections and the texts or
 *   settings changed on the board. An unchanged board gives back the template it came from;
 * - new objects become widgets of their kind; what the board can't know (a split's input, a
 *   workflow) is marked TODO, for whoever builds the flow (a person, or Claude with the
 *   studio-flow-from-board skill);
 * - texts that live in flow_vars stay there: the changes are listed, for the helpline's .hcl files;
 * - a "Send to queue" that uses the channel's task attributes says ${channel_attributes.default};
 *   one with attributes of its own (set or changed on the board) gets them written in the widget;
 * - messages (send-message, send-and-wait-for-reply) read their service and channel from
 *   trigger.conversation: new ones, and imported ones changed on the board (their legacy
 *   trigger.message is replaced). Imported ones nobody changed stay exactly as they are live;
 * - voice recordings play from the Aselo recordings bucket (${flow_vars.recordings_url}): new widgets,
 *   and imported ones renamed or playing a renamed recording. One with a script but no recording yet
 *   says its script (from flow_vars) until the recording is uploaded.
 */
import {
  type BoardContent,
  conditionExitName,
  defaultSplitInputOf,
  exitConditionOf,
  exitsOf,
  flowChannelOf,
  type FlowObject,
  followingSplitName,
  type Frame,
  OBJECT_TYPES,
  PROFILE_FIXED_EXITS,
  repeatWidgetNames,
  studioConditionName,
  type TaskAttributes,
  taskChannelOf,
  toSnake,
  widgetNamesOf,
  workerChannelOf,
} from '@tech-matters/form-builder-shared/flows/model';
import { janitorValuesOf, withJanitorValues } from '@tech-matters/form-builder-shared/flows/janitor';
import { splitMergedObjects } from '@tech-matters/form-builder-shared/flows/mergedWidgets';
import { defaultOperatingHoursRequest } from '@tech-matters/form-builder-shared/flows/operatingHoursRequest';
import {
  isRecordingsBucketUrl,
  isVoiceMessage,
  recordingOf,
  RECORDINGS_URL_VARIABLE,
  type RecordingsList,
  standardRecordingName,
  variantRecordingsUrls,
} from '@tech-matters/form-builder-shared/flows/recordings';
import {
  CHANNEL_ATTRIBUTES_REFERENCE,
  isChannelAttributesReference,
  taskAttributesSourceOf,
  usesChannelAttributes,
} from '@tech-matters/form-builder-shared/flows/taskAttributes';

// Who a message is from: as chosen on the board, otherwise the helpline's name

type StudioTransition = Record<string, unknown> & { event: string; next?: string };
type StudioState = {
  name: string;
  type: string;
  transitions: StudioTransition[];
  properties: Record<string, unknown>;
};
type StudioFlow = Record<string, unknown> & { states: StudioState[] };

// A text to set in the helpline's variables (staging.hcl / production.hcl): flow_vars, or the
// channel's channel_flow_vars
export type FlowVarChange = {
  scope: string;
  name: string;
  value: string;
  widget: string;
  // For flows sharing a template (variants): the studio_flows entry whose flow_vars it goes in
  flow?: string;
  // Typed into a widget and different in each environment (a SID, a service's address): value is
  // staging's; production's has to be asked for, unless both are known (values)
  environmentSpecific?: boolean;
  values?: RecordingsList['baseUrls'];
};

// A "Send to queue" widget's task attributes that are new or changed on the board, and where they're
// kept: a channel-attributes template (for its channels), or the widget itself (already written)
export type TaskAttributesChange = {
  widget: string;
  change: 'new' | 'changed';
  json: string;
  source: TaskAttributes['source'];
};

type GeneratedStudioFlow = {
  frameId?: string;
  title: string;
  // The template it came from (under twilio-iac/helplines) and the channels using it, if imported
  template?: string;
  // A shared template's other helplines, and whether Aselo staff chose to change it for all of them
  sharedWith?: string[];
  changeShared?: boolean;
  channels: string[];
  flow: StudioFlow;
  // The .tftpl file's contents
  text: string;
  flowVars: FlowVarChange[];
  taskAttributes: TaskAttributesChange[];
  // What a person (or Claude) still has to fill in or decide
  todo: string[];
};

// A text that is only a variable: ${flow_vars.x}, ${channel_flow_vars.x}...
const VARIABLE = /^\$\{\s*([a-z_]*flow_vars)\.([A-Za-z0-9_]+)\s*\}$/;
const TODO = 'TODO';
// A Twilio SID (two capitals and 32 hex digits), and the address (scheme and host) of a service that
// differs between staging and production: its host names the environment, or it's a Twilio Function
const ENVIRONMENT_SID = /\b[A-Z]{2}[0-9a-f]{32}\b/g;
const ENVIRONMENT_URL = /https?:\/\/[A-Za-z0-9.-]*(?:staging|production|twil\.io)[A-Za-z0-9.-]*/g;
const ACCOUNT_SCOPED = '${lambda_twilio_account_scoped_url}';
// The language a say widget speaks a message's language in, when the flow has none of its own
const SAY_LANGUAGES: Record<string, string> = { en: 'en-US', es: 'es-MX', fr: 'fr-CA', pt: 'pt-BR', vi: 'vi-VN' };

// A Repeat's name, or one for it while it has none
const repeatNameOf = (object: FlowObject) => object.studioName ?? `repeat_todo_${toSnake(object.text) || object.id}`;

// What new flows start with (the baseline templates' settings)
const DEFAULT_SETTINGS = {
  description: '${flow_description}',
  initial_state: 'Trigger',
  flags: { allow_concurrent_calls: true },
};

const TRIGGER_EVENTS = [
  'incomingMessage',
  'incomingCall',
  'incomingConversationMessage',
  'incomingRequest',
  'incomingParent',
];

const httpRequest = (url: string, body: string) => ({
  method: 'POST',
  content_type: 'application/json;charset=utf-8',
  add_twilio_auth: false,
  body,
  url,
});

// The bodies the helplines send (see lambdas/account-scoped/STUDIO_ROUTES.md)
const profileFlagsBody = (channel?: string) =>
  channel === 'voice'
    ? '{ "trigger": {{trigger | to_json}}, "channelType": "voice"}'
    : '{ "trigger": {{trigger | to_json}}, "channelType": "{% if trigger.conversation.ChannelAttributes.channel_type %}{{trigger.conversation.ChannelAttributes.channel_type}}{% else %}{{trigger.conversation.Source | downcase}}{% endif %}"}';

const operatingHoursBody = (channel: string | undefined, todo: string[], name: string) => {
  todo.push(
    `${name}: check its channel is in the helpline's operating info, and its language (the closed message's) and office.`,
  );
  return JSON.stringify(defaultOperatingHoursRequest(channel ?? TODO));
};

const notifyErrorBody = (text: string) => {
  // What the object on the board says, e.g. "Failed to close conversation" (fit for a JSON string)
  const what = text
    .replace(/[[\]"\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `{ "text": "Issue detected ${
    what ? `[${what}] ` : ''
  }on \${short_helpline} \${short_environment} Flow SID: {{flow.flow_sid}} Execution SID: {{flow.sid}}  " }`;
};

const condition = (input: string, type: string, value: string, friendlyName: string) => ({
  friendly_name: friendlyName,
  arguments: [input],
  type,
  value,
});

// Where a ${...} (or %{...}) starting at `start` ends, braces and quoted strings inside included
const interpolationEnd = (text: string, start: number) => {
  let depth = 0;
  let inString = false;
  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (char === '\\') index += 1;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }
  return text.length;
};

// Where messages read their Conversations service and channel from; the legacy trigger.message
// ones (still in many live flows) are replaced when the widget changes
const MESSAGE_SERVICE = '{{trigger.conversation.InstanceSid}}';
const MESSAGE_CHANNEL = '{{trigger.conversation.ChannelSid}}';
const LEGACY_MESSAGE_SOURCE: Record<string, string> = {
  service: '{{trigger.message.InstanceSid}}',
  channel: '{{trigger.message.ChannelSid}}',
};
const MESSAGE_WIDGET_TYPES = new Set(['send-message', 'send-and-wait-for-reply']);

// The Studio widget types each kind is built as (as the import reads them: server/src/flowImport.ts)
const REQUEST_TYPES = ['make-http-request', 'run-function'];
const STUDIO_TYPES: Partial<Record<FlowObject['type'], string[]>> = {
  incoming: ['trigger'],
  decision: ['split-based-on'],
  checkCountry: ['split-based-on'],
  playMessage: ['say-play'],
  sendMessage: ['send-message'],
  questionMessaging: ['send-and-wait-for-reply'],
  menuVoice: ['gather-input-on-call'],
  recordVoicemail: ['record-voicemail'],
  sendToQueue: ['send-to-flex'],
  setVariable: ['set-variables'],
  systemDown: ['run-subflow'],
  subflow: ['run-subflow'],
  forwardCall: ['connect-call-to'],
  sendMessageAndClose: REQUEST_TYPES,
  function: REQUEST_TYPES,
  notifyError: REQUEST_TYPES,
  checkOperatingHours: REQUEST_TYPES,
  checkClientProfile: REQUEST_TYPES,
  checkQueueAvailability: REQUEST_TYPES,
  checkWorkerLoggedIn: REQUEST_TYPES,
  chatbot: REQUEST_TYPES,
  chatbotCleanup: REQUEST_TYPES,
  setFlowMemory: REQUEST_TYPES,
};
// Whether an imported widget is still of the board object's kind (kinds not listed: always)
const isStudioTypeOf = (type: FlowObject['type'], studioType: string) =>
  STUDIO_TYPES[type]?.includes(studioType) ?? true;

// The same JSON, whatever the order of its keys
const canonical = (value: unknown): unknown =>
  // eslint-disable-next-line no-nested-ternary
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === 'object'
    ? Object.fromEntries(
        Object.entries(value)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, canonical(item)]),
      )
    : value;
const sameJson = (a: unknown, b: unknown) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

// A message widget's properties with the legacy service and channel replaced
const withConversationSource = (type: string, properties: Record<string, unknown>) => {
  if (!MESSAGE_WIDGET_TYPES.has(type)) return properties;
  return {
    ...properties,
    ...(properties.service === LEGACY_MESSAGE_SOURCE.service ? { service: MESSAGE_SERVICE } : {}),
    ...(properties.channel === LEGACY_MESSAGE_SOURCE.channel ? { channel: MESSAGE_CHANNEL } : {}),
  };
};

// A quoted HCL string: text escaped, interpolations (${...}) kept exactly as written
export const hclString = (text: string) => {
  let result = '"';
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    if ((char === '$' || char === '%') && text[index + 1] === '{') {
      const end = interpolationEnd(text, index);
      result += text.slice(index, end);
      index = end;
    } else {
      const escapes: Record<string, string> = { '"': '\\"', '\\': '\\\\', '\n': '\\n', '\r': '\\r', '\t': '\\t' };
      result += escapes[char] ?? char;
      index += 1;
    }
  }
  return `${result}"`;
};

const isExpression = (value: object) => Object.keys(value).length === 1 && 'expression' in value;

// The flow as HCL, laid out like JSON (as the helplines' templates are written)
export const toHcl = (value: unknown, indent = ''): string => {
  if (typeof value === 'string') return hclString(value);
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  // An expression the template had unquoted, kept as it was
  if (!Array.isArray(value) && isExpression(value)) return String((value as { expression: string }).expression);
  const inner = `${indent}  `;
  if (Array.isArray(value)) {
    return value.length === 0 ? '[]' : `[\n${value.map(item => inner + toHcl(item, inner)).join(',\n')}\n${indent}]`;
  }
  const entries = Object.entries(value).filter(([, item]) => item !== undefined);
  if (entries.length === 0) return '{}';
  return `{\n${entries
    .map(([key, item]) => `${inner}${JSON.stringify(key)}: ${toHcl(item, inner)}`)
    .join(',\n')}\n${indent}}`;
};

const toTemplateText = (flow: StudioFlow) => `\${\n  jsonencode(${toHcl(flow, '  ')})\n}\n`;

/**
 * The Studio flow for one frame of a board (or for the objects outside frames, without frameId).
 */
export const toStudioFlow = (
  board: BoardContent,
  frame?: Frame,
  recordings?: RecordingsList,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): GeneratedStudioFlow => {
  // Objects imported with their split (a check, a Repeat) are their two widgets again
  const { content, todo: mergedTodo } = splitMergedObjects(board);
  const objects = content.objects.filter(object => object.frameId === frame?.id);
  // What the flow is: the frame's, or the board's own (an imported board's Studio flow)
  const details = frame ?? content.flow;
  // Studio flows sharing the template: the template is one; each has its own flow_vars
  const variants = frame ? [] : content.flow?.variants ?? [];
  const mainVariant = variants.length > 1 ? variants[0].key : undefined;
  const ids = new Set(objects.map(object => object.id));
  const connections = content.connections.filter(connection => ids.has(connection.from) && ids.has(connection.to));
  const byId = new Map(objects.map(object => [object.id, object]));
  const todo: string[] = [...mergedTodo];
  const flowVars: FlowVarChange[] = [];
  const taskAttributes: TaskAttributesChange[] = [];
  const label = (object: FlowObject) => `“${object.studioName ?? object.text}”`;

  // Who a message is from: the board's From, always set (checks.ts: an error when it isn't)
  const fromOf = (object: FlowObject) => object.settings?.from ?? '';

  // Task attributes that are new or changed: the channel's template as it is (the widget says
  // ${channel_attributes.default}), or the widget's own, written in it
  const listTaskAttributes = (object: FlowObject, name: string, change: TaskAttributesChange['change']) => {
    const attributes = object.taskAttributes!;
    const source = taskAttributesSourceOf(attributes);
    taskAttributes.push({ widget: name, change, json: attributes.json, source });
    if (source.kind === 'inline') {
      if (source.movedFrom) {
        todo.push(
          `${label(object)} has task attributes of its own, written in the widget; ${
            source.movedFrom.template
          } stays as it is.`,
        );
      }
      return;
    }
    const { template, channels } = source;
    todo.push(
      `${label(object)} uses the channel's task attributes: check that the flow's channels${
        channels.length > 0 ? ` (${channels.join(', ')})` : ''
      } get ${template} (channel_attributes in common.hcl, or defaults.hcl).`,
    );
  };

  // The recordings folder variable this flow's voice widgets already use, for new ones
  const recordingsVariable = objects
    .map(
      object => String(object.studio?.properties?.play ?? '').match(/^\$\{\s*flow_vars\.([A-Za-z0-9_]+)\s*\}\//)?.[1],
    )
    .find(Boolean);

  // Where recordings play from: the recordings bucket, through the flow's own variable when it
  // already points there (as a flow's flow_vars say), otherwise recordings_url, listed for the .hcl
  // files the first time a widget uses it
  const bucketUrls = recordings?.baseUrls;
  const bucketVariable =
    recordingsVariable &&
    variants.some(variant =>
      Object.values(variant.flowVars ?? {}).some(vars => isRecordingsBucketUrl(vars?.[recordingsVariable], bucketUrls)),
    )
      ? recordingsVariable
      : RECORDINGS_URL_VARIABLE;
  let bucketListed = bucketVariable !== RECORDINGS_URL_VARIABLE;
  const fromBucket = (widget: string, file: string) => {
    if (!bucketListed) {
      bucketListed = true;
      if (bucketUrls) {
        const folders = variants.length > 0 ? variants : [undefined];
        folders.forEach(variant => {
          const values = variant ? variantRecordingsUrls(bucketUrls, variants, variant.recordingsFolder) : bucketUrls;
          flowVars.push({
            scope: 'flow_vars',
            name: bucketVariable,
            value: values.staging,
            widget,
            ...(variant && mainVariant ? { flow: variant.key } : {}),
            environmentSpecific: true,
            values,
          });
        });
      } else {
        todo.push(
          `Set flow_vars.${bucketVariable} to the helpline's folder in the Aselo recordings bucket (https://recordings.tl.techmatters.org/<helpline>/<environment>).`,
        );
      }
    }
    return `\${flow_vars.${bucketVariable}}/${file}`;
  };

  // Whether a voice message's recording has been uploaded. Without the helpline's recordings to
  // look in: imported ones play theirs, new ones have one when the flow plays recordings
  const hasRecording = (object: FlowObject) => {
    if (!recordings) return Boolean(object.studio || recordingsVariable);
    const recording = recordingOf(object, recordings.recordings);
    return Boolean(recording?.staging || recording?.production);
  };
  // The language (and voice) a say widget speaks in: those of the flow's say widgets in that
  // language, otherwise the usual one for it
  const sayVoiceOf = (language?: string) => {
    const code = (language ?? 'en').split(/[-_]/)[0].toLowerCase();
    const like = objects
      .map(object => object.studio?.properties)
      .find(
        properties =>
          typeof properties?.say === 'string' &&
          typeof properties.language === 'string' &&
          !properties.language.includes('${') &&
          properties.language.toLowerCase().startsWith(code),
      );
    return {
      language: String(like?.language ?? SAY_LANGUAGES[code] ?? language ?? 'en-US'),
      ...(typeof like?.voice === 'string' ? { voice: like.voice } : {}),
    };
  };
  // Its text in flow_vars: for flows sharing the template, each flow's own (its studio_flows entry's)
  const pushText = (object: FlowObject, widget: string, variable: string) => {
    const message = object.message?.script ?? '';
    flowVars.push({
      scope: 'flow_vars',
      name: variable,
      value: message,
      widget,
      ...(mainVariant ? { flow: mainVariant } : {}),
    });
    if (!mainVariant) return;
    variants.slice(1).forEach(({ key, label: language }) => {
      const own = object.variantMessages?.[key]?.script;
      if (!own) todo.push(`${label(object)} has no ${language} text yet: ${key} gets the ${variants[0].label} one.`);
      flowVars.push({ scope: 'flow_vars', name: variable, value: own || message, widget, flow: key });
    });
  };
  // A voice message with a script and no recording yet: it says the script until it's uploaded
  const saysScript = (object: FlowObject, widget: string) => {
    pushText(object, widget, widget);
    todo.push(
      `${label(
        object,
      )} says its script (\${flow_vars.${widget}}) until its recording is uploaded: export the board again then, and it plays the recording.`,
    );
    // Its language: the message's, otherwise the one in its name (play_message_voice_es_...)
    const named = widget.match(/(?:^|_)(en|es|fr|pt|vi)_/)?.[1];
    return { say: `\${flow_vars.${widget}}`, ...sayVoiceOf(object.message?.language ?? named) };
  };

  // What callers hear while waiting in the queue (Send to queue's waitUrl): Twilio's music (nothing
  // set), the helpline's recording (named after the widget, played from the recordings folder) or an
  // address. Imported widgets with an address have it as their setting, so nothing set leaves theirs
  const waitSettingsOf = (object: FlowObject, name: string): Record<string, string> => {
    const { waitMusic, waitUrl, waitUrlMethod } = object.settings ?? {};
    if (waitMusic === 'recording') return { waitUrl: fromBucket(name, `${name}.mp3`), waitUrlMethod: 'GET' };
    if (waitMusic === 'address') return { waitUrl: waitUrl || TODO, ...(waitUrlMethod ? { waitUrlMethod } : {}) };
    return {};
  };

  // Each object's widget name; kinds that aren't widgets have none
  const NOT_WIDGETS = new Set<FlowObject['type']>(['end', 'text', 'goToFrame', 'preSurvey']);
  const nameOf = (object: FlowObject): string | undefined => {
    if (object.studio) return object.studioName ?? object.studio.name;
    if (object.type === 'incoming') return 'Trigger';
    if (NOT_WIDGETS.has(object.type)) return undefined;
    // A Repeat is reached through its counter (set_var_<name>_counter)
    if (object.type === 'repeat') return widgetNamesOf(object, repeatNameOf(object))[0];
    return object.studioName ?? `todo_${toSnake(object.text) || object.id}`;
  };
  // Design objects that stand for something built some other way
  const BUILT_ELSEWHERE: Partial<Record<FlowObject['type'], string>> = {
    preSurvey: 'a pre-survey: build it with the chatbot or webchat form',
  };
  // Where a way out leads: the widget it's connected to (End, or nothing, ends the flow)
  const nextOf = (object: FlowObject, exit: string) => {
    const connection = connections.find(candidate => candidate.from === object.id && (candidate.exit ?? '') === exit);
    const target = connection && byId.get(connection.to);
    if (!target || target.type === 'end') return undefined;
    const name = nameOf(target);
    if (!name)
      todo.push(
        `${label(object)} leads to ${label(target)} (${
          OBJECT_TYPES[target.type].label
        }), which isn't a Studio widget: connect it to one.`,
      );
    return name;
  };
  const withNext = (transition: Record<string, unknown>, next?: string): StudioTransition =>
    ({ ...transition, ...(next ? { next } : {}) } as StudioTransition);
  const offsetOf = (object: FlowObject) =>
    object.studio?.offset ?? { x: Math.round(object.x), y: Math.round(object.y * 2) };

  // A message's text changed on the board: in its variable when the widget reads one, otherwise in
  // the template
  const setText = (object: FlowObject, properties: Record<string, unknown>, field: 'say' | 'body', name: string) => {
    const script = object.message?.script;
    if (script === undefined || script === object.studio?.importedScript) return;
    const current = properties[field];
    const variable = typeof current === 'string' ? current.match(VARIABLE) : undefined;
    if (variable) {
      flowVars.push({
        scope: variable[1],
        name: variable[2],
        value: script,
        widget: name,
        ...(mainVariant ? { flow: mainVariant } : {}),
      });
    } else {
      if (typeof current === 'string' && current.includes('${')) {
        todo.push(`${label(object)}: its text was ${current}; the board's text replaces it, variables and all.`);
      }
      properties[field] = script;
    }
  };

  // eslint-disable-next-line complexity
  const widgetsOf = (object: FlowObject): StudioState[] => {
    const name = nameOf(object);
    if (!name) {
      const how = BUILT_ELSEWHERE[object.type];
      if (how) todo.push(`${label(object)} is ${how}.`);
      return [];
    }
    const offset = offsetOf(object);

    // Imported, but made another kind on the board (e.g. a Send Message made "Send message and close"):
    // built as a new widget of its kind
    const kindChanged = Boolean(object.studio && !isStudioTypeOf(object.type, object.studio.type));
    if (object.studio && kindChanged) {
      const variable = String(object.studio.properties?.body ?? object.studio.properties?.say ?? '').match(VARIABLE);
      todo.push(
        `${label(object)} was ${object.studio.name} (${object.studio.type}) in Studio and is a ${
          OBJECT_TYPES[object.type].label
        } now: built as a new one${
          variable
            ? `; \${${variable[1]}.${variable[2]}} isn't read by it any more (remove it from the .hcl files if nothing else uses it)`
            : ''
        }.`,
      );
    }

    // Imported: rebuilt as it was, with the board's connections and changes
    if (object.studio && !kindChanged) {
      const { studio } = object;
      const properties: Record<string, unknown> = { ...studio.properties, offset };
      // Its transitions as live (a split whose input changed reads the new one in its conditions)
      let liveTransitions = studio.transitions;
      if (object.studioName && object.studioName !== studio.name) {
        todo.push(
          `${label(object)} was ${
            studio.name
          } in Studio: renaming a live widget also means its recording file and any monitoring that uses the name.`,
        );
      }
      const attributes = object.taskAttributes;
      // Attributes of its own (changed, or no longer the channel's): written in the widget
      const own = attributes !== undefined && !usesChannelAttributes(attributes);
      if (
        attributes?.imported !== undefined &&
        (attributes.json !== attributes.imported || (own && isChannelAttributesReference(properties.attributes)))
      ) {
        if (own) properties.attributes = attributes.json;
        listTaskAttributes(object, name, 'changed');
      }
      if ('say' in properties) setText(object, properties, 'say', name);
      // (Send message and close keeps its message among its request's values: below)
      else if ('body' in properties && OBJECT_TYPES[object.type].hasMessage && object.type !== 'sendMessageAndClose')
        setText(object, properties, 'body', name);
      // Renamed, or its recording given its standard name (the widget's) on the board: it plays that
      // file from the recordings bucket now, or says its script while there's no recording yet
      if (typeof properties.play === 'string') {
        const played = properties.play.split('/').pop() ?? '';
        const kept = object.message?.recordingFile;
        const wanted =
          kept ?? (played.replace(/\.(mp3|wav)$/, '') === name ? played : standardRecordingName(name, played));
        if (/\.(mp3|wav)$/.test(played) && (wanted !== played || name !== studio.name)) {
          if (!hasRecording(object) && object.message?.script) {
            delete properties.play;
            Object.assign(properties, saysScript(object, name));
          } else properties.play = fromBucket(name, wanted);
        }
      }
      // The other variants' texts go in their own flow_vars (the template keeps the variable)
      const written = studio.properties?.say ?? studio.properties?.body;
      const shared = typeof written === 'string' ? written.match(VARIABLE) : undefined;
      if (shared && mainVariant) {
        variants.slice(1).forEach(({ key }) => {
          const own = object.variantMessages?.[key];
          if (own?.script === undefined || own.script === own.importedScript) return;
          flowVars.push({ scope: shared[1], name: shared[2], value: own.script, widget: name, flow: key });
        });
      }
      if (object.type === 'sendToQueue') {
        // Its workflow and task channel as chosen on the board
        const { workflow, taskChannel } = object.settings ?? {};
        if (workflow && properties.workflow !== `\${workflow_sids.${workflow}}`) {
          properties.workflow = `\${workflow_sids.${workflow}}`;
        }
        if (taskChannel && properties.channel !== `\${task_channel_sids.${taskChannel}}`) {
          properties.channel = `\${task_channel_sids.${taskChannel}}`;
        }
        // What's heard while waiting, and for how long, where changed on the board
        Object.entries(waitSettingsOf(object, name)).forEach(([key, value]) => {
          if (properties[key] !== value) properties[key] = value;
        });
        if (object.settings?.timeout && properties.timeout !== object.settings.timeout) {
          properties.timeout = object.settings.timeout;
        }
      } else if (
        (object.type === 'decision' || object.type === 'checkCountry') &&
        object.settings?.input !== undefined &&
        object.settings.input !== properties.input
      ) {
        // What it splits on, changed on the board: its conditions read the new one too
        const previous = properties.input;
        properties.input = object.settings.input;
        liveTransitions = studio.transitions?.map(transition =>
          Array.isArray(transition.conditions)
            ? {
                ...transition,
                conditions: transition.conditions.map((condition: Record<string, unknown>) =>
                  Array.isArray(condition.arguments)
                    ? {
                        ...condition,
                        arguments: condition.arguments.map(argument =>
                          argument === previous ? object.settings!.input : argument,
                        ),
                      }
                    : condition,
                ),
              }
            : transition,
        );
      } else if (object.type === 'questionMessaging' || object.type === 'sendMessage') {
        // How long it waits, and who it's from, where changed on the board
        if (object.settings?.timeout && String(properties.timeout) !== object.settings.timeout) {
          properties.timeout = object.settings.timeout;
        }
        if (object.settings?.from && properties.from !== object.settings.from) properties.from = object.settings.from;
      } else if (object.type === 'setFlowMemory' && object.variables && typeof properties.body === 'string') {
        // The values it keeps, where changed on the board
        try {
          const body = JSON.parse(properties.body);
          const values = Object.fromEntries(
            object.variables.filter(({ key }) => key).map(({ key, value }) => [key, value]),
          );
          if (JSON.stringify(body.flowMemory ?? {}) !== JSON.stringify(values)) {
            properties.body = JSON.stringify({ ...body, flowMemory: values }, null, 2);
          }
        } catch {
          todo.push(`${label(object)}: its request body isn't JSON; set its flowMemory by hand.`);
        }
      } else if (object.type === 'setVariable' && object.variables && Array.isArray(properties.variables)) {
        // What it sets, where changed on the board (each keeps its type as written)
        const live = properties.variables as { key?: string; value?: string; type?: string }[];
        const same =
          live.length === object.variables.length &&
          live.every((variable, index) => {
            const own = object.variables![index];
            return variable.key === own.key && variable.value === own.value;
          });
        if (!same) {
          properties.variables = object.variables.map(({ key, value }) => ({
            type: live.find(variable => variable.key === key)?.type ?? 'string',
            value,
            key,
          }));
        }
      } else if (object.type === 'sendMessageAndClose') {
        // Its message (in its variable when it reads one, otherwise written in the widget) and author
        const values = janitorValuesOf(properties);
        const changes: Record<string, string | undefined> = {};
        const script = object.message?.script;
        if (script !== undefined && script !== studio.importedScript) {
          const variable = values.message?.match(VARIABLE);
          if (variable) {
            flowVars.push({
              scope: variable[1],
              name: variable[2],
              value: script,
              widget: name,
              ...(mainVariant ? { flow: mainVariant } : {}),
            });
          } else changes.message = script;
        }
        if (object.settings?.from !== undefined && object.settings.from !== values.from) {
          changes.from = object.settings.from;
        }
        Object.assign(properties, withJanitorValues(properties, changes));
      } else if (['function', 'notifyError', 'checkOperatingHours', 'checkClientProfile'].includes(object.type)) {
        // The request as set on the board (method, address, body), where it differs from Studio's
        if (studio.type === 'make-http-request') {
          (['method', 'url', 'body'] as const).forEach(key => {
            const value = object.settings?.[key];
            if (value !== undefined && value !== properties[key]) properties[key] = value;
          });
        }
      } else if (object.settings && typeof properties.body === 'string') {
        try {
          const body = JSON.parse(properties.body);
          if (Object.entries(object.settings).some(([key, value]) => body[key] !== value)) {
            properties.body = JSON.stringify({ ...body, ...object.settings }, null, 2);
          }
        } catch {
          // A body that isn't JSON keeps its settings
        }
      }
      const exits = object.exits ?? [];
      // Boards imported before transitions were kept can't be rebuilt as they are live
      if (!studio.transitions) {
        todo.push('This board was imported before the import kept what Studio needs: import the helpline again.');
      }
      const original = liveTransitions ?? [];
      const transitions = original.map((transition, index) => {
        const { next, ...rest } = transition;
        const exit = studio.type === 'trigger' ? String(transition.event) : exits[index];
        // A split's way out renamed or given another operator on the board: its condition too
        const changed = exit === undefined ? undefined : exitConditionOf(object, exit);
        if (changed?.blockedContains) todo.push(`${label(object)}: blocked check now uses contains, was equal_to.`);
        if (changed?.changed && Array.isArray(rest.conditions) && rest.conditions.length === 1) {
          const [live] = rest.conditions as Record<string, unknown>[];
          const liveName = typeof live.friendly_name === 'string' ? live.friendly_name : undefined;
          const namedByValue = !liveName || conditionExitName(liveName, String(live.value ?? '')) === live.value;
          rest.conditions = [
            {
              ...live,
              friendly_name: namedByValue ? studioConditionName(changed.type, changed.value) : liveName,
              type: changed.type,
              value: changed.value,
            },
          ];
        }
        return withNext(rest, exit === undefined ? undefined : nextOf(object, exit));
      });
      // Ways out added on the board (e.g. a decision's new answer)
      const splitInput =
        studio.type === 'split-based-on' && typeof properties.input === 'string' ? properties.input : '';
      exits.slice(original.length).forEach(exit => {
        const added = exitConditionOf(object, exit);
        if (!splitInput || !added) {
          todo.push(`${label(object)} has a new way out “${exit}”: set the condition it stands for.`);
        }
        const type = added?.type ?? 'equal_to';
        transitions.push(
          withNext(
            {
              event: 'match',
              conditions: [condition(splitInput || TODO, type, added?.value ?? exit, studioConditionName(type, exit))],
            },
            nextOf(object, exit),
          ),
        );
      });
      // A message changed on the board (not just moved) reads trigger.conversation now
      const { offset: _liveOffset, ...live } = studio.properties ?? {};
      const { offset: _offset, ...rebuilt } = properties;
      const changed =
        name !== studio.name || !sameJson(rebuilt, live) || !sameJson(transitions, studio.transitions ?? []);
      return [
        {
          name,
          type: studio.type,
          transitions,
          properties: changed ? withConversationSource(studio.type, properties) : properties,
        },
      ];
    }

    // New: a widget of its kind
    const info = OBJECT_TYPES[object.type];
    const exits = exitsOf(object);
    const next = (exit = '') => nextOf(object, exit);
    const message = object.message?.script ?? '';
    const voice = isVoiceMessage(object, details);
    // The file uploaded (MP3 or WAV) when there is one, otherwise the MP3 it should be
    const voiceRecording =
      voice &&
      (recordingOf(object, recordings?.recordings)?.fileName ??
        object.message?.recordingFile ??
        `${object.studioName}.mp3`);
    // A voice message plays its recording from the recordings bucket, or says its script while it
    // has no recording (with neither, it plays the file it should have: the checks flag it)
    const spoken = (): Record<string, unknown> => {
      if (!voiceRecording || !object.studioName) return { say: message || TODO };
      if (!hasRecording(object) && message) return saysScript(object, name);
      return { play: fromBucket(name, voiceRecording) };
    };
    const fromFlowVars = () => {
      pushText(object, name, name);
      return `\${flow_vars.${name}}`;
    };
    // A split on a value, one match per way out (and "no match")
    const split = (
      splitName: string,
      input: string,
      matches: { exit: string; type: string; value: string }[],
      noMatch: string,
    ): StudioState => ({
      name: splitName,
      type: 'split-based-on',
      transitions: [
        withNext({ event: 'noMatch' }, next(noMatch)),
        ...matches.map(({ exit, type, value }) =>
          withNext({ event: 'match', conditions: [condition(input, type, value, exit)] }, next(exit)),
        ),
      ],
      properties: { input, offset: { x: offset.x, y: offset.y + 240 } },
    });
    // Its Split, e.g. f_isSkilledWorkerAvailable_tya_calls -> split_is_skilled_worker_available_tya_calls
    const splitName = followingSplitName(name);

    switch (object.type) {
      case 'incoming': {
        const event = object.message?.channel === 'voice' ? 'incomingCall' : 'incomingConversationMessage';
        return [
          {
            name,
            type: 'trigger',
            transitions: TRIGGER_EVENTS.map(candidate =>
              withNext({ event: candidate }, candidate === event ? next(exits[0] ?? '') : undefined),
            ),
            properties: { offset },
          },
        ];
      }
      case 'playMessage':
        return [
          {
            name,
            type: 'say-play',
            transitions: [withNext({ event: 'audioComplete' }, next())],
            properties: { ...spoken(), loop: 1, offset },
          },
        ];
      case 'sendMessage':
        return [
          {
            name,
            type: 'send-message',
            // A message that couldn't be sent goes on as if it had been
            transitions: [withNext({ event: 'sent' }, next()), withNext({ event: 'failed' }, next())],
            properties: {
              offset,
              service: MESSAGE_SERVICE,
              channel: MESSAGE_CHANNEL,
              from: fromOf(object),
              message_type: 'custom',
              to: '{{contact.channel.address}}',
              body: fromFlowVars(),
            },
          },
        ];
      case 'questionMessaging':
        return [
          {
            name,
            type: 'send-and-wait-for-reply',
            transitions: [
              withNext({ event: 'incomingMessage' }, next('reply')),
              withNext({ event: 'timeout' }, next('timeout')),
              // Not delivered: no reply will come, as on timeout
              withNext({ event: 'deliveryFailure' }, next('timeout')),
            ],
            properties: {
              offset,
              service: MESSAGE_SERVICE,
              channel: MESSAGE_CHANNEL,
              from: fromOf(object),
              message_type: 'custom',
              body: fromFlowVars(),
              // 5 minutes unless set on the board
              timeout: object.settings?.timeout || '300',
            },
          },
        ];
      case 'menuVoice': {
        // Boards made when a menu's options were its ways out (1, 2, noMatch) get a split for them
        const digits = exits.filter(exit => !['keypress', 'speech', 'noMatch', 'timeout'].includes(exit));
        const input = `{{widgets.${name}.Digits}}`;
        return [
          {
            name,
            type: 'gather-input-on-call',
            transitions: [
              digits.length > 0
                ? { event: 'keypress', next: splitName }
                : withNext({ event: 'keypress' }, next('keypress')),
              withNext({ event: 'speech' }, next('speech')),
              withNext({ event: 'timeout' }, next('timeout')),
            ],
            properties: {
              ...spoken(),
              number_of_digits: 1,
              speech_timeout: 'auto',
              offset,
              loop: 1,
              finish_on_key: '#',
              stop_gather: true,
              gather_language: object.message?.language ?? 'en',
              speech_model: 'numbers_and_commands',
              timeout: 10,
            },
          },
          ...(digits.length > 0
            ? [
                split(
                  splitName,
                  input,
                  digits.map(digit => ({ exit: digit, type: 'equal_to', value: digit })),
                  'noMatch',
                ),
              ]
            : []),
        ];
      }
      case 'repeat': {
        // The counter goes up each time round; past the maximum, the loop's way out
        const { counter } = repeatWidgetNames(repeatNameOf(object));
        const [, endName] = widgetNamesOf(object, repeatNameOf(object));
        const maxRepeats = object.settings?.maxRepeats?.trim() || '2';
        if (!object.settings?.maxRepeats) {
          todo.push(`${label(object)}: check how many times it repeats (${maxRepeats}).`);
        }
        const value = `flow.variables.${counter}`;
        return [
          {
            name,
            type: 'set-variables',
            transitions: [{ event: 'next', next: endName }],
            properties: {
              variables: [
                {
                  type: 'string',
                  value: `{% if ${value} %}{{${value} | plus: 1}}{% else %}1{% endif %}`,
                  key: counter,
                },
              ],
              offset,
            },
          },
          {
            name: endName,
            type: 'split-based-on',
            transitions: [
              withNext({ event: 'noMatch' }, next('repeat')),
              withNext(
                {
                  event: 'match',
                  conditions: [
                    condition(`{{${value}}}`, 'greater_than', maxRepeats, `If value greater_than ${maxRepeats}`),
                  ],
                },
                next('max reached'),
              ),
            ],
            properties: { input: `{{${value}}}`, offset: { x: offset.x, y: offset.y + 240 } },
          },
        ];
      }
      case 'chatbot': {
        const settings = object.settings ?? {};
        const missing = ['botSuffix', 'language', 'triggerType', 'message', 'releaseType'].filter(
          key => !settings[key],
        );
        if (missing.length > 0) {
          todo.push(
            `${label(object)}: set its ${missing.join(', ')} (STUDIO_ROUTES.md, channelCapture/captureChannelWithBot).`,
          );
        }
        const releaseType = settings.releaseType ?? 'triggerStudioFlow';
        const body = {
          channelSid: '{{flow.channel.address}}',
          isConversation: 'true',
          message: settings.message ?? TODO,
          ...(releaseType === 'triggerStudioFlow' ? { studioFlowSid: '{{flow.flow_sid}}' } : {}),
          language: settings.language ?? TODO,
          botSuffix: settings.botSuffix ?? TODO,
          triggerType: settings.triggerType ?? 'withUserMessage',
          releaseType,
          ...(settings.releaseFlag ? { releaseFlag: settings.releaseFlag } : {}),
          ...(settings.memoryAttribute ? { memoryAttribute: settings.memoryAttribute } : {}),
          channelType:
            '{% if trigger.conversation.ChannelAttributes.channel_type %}{{trigger.conversation.ChannelAttributes.channel_type | downcase}}{% else %}{{trigger.conversation.Source | downcase}}{% endif %}',
        };
        return [
          {
            name,
            type: 'make-http-request',
            transitions: [
              withNext({ event: 'success' }, next('success')),
              withNext({ event: 'failed' }, next('failed')),
            ],
            properties: {
              offset,
              ...httpRequest(`${ACCOUNT_SCOPED}/${info.studioRoute}`, JSON.stringify(body, null, 2)),
            },
          },
        ];
      }
      case 'decision':
      case 'checkCountry': {
        // What it splits on, as chosen on the board (or the answer of the widget before it); each way
        // out is a value it's equal to
        const input =
          object.settings?.input?.trim() || defaultSplitInputOf({ objects, connections }, object.id) || TODO;
        todo.push(
          input === TODO
            ? `${label(object)}: set what it splits on (its input) and its conditions.`
            : `${label(object)}: check its conditions (each way out is compared with ${input}).`,
        );
        return [
          {
            name,
            type: 'split-based-on',
            transitions: [
              withNext({ event: 'noMatch' }, next('noMatch')),
              ...exits
                .filter(exit => exit !== 'noMatch')
                .map(exit => {
                  // Equal to it, or any of a list ("Si,si,ok"), or the operator chosen on the board
                  const type = exitConditionOf(object, exit, input)?.type ?? 'equal_to';
                  return withNext(
                    { event: 'match', conditions: [condition(input, type, exit, studioConditionName(type, exit))] },
                    next(exit),
                  );
                }),
            ],
            properties: { input, offset },
          },
        ];
      }
      case 'chatbotCleanup':
        // Only the conversation: the rest is in what the bot's capture kept on it
        return [
          {
            name,
            type: 'make-http-request',
            transitions: [
              withNext({ event: 'success' }, next('success')),
              withNext({ event: 'failed' }, next('failed')),
            ],
            properties: {
              offset,
              ...httpRequest(
                `${ACCOUNT_SCOPED}/${OBJECT_TYPES.chatbotCleanup.studioRoute}`,
                JSON.stringify({ channelSid: '{{flow.channel.address}}' }, null, 2),
              ),
            },
          },
        ];
      case 'setFlowMemory': {
        const values = Object.fromEntries(
          (object.variables ?? []).filter(({ key }) => key).map(({ key, value }) => [key, value]),
        );
        if (Object.keys(values).length === 0) todo.push(`${label(object)}: set the values it keeps.`);
        return [
          {
            name,
            type: 'make-http-request',
            transitions: [
              withNext({ event: 'success' }, next('success')),
              withNext({ event: 'failed' }, next('failed')),
            ],
            properties: {
              offset,
              ...httpRequest(
                `${ACCOUNT_SCOPED}/${OBJECT_TYPES.setFlowMemory.studioRoute}`,
                JSON.stringify({ conversationSid: '{{flow.channel.address}}', flowMemory: values }, null, 2),
              ),
            },
          },
        ];
      }
      case 'checkQueueAvailability':
      case 'checkWorkerLoggedIn': {
        const result =
          object.type === 'checkQueueAvailability' ? ['available', 'not available'] : ['logged in', 'not logged in'];
        // Its settings; an availability check's channel follows the flow's when not chosen (the route needs one)
        const settings: Record<string, string> = { ...object.settings };
        if (object.type === 'checkQueueAvailability') {
          const targetChannel = workerChannelOf(object, flowChannelOf(details));
          if (!targetChannel) todo.push(`${label(object)}: set its channel (voice or chat).`);
          settings.targetChannel = targetChannel ?? TODO;
        }
        // What each route answers (STUDIO_ROUTES.md): how many could take it now, or are logged in
        const field = object.type === 'checkQueueAvailability' ? 'totalAvailableWorkers' : 'totalLoggedInWorkers';
        const input = `{{widgets.${name}.parsed.${field}}}`;
        return [
          {
            name,
            type: 'make-http-request',
            transitions: [{ event: 'success', next: splitName }, withNext({ event: 'failed' }, next('failed'))],
            properties: {
              offset,
              ...httpRequest(`${ACCOUNT_SCOPED}/${info.studioRoute}`, JSON.stringify(settings, null, 2)),
            },
          },
          split(splitName, input, [{ exit: result[0], type: 'greater_than', value: '0' }], result[1]),
        ];
      }
      case 'checkOperatingHours':
      case 'checkClientProfile': {
        const route = info.studioRoute!;
        const channel = details?.channel;
        const body =
          object.settings?.body?.trim() ||
          (object.type === 'checkClientProfile'
            ? profileFlagsBody(channel)
            : operatingHoursBody(channel, todo, label(object)));
        const results = exits.filter(exit => exit !== 'failed');
        // As the helplines' are: each flag the profile's flags include, in order (blocked, then e.g.
        // NZ's "case management"), otherwise not blocked; open, closed or holiday
        const profile = object.type === 'checkClientProfile';
        const matches = profile
          ? results
              .filter(exit => exit && !PROFILE_FIXED_EXITS.includes(exit))
              .map(exit => ({ exit, type: 'contains', value: exit }))
          : results.slice(0, -1).map(exit => ({ exit, type: 'equal_to', value: exit }));
        return [
          {
            name,
            type: 'make-http-request',
            transitions: [{ event: 'success', next: splitName }, withNext({ event: 'failed' }, next('failed'))],
            properties: { offset, ...httpRequest(`${ACCOUNT_SCOPED}/${route}`, body) },
          },
          split(
            splitName,
            `{{widgets.${name}.parsed.${object.type === 'checkClientProfile' ? 'flags' : 'status'}}}`,
            matches,
            profile ? 'not blocked' : results[results.length - 1],
          ),
        ];
      }
      case 'sendMessageAndClose': {
        // Its message from flow_vars, named as the helplines' are (send_message_<what>)
        const variable = `send_message_${name.replace(/^(postqueue_)?f_sendMessageAndRunJanitor_?/, '') || 'janitor'}`;
        pushText(object, name, variable);
        return [
          {
            name,
            type: 'make-http-request',
            transitions: [
              withNext({ event: 'success' }, next('success')),
              withNext({ event: 'failed' }, next('failed')),
            ],
            // As the helplines' are: form parameters with the flow's conversation, its message and who it's from
            properties: {
              offset,
              method: 'POST',
              content_type: 'application/x-www-form-urlencoded;charset=utf-8',
              add_twilio_auth: false,
              parameters: [
                { value: '{{flow.channel.address}}', key: 'conversationSid' },
                { value: `\${flow_vars.${variable}}`, key: 'message' },
                { value: fromOf(object), key: 'from' },
              ],
              url: `${ACCOUNT_SCOPED}/${info.studioRoute}`,
            },
          },
        ];
      }
      case 'function':
      case 'notifyError': {
        const url = object.type === 'function' ? object.settings?.url?.trim() : undefined;
        // The team's alert: the helplines' text, labelled with what went wrong
        const body =
          object.settings?.body?.trim() ||
          (object.type === 'notifyError' ? notifyErrorBody(object.text === info.label ? '' : object.text) : undefined);
        if (object.type === 'function' && (!url || !body)) {
          todo.push(`${label(object)}: set the address it calls and its request body.`);
        }
        return [
          {
            name,
            type: 'make-http-request',
            transitions: [
              withNext({ event: 'success' }, next(exits.includes('success') ? 'success' : '')),
              withNext({ event: 'failed' }, next('failed')),
            ],
            properties: {
              offset,
              ...httpRequest(
                object.type === 'notifyError' ? '${webhook_url_studio_errors}' : url ?? TODO,
                body ?? TODO,
              ),
              ...(object.settings?.method ? { method: object.settings.method } : {}),
            },
          },
        ];
      }
      case 'sendToQueue': {
        const { queue, workflow } = object.settings ?? {};
        const taskChannel = taskChannelOf(object, flowChannelOf(details));
        if (!workflow || !taskChannel) todo.push(`${label(object)}: set its workflow and task channel.`);
        if (queue) {
          todo.push(
            `${label(object)} should end up in the ${queue} queue: check that the ${
              workflow ?? 'chosen'
            } workflow's rules send it there (with its task attributes).`,
          );
        }
        const attributes = object.taskAttributes;
        const attributesJson =
          attributes && usesChannelAttributes(attributes) ? CHANNEL_ATTRIBUTES_REFERENCE : attributes?.json;
        if (attributes) listTaskAttributes(object, name, 'new');
        else todo.push(`${label(object)}: set its task attributes.`);
        return [
          {
            name,
            type: 'send-to-flex',
            transitions: [
              withNext({ event: 'callComplete' }, next('callComplete')),
              withNext({ event: 'failedToEnqueue' }, next('failedToEnqueue')),
              withNext({ event: 'callFailure' }, next('callFailure')),
            ],
            properties: {
              offset,
              workflow: workflow ? `\${workflow_sids.${workflow}}` : TODO,
              channel: taskChannel ? `\${task_channel_sids.${taskChannel}}` : TODO,
              ...waitSettingsOf(object, name),
              timeout: object.settings?.timeout || '3600',
              attributes: attributes ? attributesJson : TODO,
            },
          },
        ];
      }
      case 'recordVoicemail':
        return [
          {
            name,
            type: 'record-voicemail',
            transitions: [withNext({ event: 'recordingComplete' }, next()), { event: 'noAudio' }, { event: 'hangup' }],
            properties: {
              transcribe: false,
              offset,
              trim: 'trim-silence',
              play_beep: 'true',
              finish_on_key: '#',
              timeout: 5,
              max_length: 3600,
            },
          },
        ];
      case 'setVariable':
        if (!object.variables?.length) todo.push(`${label(object)}: set its variables.`);
        return [
          {
            name,
            type: 'set-variables',
            transitions: [withNext({ event: 'next' }, next())],
            properties: {
              variables: (object.variables ?? []).map(({ key, value }) => ({ type: 'string', value, key })),
              offset,
            },
          },
        ];
      case 'systemDown':
      case 'subflow': {
        // eslint-disable-next-line callback-return -- next() finds the widget a way out leads to: not a callback
        const after = next(exits[0] ?? '');
        if (object.type === 'subflow') todo.push(`${label(object)}: set the subflow it runs.`);
        return [
          {
            name,
            type: 'run-subflow',
            transitions: [
              withNext({ event: 'completed' }, object.type === 'systemDown' ? after : next('completed')),
              withNext({ event: 'failed' }, object.type === 'systemDown' ? after : next('failed')),
            ],
            properties: {
              flow_sid: object.type === 'systemDown' ? '${system_down_studio_subflow_sid}' : TODO,
              flow_revision: 'LatestPublished',
              parameters: [],
              offset,
            },
          },
        ];
      }
      case 'forwardCall':
        todo.push(`${label(object)}: set the number it forwards to.`);
        return [
          {
            name,
            type: 'connect-call-to',
            transitions: [
              withNext({ event: 'callCompleted' }, next('call completed')),
              withNext({ event: 'hangup' }, next('hung up')),
            ],
            properties: { offset, caller_id: '{{contact.channel.address}}', noun: 'number', to: TODO, timeout: 30 },
          },
        ];
      default:
        todo.push(`${label(object)} (${info.label}) has no Studio widget: build it by hand.`);
        return [];
    }
  };

  // Values that differ between staging and production, typed into new widgets (Twilio SIDs, the
  // addresses of staging/production services and Twilio Functions): read from flow_vars instead
  const environmentValues = new Map<string, string>();
  const environmentVariable = (widget: string, value: string) => {
    if (!environmentValues.has(value)) {
      const kind = /^[A-Z]{2}[0-9a-f]{32}$/.test(value) ? 'sid' : 'url';
      const taken = new Set(environmentValues.values());
      let variable = `${widget}_${kind}`;
      for (let count = 2; taken.has(variable); count += 1) variable = `${widget}_${kind}_${count}`;
      environmentValues.set(value, variable);
      flowVars.push({ scope: 'flow_vars', name: variable, value, widget, environmentSpecific: true });
      todo.push(
        `“${widget}” had ${value} written in it: it reads \${flow_vars.${variable}} now. Set that in staging.hcl, and ask for the production value for production.hcl.`,
      );
    }
    return `\${flow_vars.${environmentValues.get(value)}}`;
  };
  const withEnvironmentVariables = (widget: string, value: unknown): unknown => {
    if (typeof value === 'string') {
      // Only the literal text: what's already a ${...} or {{...}} stays as it is
      return value
        .split(/(\$\{[^}]*\}|\{\{[^}]*\}\})/)
        .map((part, index) =>
          index % 2 === 1
            ? part
            : part
                .replace(ENVIRONMENT_URL, url => environmentVariable(widget, url))
                .replace(ENVIRONMENT_SID, sid => environmentVariable(widget, sid)),
        )
        .join('');
    }
    if (Array.isArray(value)) return value.map(item => withEnvironmentVariables(widget, item));
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, withEnvironmentVariables(widget, item)]),
      );
    }
    return value;
  };

  const states: StudioState[] = objects.flatMap(object =>
    object.studio
      ? widgetsOf(object)
      : widgetsOf(object).map(state => ({
          ...state,
          properties: withEnvironmentVariables(state.name, state.properties) as Record<string, unknown>,
        })),
  );

  if (!states.some(state => state.type === 'trigger'))
    todo.push('The flow has no incoming call or message (its Trigger).');

  const flow: StudioFlow = { ...(details?.studio?.settings ?? DEFAULT_SETTINGS), states };
  return {
    ...(frame ? { frameId: frame.id } : {}),
    title: frame?.title ?? content.title,
    ...(details?.studio ? { template: details.studio.template } : {}),
    ...(details?.studio?.sharedWith?.length ? { sharedWith: details.studio.sharedWith } : {}),
    ...(details?.studio?.changeShared ? { changeShared: true } : {}),
    channels: details?.studio?.channels ?? [],
    flow,
    text: toTemplateText(flow),
    flowVars,
    taskAttributes,
    todo: [...new Set(todo)],
  };
};

// One flow per frame (and one for objects outside frames, if any)
export const toStudioFlows = (content: BoardContent, recordings?: RecordingsList): GeneratedStudioFlow[] => [
  ...content.frames
    .filter(frame => content.objects.some(object => object.frameId === frame.id))
    .map(frame => toStudioFlow(content, frame, recordings)),
  ...(content.objects.some(object => !object.frameId || !content.frames.some(frame => frame.id === object.frameId))
    ? [toStudioFlow(content, undefined, recordings)]
    : []),
];
