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
import { objectProblems, studioNameProblems, uniqueName } from './checks';

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
