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
 * A flow's channels, languages and services (warned about when not set), the channel a Skilled
 * worker available? check asks about when not chosen, and new boards with one flow per language
 * sharing their template.
 */

import { describe, expect, test } from 'vitest';
import type { BoardContent, FlowObject } from '../src/flows/model';
import { emptyBoard, flowChannelOf, namingChoicesOf, sharedLanguageVariants } from '../src/flows/model';
import { boardChecks } from '../src/flows/checks';
import { toStudioFlow } from '../src/flows/studioTemplate';

const object = (id: string, type: FlowObject['type'], extra: Partial<FlowObject> = {}): FlowObject => ({
  id,
  type,
  text: id,
  x: 100,
  y: 100,
  width: 200,
  height: 70,
  ...extra,
});

const namingWarnings = (content: Pick<BoardContent, 'objects' | 'frames' | 'connections' | 'flow'>) =>
  boardChecks(content)
    .filter((issue) => issue.key.includes('|naming-'))
    .map((issue) => issue.message);

describe('a flow says its channels, languages and services', () => {
  test('not saying them is a warning (for each flow with widgets), one that can be ignored', () => {
    const content = {
      ...emptyBoard('New'),
      frames: [{ id: 'f', title: 'Voice', x: 0, y: 0, width: 900, height: 600, channel: 'voice' as const }],
      objects: [object('a', 'playMessage', { frameId: 'f' }), object('b', 'end')],
    };
    expect(namingWarnings(content)).toEqual([
      "The board doesn't say its channels (Names in its settings). Ignore this if it doesn't apply.",
      "The board doesn't say its languages (Names in its settings). Ignore this if it doesn't apply.",
      "The board doesn't say its services (Names in its settings). Ignore this if it doesn't apply.",
      // The frame's channel is its channel
      "Frame “Voice” doesn't say its languages (Names in its settings). Ignore this if it doesn't apply.",
      "Frame “Voice” doesn't say its services (Names in its settings). Ignore this if it doesn't apply.",
    ]);
    const said = {
      ...content,
      flow: { naming: { channels: ['sms'], languages: ['en', 'es'], services: ['childhelp'] } },
      frames: [{ ...content.frames[0], naming: { languages: ['en'], services: ['childhelp'] } }],
    };
    expect(namingWarnings(said)).toEqual([]);
    // A flow per language: its languages are its flows
    expect(
      namingWarnings({
        ...content,
        frames: [],
        flow: { naming: { channels: ['voice'], services: ['x'] }, variants: sharedLanguageVariants('Survey', ['en']) },
      }),
    ).toEqual([]);
  });

  test("a flow's channel: its own, otherwise its names' (voice only when they're all voice)", () => {
    expect(flowChannelOf({ channel: 'sms', naming: { channels: ['voice'] } })).toBe('sms');
    expect(flowChannelOf({ naming: { channels: ['voice'] } })).toBe('voice');
    expect(flowChannelOf({ naming: { channels: ['voice', 'webchat'] } })).toBe('webchat');
    expect(flowChannelOf({})).toBeUndefined();
  });
});

describe('Skilled worker available? asks about the flow’s channel when none is chosen', () => {
  const check = (extra: Partial<FlowObject> = {}) =>
    object('check', 'checkQueueAvailability', {
      frameId: 'f',
      studioName: 'f_isSkilledWorkerAvailable_spanish',
      settings: { targetSkills: 'ChatText,Spanish' },
      ...extra,
    });
  const bodyOf = (channel: 'voice' | 'sms' | undefined, checked = check()) => {
    const content = {
      ...emptyBoard('New'),
      frames: [{ id: 'f', title: 'Flow', x: 0, y: 0, width: 900, height: 600, ...(channel ? { channel } : {}) }],
      objects: [checked],
    };
    const { flow, todo } = toStudioFlow(content, content.frames[0]);
    return { body: JSON.parse(String(flow.states[0].properties.body)), todo, content };
  };

  test('chat in a messaging flow, voice in a voice flow, as chosen when chosen', () => {
    expect(bodyOf('sms').body).toEqual({ targetSkills: 'ChatText,Spanish', targetChannel: 'chat' });
    expect(bodyOf('voice').body).toEqual({ targetSkills: 'ChatText,Spanish', targetChannel: 'voice' });
    expect(
      bodyOf('sms', check({ settings: { targetSkills: 'ChatText,Spanish', targetChannel: 'voice' } })).body
        .targetChannel,
    ).toBe('voice');
  });

  test("a flow that doesn't say its channel: an error to fix on the board, a TODO in the export", () => {
    const { body, todo, content } = bodyOf(undefined);
    expect(body.targetChannel).toBe('TODO');
    expect(todo).toContain('“f_isSkilledWorkerAvailable_spanish”: set its channel (voice or chat).');
    expect(boardChecks(content).map((issue) => issue.message)).toContain('“check”: set its channel.');
    expect(boardChecks(bodyOf('sms').content).map((issue) => issue.message)).not.toContain('“check”: set its channel.');
  });
});

describe('a new board with one flow per language, sharing its template', () => {
  test('a flow per language, named after the board; widgets’ names have no language', () => {
    const variants = sharedLanguageVariants('Post call survey', ['en', 'es']);
    expect(variants).toEqual([
      { key: 'post_call_survey_en', label: 'English', recordingsFolder: 'post_call_survey_en', added: true },
      { key: 'post_call_survey_es', label: 'Spanish', recordingsFolder: 'post_call_survey_es', added: true },
    ]);
    const messages = [object('m', 'sendMessage', { message: { channel: 'sms', language: 'en' } })];
    expect(namingChoicesOf({ naming: { languages: ['en', 'es'] } }, messages).languages).toEqual(['en', 'es']);
    expect(namingChoicesOf({ naming: { languages: ['en', 'es'] }, variants }, messages).languages).toEqual([]);
  });

  test("each flow's texts go in its own flow_vars; one not written yet gets the first flow's", () => {
    const content: BoardContent = {
      ...emptyBoard('Survey'),
      flow: { channel: 'sms', variants: sharedLanguageVariants('Survey', ['en', 'es', 'fr']) },
      objects: [
        object('thanks', 'sendMessage', {
          studioName: 'send_message_sms_thanks',
          settings: { from: 'Bot' },
          message: { channel: 'sms', language: 'en', script: 'Thank you' },
          variantMessages: { survey_es: { language: 'es', script: 'Gracias' }, survey_fr: { language: 'fr' } },
        }),
      ],
    };
    const { flowVars, todo } = toStudioFlow(content);
    expect(flowVars.map(({ name, value, flow }) => ({ name, value, flow }))).toEqual([
      { name: 'send_message_sms_thanks', value: 'Thank you', flow: 'survey_en' },
      { name: 'send_message_sms_thanks', value: 'Gracias', flow: 'survey_es' },
      { name: 'send_message_sms_thanks', value: 'Thank you', flow: 'survey_fr' },
    ]);
    expect(todo).toContain('“send_message_sms_thanks” has no French text yet: survey_fr gets the English one.');
  });
});
