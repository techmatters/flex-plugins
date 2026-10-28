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
 * standards"). Problems are shown on the objects and in their settings; they never stop saving,
 * since a board is a design in progress.
 */
import type { BoardContent, FlowObject, Frame } from './model';
import { OBJECT_TYPES } from './model';

const POSTQUEUE = 'postqueue_';

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

/**
 * Problems with each object, by object id: its Studio name (missing, or breaking the standards),
 * and names used twice in a flow.
 */
export const objectProblems = (content: Pick<BoardContent, 'objects' | 'frames'>): Map<string, string[]> => {
  const duplicates = duplicateNames(content);
  const problems = new Map<string, string[]>();
  content.objects.forEach((object) => {
    const frame = content.frames.find((candidate) => candidate.id === object.frameId);
    const found = studioNameProblems(object, frame);
    // Everything that becomes a Studio widget needs a name (its recording's too, for voice)
    if (!object.studioName && OBJECT_TYPES[object.type].studioPrefix) found.push('No Studio name yet.');
    if (duplicates.has(object.id)) found.push(`Another object in this flow is also named ${object.studioName}.`);
    if (found.length > 0) problems.set(object.id, found);
  });
  return problems;
};
