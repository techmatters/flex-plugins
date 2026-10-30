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
 * The menu's ways out (Studio's: keypress, speech, timeout), Repeat (a counter and a split, like
 * usnm's set_var_en_service_counter and split_end_cycle_en_service) and Chatbot (a
 * captureChannelWithBot request), new and imported.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';
import type { BoardContent, FlowObject } from '../src/flows/model';
import { emptyBoard, exitsOf, upgradeContent } from '../src/flows/model';
import { boardChecks } from '../src/flows/checks';
import { toStudioFlow } from '../src/flows/studioTemplate';
import { importHelpline } from './flowImport';

const helplinesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../twilio-iac/helplines');

const object = (id: string, type: FlowObject['type'], extra: Partial<FlowObject> = {}): FlowObject => ({
  id,
  type,
  frameId: 'f',
  text: id,
  x: 100,
  y: 100,
  width: 200,
  height: 70,
  ...extra,
});
const connect = (from: string, to: string, exit?: string) => ({ id: `${from}-${to}-${exit}`, from, to, exit });
const board = (channel: 'voice' | 'webchat', objects: FlowObject[], connections: BoardContent['connections']) => ({
  ...emptyBoard('New'),
  frames: [{ id: 'f', title: 'Flow', x: 0, y: 0, width: 900, height: 600, channel }],
  objects,
  connections,
});

describe('menus, repeats and chatbots', () => {
  test("a new menu's ways out are Studio's: keypress, speech and timeout", () => {
    const menu = object('menu', 'menuVoice', {
      studioName: 'gather_input_voice_en_service',
      message: { channel: 'voice', language: 'en', script: 'Press 1 or 2' },
    });
    expect(exitsOf(menu)).toEqual(['keypress', 'speech', 'timeout']);
    const content = board(
      'voice',
      [
        menu,
        object('options', 'decision', { studioName: 'split_service' }),
        object('again', 'playMessage', { studioName: 'play_message_voice_en_again' }),
      ],
      [connect('menu', 'options', 'keypress'), connect('menu', 'again', 'timeout')],
    );
    const [gather, ...rest] = toStudioFlow(content, content.frames[0]).flow.states;
    expect(gather.transitions).toEqual([
      { event: 'keypress', next: 'split_service' },
      { event: 'speech' },
      { event: 'timeout', next: 'play_message_voice_en_again' },
    ]);
    // No split of its own: the Decision after it tells the options apart
    expect(rest.map((state) => state.name)).toEqual(['split_service', 'play_message_voice_en_again']);
  });

  test('a repeat is a counter and a split on it: back round until it has repeated enough', () => {
    const content = board(
      'voice',
      [
        object('menu', 'menuVoice', {
          studioName: 'gather_input_voice_en_service',
          message: { channel: 'voice', language: 'en', script: 'Press 1 or 2' },
        }),
        object('loop', 'repeat', {
          studioName: 'set_var_en_service_counter',
          settings: { counter: 'en_service_counter', maxRepeats: '2' },
        }),
        object('queue', 'playMessage', { studioName: 'play_message_voice_en_prequeue_std' }),
      ],
      [
        connect('menu', 'loop', 'timeout'),
        connect('loop', 'menu', 'repeat'),
        connect('loop', 'queue', 'max reached'),
        connect('queue', 'menu'),
      ],
    );
    const { flow, todo } = toStudioFlow(content, content.frames[0]);
    const state = (name: string) => flow.states.find((candidate) => candidate.name === name);
    expect(state('set_var_en_service_counter')).toMatchObject({
      type: 'set-variables',
      transitions: [{ event: 'next', next: 'split_end_cycle_en_service' }],
      properties: {
        variables: [
          {
            type: 'string',
            key: 'en_service_counter',
            value:
              '{% if flow.variables.en_service_counter %}{{flow.variables.en_service_counter | plus: 1}}{% else %}1{% endif %}',
          },
        ],
      },
    });
    expect(state('split_end_cycle_en_service')).toMatchObject({
      type: 'split-based-on',
      transitions: [
        { event: 'noMatch', next: 'gather_input_voice_en_service' },
        {
          event: 'match',
          next: 'play_message_voice_en_prequeue_std',
          conditions: [{ type: 'greater_than', value: '2', arguments: ['{{flow.variables.en_service_counter}}'] }],
        },
      ],
      properties: { input: '{{flow.variables.en_service_counter}}' },
    });
    expect(todo.join('\n')).not.toMatch(/Repeat|counter/);
    // The menu goes round through the counter, so it doesn't repeat for ever
    expect(boardChecks(content).map((issue) => issue.message)).not.toContainEqual(
      expect.stringContaining('can repeat for ever'),
    );

    const unset = { ...content, objects: content.objects.map((o) => (o.id === 'loop' ? { ...o, settings: {} } : o)) };
    expect(boardChecks(unset).map((issue) => issue.message)).toContainEqual(
      expect.stringContaining('set its counter and how many times it repeats.'),
    );
  });

  test('boards with the old "Wait / repeat" open with a Repeat, its way out the way back round', () => {
    const old = {
      ...board(
        'voice',
        [{ ...object('wait', 'repeat'), type: 'wait' as FlowObject['type'] }, object('menu', 'menuVoice')],
        [connect('wait', 'menu')],
      ),
    };
    const upgraded = upgradeContent(old);
    expect(upgraded.objects[0].type).toBe('repeat');
    expect(upgraded.connections[0].exit).toBe('repeat');
    const current = board('voice', [object('menu', 'menuVoice')], []);
    expect(upgradeContent(current)).toBe(current);
  });

  test('a chatbot calls captureChannelWithBot with the bot chosen', () => {
    const content = board(
      'webchat',
      [
        object('bot', 'chatbot', {
          studioName: 'f_captureChannelWithBot_pre_survey',
          settings: {
            botSuffix: 'pre_survey',
            language: 'en-USCH',
            triggerType: 'withUserMessage',
            message: 'trigger_pre_survey',
            releaseType: 'triggerStudioFlow',
            releaseFlag: 'preSurveyComplete',
          },
        }),
      ],
      [],
    );
    const { flow, todo } = toStudioFlow(content, content.frames[0]);
    const [request] = flow.states;
    expect(request).toMatchObject({
      name: 'f_captureChannelWithBot_pre_survey',
      type: 'make-http-request',
      properties: {
        method: 'POST',
        add_twilio_auth: false,
        url: '${lambda_twilio_account_scoped_url}/channelCapture/captureChannelWithBot',
      },
    });
    expect(JSON.parse(String(request.properties.body))).toMatchObject({
      channelSid: '{{flow.channel.address}}',
      isConversation: 'true',
      message: 'trigger_pre_survey',
      studioFlowSid: '{{flow.flow_sid}}',
      language: 'en-USCH',
      botSuffix: 'pre_survey',
      triggerType: 'withUserMessage',
      releaseType: 'triggerStudioFlow',
      releaseFlag: 'preSurveyComplete',
    });
    expect(todo.join('\n')).not.toMatch(/captureChannelWithBot/);
  });

  test('imported captureChannelWithBot requests are chatbots, their settings as written (variables kept)', async () => {
    const { boards } = await importHelpline(helplinesDir, 'usch');
    const bots = boards.flatMap(({ content }) => content.objects.filter((candidate) => candidate.type === 'chatbot'));
    expect(bots.length).toBeGreaterThan(0);
    expect(bots[0].settings).toMatchObject({ botSuffix: 'pre_survey', language: 'en-USCH' });
  });
});
