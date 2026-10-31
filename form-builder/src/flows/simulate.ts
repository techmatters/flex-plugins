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
 * Runs a board's flow as Studio would, without Twilio: from the trigger, one widget after another,
 * following the board's connections. What a person says or presses is asked for (a chat reply, the
 * dialpad); what a lambda answers is chosen (each of its ways out); everything else is worked out:
 * splits on what the run knows (replies, digits, flow variables, Repeat counters, flow memory), Set
 * variable and Set flow memory, and a chatbot handing the conversation back, which starts the flow
 * again (a second execution) with its release flag, the bot's memory and the flow memory kept.
 *
 * Also the tested paths: runs marked as tested, kept on the board while nothing on them changes.
 */
import type { BoardContent, FlowObject, TestedPath } from './model';
import { defaultSplitInputOf, exitsOf, OBJECT_TYPES, repeatWidgetNames } from './model';

// ---------------------------------------------------------------------------------------------
// A tiny Liquid: {{ path | filter: arg }}, {% if %}/{% elsif %}/{% else %}/{% endif %}

// A value the run can't know (e.g. what a lambda answered): the split asks instead
export class Unknown extends Error {
  constructor(readonly path: string) {
    super(`Can't know ${path}`);
  }
}

type Lookup = (path: string) => unknown;

const literal = (text: string): { value: unknown } | undefined => {
  const trimmed = text.trim();
  const quoted = trimmed.match(/^(['"])(.*)\1$/);
  if (quoted) return { value: quoted[2] };
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return { value: Number(trimmed) };
  if (trimmed === 'true' || trimmed === 'false') return { value: trimmed === 'true' };
  if (trimmed === 'nil' || trimmed === 'null' || trimmed === 'empty' || trimmed === 'blank')
    return { value: undefined };
  return undefined;
};

const valueOf = (text: string, lookup: Lookup) =>
  literal(text)?.value ?? (literal(text) ? undefined : lookup(text.trim()));

const asText = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const FILTERS: Record<string, (value: unknown, arg?: unknown) => unknown> = {
  plus: (value, arg) => Number(asText(value) || 0) + Number(asText(arg) || 0),
  minus: (value, arg) => Number(asText(value) || 0) - Number(asText(arg) || 0),
  times: (value, arg) => Number(asText(value) || 0) * Number(asText(arg) || 0),
  downcase: (value) => asText(value).toLowerCase(),
  upcase: (value) => asText(value).toUpperCase(),
  strip: (value) => asText(value).trim(),
  default: (value, arg) => (value === undefined || value === null || value === '' ? arg : value),
  size: (value) => (Array.isArray(value) ? value.length : asText(value).length),
  to_json: (value) => JSON.stringify(value ?? null),
};

// An output's value: a path or literal, then its filters
const evaluate = (expression: string, lookup: Lookup): unknown => {
  const [first, ...filters] = expression.split('|');
  return filters.reduce(
    (value, filter) => {
      const [name, arg] = filter.split(':');
      const apply = FILTERS[name.trim()];
      return apply ? apply(value, arg === undefined ? undefined : valueOf(arg, lookup)) : value;
    },
    valueOf(first, lookup),
  );
};

const truthy = (value: unknown) => value !== undefined && value !== null && value !== false;

const compare = (left: unknown, operator: string, right: unknown): boolean => {
  const [a, b] = [asText(left), asText(right)];
  const numbers = a !== '' && b !== '' && !Number.isNaN(Number(a)) && !Number.isNaN(Number(b));
  switch (operator) {
    case '==':
      return numbers ? Number(a) === Number(b) : a === b;
    case '!=':
      return numbers ? Number(a) !== Number(b) : a !== b;
    case '>':
      return numbers && Number(a) > Number(b);
    case '<':
      return numbers && Number(a) < Number(b);
    case '>=':
      return numbers && Number(a) >= Number(b);
    case '<=':
      return numbers && Number(a) <= Number(b);
    case 'contains':
      return a.includes(b);
    default:
      return false;
  }
};

// A tag's condition: comparisons joined by and / or (evaluated right to left, as Liquid does)
const condition = (text: string, lookup: Lookup): boolean => {
  const or = text.split(/\s+or\s+/);
  if (or.length > 1) return or.some((part) => condition(part, lookup));
  const and = text.split(/\s+and\s+/);
  if (and.length > 1) return and.every((part) => condition(part, lookup));
  const comparison = text.match(/^(.+?)\s*(==|!=|>=|<=|>|<|\scontains\s)\s*(.+)$/);
  if (!comparison) return truthy(evaluate(text, lookup));
  return compare(evaluate(comparison[1], lookup), comparison[2].trim(), evaluate(comparison[3], lookup));
};

/** A Liquid text with what the run knows; throws Unknown when it reads something it can't know. */
export const renderLiquid = (template: string, lookup: Lookup): string => {
  const parts = template.split(/({%[\s\S]*?%}|{{[\s\S]*?}})/);
  // Whether each open {% if %} is showing its text, and whether one of its branches already has
  const stack: { showing: boolean; done: boolean; outer: boolean }[] = [];
  const showing = () => stack.every((level) => level.showing);
  let out = '';
  parts.forEach((part) => {
    const tag = part.match(/^{%-?\s*(\w+)\s*([\s\S]*?)\s*-?%}$/);
    if (tag) {
      const [, name, rest] = tag;
      const outer = showing();
      if (name === 'if' || name === 'unless') {
        const met = outer && condition(rest, lookup) === (name === 'if');
        stack.push({ showing: met, done: met, outer });
      } else if (name === 'elsif' && stack.length > 0) {
        const level = stack[stack.length - 1];
        level.showing = level.outer && !level.done && condition(rest, lookup);
        level.done = level.done || level.showing;
      } else if (name === 'else' && stack.length > 0) {
        const level = stack[stack.length - 1];
        level.showing = level.outer && !level.done;
        level.done = true;
      } else if ((name === 'endif' || name === 'endunless') && stack.length > 0) {
        stack.pop();
      }
      return;
    }
    const output = part.match(/^{{-?([\s\S]*?)-?}}$/);
    if (!showing()) return;
    out += output ? asText(evaluate(output[1], lookup)) : part;
  });
  return out;
};

// ---------------------------------------------------------------------------------------------
// The run

export type SimStep = {
  // Which execution of the flow (a chatbot handing the conversation back starts the next one)
  execution: number;
  objectId: string;
  // The way out it took, and the connection that follows it
  exit?: string;
  connectionId?: string;
  // What happened there: the reply, the digits, what a split read...
  note?: string;
};

export type SimPrompt =
  // A chat reply (Question, messaging), or one of its other ways out (timeout)
  | { kind: 'reply'; objectId: string; exits: string[] }
  // Keys pressed or words said (Menu, voice), or its other ways out
  | { kind: 'dialpad'; objectId: string; exits: string[]; digits: number }
  // A way out chosen: what a lambda answered, a split on something the run can't know...
  | { kind: 'choose'; objectId: string; exits: string[]; why: string }
  // A chatbot has the conversation: what it keeps, and whether it starts the flow again
  | { kind: 'release'; objectId: string; memoryAttribute: string; releaseFlag?: string; triggersFlow: boolean }
  // Paused on a widget that goes on by itself (a message, a split worked out), to check it first
  | { kind: 'continue'; objectId: string; exit: string; note?: string };

export type SimEnd = {
  kind: 'end' | 'deadEnd' | 'loop';
  message: string;
  objectId?: string;
  exit?: string;
};

export type SimRun = {
  // The trigger it started from
  startId: string;
  execution: number;
  steps: SimStep[];
  current?: string;
  prompt?: SimPrompt;
  ended?: SimEnd;
  // flow.variables (this execution), the widgets' answers (this execution), and the
  // conversation's attributes (kept across executions: flow memory, the bot's memory, flags)
  variables: Record<string, string>;
  widgets: Record<string, Record<string, unknown>>;
  attributes: Record<string, unknown>;
  // Stops at every widget, also those that go on by themselves, until Next
  pauseEach?: boolean;
};

export type SimAnswer =
  | { kind: 'reply'; text: string }
  | { kind: 'digits'; digits: string }
  | { kind: 'speech'; text: string }
  | { kind: 'exit'; exit: string }
  | { kind: 'release'; memory: Record<string, string> }
  | { kind: 'continue' }
  | { kind: 'stop' };

// Steps taken without asking before it's taken as going round for ever
const MAX_STEPS = 300;

// Ways out that leave the flow on purpose when unconnected (as the checks have them), and the
// ones where the conversation is somewhere else afterwards
const UNCONNECTED_ON_PURPOSE = new Set(['speech', 'callfailure']);
const LEAVES_THE_FLOW: Partial<Record<FlowObject['type'], string[]>> = {
  sendMessageAndClose: ['success', 'failed'],
  sendToQueue: ['callComplete', 'failedToEnqueue', 'callFailure'],
  forwardCall: ['call completed', 'hung up'],
  // A last message (goodbye): the call or conversation ends after it, as in Studio
  playMessage: ['', 'audioComplete'],
  sendMessage: ['', 'sent'],
};

// Kinds whose first way out is taken without asking (a message is sent, an alert posted)
const GOES_ON = new Set<FlowObject['type']>(['playMessage', 'sendMessage', 'notifyError', 'setVariable', 'other']);

export const widgetNameOf = (object: Pick<FlowObject, 'studioName' | 'studio' | 'id'>) =>
  object.studioName ?? object.studio?.name ?? object.id;

const labelOf = (object: FlowObject) => object.text.trim() || OBJECT_TYPES[object.type].label;

// A path in nested records ("a.b.c"), undefined when missing
const at = (record: unknown, path: string[]): unknown =>
  path.reduce<unknown>(
    (value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined),
    record,
  );

/**
 * What a Liquid path means in the run. Known (or empty, as Studio would have it): flow variables,
 * the conversation's attributes, and the answers of the questions, menus and flow memory widgets.
 * Anything else (a lambda's answer, the caller's number) is Unknown.
 */
const lookupIn =
  (run: SimRun, content: Pick<BoardContent, 'objects'>): Lookup =>
  (path) => {
    const parts = path.split('.');
    if (parts[0] === 'flow' && parts[1] === 'variables') return run.variables[parts[2]];
    if (parts[0] === 'trigger' && parts[1] === 'conversation' && parts[2] === 'ChannelAttributes') {
      return at(run.attributes, parts.slice(3));
    }
    if (parts[0] === 'widgets') {
      const name = parts[1];
      if (run.widgets[name]) return at(run.widgets[name], parts.slice(2));
      const object = content.objects.find((candidate) => widgetNameOf(candidate) === name);
      const answers =
        object &&
        (['questionMessaging', 'menuVoice'].includes(object.type) ||
          (object.type === 'setFlowMemory' && parts[2] === 'parsed'));
      if (answers) return undefined;
    }
    throw new Unknown(path);
  };

/**
 * The ways out of a split, in Studio's order, each with what makes it match (imported ones: their
 * conditions as live; new ones: equal to the way out's name). The rest is noMatch.
 */
const splitMatchesOf = (object: FlowObject, input: string) => {
  const exits = exitsOf(object);
  if (object.studio?.type === 'split-based-on' && Array.isArray(object.studio.transitions)) {
    const liveInput = object.studio.properties?.input;
    return object.studio.transitions.flatMap((transition, index) => {
      if (transition.event !== 'match' || !Array.isArray(transition.conditions)) return [];
      const conditions = (transition.conditions as Record<string, unknown>[]).map((candidate) => {
        const argument = Array.isArray(candidate.arguments) ? String(candidate.arguments[0] ?? '') : input;
        return {
          // A split whose input was changed on the board reads the new one
          argument: argument === liveInput ? input : argument,
          type: String(candidate.type ?? 'equal_to'),
          value: String(candidate.value ?? ''),
        };
      });
      return [{ exit: exits[index] ?? `match ${index + 1}`, conditions }];
    });
  }
  return exits
    .filter((exit) => exit && exit !== 'noMatch')
    .map((exit) => ({ exit, conditions: [{ argument: input, type: 'equal_to', value: exit }] }));
};

// Studio's split conditions (text compared without minding case)
const conditionMet = (type: string, value: string, condition: string): boolean | undefined => {
  const [a, b] = [value.trim().toLowerCase(), condition.trim().toLowerCase()];
  const list = b.split(',').map((item) => item.trim());
  const numbers = a !== '' && !Number.isNaN(Number(a)) && !Number.isNaN(Number(b));
  switch (type) {
    case 'equal_to':
      return numbers ? Number(a) === Number(b) : a === b;
    case 'not_equal_to':
      return numbers ? Number(a) !== Number(b) : a !== b;
    case 'matches_any_of':
      return list.includes(a);
    case 'does_not_match_any_of':
      return !list.includes(a);
    case 'contains':
      return a.includes(b);
    case 'does_not_contain':
      return !a.includes(b);
    case 'starts_with':
      return a.startsWith(b);
    case 'does_not_start_with':
      return !a.startsWith(b);
    case 'is_blank':
      return a === '';
    case 'is_not_blank':
      return a !== '';
    case 'greater_than':
      return numbers && Number(a) > Number(b);
    case 'less_than':
      return numbers && Number(a) < Number(b);
    case 'regex':
      try {
        return new RegExp(condition).test(value);
      } catch {
        return undefined;
      }
    default:
      return undefined;
  }
};

// What a split reads: as set on the board, the answer of the widget before it, or as live
const splitInputOf = (object: FlowObject, content: Pick<BoardContent, 'objects' | 'connections'>) =>
  object.settings?.input?.trim() ||
  (typeof object.studio?.properties?.input === 'string' ? object.studio.properties.input : undefined) ||
  defaultSplitInputOf(content, object.id);

const firstOf = (exits: string[], candidates: string[]) => exits.find((exit) => candidates.includes(exit));

const nextRun = (run: SimRun, changes: Partial<SimRun>): SimRun => ({ ...run, ...changes });

/** A new run from a trigger (an Incoming object), up to the first thing it needs to ask. */
export const startRun = (content: BoardContent, startId: string, pauseEach = false): SimRun =>
  advance(content, {
    startId,
    execution: 1,
    steps: [{ execution: 1, objectId: startId }],
    current: startId,
    variables: {},
    widgets: {},
    attributes: {},
    ...(pauseEach ? { pauseEach } : {}),
  });

// On by a way out worked out here, or, pausing at every widget, stopped there until Next
const goOn = (content: BoardContent, run: SimRun, exit: string, note?: string): SimRun =>
  run.pauseEach && run.current
    ? nextRun(run, { prompt: { kind: 'continue', objectId: run.current, exit, ...(note ? { note } : {}) } })
    : leave(content, run, exit, note);

// Leaving the current object by a way out: on to what it's connected to, or the run ends
const leave = (content: BoardContent, run: SimRun, exit: string, note?: string): SimRun => {
  const object = content.objects.find((candidate) => candidate.id === run.current)!;
  const connection = content.connections.find(
    (candidate) => candidate.from === object.id && (candidate.exit ?? '') === exit,
  );
  const steps = [...run.steps];
  steps[steps.length - 1] = {
    ...steps[steps.length - 1],
    exit,
    ...(connection ? { connectionId: connection.id } : {}),
    ...(note !== undefined ? { note } : {}),
  };
  const target = connection && content.objects.find((candidate) => candidate.id === connection.to);
  if (target) {
    return nextRun(run, {
      steps: [...steps, { execution: run.execution, objectId: target.id }],
      current: target.id,
      prompt: undefined,
    });
  }
  const name = exit ? `“${exit}”` : 'its way out';
  const onPurpose =
    (object.endedExits ?? []).includes(exit) ||
    UNCONNECTED_ON_PURPOSE.has(exit.toLowerCase()) ||
    (LEAVES_THE_FLOW[object.type] ?? []).includes(exit);
  return nextRun(run, {
    steps,
    current: undefined,
    prompt: undefined,
    ended: onPurpose
      ? { kind: 'end', message: `The flow ends after ${labelOf(object)} (${name}).`, objectId: object.id, exit }
      : {
          kind: 'deadEnd',
          message: `${labelOf(object)}: ${name} isn't connected, so the flow stops here.`,
          objectId: object.id,
          exit,
        },
  });
};

const ask = (run: SimRun, prompt: SimPrompt): SimRun => nextRun(run, { prompt });

/** On from the current object, as far as it goes without asking. */
const advance = (content: BoardContent, start: SimRun): SimRun => {
  let run = start;
  for (let count = 0; count < MAX_STEPS; count += 1) {
    if (run.ended || run.prompt || !run.current) return run;
    const object = content.objects.find((candidate) => candidate.id === run.current);
    if (!object) return nextRun(run, { ended: { kind: 'deadEnd', message: 'The next object is gone.' } });
    const exits = exitsOf(object);
    const named = exits.filter(Boolean);
    const name = widgetNameOf(object);
    const lookup = lookupIn(run, content);

    switch (object.type) {
      case 'incoming': {
        // The trigger's event: the one that's connected (asked when there are several)
        const connected = exits.filter((exit) =>
          content.connections.some((connection) => connection.from === object.id && (connection.exit ?? '') === exit),
        );
        if (connected.length === 1) run = leave(content, run, connected[0]);
        else if (connected.length === 0) run = leave(content, run, exits[0] ?? '');
        else run = ask(run, { kind: 'choose', objectId: object.id, exits: connected, why: 'Which event starts it?' });
        break;
      }
      case 'end':
        return nextRun(run, {
          current: undefined,
          ended: { kind: 'end', message: 'The flow ends here.', objectId: object.id },
        });
      case 'goToFrame':
        return nextRun(run, {
          current: undefined,
          ended: {
            kind: 'end',
            message: `${labelOf(object)}: goes on in another frame (run that frame from its own start).`,
            objectId: object.id,
          },
        });
      case 'questionMessaging':
        return ask(run, { kind: 'reply', objectId: object.id, exits });
      case 'menuVoice': {
        const digits = Number(object.studio?.properties?.number_of_digits ?? 1) || 1;
        return ask(run, { kind: 'dialpad', objectId: object.id, exits, digits });
      }
      case 'setVariable': {
        // Each in order, each seeing the ones before
        // Each in order, each seeing the ones before; one read from what the run can't know is left empty
        const variables = { ...run.variables };
        const notes = (object.variables ?? [])
          .filter(({ key }) => key)
          .map(({ key, value }) => {
            try {
              variables[key] = renderLiquid(value, lookupIn({ ...run, variables }, content));
              return `${key} = ${variables[key]}`;
            } catch (err) {
              if (!(err instanceof Unknown)) throw err;
              variables[key] = '';
              return `${key} = (can't know ${err.path})`;
            }
          });
        run = goOn(content, nextRun(run, { variables }), exits[0] ?? '', notes.join(', '));
        break;
      }
      case 'repeat': {
        const { counter } = repeatWidgetNames(object.studioName ?? 'repeat');
        const count = Number(run.variables[counter] ?? 0) + 1;
        const max = Number(object.settings?.maxRepeats?.trim() || 2);
        run = goOn(
          content,
          nextRun(run, { variables: { ...run.variables, [counter]: String(count) } }),
          count > max ? 'max reached' : 'repeat',
          `${counter} = ${count} (max ${max})`,
        );
        break;
      }
      case 'decision':
      case 'checkCountry': {
        const input = splitInputOf(object, content);
        const matches = splitMatchesOf(object, input ?? '');
        const noMatch = exits.includes('noMatch') ? 'noMatch' : named[named.length - 1];
        try {
          if (!input || input === 'TODO') throw new Unknown('what it splits on (not set)');
          const value = renderLiquid(input, lookup);
          const found = matches.find(({ conditions }) =>
            conditions.every((candidate) => {
              const read = candidate.argument === input ? value : renderLiquid(candidate.argument, lookup);
              const met = conditionMet(candidate.type, read, candidate.value);
              if (met === undefined) throw new Unknown(`a “${candidate.type}” condition`);
              return met;
            }),
          );
          run = goOn(content, run, found?.exit ?? noMatch, `${input} = “${value}”`);
        } catch (err) {
          if (!(err instanceof Unknown)) throw err;
          return ask(run, {
            kind: 'choose',
            objectId: object.id,
            exits: named,
            why: `It splits on ${err.path}, which this run can't know: which way does it go?`,
          });
        }
        break;
      }
      case 'setFlowMemory':
        return ask(run, { kind: 'choose', objectId: object.id, exits: named, why: 'conversation/setFlowMemory' });
      case 'chatbot':
        return ask(run, {
          kind: 'choose',
          objectId: object.id,
          exits: named,
          why: `Did the chatbot${object.settings?.botSuffix ? ` ${object.settings.botSuffix}` : ''} start? (channelCapture/captureChannelWithBot)`,
        });
      default: {
        if (named.length <= 1 || GOES_ON.has(object.type)) {
          run = goOn(content, run, exits[0] ?? '');
          break;
        }
        const info = OBJECT_TYPES[object.type];
        return ask(run, {
          kind: 'choose',
          objectId: object.id,
          exits: named,
          why: info.studioRoute ? `What ${info.studioRoute} answers` : `What ${name} does`,
        });
      }
    }
  }
  return nextRun(run, {
    current: undefined,
    prompt: undefined,
    ended: {
      kind: 'loop',
      message: `More than ${MAX_STEPS} steps without asking anything: the flow goes round for ever.`,
    },
  });
};

// The values a Set flow memory keeps, as the run has them
const keptValues = (object: FlowObject, run: SimRun, content: BoardContent) => {
  const values: Record<string, string> = {};
  const lookup = lookupIn(run, content);
  (object.variables ?? []).forEach(({ key, value }) => {
    if (!key) return;
    try {
      values[key] = renderLiquid(value, lookup);
    } catch {
      values[key] = value;
    }
  });
  return values;
};

/** The run after what was asked is answered (a reply, digits, a way out chosen...). */
export const answer = (content: BoardContent, run: SimRun, given: SimAnswer): SimRun => {
  const { prompt } = run;
  if (!prompt || run.ended) return run;
  if (given.kind === 'stop') {
    return nextRun(run, { prompt: undefined, current: undefined, ended: { kind: 'end', message: 'Stopped.' } });
  }
  if (prompt.kind === 'continue') {
    return given.kind === 'continue' ? advance(content, leave(content, run, prompt.exit, prompt.note)) : run;
  }
  const object = content.objects.find((candidate) => candidate.id === prompt.objectId)!;
  const name = widgetNameOf(object);
  const exits = exitsOf(object);

  if (prompt.kind === 'release') {
    if (given.kind !== 'release') return run;
    const attributes: Record<string, unknown> = {
      ...run.attributes,
      [prompt.memoryAttribute]: given.memory,
      ...(prompt.releaseFlag ? { [prompt.releaseFlag]: 'true' } : {}),
    };
    if (!prompt.triggersFlow) {
      return nextRun(run, {
        attributes,
        prompt: undefined,
        current: undefined,
        ended: { kind: 'end', message: 'The chatbot finished; its release doesn’t start this flow again.' },
      });
    }
    // The flow starts again from its trigger: a new execution, with the conversation's attributes
    const execution = run.execution + 1;
    return advance(content, {
      ...run,
      execution,
      attributes,
      variables: {},
      widgets: {},
      prompt: undefined,
      current: run.startId,
      steps: [
        ...run.steps,
        { execution, objectId: run.startId, note: `Execution ${execution}: the chatbot handed the conversation back` },
      ],
    });
  }

  if (given.kind === 'exit') {
    // A chatbot that started: it has the conversation until it hands it back
    if (object.type === 'chatbot' && given.exit === 'success') {
      const settings = object.settings ?? {};
      const steps = [...run.steps];
      steps[steps.length - 1] = {
        ...steps[steps.length - 1],
        exit: 'success',
        note: 'The chatbot has the conversation',
      };
      return nextRun(run, {
        steps,
        prompt: {
          kind: 'release',
          objectId: object.id,
          memoryAttribute: settings.memoryAttribute?.trim() || 'memory',
          releaseFlag: settings.releaseFlag?.trim() || undefined,
          triggersFlow: (settings.releaseType?.trim() || 'triggerStudioFlow') === 'triggerStudioFlow',
        },
      });
    }
    let changed = run;
    if (object.type === 'setFlowMemory' && given.exit === 'success') {
      const values = keptValues(object, run, content);
      const flowMemory = { ...((run.attributes.flowMemory as Record<string, unknown>) ?? {}), ...values };
      // Kept on the conversation for later executions; this one reads it from the widget's answer
      changed = nextRun(run, {
        attributes: { ...run.attributes, flowMemory },
        widgets: { ...run.widgets, [name]: { parsed: { flowMemory } } },
      });
    }
    return advance(content, leave(content, changed, given.exit));
  }

  if (prompt.kind === 'reply') {
    if (given.kind !== 'reply') return run;
    const exit = firstOf(exits, ['reply', 'incomingMessage']) ?? exits[0];
    const changed = nextRun(run, { widgets: { ...run.widgets, [name]: { inbound: { Body: given.text } } } });
    return advance(content, leave(content, changed, exit, `“${given.text}”`));
  }

  if (prompt.kind === 'dialpad') {
    if (given.kind === 'digits') {
      // Boards made when a menu's options were its ways out: the digit is the way out
      const exit = firstOf(exits, ['keypress']) ?? (exits.includes(given.digits) ? given.digits : 'noMatch');
      const changed = nextRun(run, { widgets: { ...run.widgets, [name]: { Digits: given.digits } } });
      return advance(content, leave(content, changed, exit, `pressed ${given.digits}`));
    }
    if (given.kind === 'speech') {
      const changed = nextRun(run, { widgets: { ...run.widgets, [name]: { SpeechResult: given.text } } });
      return advance(content, leave(content, changed, firstOf(exits, ['speech']) ?? 'speech', `said “${given.text}”`));
    }
  }
  return run;
};

// ---------------------------------------------------------------------------------------------
// What a run went through, and tested paths

/** Objects and connections a run went through, each object with its step numbers. */
export const visitedBy = (run: SimRun) => {
  const objects = new Map<string, number[]>();
  const connections = new Set<string>();
  run.steps.forEach((step, index) => {
    objects.set(step.objectId, [...(objects.get(step.objectId) ?? []), index + 1]);
    if (step.connectionId) connections.add(step.connectionId);
  });
  const last = run.steps[run.steps.length - 2];
  return { objects, connections, activeConnection: run.current ? last?.connectionId : undefined };
};

// A short hash of a text (fingerprints, not security)
const hashOf = (text: string) => {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 33) ^ text.charCodeAt(index);
  return (hash >>> 0).toString(36);
};

// What on an object decides where a run goes (not its text, script or place)
const logicOf = (object: FlowObject) =>
  JSON.stringify([
    object.type,
    object.studioName,
    object.exits,
    object.endedExits,
    object.settings,
    object.variables,
    object.studio?.type,
    object.studio?.properties?.input,
    object.studio?.transitions?.map((transition) => transition.conditions ?? null),
  ]);

/** A fingerprint of everything on a path: when any of it changes, the path has to be tested again. */
export const pathFingerprint = (
  content: Pick<BoardContent, 'objects' | 'connections'>,
  steps: Pick<SimStep, 'objectId' | 'exit' | 'connectionId'>[],
) =>
  hashOf(
    JSON.stringify(
      steps.map((step) => {
        const object = content.objects.find((candidate) => candidate.id === step.objectId);
        const connection = step.connectionId
          ? content.connections.find((candidate) => candidate.id === step.connectionId)
          : undefined;
        return [
          object ? logicOf(object) : null,
          step.exit ?? null,
          connection ? [connection.from, connection.to, connection.exit ?? ''] : null,
        ];
      }),
    ),
  );

/** A finished run as a tested path. */
export const testedPathOf = (
  content: Pick<BoardContent, 'objects' | 'connections'>,
  run: SimRun,
  testedBy: string,
  id: string,
): TestedPath => {
  const steps = run.steps.map(({ objectId, exit, connectionId }) => ({
    objectId,
    ...(exit !== undefined ? { exit } : {}),
    ...(connectionId ? { connectionId } : {}),
  }));
  return {
    id,
    testedAt: new Date().toISOString(),
    testedBy,
    startId: run.startId,
    steps,
    fingerprint: pathFingerprint(content, steps),
  };
};

/** The tested paths still as they were tested (nothing on them changed since). */
export const validTestedPaths = (content: Pick<BoardContent, 'objects' | 'connections'>, paths: TestedPath[]) =>
  paths.filter((path) => pathFingerprint(content, path.steps) === path.fingerprint);

/**
 * What's been tested: the objects and connections on tested paths, and the ways out of the board's
 * objects (those that go somewhere, or end the flow on purpose) with whether a tested path took them.
 */
export const coverageOf = (content: BoardContent, paths: TestedPath[]) => {
  const objects = new Set<string>();
  const connections = new Set<string>();
  const taken = new Set<string>();
  paths.forEach((path) =>
    path.steps.forEach((step) => {
      objects.add(step.objectId);
      if (step.connectionId) connections.add(step.connectionId);
      if (step.exit !== undefined) taken.add(`${step.objectId}|${step.exit}`);
    }),
  );
  const waysOut = content.objects.flatMap((object) => {
    if (['text', 'end', 'goToFrame'].includes(object.type)) return [];
    const exits = exitsOf(object);
    return exits
      .filter(
        (exit) =>
          content.connections.some((connection) => connection.from === object.id && (connection.exit ?? '') === exit) ||
          (object.endedExits ?? []).includes(exit),
      )
      .map((exit) => ({ objectId: object.id, exit, tested: taken.has(`${object.id}|${exit}`) }));
  });
  return { objects, connections, waysOut };
};
