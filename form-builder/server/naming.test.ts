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
 * Message widgets' names: <prefix><channel>_<language>_<service>_<what it is>, from the channels,
 * languages and services set for the flow (FlowNaming); renaming keeps the recording playing.
 */
import { describe, expect, test } from 'vitest';
import type { BoardContent, FlowObject } from '../src/flows/model';
import {
  composeName,
  emptyBoard,
  nameParts,
  namingChoicesOf,
  standardStudioName,
  suggestStudioName,
} from '../src/flows/model';
import { boardChecks } from '../src/flows/checks';
import { hasNonStandardRecording, withStudioName } from '../src/flows/recordings';

const choices = { channels: ['voice'], languages: ['en', 'es'], services: ['childhelp', 'tya_calls'] };

const object = (id: string, type: FlowObject['type'], extra: Partial<FlowObject> = {}): FlowObject => ({
  id,
  type,
  text: id,
  x: 0,
  y: 0,
  width: 200,
  height: 70,
  ...extra,
});

describe('names by parts', () => {
  test('a name is its prefix, channel, language, service and what it is', () => {
    const parts = nameParts('gather_input_voice_en_childhelp_service_menu', 'gather_input_', choices);
    expect(parts).toEqual({
      postqueue: false,
      prefix: 'gather_input_',
      channel: 'voice',
      language: 'en',
      service: 'childhelp',
      rest: 'service_menu',
    });
    expect(composeName(parts!)).toBe('gather_input_voice_en_childhelp_service_menu');
    // Every part is optional; services may be several words
    expect(nameParts('postqueue_play_message_tya_calls_wait', 'play_message_', choices)).toMatchObject({
      postqueue: true,
      channel: undefined,
      language: undefined,
      service: 'tya_calls',
      rest: 'wait',
    });
    expect(nameParts('childhelp_voice_welcome', 'play_message_', choices)).toBeUndefined();
  });

  test("the flow's choices: as set, otherwise its channel and its messages' languages", () => {
    const messages: Pick<FlowObject, 'type' | 'message'>[] = [
      { type: 'sendMessage', message: { language: 'es', channel: 'sms' } },
      { type: 'playMessage', message: { language: 'en' } },
      { type: 'decision' },
    ];
    expect(namingChoicesOf({ channel: 'voice' }, messages)).toEqual({
      channels: ['voice'],
      languages: ['en', 'es'],
      services: [],
    });
    expect(namingChoicesOf({ channel: 'sms', naming: { channels: ['sms', 'webchat'] } }, messages).channels).toEqual([
      'sms',
      'webchat',
    ]);
    // No channel for the flow: its messages' (a voice-only kind's is voice)
    expect(namingChoicesOf(undefined, messages).channels).toEqual(['sms', 'voice']);
  });

  test('new names take the flow’s only service (and channel, language)', () => {
    const menu = object('Service menu', 'menuVoice', { message: { channel: 'voice', language: 'en' } });
    expect(suggestStudioName(menu, { channel: 'voice' }, { ...choices, services: ['childhelp'] })).toBe(
      'gather_input_voice_en_childhelp_service_menu',
    );
  });

  test('older names get the standard one, parts found anywhere in them, in order', () => {
    const welcome = object('Welcome', 'playMessage', {
      studioName: 'play_message_childhelp_voice_welcome',
      message: { channel: 'voice', language: 'en' },
    });
    expect(standardStudioName(welcome, { channel: 'voice' }, choices)).toBe('play_message_voice_en_childhelp_welcome');
    // A shorter prefix (gather_...) and the flow's only language
    const menu = object('Menu', 'menuVoice', { studioName: 'gather_childhelp_menu', message: { channel: 'voice' } });
    expect(standardStudioName(menu, { channel: 'voice' }, { ...choices, languages: ['en'] })).toBe(
      'gather_input_voice_en_childhelp_menu',
    );
    // Already standard: the same
    const good = { ...welcome, studioName: 'play_message_voice_en_childhelp_welcome' };
    expect(standardStudioName(good, { channel: 'voice' }, choices)).toBe(good.studioName);
    // Not a message: not named by parts
    expect(standardStudioName(object('d', 'decision', { studioName: 'x' }), undefined, choices)).toBeUndefined();
  });

  test('a renamed message keeps playing its recording until it is copied to the new name', () => {
    const recordings = [{ fileName: 'play_message_childhelp_voice_welcome.mp3' }] as never[];
    const welcome = object('Welcome', 'playMessage', {
      studioName: 'play_message_childhelp_voice_welcome',
      message: { channel: 'voice', script: 'Hi' },
    });
    const renamed = withStudioName(welcome, 'play_message_voice_en_childhelp_welcome', recordings);
    expect(renamed.message).toEqual({
      channel: 'voice',
      script: 'Hi',
      recordingFile: 'play_message_childhelp_voice_welcome.mp3',
    });
    expect(hasNonStandardRecording(renamed)).toBe(true);
    // Named back: nothing to keep
    expect(withStudioName(renamed, welcome.studioName, recordings).message).toEqual({ channel: 'voice', script: 'Hi' });
    // An imported widget's file, from what it plays
    const imported = {
      ...welcome,
      studio: { name: 'x', type: 'say-play', properties: { play: '${flow_vars.recordings}/old_welcome.wav' } },
    };
    expect(withStudioName(imported, 'play_message_voice_welcome').message?.recordingFile).toBe('old_welcome.wav');
    // No recording: just the name
    expect(withStudioName(object('m', 'sendMessage', { message: { script: 'Hi' } }), 'send_message_x').message).toEqual(
      {
        script: 'Hi',
      },
    );
  });

  test("the check points out names that don't follow it, with the standard one", () => {
    const content: BoardContent = {
      ...emptyBoard('Names'),
      flow: { channel: 'voice', naming: { services: ['childhelp'] } },
      objects: [
        object('in', 'incoming', { message: { channel: 'voice' } }),
        object('Welcome', 'playMessage', {
          studioName: 'play_message_childhelp_voice_en_welcome',
          message: { channel: 'voice', language: 'en' },
        }),
      ],
    };
    expect(boardChecks(content).map((issue) => issue.message)).toContainEqual(
      expect.stringContaining('the standard is play_message_voice_en_childhelp_welcome'),
    );
  });
});
