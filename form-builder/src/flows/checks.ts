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
 * Checks a board against the Studio flow standards (twilio-iac/AGENTS.md, "Studio flow
 * standards"). Problems are shown on the objects, in their settings and in the Check panel; they
 * never stop saving, since a board is a design in progress.
 */
import type { BoardContent, FlowObject, Frame, NamingChoices } from './model';
import {
  exitsOf,
  fieldProblem,
  fieldShown,
  flowDetailsOf,
  namingChoicesOf,
  OBJECT_TYPES,
  standardStudioName,
  variableKeyProblem,
  variesByVariant,
} from './model';
import type { Recording } from './recordings';
import { hasNonStandardRecording, isVoiceMessage, messageStatus } from './recordings';
import { taskAttributesProblem } from './taskAttributes';

const POSTQUEUE = 'postqueue_';

const UNCONNECTED_ON_PURPOSE = new Set(['speech', 'callfailure']);

// HTTP requests that don't call a function are named http_get_ / http_post_ instead of f_
const prefixesOf = (object: Pick<FlowObject, 'type'>): string[] => {
  const { studioPrefix } = OBJECT_TYPES[object.type];
  if (!studioPrefix) return [];
  return object.type === 'function' ? [studioPrefix, 'http_get_', 'http_post_'] : [studioPrefix];
};

/**
 * What's wrong with an object's Studio name, in plain language. Empty when it's fine (or not set).
 */
export const studioNameProblems = (
  object: Pick<FlowObject, 'type' | 'studioName'>,
  frame?: Pick<Frame, 'stage'>,
): string[] => {
  const name = object.studioName;
  const prefixes = prefixesOf(object);
  if (!name || prefixes.length === 0) return [];
  const problems: string[] = [];
  const rest = name.startsWith(POSTQUEUE) ? name.slice(POSTQUEUE.length) : name;
  const prefix = prefixes.find((candidate) => rest.startsWith(candidate) || rest === candidate.replace(/_$/, ''));

  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    problems.push('Use only letters, numbers and underscores (no spaces or other characters).');
  } else if (prefix === 'f_') {
    // Functions: f_ + the function name in camelCase, then an optional lower case suffix
    if (!/^f_[a-z][A-Za-z0-9]*(_[a-z0-9]+)*$/.test(rest)) {
      problems.push('Functions are named f_ + the function name in camelCase, e.g. f_getProfileFlagsForIdentifier.');
    }
  } else if (/[A-Z]/.test(name)) {
    problems.push('Use lower case with underscores. camelCase is only for function names, after f_.');
  }
  if (!prefix) {
    problems.push(`${OBJECT_TYPES[object.type].label} names start with ${prefixes.join(' or ')}.`);
  }
  if (/__/.test(name) || name.endsWith('_')) {
    problems.push('No double or trailing underscores.');
  }
  if (frame?.stage === 'postqueue' && !name.startsWith(POSTQUEUE)) {
    problems.push('Everything after the queue starts with postqueue_.');
  }
  return problems;
};

/**
 * Names have to be unique within a Studio flow. Frames with the same channel are parts of the
 * same flow (e.g. "Voice: pre-queue" and "Voice: post-queue"); other frames, and objects outside
 * frames, are each their own.
 */
export const flowScopeOf = (object: Pick<FlowObject, 'frameId'>, frames: Pick<Frame, 'id' | 'channel'>[]) => {
  const frame = object.frameId ? frames.find((candidate) => candidate.id === object.frameId) : undefined;
  if (frame?.channel) return `channel:${frame.channel}`;
  return frame ? `frame:${frame.id}` : 'board';
};

// Objects whose Studio name another object in the same flow also has
export const duplicateNames = (content: Pick<BoardContent, 'objects' | 'frames'>): Set<string> => {
  const seen = new Map<string, string[]>();
  content.objects.forEach((object) => {
    if (!object.studioName) return;
    const key = `${flowScopeOf(object, content.frames)}|${object.studioName}`;
    seen.set(key, [...(seen.get(key) ?? []), object.id]);
  });
  return new Set([...seen.values()].filter((ids) => ids.length > 1).flat());
};

// The name, or the name with _2, _3... when another object in the same flow already has it
export const uniqueName = (
  name: string,
  object: Pick<FlowObject, 'id' | 'frameId'>,
  content: Pick<BoardContent, 'objects' | 'frames'>,
): string => {
  const scope = flowScopeOf(object, content.frames);
  const taken = new Set(
    content.objects
      .filter((other) => other.id !== object.id && other.studioName && flowScopeOf(other, content.frames) === scope)
      .map((other) => other.studioName),
  );
  if (!taken.has(name)) return name;
  let count = 2;
  while (taken.has(`${name}_${count}`)) count += 1;
  return `${name}_${count}`;
};

// ---------------------------------------------------------------------------------------------
// The whole board

export type Severity = 'error' | 'warning';

export type Issue = {
  // Stable, for lists
  key: string;
  severity: Severity;
  message: string;
  objectId?: string;
  frameId?: string;
  // An unconnected way out, which can be marked as ending the flow on purpose
  openExit?: string;
};

// Objects that don't need anything leading to them
const STARTS = new Set<FlowObject['type']>(['incoming', 'text']);

/**
 * Everything worth fixing on the board, errors first. Errors are mistakes (names that break the
 * standards or repeat, a way out leading to two places); warnings are what's still missing in a
 * design in progress (open ends, names, scripts, recordings...).
 */
export const boardChecks = (
  content: Pick<BoardContent, 'objects' | 'frames' | 'connections' | 'flow'>,
  // The helpline's recordings, when they're known: voice messages are then checked for theirs
  recordings?: Recording[],
): Issue[] => {
  const issues: Issue[] = [];
  const add = (issue: Omit<Issue, 'key'>, kind: string) =>
    issues.push({ ...issue, key: `${issue.objectId ?? issue.frameId}|${kind}|${issue.openExit ?? ''}` });
  const byId = new Map(content.objects.map((object) => [object.id, object]));
  // The object's frame, or the board's own flow for objects outside frames
  const frameOf = (object: FlowObject) => flowDetailsOf(content, object.frameId);
  const nameOf = (object: FlowObject) => `“${object.text.trim() || OBJECT_TYPES[object.type].label}”`;
  const outgoing = (id: string) => content.connections.filter((connection) => connection.from === id);
  const targets = new Set(content.connections.map((connection) => connection.to));
  const duplicates = duplicateNames(content);
  // Each flow's names' parts (FlowNaming), by frame (undefined: the board's own flow)
  const choices = new Map<string | undefined, NamingChoices>();
  const choicesOf = (frameId?: string) => {
    if (!choices.has(frameId)) {
      const flowObjects = content.objects.filter((candidate) => candidate.frameId === frameId);
      choices.set(frameId, namingChoicesOf(flowDetailsOf(content, frameId), flowObjects));
    }
    return choices.get(frameId)!;
  };

  content.objects.forEach((object) => {
    const info = OBJECT_TYPES[object.type];
    const frame = frameOf(object);
    const objectId = object.id;
    const name = nameOf(object);

    // Studio name
    studioNameProblems(object, frame).forEach((message, index) =>
      add({ severity: 'error', message: `${name}: ${message}`, objectId }, `name${index}`),
    );
    if (!object.studioName && info.studioPrefix) {
      add({ severity: 'warning', message: `${name} has no Studio name yet.`, objectId }, 'noName');
    }
    // Messages: <prefix><channel>_<language>_<service>_<what it is>, from the flow's parts
    const standard = standardStudioName(object, frame, choicesOf(object.frameId));
    if (standard && standard !== object.studioName) {
      add(
        {
          severity: 'warning',
          message: `${name}: ${object.studioName} isn't named <prefix><channel>_<language>_<service>_…; the standard is ${standard}.`,
          objectId,
        },
        'nameStandard',
      );
    }
    if (duplicates.has(objectId)) {
      add(
        {
          severity: 'error',
          message: `${name}: another object in this flow is also named ${object.studioName}.`,
          objectId,
        },
        'duplicate',
      );
    }

    // Ways out: each one leads to one place, or ends the flow on purpose
    const exits = exitsOf(object);
    const named = exits.filter(Boolean);
    const out = outgoing(objectId);
    const ended = new Set(object.endedExits ?? []);
    if (exits.length === 0) {
      if (out.length > 0) {
        add({ severity: 'error', message: `${name} ends the flow, but a connection leaves it.`, objectId }, 'endsOut');
      }
    } else if (named.length === 0) {
      if (out.length > 1) {
        add(
          { severity: 'error', message: `${name} has one way out but ${out.length} connections leave it.`, objectId },
          'manyOut',
        );
      }
      if (out.length === 0 && !ended.has('')) {
        add({ severity: 'warning', message: `Nothing comes after ${name}.`, objectId, openExit: '' }, 'open');
      }
    } else {
      named.forEach((exit) => {
        const leaving = out.filter((connection) => connection.exit === exit);
        if (leaving.length > 1) {
          add(
            {
              severity: 'error',
              message: `${name}: “${exit}” leads to ${leaving.length} places; it can only lead to one.`,
              objectId,
            },
            `twice-${exit}`,
          );
        }
        // Left unconnected on purpose: "speech" (answers are pressed, rarely said) and Send to
        // Flex's "callFailure" (as in nearly every live flow)
        if (leaving.length === 0 && !ended.has(exit) && !UNCONNECTED_ON_PURPOSE.has(exit.toLowerCase())) {
          add(
            { severity: 'warning', message: `${name}: “${exit}” isn't connected.`, objectId, openExit: exit },
            `open-${exit}`,
          );
        }
      });
      out
        .filter((connection) => !named.includes(connection.exit ?? ''))
        .forEach((connection) =>
          add(
            {
              severity: 'error',
              message: connection.exit
                ? `${name}: a connection leaves by “${connection.exit}”, which it doesn't have any more.`
                : `${name}: a connection doesn't say which way out it is.`,
              objectId,
            },
            `unknownExit-${connection.id}`,
          ),
        );
    }

    // Call settings: valid addresses and JSON
    (info.fields ?? [])
      .filter((field) => fieldShown(field, object.settings))
      .forEach((field) => {
        const problem = fieldProblem(field, object.settings?.[field.key] ?? '');
        if (problem)
          add({ severity: 'error', message: `${name}: ${field.label}: ${problem}`, objectId }, `field-${field.key}`);
      });
    if (object.type === 'function' && !object.studio && !object.settings?.url?.trim()) {
      add({ severity: 'warning', message: `${name} has no address (URL) to call yet.`, objectId }, 'noUrl');
    }
    // What a Set variable sets: something, with keys Studio takes
    if (object.type === 'setVariable' && !object.studio && !object.variables?.some((variable) => variable.key)) {
      add({ severity: 'warning', message: `${name}: add the variables it sets.`, objectId }, 'noVariables');
    }
    (object.variables ?? []).forEach((variable, index) => {
      const problem = variable.key ? variableKeyProblem(variable.key) : 'It has no name (key) yet.';
      if (problem) {
        add(
          {
            severity: variable.key ? 'error' : 'warning',
            message: `${name}: variable ${index + 1}: ${problem}`,
            objectId,
          },
          `variable-${index}`,
        );
      }
    });
    if (object.type === 'repeat' && !object.settings?.maxRepeats?.trim()) {
      add({ severity: 'warning', message: `${name}: set how many times it repeats.`, objectId }, 'noCounter');
    }
    if (object.type === 'chatbot' && !object.studio && !object.settings?.botSuffix?.trim()) {
      add({ severity: 'warning', message: `${name}: choose the chatbot it starts.`, objectId }, 'noChatbot');
    }

    // Incoming contacts check that the system is up before anything else
    if (object.type === 'incoming' && frame?.stage !== 'postqueue') {
      const first = out[0] && byId.get(out[0].to);
      if (first && first.type !== 'systemDown') {
        add(
          {
            severity: 'warning',
            message: `${name} should go to the system-down subflow before anything else.`,
            objectId,
          },
          'systemDown',
        );
      }
    }

    // Reached from somewhere (a post-queue frame can start from its queue)
    const startsPostQueue = object.type === 'sendToQueue' && frame?.stage === 'postqueue';

    // What the task carries to routing (a post-queue frame's queue is the pre-queue one)
    if (object.type === 'sendToQueue' && !startsPostQueue) {
      const problem = object.taskAttributes && taskAttributesProblem(object.taskAttributes.json);
      if (!object.taskAttributes) {
        add({ severity: 'warning', message: `${name} has no task attributes yet.`, objectId }, 'taskAttributes');
      } else if (problem) {
        add(
          { severity: 'error', message: `${name}: its task attributes aren't valid JSON (${problem}).`, objectId },
          'taskAttributes',
        );
      }
    }
    if (!STARTS.has(object.type) && !targets.has(objectId) && !startsPostQueue) {
      add({ severity: 'warning', message: `Nothing leads to ${name}.`, objectId }, 'unreachable');
    }

    // The language in the name is the message's (play_message_voice_es_... for Spanish); not for a template
    // several flows share in different languages, where one widget plays each flow's
    const language = object.message?.language?.trim().toLowerCase();
    const sharedByVariants = !object.frameId && (content.flow?.variants?.length ?? 0) > 1;
    if (
      info.hasMessage &&
      language &&
      object.studioName &&
      !sharedByVariants &&
      !object.studioName.split('_').includes(language)
    ) {
      add(
        { severity: 'warning', message: `${name} is in “${language}”, but its Studio name doesn't say so.`, objectId },
        'language',
      );
    }

    if (info.hasMessage && !object.message?.script?.trim()) {
      add({ severity: 'warning', message: `${name} has no script yet.`, objectId }, 'noScript');
    }
    // Recordings named after their widget (the standard); older helplines' may not be
    if (hasNonStandardRecording(object)) {
      add(
        {
          severity: 'warning',
          message: `${name} plays ${object.message!.recordingFile}, not a file named after it (${object.studioName}).`,
          objectId,
        },
        'oldRecordingName',
      );
    }
    // Flows sharing the template: each other one's script, where the message is its own
    if (info.hasMessage && !object.frameId && variesByVariant(object)) {
      (content.flow?.variants ?? []).slice(1).forEach((variant) => {
        if (!object.variantMessages?.[variant.key]?.script?.trim()) {
          add(
            { severity: 'warning', message: `${variant.label}: ${name} has no script yet.`, objectId },
            `noScript-${variant.key}`,
          );
        }
      });
    }

    // What's left before callers hear it (voice) or before it's sent (messaging)
    if (info.hasMessage && isVoiceMessage(object, frame)) {
      const status = recordings && object.studioName ? messageStatus(object, frame, recordings) : undefined;
      const left: Partial<Record<string, string>> = {
        'No script': `${name} has no recording yet.`,
        'Script ready': `${name} has no recording yet.`,
        Recorded: `${name}: its recording is waiting for Aselo staff to approve it.`,
        Approved: `${name}: its recording is approved but not published to production yet.`,
      };
      if (status && left[status]) add({ severity: 'warning', message: left[status]!, objectId }, 'recording');
    } else if (info.hasMessage && messageStatus(object, frame) === 'Script ready') {
      add({ severity: 'warning', message: `${name}: its script isn't approved yet.`, objectId }, 'scriptApproval');
    }

    // A menu that can come back to itself needs a counter (Repeat) on the way, so callers
    // can't go round for ever
    if (object.type === 'menuVoice' || object.type === 'questionMessaging') {
      const seen = new Set<string>();
      const queue = out.map((connection) => connection.to);
      let loops = false;
      while (queue.length > 0 && !loops) {
        const id = queue.shift()!;
        if (id === objectId) loops = true;
        const next = byId.get(id);
        if (seen.has(id) || !next || next.type === 'setVariable' || next.type === 'repeat') continue;
        seen.add(id);
        queue.push(...outgoing(id).map((connection) => connection.to));
      }
      if (loops) {
        add(
          {
            severity: 'warning',
            message: `${name} can repeat for ever: add a Repeat (counter) and a way out after a few tries.`,
            objectId,
          },
          'loop',
        );
      }
    }
  });

  content.frames
    .filter((frame) => !frame.channel && content.objects.some((object) => object.frameId === frame.id))
    .forEach((frame) =>
      add(
        {
          severity: 'warning',
          message: `Frame “${frame.title}” doesn't say which channel it's for, so the export can't tell which Studio flow it belongs to.`,
          frameId: frame.id,
        },
        'frameChannel',
      ),
    );

  return [
    ...issues.filter((issue) => issue.severity === 'error'),
    ...issues.filter((issue) => issue.severity === 'warning'),
  ];
};

// The issues on each object, for its badge and settings
/**
 * The board's warnings split into those still to look at and those marked as not needed for this
 * board. Only warnings can be ignored: errors are mistakes.
 */
export const splitIgnored = (issues: Issue[], ignoredKeys: string[] = []) => {
  const ignored = new Set(ignoredKeys);
  const isIgnored = (issue: Issue) => issue.severity === 'warning' && ignored.has(issue.key);
  return { active: issues.filter((issue) => !isIgnored(issue)), ignored: issues.filter(isIgnored) };
};

export const issuesByObject = (issues: Issue[]): Map<string, Issue[]> => {
  const result = new Map<string, Issue[]>();
  issues.forEach((issue) => {
    if (issue.objectId) result.set(issue.objectId, [...(result.get(issue.objectId) ?? []), issue]);
  });
  return result;
};

/**
 * Problems with each object, by object id: its Studio name (missing, or breaking the standards),
 * and names used twice in a flow.
 */
export const objectProblems = (content: Pick<BoardContent, 'objects' | 'frames' | 'flow'>): Map<string, string[]> => {
  const duplicates = duplicateNames(content);
  const problems = new Map<string, string[]>();
  content.objects.forEach((object) => {
    const frame = flowDetailsOf(content, object.frameId);
    const found = studioNameProblems(object, frame);
    // Everything that becomes a Studio widget needs a name (its recording's too, for voice)
    if (!object.studioName && OBJECT_TYPES[object.type].studioPrefix) found.push('No Studio name yet.');
    if (duplicates.has(object.id)) found.push(`Another object in this flow is also named ${object.studioName}.`);
    if (found.length > 0) problems.set(object.id, found);
  });
  return problems;
};
