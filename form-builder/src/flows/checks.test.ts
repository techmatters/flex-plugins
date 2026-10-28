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

import { describe, expect, test } from 'vitest';
import type { FlowObject, Frame } from './model';
import { boardChecks, objectProblems, studioNameProblems, uniqueName } from './checks';
import type { Connection } from './model';

const object = (id: string, type: FlowObject['type'], studioName?: string, frameId?: string): FlowObject => ({
  id,
  type,
  studioName,
  frameId,
  text: id,
  x: 0,
  y: 0,
  width: 100,
  height: 60,
});

const frame = (id: string, channel?: Frame['channel'], stage?: Frame['stage']): Frame => ({
  id,
  title: id,
  channel,
  stage,
  x: 0,
  y: 0,
  width: 900,
  height: 600,
});

describe('Studio names', () => {
  test('follow the standards: prefix, lower case with underscores', () => {
    expect(studioNameProblems({ type: 'decision', studioName: 'split_contact_routing' })).toEqual([]);
    expect(studioNameProblems({ type: 'playMessage', studioName: 'play_message_voice_en_welcome' })).toEqual([]);
    expect(studioNameProblems({ type: 'sendToQueue', studioName: 'send_to_queue' })).toEqual([]);
    expect(studioNameProblems({ type: 'sendToQueue', studioName: 'send_to_queue_es_tya' })).toEqual([]);
    expect(studioNameProblems({ type: 'forwardCall', studioName: 'connect_to_988' })).toEqual([]);
    expect(studioNameProblems({ type: 'decision', studioName: undefined })).toEqual([]);

    expect(studioNameProblems({ type: 'decision', studioName: 'splitsAABBwrong' })).toEqual([
      'Use lower case with underscores. camelCase is only for function names, after f_.',
      'Decision names start with split_.',
    ]);
    expect(studioNameProblems({ type: 'decision', studioName: 'split_Language' })).toEqual([
      'Use lower case with underscores. camelCase is only for function names, after f_.',
    ]);
    expect(studioNameProblems({ type: 'playMessage', studioName: 'play message welcome' })[0]).toMatch(/only letters/);
    expect(studioNameProblems({ type: 'decision', studioName: 'split__language_' })).toEqual([
      'No double or trailing underscores.',
    ]);
  });

  test('camelCase only for functions, after f_; HTTP requests can be http_get_ / http_post_', () => {
    expect(studioNameProblems({ type: 'checkClientProfile', studioName: 'f_getProfileFlagsForIdentifier' })).toEqual(
      [],
    );
    expect(studioNameProblems({ type: 'function', studioName: 'f_sendMessageAndRunJanitor_blocked' })).toEqual([]);
    expect(studioNameProblems({ type: 'function', studioName: 'http_post_webhook_notify_failed_to_enqueue' })).toEqual(
      [],
    );
    expect(studioNameProblems({ type: 'checkOperatingHours', studioName: 'f_OperatingHours' })[0]).toMatch(/camelCase/);
    expect(studioNameProblems({ type: 'checkOperatingHours', studioName: 'operatingHours' })).toContain(
      'Check operating hours names start with f_.',
    );
  });

  test('after the queue, names start with postqueue_', () => {
    const postqueue = { stage: 'postqueue' as const };
    expect(studioNameProblems({ type: 'decision', studioName: 'postqueue_split_language' }, postqueue)).toEqual([]);
    expect(studioNameProblems({ type: 'decision', studioName: 'split_language' }, postqueue)).toEqual([
      'Everything after the queue starts with postqueue_.',
    ]);
    expect(
      studioNameProblems({ type: 'checkOperatingHours', studioName: 'postqueue_f_operatingHours' }, postqueue),
    ).toEqual([]);
  });

  test('are needed by everything that becomes a Studio widget', () => {
    const content = {
      frames: [],
      objects: [
        object('a', 'decision'),
        object('b', 'end'),
        object('c', 'chatbot'),
        object('d', 'checkWorkerLoggedIn'),
      ],
    };
    const problems = objectProblems(content);
    expect([...problems.keys()].sort()).toEqual(['a', 'd']);
    expect(problems.get('a')).toEqual(['No Studio name yet.']);
  });

  test('are unique within a Studio flow: frames with the same channel are one flow', () => {
    const content = {
      frames: [frame('voice-pre', 'voice', 'prequeue'), frame('voice-post', 'voice', 'postqueue'), frame('sms', 'sms')],
      objects: [
        object('a', 'playMessage', 'play_message_voice_en_welcome', 'voice-pre'),
        object('b', 'playMessage', 'play_message_voice_en_welcome', 'voice-post'),
        // Same name in another flow is fine
        object('c', 'sendToQueue', 'send_to_queue', 'voice-pre'),
        object('d', 'sendToQueue', 'send_to_queue', 'sms'),
      ],
    };
    const problems = objectProblems(content);
    expect([...problems.keys()].sort()).toEqual(['a', 'b']);
    expect(problems.get('a')).toContain('Another object in this flow is also named play_message_voice_en_welcome.');

    expect(uniqueName('play_message_voice_en_welcome', { id: 'new', frameId: 'voice-post' }, content)).toBe(
      'play_message_voice_en_welcome_2',
    );
    expect(uniqueName('play_message_voice_en_welcome', { id: 'new', frameId: 'sms' }, content)).toBe(
      'play_message_voice_en_welcome',
    );
    // An object keeps its own name
    expect(uniqueName('send_to_queue', { id: 'c', frameId: 'voice-pre' }, content)).toBe('send_to_queue');
  });
});

const named = (
  id: string,
  type: FlowObject['type'],
  frameId?: string,
  extra: Partial<FlowObject> = {},
): FlowObject => ({
  ...object(id, type, `${type === 'checkOperatingHours' || type === 'function' ? 'f_x' : ''}`, frameId),
  ...extra,
});

let connectionCount = 0;
const connect = (from: string, to: string, exit?: string): Connection => {
  connectionCount += 1;
  return { id: `c${connectionCount}`, from, to, ...(exit ? { exit } : {}) };
};

const messagesOf = (content: Parameters<typeof boardChecks>[0]) => boardChecks(content).map((issue) => issue.message);

describe('the board check', () => {
  test('finds ways out that lead nowhere, unless the flow ends there on purpose', () => {
    const content = {
      frames: [frame('voice', 'voice')],
      objects: [
        named('in', 'incoming', 'voice', { text: 'Call' }),
        named('down', 'systemDown', 'voice', { text: 'System down', studioName: 'run_subflow_system_down' }),
        named('lang', 'decision', 'voice', { text: 'Is English?', studioName: 'split_language', exits: ['Yes', 'No'] }),
        named('bye', 'playMessage', 'voice', {
          text: 'Goodbye',
          studioName: 'play_message_voice_en_goodbye',
          message: { channel: 'voice', script: 'Bye' },
        }),
      ],
      connections: [connect('in', 'down'), connect('down', 'lang'), connect('lang', 'bye', 'Yes')],
    };
    expect(messagesOf(content)).toEqual(["“Is English?”: “No” isn't connected.", 'Nothing comes after “Goodbye”.']);

    const ended = {
      ...content,
      objects: content.objects.map((item) =>
        item.id === 'lang' ? { ...item, endedExits: ['No'] } : item.id === 'bye' ? { ...item, endedExits: [''] } : item,
      ),
    };
    expect(messagesOf(ended)).toEqual([]);
  });

  test('a way out leads to one place, and connections only use ways out the object has', () => {
    const content = {
      frames: [],
      objects: [
        named('a', 'decision', undefined, {
          text: 'A',
          studioName: 'split_a',
          exits: ['Yes', 'No'],
          endedExits: ['No'],
        }),
        named('b', 'end', undefined, { text: 'B' }),
        named('c', 'end', undefined, { text: 'C' }),
      ],
      connections: [connect('a', 'b', 'Yes'), connect('a', 'c', 'Yes'), connect('a', 'b', 'Maybe'), connect('b', 'c')],
    };
    const issues = boardChecks(content);
    expect(issues.filter((issue) => issue.severity === 'error').map((issue) => issue.message)).toEqual([
      '“A”: “Yes” leads to 2 places; it can only lead to one.',
      "“A”: a connection leaves by “Maybe”, which it doesn't have any more.",
      '“B” ends the flow, but a connection leaves it.',
    ]);
  });

  test('incoming contacts go to the system-down subflow first; failures need no notification object', () => {
    const content = {
      frames: [],
      objects: [
        named('in', 'incoming', undefined, { text: 'Call' }),
        named('q', 'sendToQueue', undefined, { text: 'Queue', studioName: 'send_to_queue' }),
        named('sorry', 'end', undefined, { text: 'End' }),
        named('wait', 'wait', undefined, { text: 'Wait' }),
      ],
      connections: [connect('in', 'q'), connect('q', 'wait', 'post-queue'), connect('q', 'sorry', 'failed to enqueue')],
    };
    expect(messagesOf(content)).toEqual([
      '“Call” should go to the system-down subflow before anything else.',
      // Failures (here "failed to enqueue") are notified through Datadog, not in the flow
      'Nothing comes after “Wait”.',
    ]);

    const fixed = {
      ...content,
      objects: [
        ...content.objects,
        named('down', 'systemDown', undefined, {
          text: 'Down',
          studioName: 'run_subflow_system_down',
          endedExits: [''],
        }),
      ],
      connections: [
        connect('in', 'down'),
        connect('down', 'q'),
        connect('q', 'wait', 'post-queue'),
        connect('q', 'sorry', 'failed to enqueue'),
        connect('wait', 'sorry'),
      ],
    };
    expect(messagesOf(fixed)).toEqual([]);
  });

  test('flags objects nothing leads to, missing scripts, menus that repeat for ever and frames without a channel', () => {
    const content = {
      frames: [frame('f1')],
      objects: [
        named('menu', 'menuVoice', 'f1', {
          text: 'Menu',
          studioName: 'gather_input_voice_en_menu',
          exits: ['1'],
          message: { channel: 'voice', script: 'Press 1' },
        }),
        named('again', 'playMessage', 'f1', { text: 'Again', studioName: 'play_message_voice_en_again' }),
        named('lost', 'setVariable', 'f1', { text: 'Lost', studioName: 'set_var_lost', endedExits: [''] }),
      ],
      connections: [connect('again', 'menu'), connect('menu', 'again', '1')],
    };
    expect(messagesOf(content)).toEqual([
      '“Menu” can repeat for ever: add a counter (Set variable) and a way out after a few tries.',
      '“Again” has no script yet.',
      'Nothing leads to “Lost”.',
      "Frame “f1” doesn't say which channel it's for, so the export can't tell which Studio flow it belongs to.",
    ]);
  });
});

test("a message's Studio name says its language", () => {
  const message = (studioName: string): FlowObject =>
    named('m', 'playMessage', undefined, {
      text: 'Closed',
      studioName,
      message: { language: 'es', script: 'Cerrado' },
      endedExits: [''],
    });
  const check = (studioName: string) =>
    messagesOf({ frames: [], objects: [message(studioName)], connections: [] }).filter((text) => text.includes('“es”'));
  expect(check('play_message_voice_es_closed')).toEqual([]);
  expect(check('play_message_voice_en_closed')).toEqual(["“Closed” is in “es”, but its Studio name doesn't say so."]);
});
