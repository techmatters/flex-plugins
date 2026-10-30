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
 * usnm's set_var_en_service_counter and split_en_service) and Chatbot (a
 * captureChannelWithBot request), new and imported.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';
import type { BoardContent, FlowObject } from '../src/flows/model';
import { emptyBoard, exitsOf, repeatWidgetNames, suggestStudioName, upgradeContent } from '../src/flows/model';
import { janitorValuesOf } from '../src/flows/janitor';
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
          studioName: 'repeat_en_service',
          settings: { maxRepeats: '2' },
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
      transitions: [{ event: 'next', next: 'split_en_service' }],
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
    expect(state('split_en_service')).toMatchObject({
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
      expect.stringContaining('set how many times it repeats.'),
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

  test("send to queue's ways out are Studio's events; boards with the old ones open with these", () => {
    const old = board(
      'voice',
      [
        object('queue', 'sendToQueue', { endedExits: ['failed to enqueue'] }),
        object('wait', 'playMessage', { studioName: 'postqueue_play_message_voice_wait' }),
      ],
      [connect('queue', 'wait', 'post-queue')],
    );
    const upgraded = upgradeContent(old);
    expect(exitsOf(upgraded.objects[0])).toEqual(['callComplete', 'failedToEnqueue', 'callFailure']);
    expect(upgraded.connections[0].exit).toBe('callComplete');
    expect(upgraded.objects[0].endedExits).toEqual(['failedToEnqueue']);

    const [sendToFlex] = toStudioFlow(
      { ...upgraded, objects: [{ ...upgraded.objects[0], studioName: 'send_to_queue' }, upgraded.objects[1]] },
      upgraded.frames[0],
    ).flow.states;
    expect(sendToFlex.transitions).toEqual([
      { event: 'callComplete', next: 'postqueue_play_message_voice_wait' },
      { event: 'failedToEnqueue' },
      { event: 'callFailure' },
    ]);
    // callFailure is left unconnected on purpose, as in nearly every live flow
    expect(boardChecks(upgraded).map((issue) => issue.message)).not.toContainEqual(
      expect.stringContaining('callFailure'),
    );
  });

  test('send to queue: what callers hear while waiting, and for how long', async () => {
    const queue = (settings: Record<string, string>) =>
      toStudioFlow(
        board('voice', [object('queue', 'sendToQueue', { studioName: 'send_to_queue_en_std', settings })], []),
        { id: 'f', title: 'Flow', x: 0, y: 0, width: 900, height: 600, channel: 'voice' },
      );
    // Twilio's music: no waitUrl; an hour unless set
    expect(queue({}).flow.states[0].properties).toMatchObject({ timeout: '3600' });
    expect(queue({}).flow.states[0].properties.waitUrl).toBeUndefined();
    expect(
      queue({
        waitMusic: 'address',
        waitUrl: '${flow_vars.custom_functions_url}/postQueueMonitor',
        waitUrlMethod: 'POST',
        timeout: '180',
      }).flow.states[0].properties,
    ).toMatchObject({
      waitUrl: '${flow_vars.custom_functions_url}/postQueueMonitor',
      waitUrlMethod: 'POST',
      timeout: '180',
    });
    // A recording, named after the widget: from the flow's recordings folder (none here, so marked)
    const recorded = queue({ waitMusic: 'recording' });
    expect(recorded.flow.states[0].properties).toMatchObject({ waitUrl: 'TODO', waitUrlMethod: 'GET' });
    expect(recorded.todo).toContainEqual(expect.stringContaining('send_to_queue_en_std.mp3'));

    // usnm's: its address (postQueueMonitor) and timeout, as settings
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const imported = boards
      .flatMap(({ content }) => content.objects)
      .find((candidate) => candidate.studioName === 'send_to_queue_en_std');
    expect(imported?.settings).toMatchObject({
      waitMusic: 'address',
      waitUrl: '${flow_vars.custom_functions_url}/postQueueMonitor?Language=english',
      waitUrlMethod: 'POST',
      timeout: '3600',
    });
  });

  test('repeats are named repeat_<name>; those named after their counter before open renamed', () => {
    const old = board(
      'voice',
      [
        object('loop', 'repeat', {
          studioName: 'set_var_menu_counter',
          settings: { counter: 'menu_counter', maxRepeats: '3' },
        }),
      ],
      [],
    );
    expect(upgradeContent(old).objects[0]).toMatchObject({ studioName: 'repeat_menu', settings: { maxRepeats: '3' } });
    expect(upgradeContent(old).objects[0].settings).not.toHaveProperty('counter');
    expect(repeatWidgetNames('postqueue_repeat_menu')).toEqual({
      setVar: 'postqueue_set_var_menu_counter',
      split: 'postqueue_split_menu',
      counter: 'menu_counter',
    });
  });

  test('send to queue: its workflow and task channel from the board, the queue it should end in for the agent', () => {
    const content = board(
      'voice',
      [
        object('queue', 'sendToQueue', {
          studioName: 'send_to_queue_en_std',
          settings: { queue: 'en_std', workflow: 'master', taskChannel: 'voice' },
        }),
      ],
      [],
    );
    const { flow, todo } = toStudioFlow(content, content.frames[0]);
    expect(flow.states[0].properties).toMatchObject({
      workflow: '${workflow_sids.master}',
      channel: '${task_channel_sids.voice}',
    });
    expect(todo.join('\n')).not.toMatch(/set its workflow/);
    expect(todo).toContainEqual(expect.stringContaining('should end up in the en_std queue'));
  });

  test('imported Send to Flex widgets keep their workflow and task channel as settings', async () => {
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const queues = boards.flatMap(({ content }) => content.objects.filter((o) => o.type === 'sendToQueue'));
    expect(queues.length).toBeGreaterThan(0);
    expect(queues.every((queue) => queue.settings?.workflow && queue.settings?.taskChannel)).toBe(true);
  });

  test('send message and close: a new one calls sendMessageAndRunJanitor with its message from flow_vars', () => {
    const close = object('Blocked', 'sendMessageAndClose', {
      message: { channel: 'sms', script: 'This number is blocked.' },
      settings: { from: '${helpline}' },
    });
    expect(suggestStudioName(close)).toBe('f_sendMessageAndRunJanitor_blocked');
    const content = board('webchat', [{ ...close, studioName: 'f_sendMessageAndRunJanitor_blocked' }], []);
    const { flow, flowVars } = toStudioFlow(content, content.frames[0]);
    expect(flow.states[0]).toMatchObject({
      name: 'f_sendMessageAndRunJanitor_blocked',
      type: 'make-http-request',
      properties: { url: '${lambda_twilio_account_scoped_url}/conversation/sendMessageAndRunJanitor' },
    });
    expect(JSON.parse(String(flow.states[0].properties.body))).toEqual({
      conversationSid: '{{flow.channel.address}}',
      message: '${flow_vars.send_message_blocked}',
      from: '${helpline}',
    });
    expect(flowVars).toContainEqual(
      expect.objectContaining({ name: 'send_message_blocked', value: 'This number is blocked.' }),
    );
  });

  test("imported ones (usnm's, form-encoded parameters) keep their message and author; changes go where they're kept", async () => {
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const sms = boards.find(({ content }) =>
      content.objects.some((candidate) => candidate.studioName === 'f_sendMessageAndRunJanitor_voip_blocked'),
    )!.content;
    const close = sms.objects.find((candidate) => candidate.studioName === 'f_sendMessageAndRunJanitor_voip_blocked')!;
    expect(close.type).toBe('sendMessageAndClose');
    expect(close.settings?.from).toBeDefined();
    expect(close.message?.script).toBeTruthy();

    // The text is in its flow_vars; the author is written in the widget
    const changed = {
      ...sms,
      objects: sms.objects.map((candidate) =>
        candidate.id === close.id
          ? { ...candidate, message: { ...candidate.message, script: 'New text' }, settings: { from: 'Aselo' } }
          : candidate,
      ),
    };
    const { flow, flowVars } = toStudioFlow(changed);
    expect(flowVars).toContainEqual(
      expect.objectContaining({ name: 'send_message_sms_voip_blocked', value: 'New text' }),
    );
    const state = flow.states.find((candidate) => candidate.name === 'f_sendMessageAndRunJanitor_voip_blocked')!;
    expect(janitorValuesOf(state.properties)).toMatchObject({
      message: '${flow_vars.send_message_sms_voip_blocked}',
      from: 'Aselo',
    });
    // Every helpline's: recognised, as Serverless functions or lambda requests
    let found = 0;
    for (const code of ['usnm', 'usch', 'mt', 'za']) {
      const { boards: theirs } = await importHelpline(helplinesDir, code).catch(() => ({ boards: [] }));
      found += theirs
        .flatMap(({ content }) => content.objects)
        .filter((candidate) => candidate.type === 'sendMessageAndClose').length;
    }
    expect(found).toBeGreaterThan(3);
  });

  test('imported captureChannelWithBot requests are chatbots, their settings as written (variables kept)', async () => {
    const { boards } = await importHelpline(helplinesDir, 'usch');
    const bots = boards.flatMap(({ content }) => content.objects.filter((candidate) => candidate.type === 'chatbot'));
    expect(bots.length).toBeGreaterThan(0);
    expect(bots[0].settings).toMatchObject({ botSuffix: 'pre_survey', language: 'en-USCH' });
  });
});
