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
import {
  composePrefixed,
  emptyBoard,
  exitsOf,
  lockedPrefixesOf,
  prefixedName,
  repeatWidgetNames,
  splitInputsOf,
  standardPrefixedName,
  suggestStudioName,
  upgradeContent,
} from '../src/flows/model';
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

  test('set variable: what it sets, new and imported (changes written back, each keeping its type)', async () => {
    const content = board(
      'voice',
      [
        object('lang', 'setVariable', {
          studioName: 'set_var_language',
          variables: [
            { key: 'language', value: 'es' },
            { key: 'menu_choice', value: '{{widgets.gather_input_voice_en_menu.Digits}}' },
          ],
        }),
      ],
      [],
    );
    const { flow, todo } = toStudioFlow(content, content.frames[0]);
    expect(flow.states[0].properties.variables).toEqual([
      { type: 'string', value: 'es', key: 'language' },
      { type: 'string', value: '{{widgets.gather_input_voice_en_menu.Digits}}', key: 'menu_choice' },
    ]);
    expect(todo.join('\n')).not.toMatch(/set its variables/);
    // Keys Studio doesn't take are errors; none at all, a warning
    const badKey = { ...content, objects: [{ ...content.objects[0], variables: [{ key: '1st', value: 'x' }] }] };
    expect(boardChecks(badKey).map((issue) => issue.message)).toContainEqual(
      expect.stringContaining('variable 1: Letters, numbers and underscores'),
    );
    const none = { ...content, objects: [{ ...content.objects[0], variables: undefined }] };
    expect(boardChecks(none).map((issue) => issue.message)).toContainEqual(
      expect.stringContaining('add the variables it sets'),
    );

    // usnm's counter: imported with its key and value; a changed value written back
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const voice = boards.find(({ content: theirs }) =>
      theirs.objects.some((candidate) => candidate.studioName === 'set_var_en_no_tya_service_counter'),
    )!.content;
    const counter = voice.objects.find((candidate) => candidate.studioName === 'set_var_en_no_tya_service_counter')!;
    expect(counter.variables).toEqual([
      { key: 'en_no_tya_service_counter', value: expect.stringContaining('plus: 1') },
    ]);
    const changed = {
      ...voice,
      objects: voice.objects.map((candidate) =>
        candidate.id === counter.id
          ? { ...candidate, variables: [{ key: 'en_no_tya_service_counter', value: '1' }] }
          : candidate,
      ),
    };
    const state = toStudioFlow(changed).flow.states.find(
      (candidate) => candidate.name === 'set_var_en_no_tya_service_counter',
    )!;
    expect(state.properties.variables).toEqual([{ type: 'string', value: '1', key: 'en_no_tya_service_counter' }]);
  });

  test("names start as their kind's do: locked in the settings, given that start when they don't have it", () => {
    expect(lockedPrefixesOf({ type: 'setVariable' })).toEqual(['set_var_']);
    expect(lockedPrefixesOf({ type: 'checkQueueAvailability' })).toEqual(['f_isSkilledWorkerAvailable']);
    expect(lockedPrefixesOf({ type: 'function' })).toEqual(['f_', 'http_get_', 'http_post_']);
    expect(prefixedName('postqueue_f_isSkilledWorkerAvailable_tya_calls', ['f_isSkilledWorkerAvailable'])).toEqual({
      postqueue: true,
      prefix: 'f_isSkilledWorkerAvailable',
      rest: 'tya_calls',
    });
    expect(composePrefixed({ postqueue: false, prefix: 'send_to_queue', rest: 'en_std' })).toBe('send_to_queue_en_std');
    expect(standardPrefixedName({ type: 'setVariable', studioName: 'var_put_etc' })).toBe('set_var_put_etc');
    expect(standardPrefixedName({ type: 'decision', studioName: 'splitLanguage' }, { stage: 'postqueue' })).toBe(
      'postqueue_split_splitlanguage',
    );
    expect(standardPrefixedName({ type: 'setVariable', studioName: 'set_var_ok' })).toBeUndefined();
  });

  test('flow memory: kept by Set flow memory (setFlowMemory), read by a Decision after a chatbot', () => {
    const keep = object('Entry point', 'setFlowMemory', {
      studioName: 'f_setFlowMemory_entry_point',
      variables: [
        { key: 'entryPoint', value: 'sms_redirect' },
        { key: 'menuChoice', value: '{{widgets.send_wait_sms_en_menu.inbound.Body}}' },
      ],
    });
    expect(suggestStudioName(keep)).toBe('f_setFlowMemory_entry_point');
    const bot = object('Pre-survey', 'chatbot', {
      studioName: 'f_captureChannelWithBot_pre_survey',
      settings: { botSuffix: 'pre_survey', releaseFlag: 'preSurveyComplete' },
    });
    const split = object('Came from', 'decision', {
      studioName: 'split_entry_point',
      exits: ['sms_redirect', 'noMatch'],
      settings: { input: '{{trigger.conversation.ChannelAttributes.flowMemory.entryPoint}}' },
    });
    const content = board('webchat', [keep, bot, split], []);

    // What a split can read here, each with what it is
    expect(splitInputsOf(content.objects)).toEqual([
      {
        value: '{{trigger.conversation.ChannelAttributes.flowMemory.entryPoint}}',
        detail: 'flow memory: entryPoint (kept after a chatbot)',
      },
      // In the same execution, from the widget's answer (the trigger has the attributes it started with)
      {
        value: '{{widgets.f_setFlowMemory_entry_point.parsed.flowMemory.entryPoint}}',
        detail: 'flow memory: entryPoint (this execution, after f_setFlowMemory_entry_point)',
      },
      {
        value: '{{trigger.conversation.ChannelAttributes.flowMemory.menuChoice}}',
        detail: 'flow memory: menuChoice (kept after a chatbot)',
      },
      {
        value: '{{widgets.f_setFlowMemory_entry_point.parsed.flowMemory.menuChoice}}',
        detail: 'flow memory: menuChoice (this execution, after f_setFlowMemory_entry_point)',
      },
      { value: '{{trigger.conversation.ChannelAttributes.preSurveyComplete}}', detail: 'pre_survey finished (true)' },
    ]);

    const { flow, todo } = toStudioFlow(content, content.frames[0]);
    const state = (name: string) => flow.states.find((candidate) => candidate.name === name)!;
    expect(state('f_setFlowMemory_entry_point').properties).toMatchObject({
      url: '${lambda_twilio_account_scoped_url}/conversation/setFlowMemory',
    });
    expect(JSON.parse(String(state('f_setFlowMemory_entry_point').properties.body))).toEqual({
      conversationSid: '{{flow.channel.address}}',
      flowMemory: { entryPoint: 'sms_redirect', menuChoice: '{{widgets.send_wait_sms_en_menu.inbound.Body}}' },
    });
    expect(state('split_entry_point')).toMatchObject({
      properties: { input: '{{trigger.conversation.ChannelAttributes.flowMemory.entryPoint}}' },
      transitions: [
        { event: 'noMatch' },
        {
          event: 'match',
          conditions: [
            {
              type: 'equal_to',
              value: 'sms_redirect',
              arguments: ['{{trigger.conversation.ChannelAttributes.flowMemory.entryPoint}}'],
            },
          ],
        },
      ],
    });
    expect(todo.join('\n')).not.toMatch(/set what it splits on/);
    // Nothing chosen: pointed out
    const unset = { ...content, objects: [{ ...split, settings: undefined }] };
    expect(boardChecks(unset).map((issue) => issue.message)).toContainEqual(
      expect.stringContaining('choose what it splits on'),
    );
  });

  test('imported splits keep what they split on; changed, their conditions read the new input too', async () => {
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const voice = boards.find(({ content: theirs }) =>
      theirs.objects.some((candidate) => candidate.studioName === 'split_end_cycle_en_no_tya_service'),
    )!.content;
    const split = voice.objects.find((candidate) => candidate.studioName === 'split_end_cycle_en_no_tya_service')!;
    expect(split.settings?.input).toBe('{{flow.variables.en_no_tya_service_counter}}');
    const changed = {
      ...voice,
      objects: voice.objects.map((candidate) =>
        candidate.id === split.id ? { ...candidate, settings: { input: '{{flow.variables.tries}}' } } : candidate,
      ),
    };
    const state = toStudioFlow(changed).flow.states.find(
      (candidate) => candidate.name === 'split_end_cycle_en_no_tya_service',
    )!;
    expect(state.properties.input).toBe('{{flow.variables.tries}}');
    expect(JSON.stringify(state.transitions)).not.toContain('en_no_tya_service_counter');
    // The board's own object isn't changed by generating its flow
    expect(JSON.stringify(split.studio?.transitions)).toContain('en_no_tya_service_counter');
  });

  test('send and wait: its timeout; release from chatbot: only the conversation', async () => {
    const question = object('Menu', 'questionMessaging', {
      studioName: 'send_wait_sms_en_menu',
      message: { channel: 'sms', script: 'Reply 1 or 2' },
      settings: { timeout: '180' },
    });
    const cleanup = object('Release', 'chatbotCleanup', { studioName: 'f_chatbotCallbackCleanup' });
    const content = board('webchat', [question, cleanup], []);
    const { flow } = toStudioFlow(content, content.frames[0]);
    expect(flow.states[0].properties.timeout).toBe('180');
    expect(flow.states[1].properties).toMatchObject({
      url: '${lambda_twilio_account_scoped_url}/channelCapture/chatbotCallbackCleanup',
    });
    expect(JSON.parse(String(flow.states[1].properties.body))).toEqual({ channelSid: '{{flow.channel.address}}' });
    expect(exitsOf(cleanup)).toEqual(['success', 'failed']);

    // Imported: usnm's questions keep their timeout, and every helpline's cleanups are recognised
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const imported = boards.flatMap(({ content: theirs }) => theirs.objects);
    expect(
      imported.filter((candidate) => candidate.type === 'questionMessaging').every((q) => q.settings?.timeout),
    ).toBe(true);
    const mt = await importHelpline(helplinesDir, 'mt');
    expect(
      mt.boards
        .flatMap(({ content: theirs }) => theirs.objects)
        .some((candidate) => candidate.type === 'chatbotCleanup'),
    ).toBe(true);
  });

  test('imported captureChannelWithBot requests are chatbots, their settings as written (variables kept)', async () => {
    const { boards } = await importHelpline(helplinesDir, 'usch');
    const bots = boards.flatMap(({ content }) => content.objects.filter((candidate) => candidate.type === 'chatbot'));
    expect(bots.length).toBeGreaterThan(0);
    expect(bots[0].settings).toMatchObject({ botSuffix: 'pre_survey', language: 'en-USCH' });
  });
});

describe('what a split splits on', () => {
  test("not set, a split reads the answer of the widget before it; typed, what's typed", () => {
    const question = object('welcome', 'questionMessaging', { studioName: 'send_wait_welcome' });
    const menu = object('language', 'menuVoice', { studioName: 'gather_input_voice_language' });
    const afterReply = object('reply', 'decision', { studioName: 'split_welcome', exits: ['yes', 'noMatch'] });
    const afterKeys = object('keys', 'decision', { studioName: 'split_language', exits: ['1', '2', 'noMatch'] });
    const afterSpeech = object('speech', 'decision', {
      studioName: 'split_language_speech',
      exits: ['english', 'noMatch'],
    });
    const typed = object('typed', 'decision', {
      studioName: 'split_service',
      exits: ['tya', 'noMatch'],
      settings: { input: '{{trigger.conversation.ChannelAttributes.flowMemory.service}}' },
    });
    const content = board(
      'webchat',
      [question, menu, afterReply, afterKeys, afterSpeech, typed],
      [
        connect('welcome', 'reply', 'reply'),
        connect('language', 'keys', 'keypress'),
        connect('language', 'speech', 'speech'),
        connect('welcome', 'typed', 'reply'),
      ],
    );
    const { flow } = toStudioFlow(content, content.frames[0]);
    const inputOf = (name: string) => flow.states.find((state) => state.name === name)!.properties.input;
    expect(inputOf('split_welcome')).toBe('{{widgets.send_wait_welcome.inbound.Body}}');
    expect(inputOf('split_language')).toBe('{{widgets.gather_input_voice_language.Digits}}');
    expect(inputOf('split_language_speech')).toBe('{{widgets.gather_input_voice_language.SpeechResult}}');
    expect(inputOf('split_service')).toBe('{{trigger.conversation.ChannelAttributes.flowMemory.service}}');
    const keys = flow.states.find((state) => state.name === 'split_language')!;
    expect(JSON.stringify(keys.transitions)).toContain(
      '"arguments":["{{widgets.gather_input_voice_language.Digits}}"]',
    );
    // With a default, nothing to choose
    expect(
      boardChecks(content)
        .map((issue) => issue.message)
        .join('\n'),
    ).not.toMatch(/choose what it splits on/);
    // Reached from widgets with different answers: no default
    const two = { ...content, connections: [...content.connections, connect('language', 'reply', 'keypress')] };
    expect(boardChecks(two).map((issue) => issue.message)).toContainEqual(
      expect.stringContaining('“reply”: choose what it splits on'),
    );
  });

  test('imported splits\' ways out are their values ("2"), also on boards imported before', async () => {
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const voice = boards.find(({ content }) =>
      content.objects.some((candidate) => candidate.studioName === 'split_voice_language'),
    )!.content;
    const split = voice.objects.find((candidate) => candidate.studioName === 'split_voice_language')!;
    expect(split.exits).toContain('2');
    expect(split.exits!.some((exit) => exit.startsWith('If value'))).toBe(false);
    expect(voice.connections.filter((connection) => connection.from === split.id).map(({ exit }) => exit)).toContain(
      '2',
    );
    // Unchanged, it's generated as it is live
    const live = toStudioFlow(voice).flow.states.find((state) => state.name === 'split_voice_language')!;
    expect(live.transitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ conditions: [expect.objectContaining({ friendly_name: 'If value equal_to 2' })] }),
      ]),
    );

    // A board imported before: its ways out (and connections) are renamed when it's opened
    const before = (exit?: string) => (exit && /^\d$/.test(exit) ? `If value equal_to ${exit}` : exit);
    const old = {
      ...voice,
      objects: voice.objects.map((candidate) =>
        candidate.id === split.id ? { ...candidate, exits: candidate.exits!.map((exit) => before(exit)!) } : candidate,
      ),
      connections: voice.connections.map((connection) =>
        connection.from === split.id ? { ...connection, exit: before(connection.exit) } : connection,
      ),
    };
    const upgraded = upgradeContent(old);
    expect(upgraded.objects.find((candidate) => candidate.id === split.id)!.exits).toEqual(split.exits);
    expect(upgraded.connections).toEqual(voice.connections);
    expect(upgradeContent(voice)).toBe(voice);
  });
});

describe('who a message is from', () => {
  test("new messages are from the helpline unless chosen (Bot, or typed), with Studio's other attributes set", () => {
    const send = object('send', 'sendMessage', { studioName: 'send_message_sms_en_info' });
    const ask = object('ask', 'questionMessaging', { studioName: 'send_wait_sms_en_name', settings: { from: 'Bot' } });
    const close = object('close', 'sendMessageAndClose', {
      studioName: 'f_sendMessageAndRunJanitor_blocked',
      settings: { from: 'NAMI' },
    });
    const content = board('webchat', [send, ask, close], [connect('send', 'ask'), connect('ask', 'close', 'reply')]);
    const { flow } = toStudioFlow(content, content.frames[0]);
    const state = (name: string) => flow.states.find((candidate) => candidate.name === name)!;
    expect(state('send_message_sms_en_info').properties).toMatchObject({
      service: '{{trigger.message.InstanceSid}}',
      channel: '{{trigger.message.ChannelSid}}',
      from: '${helpline}',
      message_type: 'custom',
      to: '{{contact.channel.address}}',
    });
    expect(state('send_wait_sms_en_name').properties).toMatchObject({ from: 'Bot', message_type: 'custom' });
    expect(JSON.parse(String(state('f_sendMessageAndRunJanitor_blocked').properties.body))).toMatchObject({
      from: 'NAMI',
    });
  });

  test("imported messages show who they're from; changed on the board, the widget says so", async () => {
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const sms = boards.find(({ content }) =>
      content.objects.some((candidate) => candidate.studioName === 'send_wait_sms_name_request'),
    )!.content;
    const ask = sms.objects.find((candidate) => candidate.studioName === 'send_wait_sms_name_request')!;
    expect(ask.settings).toMatchObject({ from: 'NAMI', timeout: '180' });
    const changed = {
      ...sms,
      objects: sms.objects.map((candidate) =>
        candidate.id === ask.id
          ? { ...candidate, settings: { ...candidate.settings, from: '${helpline}' } }
          : candidate,
      ),
    };
    const state = toStudioFlow(changed).flow.states.find(
      (candidate) => candidate.name === 'send_wait_sms_name_request',
    )!;
    expect(state.properties).toMatchObject({ from: '${helpline}', message_type: 'custom', timeout: '180' });
  });
});
