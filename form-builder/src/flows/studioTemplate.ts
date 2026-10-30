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
 * - "Send to queue" task attributes kept in a channel-attributes template stay there too
 *   (${channel_attributes.default}): new and changed ones are listed, for that template.
 */
import type { BoardContent, FlowObject, Frame, TaskAttributes } from './model';
import { defaultSplitInputOf, exitsOf, MESSAGE_FROM_DEFAULT, OBJECT_TYPES, repeatWidgetNames, toSnake } from './model';
import { janitorValuesOf, withJanitorValues } from './janitor';
import { isVoiceMessage, standardRecordingName } from './recordings';
import { CHANNEL_ATTRIBUTES_REFERENCE } from './taskAttributes';

// Who a message is from: as chosen on the board, otherwise the helpline's name
const fromOf = (object: FlowObject) => object.settings?.from?.trim() || MESSAGE_FROM_DEFAULT;

export type StudioTransition = Record<string, unknown> & { event: string; next?: string };
export type StudioState = {
  name: string;
  type: string;
  transitions: StudioTransition[];
  properties: Record<string, unknown>;
};
export type StudioFlow = Record<string, unknown> & { states: StudioState[] };

// A text to set in the helpline's variables (staging.hcl / production.hcl): flow_vars, or the
// channel's channel_flow_vars
export type FlowVarChange = {
  scope: string;
  name: string;
  value: string;
  widget: string;
  // For flows sharing a template (variants): the studio_flows entry whose flow_vars it goes in
  flow?: string;
};

// A "Send to queue" widget's task attributes that are new or changed on the board, and where they're
// kept: a channel-attributes template (for its channels), or the widget itself (already written)
export type TaskAttributesChange = {
  widget: string;
  change: 'new' | 'changed';
  json: string;
  source: TaskAttributes['source'];
};

export type GeneratedStudioFlow = {
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
const ACCOUNT_SCOPED = '${lambda_twilio_account_scoped_url}';

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
    return value.length === 0 ? '[]' : `[\n${value.map((item) => inner + toHcl(item, inner)).join(',\n')}\n${indent}]`;
  }
  const entries = Object.entries(value).filter(([, item]) => item !== undefined);
  if (entries.length === 0) return '{}';
  return `{\n${entries.map(([key, item]) => `${inner}${JSON.stringify(key)}: ${toHcl(item, inner)}`).join(',\n')}\n${indent}}`;
};

export const toTemplateText = (flow: StudioFlow) => `\${\n  jsonencode(${toHcl(flow, '  ')})\n}\n`;

/**
 * The Studio flow for one frame of a board (or for the objects outside frames, without frameId).
 */
export const toStudioFlow = (content: BoardContent, frame?: Frame): GeneratedStudioFlow => {
  const objects = content.objects.filter((object) => object.frameId === frame?.id);
  // What the flow is: the frame's, or the board's own (an imported board's Studio flow)
  const details = frame ?? content.flow;
  // Studio flows sharing the template: the template is one; each has its own flow_vars
  const variants = frame ? [] : (content.flow?.variants ?? []);
  const mainVariant = variants.length > 1 ? variants[0].key : undefined;
  const ids = new Set(objects.map((object) => object.id));
  const connections = content.connections.filter((connection) => ids.has(connection.from) && ids.has(connection.to));
  const byId = new Map(objects.map((object) => [object.id, object]));
  const todo: string[] = [];
  const flowVars: FlowVarChange[] = [];
  const taskAttributes: TaskAttributesChange[] = [];
  const label = (object: FlowObject) => `“${object.studioName ?? object.text}”`;

  // Task attributes in a channel-attributes template: listed for it (the widget keeps the reference)
  const listTaskAttributes = (object: FlowObject, name: string, change: TaskAttributesChange['change']) => {
    const attributes = object.taskAttributes!;
    taskAttributes.push({ widget: name, change, json: attributes.json, source: attributes.source });
    if (attributes.source.kind !== 'channelAttributes') return;
    const { template, channels } = attributes.source;
    const shared = template.startsWith('templates/');
    todo.push(
      `${label(object)}: its task attributes are ${change}; they're kept in ${template}${channels.length > 0 ? ` (channels ${channels.join(', ')})` : ''}. ${
        shared
          ? "That template is shared by other helplines: write a template of this helpline's own and point the channel's channel_attributes entry in common.hcl at it."
          : 'Update it.'
      }`,
    );
  };

  // The recordings folder variable this flow's voice widgets already use, for new ones
  const recordingsVariable = objects
    .map(
      (object) => String(object.studio?.properties?.play ?? '').match(/^\$\{\s*flow_vars\.([A-Za-z0-9_]+)\s*\}\//)?.[1],
    )
    .find(Boolean);

  // What callers hear while waiting in the queue (Send to queue's waitUrl): Twilio's music (nothing
  // set), the helpline's recording (named after the widget, played from the recordings folder) or an
  // address. Imported widgets with an address have it as their setting, so nothing set leaves theirs
  const waitSettingsOf = (object: FlowObject, name: string): Record<string, string> => {
    const { waitMusic, waitUrl, waitUrlMethod } = object.settings ?? {};
    if (waitMusic === 'recording') {
      if (!recordingsVariable) {
        todo.push(
          `${label(object)}: no recordings folder variable found in this flow; point its waitUrl at its recording (${name}.mp3).`,
        );
      }
      return {
        waitUrl: recordingsVariable ? `\${flow_vars.${recordingsVariable}}/${name}.mp3` : TODO,
        waitUrlMethod: 'GET',
      };
    }
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
    if (object.type === 'repeat') return repeatWidgetNames(repeatNameOf(object)).setVar;
    return object.studioName ?? `todo_${toSnake(object.text) || object.id}`;
  };
  // Design objects that stand for something built some other way
  const BUILT_ELSEWHERE: Partial<Record<FlowObject['type'], string>> = {
    preSurvey: 'a pre-survey: build it with the chatbot or webchat form',
  };
  // Where a way out leads: the widget it's connected to (End, or nothing, ends the flow)
  const nextOf = (object: FlowObject, exit: string) => {
    const connection = connections.find((candidate) => candidate.from === object.id && (candidate.exit ?? '') === exit);
    const target = connection && byId.get(connection.to);
    if (!target || target.type === 'end') return undefined;
    const name = nameOf(target);
    if (!name)
      todo.push(
        `${label(object)} leads to ${label(target)} (${OBJECT_TYPES[target.type].label}), which isn't a Studio widget: connect it to one.`,
      );
    return name;
  };
  const withNext = (transition: Record<string, unknown>, next?: string): StudioTransition =>
    ({ ...transition, ...(next ? { next } : {}) }) as StudioTransition;
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

  const states: StudioState[] = objects.flatMap((object): StudioState[] => {
    const name = nameOf(object);
    if (!name) {
      const how = BUILT_ELSEWHERE[object.type];
      if (how) todo.push(`${label(object)} is ${how}.`);
      return [];
    }
    const offset = offsetOf(object);

    // Imported: rebuilt as it was, with the board's connections and changes
    if (object.studio) {
      const { studio } = object;
      const properties: Record<string, unknown> = { ...studio.properties, offset };
      // Its transitions as live (a split whose input changed reads the new one in its conditions)
      let liveTransitions = studio.transitions;
      if (object.studioName && object.studioName !== studio.name) {
        todo.push(
          `${label(object)} was ${studio.name} in Studio: renaming a live widget also means its recording file and any monitoring that uses the name.`,
        );
      }
      const attributes = object.taskAttributes;
      if (attributes && attributes.imported !== undefined && attributes.json !== attributes.imported) {
        if (attributes.source.kind === 'inline') properties.attributes = attributes.json;
        listTaskAttributes(object, name, 'changed');
      }
      if ('say' in properties) setText(object, properties, 'say', name);
      // (Send message and close keeps its message among its request's values: below)
      else if ('body' in properties && OBJECT_TYPES[object.type].hasMessage && object.type !== 'sendMessageAndClose')
        setText(object, properties, 'body', name);
      // A recording given its standard name (the widget's) on the board: the widget plays that file now
      if (typeof properties.play === 'string') {
        const played = properties.play.split('/').pop() ?? '';
        const kept = object.message?.recordingFile;
        const wanted =
          kept ?? (played.replace(/\.(mp3|wav)$/, '') === name ? played : standardRecordingName(name, played));
        if (played && /\.(mp3|wav)$/.test(played) && wanted !== played) {
          properties.play = `${properties.play.slice(0, -played.length)}${wanted}`;
          todo.push(
            `${label(object)} plays ${wanted} now (was ${played}): the folder it plays from has to have it, i.e. the Aselo recordings bucket (where the builder copied it), not Twilio Serverless.`,
          );
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
        liveTransitions = studio.transitions?.map((transition) =>
          Array.isArray(transition.conditions)
            ? {
                ...transition,
                conditions: transition.conditions.map((condition: Record<string, unknown>) =>
                  Array.isArray(condition.arguments)
                    ? {
                        ...condition,
                        arguments: condition.arguments.map((argument) =>
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
            type: live.find((variable) => variable.key === key)?.type ?? 'string',
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
      } else if (object.type === 'function') {
        // The request as set on the board (method, address, body), where it differs from Studio's
        if (studio.type === 'make-http-request') {
          (['method', 'url', 'body'] as const).forEach((key) => {
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
        return withNext(rest, exit === undefined ? undefined : nextOf(object, exit));
      });
      // Ways out added on the board (e.g. a decision's new answer)
      exits.slice(original.length).forEach((exit) => {
        todo.push(`${label(object)} has a new way out “${exit}”: set the condition it stands for.`);
        transitions.push(
          withNext({ event: 'match', conditions: [condition(TODO, 'equal_to', exit, exit)] }, nextOf(object, exit)),
        );
      });
      return [{ name, type: studio.type, transitions, properties }];
    }

    // New: a widget of its kind
    const info = OBJECT_TYPES[object.type];
    const exits = exitsOf(object);
    const next = (exit = '') => nextOf(object, exit);
    const message = object.message?.script ?? '';
    const voice = isVoiceMessage(object, details);
    const voiceRecording = voice && (object.message?.recordingFile ?? `${object.studioName}.mp3`);
    const spoken = () =>
      recordingsVariable && object.studioName
        ? { play: `\${flow_vars.${recordingsVariable}}/${voiceRecording}` }
        : { say: message || TODO };
    const fromFlowVars = () => {
      flowVars.push({ scope: 'flow_vars', name, value: message, widget: name });
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
    const splitName = `split_${toSnake(name.replace(/^(postqueue_)?(f_|gather_input_)/, '$1').replace(/([a-z])([A-Z])/g, '$1_$2'))}`;

    switch (object.type) {
      case 'incoming': {
        const event = object.message?.channel === 'voice' ? 'incomingCall' : 'incomingConversationMessage';
        return [
          {
            name,
            type: 'trigger',
            transitions: TRIGGER_EVENTS.map((candidate) =>
              withNext({ event: candidate }, candidate === event ? next(exits[0] ?? '') : undefined),
            ),
            properties: { offset },
          },
        ];
      }
      case 'playMessage':
        if (!recordingsVariable && voice) {
          todo.push(
            `${label(object)}: no recordings folder variable found in this flow; it says its script instead of playing a recording.`,
          );
        }
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
            transitions: [withNext({ event: 'sent' }, next()), { event: 'failed' }],
            properties: {
              offset,
              service: '{{trigger.message.InstanceSid}}',
              channel: '{{trigger.message.ChannelSid}}',
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
              { event: 'deliveryFailure' },
            ],
            properties: {
              offset,
              service: '{{trigger.message.InstanceSid}}',
              channel: '{{trigger.message.ChannelSid}}',
              from: fromOf(object),
              message_type: 'custom',
              body: fromFlowVars(),
              timeout: object.settings?.timeout || '3600',
            },
          },
        ];
      case 'menuVoice': {
        // Boards made when a menu's options were its ways out (1, 2, noMatch) get a split for them
        const digits = exits.filter((exit) => !['keypress', 'speech', 'noMatch', 'timeout'].includes(exit));
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
                  digits.map((digit) => ({ exit: digit, type: 'equal_to', value: digit })),
                  'noMatch',
                ),
              ]
            : []),
        ];
      }
      case 'repeat': {
        // The counter goes up each time round; past the maximum, the loop's way out
        const { counter, split: endName } = repeatWidgetNames(repeatNameOf(object));
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
          (key) => !settings[key],
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
            : `${label(object)}: check its conditions (each way out is a value ${input} is equal to).`,
        );
        return [
          {
            name,
            type: 'split-based-on',
            transitions: [
              withNext({ event: 'noMatch' }, next('noMatch')),
              ...exits
                .filter((exit) => exit !== 'noMatch')
                .map((exit) =>
                  withNext(
                    { event: 'match', conditions: [condition(input, 'equal_to', exit, `If value equal_to ${exit}`)] },
                    next(exit),
                  ),
                ),
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
        const input = `{{widgets.${name}.parsed.totalAvailableWorkers}}`;
        if (object.type === 'checkWorkerLoggedIn')
          todo.push(
            `${label(object)}: check the field its split reads in STUDIO_ROUTES.md (worker/isSkilledWorkerLoggedIn).`,
          );
        return [
          {
            name,
            type: 'make-http-request',
            transitions: [{ event: 'success', next: splitName }, withNext({ event: 'failed' }, next('failed'))],
            properties: {
              offset,
              ...httpRequest(`${ACCOUNT_SCOPED}/${info.studioRoute}`, JSON.stringify(object.settings ?? {}, null, 2)),
            },
          },
          split(splitName, input, [{ exit: result[0], type: 'greater_than', value: '0' }], result[1]),
        ];
      }
      case 'checkOperatingHours':
      case 'checkClientProfile': {
        const route = info.studioRoute!;
        todo.push(
          `${label(object)}: set its request body and what its split reads from the response, from STUDIO_ROUTES.md (${route}).`,
        );
        const results = exits.filter((exit) => exit !== 'failed');
        return [
          {
            name,
            type: 'make-http-request',
            transitions: [{ event: 'success', next: splitName }, withNext({ event: 'failed' }, next('failed'))],
            properties: { offset, ...httpRequest(`${ACCOUNT_SCOPED}/${route}`, TODO) },
          },
          split(
            splitName,
            `{{widgets.${name}.parsed.${TODO}}}`,
            results.slice(0, -1).map((exit) => ({ exit, type: 'equal_to', value: exit })),
            results[results.length - 1],
          ),
        ];
      }
      case 'sendMessageAndClose': {
        const settings = object.settings ?? {};
        // Its message from flow_vars, named as the helplines' are (send_message_<what>)
        const variable = `send_message_${name.replace(/^(postqueue_)?f_sendMessageAndRunJanitor_?/, '') || 'janitor'}`;
        flowVars.push({ scope: 'flow_vars', name: variable, value: message, widget: name });
        const body = {
          [settings.conversation === 'channelSid' ? 'channelSid' : 'conversationSid']: '{{flow.channel.address}}',
          message: `\${flow_vars.${variable}}`,
          from: fromOf(object),
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
      case 'function':
      case 'notifyError': {
        const url = object.type === 'function' ? object.settings?.url?.trim() : undefined;
        const body = object.type === 'function' ? object.settings?.body?.trim() : undefined;
        if (object.type === 'notifyError' || !url || !body) {
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
                object.type === 'notifyError' ? '${webhook_url_studio_errors}' : (url ?? TODO),
                body ?? TODO,
              ),
              ...(object.settings?.method ? { method: object.settings.method } : {}),
            },
          },
        ];
      }
      case 'sendToQueue': {
        const { queue, workflow, taskChannel } = object.settings ?? {};
        if (!workflow || !taskChannel) todo.push(`${label(object)}: set its workflow and task channel.`);
        if (queue) {
          todo.push(
            `${label(object)} should end up in the ${queue} queue: check that the ${workflow ?? 'chosen'} workflow's rules send it there (with its task attributes).`,
          );
        }
        const attributes = object.taskAttributes;
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
              attributes:
                attributes?.source.kind === 'inline'
                  ? attributes.json
                  : attributes
                    ? CHANNEL_ATTRIBUTES_REFERENCE
                    : TODO,
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
  });

  if (!states.some((state) => state.type === 'trigger'))
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
export const toStudioFlows = (content: BoardContent): GeneratedStudioFlow[] => [
  ...content.frames
    .filter((frame) => content.objects.some((object) => object.frameId === frame.id))
    .map((frame) => toStudioFlow(content, frame)),
  ...(content.objects.some((object) => !object.frameId || !content.frames.some((frame) => frame.id === object.frameId))
    ? [toStudioFlow(content)]
    : []),
];
