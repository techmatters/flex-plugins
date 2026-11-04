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

import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';
import type { BoardContent, FlowObject } from '../src/flows/model';
import { emptyBoard, fieldProblem, fixedExitsOf } from '../src/flows/model';
import { boardChecks } from '../src/flows/checks';
import { toStudioFlow, toStudioFlows } from '../src/flows/studioTemplate';
import { standardTaskAttributes } from '../src/flows/taskAttributes';
import { importHelpline } from './flowImport';
import { parseTemplate } from './hcl';

const helplinesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../twilio-iac/helplines');

const codes = readdirSync(helplinesDir).filter(
  (code) =>
    /^[a-z0-9]+$/.test(code) &&
    (existsSync(path.join(helplinesDir, code, 'staging.hcl')) ||
      existsSync(path.join(helplinesDir, code, 'production.hcl'))),
);

// A parsed template with its blocked checks on a client profile's flags using contains, not equal_to
const withBlockedContains = (flow: unknown) => {
  const copy = structuredClone(flow) as { states?: { transitions?: { conditions?: Record<string, unknown>[] }[] }[] };
  copy.states?.forEach((state) =>
    state.transitions?.forEach((transition) =>
      transition.conditions?.forEach((condition) => {
        const [argument] = (condition.arguments as string[] | undefined) ?? [];
        if (condition.type === 'equal_to' && condition.value === 'blocked' && /\.parsed\.flags\}\}$/.test(argument)) {
          condition.type = 'contains';
          if (condition.friendly_name === 'If value equal_to blocked')
            condition.friendly_name = 'If value contains blocked';
        }
      }),
    ),
  );
  return copy;
};

describe('Studio templates from boards', () => {
  test("an imported board, unchanged, gives back the live flow, for every helpline's flows", async () => {
    let compared = 0;
    const blockedFixed: string[] = [];
    for (const code of codes) {
      const { boards } = await importHelpline(helplinesDir, code);
      for (const { title, content } of boards) {
        const [generated] = toStudioFlows(content);
        expect(generated.template, title).toBeDefined();
        const original = parseTemplate(readFileSync(path.join(helplinesDir, generated.template!), 'utf8'));
        // Except a blocked check on the profile's flags written with equal_to: contains now
        const expected = withBlockedContains(original);
        expect(parseTemplate(generated.text), title).toEqual(expected);
        if (JSON.stringify(expected) !== JSON.stringify(original)) {
          blockedFixed.push(generated.template!);
          expect(generated.todo, title).toContainEqual(expect.stringMatching(/blocked check now uses contains/));
        }
        // Nothing changed on the board, so nothing to change in the .hcl files
        expect(generated.flowVars, title).toEqual([]);
        compared += 1;
      }
    }
    expect(compared).toBeGreaterThan(50);
    // Only USCH's live flows still use equal_to
    expect(blockedFixed.length).toBeGreaterThan(0);
    blockedFixed.forEach((template) => expect(template).toMatch(/^usch\//));
  }, 120_000);

  test('changes on the board: new connections, texts in flow_vars or in the template, renamed widgets', async () => {
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const sms = boards.find((board) => board.content.flow?.studio?.template.endsWith('/sms.tftpl'))!.content;
    const find = (studioName: string) => sms.objects.find((object) => object.studioName === studioName)!;

    const welcome = find('send_wait_sms_welcome');
    welcome.message = { ...welcome.message, script: 'Hello from the board' };
    const crisis = find('send_message_sms_tya_info');
    const generated = toStudioFlow(sms);

    // The welcome reads ${flow_vars.send_wait_sms_welcome}: the new text is for the .hcl files
    expect(generated.flowVars).toContainEqual({
      scope: 'flow_vars',
      name: 'send_wait_sms_welcome',
      value: 'Hello from the board',
      widget: 'send_wait_sms_welcome',
    });
    const state = (name: string) => generated.flow.states.find((candidate) => candidate.name === name)!;
    expect(state('send_wait_sms_welcome').properties.body).toBe('${flow_vars.send_wait_sms_welcome}');

    // A connection moved on the board moves in the flow
    const connection = sms.connections.find((candidate) => candidate.from === welcome.id)!;
    const original = state('send_wait_sms_welcome').transitions.find(
      (transition) => transition.event === connection.exit,
    )?.next;
    connection.to = crisis.id;
    const moved = toStudioFlow(sms);
    const after = moved.flow.states.find((candidate) => candidate.name === 'send_wait_sms_welcome')!;
    expect(after.transitions.find((transition) => transition.event === connection.exit)?.next).toBe(
      'send_message_sms_tya_info',
    );
    expect(original).not.toBe('send_message_sms_tya_info');
  });

  test('new objects become widgets of their kind, with what they still need marked TODO', () => {
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
    const content: BoardContent = {
      ...emptyBoard('New'),
      frames: [{ id: 'f', title: 'Voice', x: 0, y: 0, width: 900, height: 600, channel: 'voice' }],
      objects: [
        object('in', 'incoming', { message: { channel: 'voice' } }),
        object('menu', 'menuVoice', {
          studioName: 'gather_input_voice_en_service',
          exits: ['1', '2', 'noMatch', 'timeout'],
          message: { channel: 'voice', language: 'en', script: 'Press 1 or 2' },
        }),
        object('tya', 'checkQueueAvailability', {
          studioName: 'f_isSkilledWorkerAvailable_tya_calls',
          settings: { targetSkills: 'TYA,Calls', targetChannel: 'voice' },
        }),
        object('queue', 'sendToQueue', { studioName: 'send_to_queue' }),
        object('bye', 'end'),
      ],
      connections: [
        { id: 'c1', from: 'in', to: 'menu' },
        { id: 'c2', from: 'menu', to: 'tya', exit: '1' },
        { id: 'c3', from: 'menu', to: 'queue', exit: '2' },
        { id: 'c4', from: 'tya', to: 'queue', exit: 'available' },
        { id: 'c5', from: 'menu', to: 'bye', exit: 'timeout' },
      ],
    };
    const generated = toStudioFlow(content, content.frames[0]);
    const state = (name: string) => generated.flow.states.find((candidate) => candidate.name === name)!;

    expect(generated.flow).toMatchObject({ initial_state: 'Trigger', description: '${flow_description}' });
    expect(state('Trigger').transitions.find((transition) => transition.event === 'incomingCall')?.next).toBe(
      'gather_input_voice_en_service',
    );
    // A voice menu is a Gather and a Split on its digits; with no recording yet, it says its script
    expect(state('gather_input_voice_en_service')).toMatchObject({
      type: 'gather-input-on-call',
      transitions: [{ event: 'keypress', next: 'split_voice_en_service' }, { event: 'speech' }, { event: 'timeout' }],
      properties: { say: '${flow_vars.gather_input_voice_en_service}', language: 'en-US' },
    });
    expect(generated.flowVars).toContainEqual(
      expect.objectContaining({ name: 'gather_input_voice_en_service', value: 'Press 1 or 2' }),
    );
    expect(state('split_voice_en_service').transitions).toEqual([
      { event: 'noMatch' },
      expect.objectContaining({ event: 'match', next: 'f_isSkilledWorkerAvailable_tya_calls' }),
      expect.objectContaining({ event: 'match', next: 'send_to_queue' }),
    ]);
    // A route check is the request, and a Split on its answer
    expect(state('f_isSkilledWorkerAvailable_tya_calls').properties).toMatchObject({
      url: '${lambda_twilio_account_scoped_url}/worker/isSkilledWorkerAvailable',
      body: JSON.stringify({ targetSkills: 'TYA,Calls', targetChannel: 'voice' }, null, 2),
    });
    expect(state('split_is_skilled_worker_available_tya_calls').transitions[1]).toMatchObject({
      event: 'match',
      next: 'send_to_queue',
      conditions: [{ type: 'greater_than', value: '0' }],
    });
    expect(generated.todo).toContainEqual(expect.stringContaining('send_to_queue'));
    // The template reads back as the same flow
    expect(parseTemplate(generated.text)).toEqual(generated.flow);
  });

  test('an imported widget made another kind on the board is built as a new one of that kind', async () => {
    const { boards } = await importHelpline(helplinesDir, 'usch');
    const webchat = boards.find((board) =>
      board.content.flow?.studio?.template.endsWith('/webchat-no-lex-conv-sd.tftpl'),
    )!.content;
    const blocked = webchat.objects.find((object) => object.studioName === 'send_message_webchat_blocked_client')!;
    blocked.type = 'sendMessageAndClose';
    blocked.studioName = 'f_sendMessageAndRunJanitor_webchat_blocked_client';
    blocked.message = { ...blocked.message, script: 'We are unable to take your contact at this time.' };
    const generated = toStudioFlow(webchat);
    const state = generated.flow.states.find((candidate) => candidate.name === blocked.studioName)!;
    expect(state.type).toBe('make-http-request');
    expect(state.properties).toMatchObject({
      url: '${lambda_twilio_account_scoped_url}/conversation/sendMessageAndRunJanitor',
      parameters: [
        { value: '{{flow.channel.address}}', key: 'conversationSid' },
        { value: '${flow_vars.send_message_webchat_blocked_client}', key: 'message' },
        { value: 'Bot', key: 'from' },
      ],
      // Where it was on the canvas
      offset: blocked.studio!.offset,
    });
    expect(generated.flowVars).toContainEqual(
      expect.objectContaining({
        name: 'send_message_webchat_blocked_client',
        value: 'We are unable to take your contact at this time.',
      }),
    );
    expect(generated.todo.join(' ')).toMatch(
      /was send_message_webchat_blocked_client \(send-message\) in Studio .* built as a new one; \$\{flow_vars\.webchat_blocked_client_message\} isn't read by it any more/,
    );
    // What led to it leads to it, by its new name
    expect(
      generated.flow.states.some((candidate) =>
        candidate.transitions.some((transition) => transition.next === blocked.studioName),
      ),
    ).toBe(true);
  });

  test('messages changed on the board read trigger.conversation; the ones nobody changed stay as they are', async () => {
    const { boards } = await importHelpline(helplinesDir, 'usnm');
    const sms = boards.find((board) => board.content.flow?.studio?.template.endsWith('/sms.tftpl'))!.content;
    const welcome = sms.objects.find((object) => object.studioName === 'send_wait_sms_welcome')!;
    const legacy = { service: '{{trigger.message.InstanceSid}}', channel: '{{trigger.message.ChannelSid}}' };
    const conversation = {
      service: '{{trigger.conversation.InstanceSid}}',
      channel: '{{trigger.conversation.ChannelSid}}',
    };
    const propertiesOf = (content: BoardContent, studioName: string) =>
      toStudioFlow(content).flow.states.find((state) => state.name === studioName)!.properties;

    // Untouched, or only its flow_vars text or position changed: exactly as live
    expect(propertiesOf(sms, 'send_wait_sms_welcome')).toMatchObject(legacy);
    welcome.message = { ...welcome.message, script: 'Hello from the board' };
    welcome.x += 40;
    expect(propertiesOf(sms, 'send_wait_sms_welcome')).toMatchObject(legacy);

    // Changed: the timeout
    welcome.settings = { ...welcome.settings, timeout: '600' };
    expect(propertiesOf(sms, 'send_wait_sms_welcome')).toMatchObject({ ...conversation, timeout: '600' });
    // ...and the others still as they were
    expect(propertiesOf(sms, 'send_message_sms_tya_info')).not.toMatchObject(conversation);

    // New messages always
    const added: FlowObject = {
      ...welcome,
      id: 'new-message',
      type: 'sendMessage',
      studioName: 'send_message_sms_en_new',
      studio: undefined,
    };
    expect(propertiesOf({ ...sms, objects: [...sms.objects, added] }, 'send_message_sms_en_new')).toMatchObject(
      conversation,
    );
  });
});

describe('Other function / HTTP request', () => {
  test('its address and JSON body are checked: https or a variable; {{...}} and ${...} allowed', () => {
    const url = { kind: 'url' as const };
    const json = { kind: 'json' as const };
    expect(fieldProblem(url, 'https://example.org/a')).toBeUndefined();
    expect(fieldProblem(url, '${lambda_twilio_account_scoped_url}/hrm/savePostSurvey')).toBeUndefined();
    expect(fieldProblem(url, 'example.org/a')).toMatch(/valid address/);
    // Whole numbers (a Repeat's times, a queue's timeout)
    const number = { kind: 'number' as const };
    expect(fieldProblem(number, '2')).toBeUndefined();
    expect(fieldProblem(number, ' 3600 ')).toBeUndefined();
    expect(fieldProblem(number, '2.5')).toMatch(/whole number/);
    expect(fieldProblem(number, 'two')).toMatch(/whole number/);
    expect(fieldProblem(url, 'ftp://example.org')).toMatch(/https/);
    expect(
      fieldProblem(json, '{ "contactId": "{{trigger.call.contactId}}", "n": {{flow.variables.n}} }'),
    ).toBeUndefined();
    expect(fieldProblem(json, '{ "a": 1, }')).toMatch(/valid JSON/);
    expect(fieldProblem(json, '')).toBeUndefined();
  });

  test("a new one is built from its settings; an imported one keeps Studio's, with what changed on the board", () => {
    const studioWidget = {
      name: 'f_savePostSurvey',
      type: 'make-http-request',
      properties: {
        method: 'POST',
        content_type: 'application/json;charset=utf-8',
        add_twilio_auth: false,
        body: '{"a": "{{flow.variables.a}}"}',
        url: '${lambda_twilio_account_scoped_url}/hrm/savePostSurvey',
      },
      transitions: [{ event: 'success' }, { event: 'failed' }],
    };
    const object = (id: string, extra: Partial<FlowObject>): FlowObject => ({
      id,
      type: 'function',
      text: id,
      x: 0,
      y: 0,
      width: 200,
      height: 70,
      exits: ['success', 'failed'],
      ...extra,
    });
    const content: BoardContent = {
      ...emptyBoard('Survey'),
      objects: [
        object('new', {
          studioName: 'f_new',
          settings: { method: 'GET', url: 'https://example.org/x', body: '{"b": 1}' },
        }),
        object('same', {
          studioName: 'f_savePostSurvey',
          studio: studioWidget,
          settings: { method: 'POST', url: studioWidget.properties.url, body: studioWidget.properties.body },
        }),
        object('moved', {
          studioName: 'f_moved',
          studio: { ...studioWidget, name: 'f_moved' },
          settings: { url: '${lambda_twilio_account_scoped_url}/hrm/somewhereElse' },
        }),
      ],
      connections: [],
    };
    const generated = toStudioFlow(content);
    const state = (name: string) => generated.flow.states.find((candidate) => candidate.name === name)!;
    expect(state('f_new').properties).toMatchObject({
      method: 'GET',
      content_type: 'application/json;charset=utf-8',
      add_twilio_auth: false,
      body: '{"b": 1}',
      url: 'https://example.org/x',
    });
    expect(generated.todo.some((item) => /f_new/.test(item) && /address/.test(item))).toBe(false);
    // Unchanged: exactly as Studio had it
    expect(state('f_savePostSurvey').properties).toMatchObject(studioWidget.properties);
    expect(state('f_moved').properties).toMatchObject({
      ...studioWidget.properties,
      url: '${lambda_twilio_account_scoped_url}/hrm/somewhereElse',
    });
  });
});

describe('Splits and the standard requests', () => {
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
  const smsBoard = (objects: FlowObject[]): BoardContent => ({
    ...emptyBoard('New'),
    frames: [{ id: 'f', title: 'SMS', x: 0, y: 0, width: 900, height: 600, channel: 'sms' }],
    objects,
    connections: [],
  });

  test('a way out listing values matches any of them; another comparison can be chosen', () => {
    const content = smsBoard([
      object('answer', 'decision', {
        studioName: 'split_answer',
        settings: { input: '{{widgets.send_wait_sms_question.inbound.Body}}' },
        exits: ['Si,si,Sí,sí,ok', 'No,nop,no', 'help', 'noMatch'],
        exitOperators: { help: 'contains' },
      }),
    ]);
    const generated = toStudioFlow(content, content.frames[0]);
    const split = generated.flow.states.find((state) => state.name === 'split_answer')!;
    expect(split.transitions.map((transition) => transition.conditions)).toEqual([
      undefined,
      [
        {
          friendly_name: 'If value matches_any_of Si,si,Sí,sí,ok',
          arguments: ['{{widgets.send_wait_sms_question.inbound.Body}}'],
          type: 'matches_any_of',
          value: 'Si,si,Sí,sí,ok',
        },
      ],
      [expect.objectContaining({ type: 'matches_any_of', value: 'No,nop,no' })],
      [expect.objectContaining({ friendly_name: 'If value contains help', type: 'contains', value: 'help' })],
    ]);
  });

  test("an imported split's renamed way out, or its new comparison, rewrites its condition", () => {
    const condition = (value: string, friendlyName: string) => ({
      friendly_name: friendlyName,
      arguments: ['{{widgets.send_wait_language.inbound.Body}}'],
      type: 'equal_to',
      value,
    });
    const studio = {
      name: 'split_language',
      type: 'split-based-on',
      properties: { input: '{{widgets.send_wait_language.inbound.Body}}' },
      transitions: [
        { event: 'noMatch' },
        { event: 'match', conditions: [condition('1', 'If value equal_to 1')] },
        { event: 'match', conditions: [condition('2', 'Spanish')] },
      ],
    };
    const imported = (extra: Partial<FlowObject>) => {
      const content = smsBoard([object('language', 'decision', { studioName: 'split_language', studio, ...extra })]);
      return toStudioFlow(content, content.frames[0]).flow.states.find((state) => state.name === 'split_language')!;
    };

    // Unchanged: as live
    expect(imported({ exits: ['noMatch', '1', 'Spanish'] }).transitions).toEqual(studio.transitions);
    // "1" renamed to a list: any of them; "Spanish" (the name of 2) keeps its value, with the comparison chosen
    const changed = imported({
      exits: ['noMatch', '1,uno,one', 'Spanish'],
      exitOperators: { Spanish: 'starts_with' },
    });
    expect(changed.transitions[1].conditions).toEqual([
      { ...condition('1,uno,one', 'If value matches_any_of 1,uno,one'), type: 'matches_any_of' },
    ]);
    expect(changed.transitions[2].conditions).toEqual([{ ...condition('2', 'Spanish'), type: 'starts_with' }]);
    // A way out added on the board compares with what it splits on
    const added = imported({ exits: ['noMatch', '1', 'Spanish', 'tres,3'] });
    expect(added.transitions[3].conditions).toEqual([
      { ...condition('tres,3', 'If value matches_any_of tres,3'), type: 'matches_any_of' },
    ]);
  });

  test("the ways out Studio always has can't be removed", () => {
    expect(fixedExitsOf(object('d', 'decision', { exits: ['Yes', 'No', 'noMatch'] }))).toEqual(['noMatch']);
    expect(fixedExitsOf(object('m', 'menuVoice', { exits: ['keypress', 'speech', 'timeout'] }))).toEqual([
      'keypress',
      'speech',
      'timeout',
    ]);
    expect(fixedExitsOf(object('m', 'menuVoice', { exits: ['1', '2', 'noMatch', 'timeout'] }))).toEqual([
      'noMatch',
      'timeout',
    ]);
    expect(fixedExitsOf(object('f', 'function', { exits: ['success', 'failed', 'other'] }))).toEqual([
      'success',
      'failed',
    ]);
    expect(fixedExitsOf(object('o', 'other', { exits: ['next'] }))).toEqual([]);
    // Imported: what isn't one of its conditions
    const studio = {
      name: 'split_x',
      type: 'split-based-on',
      transitions: [{ event: 'noMatch' }, { event: 'match', conditions: [] }],
    };
    expect(fixedExitsOf(object('i', 'decision', { studio, exits: ['noMatch', '1'] }))).toEqual(['noMatch']);
  });

  test('the profile check, operating hours and the team alert send what the helplines send', () => {
    const content = smsBoard([
      object('blocked', 'checkClientProfile', { studioName: 'f_getProfileFlagsForIdentifier_blocked' }),
      object('hours', 'checkOperatingHours', { studioName: 'f_operatingHours' }),
      object('alert', 'notifyError', {
        studioName: 'http_post_notify_the_aselo_team',
        text: 'Failed to close conversation',
      }),
    ]);
    const generated = toStudioFlow(content, content.frames[0]);
    const state = (name: string) => generated.flow.states.find((candidate) => candidate.name === name)!;

    expect(state('f_getProfileFlagsForIdentifier_blocked').properties.body).toBe(
      '{ "trigger": {{trigger | to_json}}, "channelType": "{% if trigger.conversation.ChannelAttributes.channel_type %}{{trigger.conversation.ChannelAttributes.channel_type}}{% else %}{{trigger.conversation.Source | downcase}}{% endif %}"}',
    );
    const flags = state('split_get_profile_flags_for_identifier_blocked');
    expect(flags.properties.input).toBe('{{widgets.f_getProfileFlagsForIdentifier_blocked.parsed.flags}}');
    expect(flags.transitions[1].conditions).toEqual([expect.objectContaining({ type: 'contains', value: 'blocked' })]);

    expect(JSON.parse(String(state('f_operatingHours').properties.body))).toEqual({
      channel: 'sms',
      includeMessageTextInResponse: 'true',
      language: 'en-US',
      from: '{{trigger.conversation.From}}',
    });
    expect(state('split_operating_hours').properties.input).toBe('{{widgets.f_operatingHours.parsed.status}}');

    expect(state('http_post_notify_the_aselo_team').properties).toMatchObject({
      url: '${webhook_url_studio_errors}',
      body: '{ "text": "Issue detected [Failed to close conversation] on ${short_helpline} ${short_environment} Flow SID: {{flow.flow_sid}} Execution SID: {{flow.sid}}  " }',
    });
    expect(generated.text).not.toMatch(/"TODO"|parsed\.TODO/);
  });

  test("a Send to queue's task channel is the flow's when not chosen: chat for messaging, voice for calls", () => {
    const content = smsBoard([
      object('q', 'sendToQueue', { studioName: 'send_to_queue', settings: { workflow: 'master' } }),
    ]);
    const channelIn = (board: BoardContent) =>
      toStudioFlow(board, board.frames[0]).flow.states.find((state) => state.name === 'send_to_queue')!.properties
        .channel;
    expect(channelIn(content)).toBe('${task_channel_sids.chat}');
    expect(channelIn({ ...content, frames: [{ ...content.frames[0], channel: 'voice' }] })).toBe(
      '${task_channel_sids.voice}',
    );
    const voicemail = {
      ...content,
      objects: [{ ...content.objects[0], settings: { workflow: 'master', taskChannel: 'voicemail' } }],
    };
    expect(channelIn(voicemail)).toBe('${task_channel_sids.voicemail}');
  });

  test("a Send to queue uses the channel's task attributes as they are, or exactly the ones set on the board", () => {
    const template = 'templates/channel-attributes/chat-conversations.tftpl';
    const channelJson = '{\n  "service": "{{flow.variables.service}}"\n}';
    const channelSource = { kind: 'channelAttributes' as const, template, channels: ['webchat'] };
    // Imported reading the channel's template, with the attributes as set on the board
    const imported = (id: string, taskAttributes: NonNullable<FlowObject['taskAttributes']>) =>
      object(id, 'sendToQueue', {
        studioName: `send_to_queue_${id}`,
        settings: { workflow: 'master', taskChannel: 'chat' },
        studio: {
          name: `send_to_queue_${id}`,
          type: 'send-to-flex',
          properties: { attributes: '${channel_attributes.default}' },
          transitions: [],
        },
        taskAttributes: { imported: channelJson, ...taskAttributes },
      });
    const spanish = '{\n  "service": "ChildHelp",\n  "counselingLanguage": "Spanish"\n}';
    const advocate = '{\n  "service": "AdvocateLine"\n}';
    const board = smsBoard([
      imported('english', { json: channelJson, source: channelSource }),
      // Edited on the board (as boards were before the tick box): its own
      imported('spanish', { json: spanish, source: channelSource }),
      // Unticked
      imported('advocate', { json: advocate, source: { kind: 'inline', movedFrom: channelSource } }),
      // A new one with the standard attributes, and one with its own
      object('new', 'sendToQueue', {
        studioName: 'send_to_queue_new',
        settings: { workflow: 'master' },
        taskAttributes: standardTaskAttributes('webchat'),
      }),
      object('newOwn', 'sendToQueue', {
        studioName: 'send_to_queue_new_own',
        settings: { workflow: 'master' },
        taskAttributes: { ...standardTaskAttributes('webchat'), json: advocate },
      }),
    ]);
    const result = toStudioFlow(board, board.frames[0]);
    const attributesOf = (name: string) =>
      result.flow.states.find((state) => state.name === name)!.properties.attributes;
    expect(attributesOf('send_to_queue_english')).toBe('${channel_attributes.default}');
    expect(attributesOf('send_to_queue_spanish')).toBe(spanish);
    expect(attributesOf('send_to_queue_advocate')).toBe(advocate);
    expect(attributesOf('send_to_queue_new')).toBe('${channel_attributes.default}');
    expect(attributesOf('send_to_queue_new_own')).toBe(advocate);
    expect(result.taskAttributes.map(({ widget, source }) => `${widget}: ${source.kind}`)).toEqual([
      'send_to_queue_spanish: inline',
      'send_to_queue_advocate: inline',
      'send_to_queue_new: channelAttributes',
      'send_to_queue_new_own: inline',
    ]);
    expect(result.todo.join('\n')).toContain(
      `“send_to_queue_spanish” has task attributes of its own, written in the widget; ${template} stays as it is.`,
    );
  });

  test('the skilled worker checks split on what each route answers', () => {
    const content = smsBoard([
      object('available', 'checkQueueAvailability', { studioName: 'f_isSkilledWorkerAvailable_spanish' }),
      object('loggedIn', 'checkWorkerLoggedIn', { studioName: 'f_isSkilledWorkerLoggedIn_chattext_spanish' }),
    ]);
    const inputs = toStudioFlow(content, content.frames[0])
      .flow.states.filter((state) => state.type === 'split-based-on')
      .map((state) => state.properties.input);
    expect(inputs).toEqual([
      '{{widgets.f_isSkilledWorkerAvailable_spanish.parsed.totalAvailableWorkers}}',
      '{{widgets.f_isSkilledWorkerLoggedIn_chattext_spanish.parsed.totalLoggedInWorkers}}',
    ]);
  });
});

describe("the blocked check on a client profile's flags (a list): contains, not equal to", () => {
  const FLAGS = '{{widgets.f_getProfileFlagsForIdentifier.parsed.flags}}';
  const voiceBoard = async () => {
    const { boards } = await importHelpline(helplinesDir, 'usch');
    return boards.find(({ content }) => content.flow?.studio?.template.endsWith('/voice-childhelp-sd.tftpl'))!.content;
  };
  const stateOf = (content: BoardContent, name: string) =>
    toStudioFlow(content).flow.states.find((state) => state.name === name)!;

  test("USCH's live equal_to is exported as contains, the rest of the split as live, and said in the TODOs", async () => {
    const content = await voiceBoard();
    const live = content.objects.find((object) => object.studioName === 'split_contact_routing')!.studio!;
    const split = stateOf(content, 'split_contact_routing');
    expect(split.transitions).toEqual([
      live.transitions![0],
      {
        ...live.transitions![1],
        conditions: [
          { friendly_name: 'If value contains blocked', arguments: [FLAGS], type: 'contains', value: 'blocked' },
        ],
      },
    ]);
    expect(split.properties).toEqual({ ...live.properties, offset: live.offset });
    expect(toStudioFlow(content).todo).toContain(
      '“split_contact_routing”: blocked check now uses contains, was equal_to.',
    );
    // As exported it's the standard: nothing to warn about
    expect(boardChecks(content).map((issue) => issue.message)).not.toContainEqual(
      expect.stringContaining("profile's flags"),
    );
  });

  test('equal_to chosen on the board stays, with a warning that it misses contacts with more than one flag', async () => {
    const content = await voiceBoard();
    const routing = content.objects.find((object) => object.studioName === 'split_contact_routing')!;
    routing.exitOperators = { blocked: 'equal_to' };
    const [, blocked] = stateOf(content, 'split_contact_routing').transitions;
    expect(blocked.conditions).toEqual([expect.objectContaining({ type: 'equal_to', value: 'blocked' })]);
    expect(toStudioFlow(content).todo).not.toContainEqual(expect.stringContaining('blocked check now uses contains'));
    expect(boardChecks(content)).toContainEqual(
      expect.objectContaining({
        severity: 'warning',
        objectId: routing.id,
        message: expect.stringContaining('misses contacts with more than one flag'),
      }),
    );
  });

  test('a new Decision on the flags (chosen, or after an imported client profile check) defaults to contains blocked', async () => {
    const content = await voiceBoard();
    const check = content.objects.find((object) => object.studioName === 'f_getProfileFlagsForIdentifier')!;
    const decision: FlowObject = {
      id: 'new-split',
      type: 'decision',
      frameId: check.frameId,
      text: 'Blocked?',
      studioName: 'split_blocked',
      exits: ['blocked', 'abusive', 'noMatch'],
      x: 0,
      y: 0,
      width: 190,
      height: 110,
    };
    const withDecision = (object: FlowObject): BoardContent => ({
      ...content,
      objects: [...content.objects, object],
      connections: [...content.connections, { id: 'to-new', from: check.id, to: object.id, exit: 'success' }],
    });
    const [noMatch, blocked, abusive] = stateOf(withDecision(decision), 'split_blocked').transitions;
    expect(noMatch.event).toBe('noMatch');
    expect(blocked.conditions).toEqual([
      { friendly_name: 'If value contains blocked', arguments: [FLAGS], type: 'contains', value: 'blocked' },
    ]);
    // Only "blocked": other ways out are as chosen (and an equal_to on the flags is warned about)
    expect(abusive.conditions).toEqual([expect.objectContaining({ type: 'equal_to', value: 'abusive' })]);
    expect(boardChecks(withDecision(decision)).map((issue) => issue.message)).toContainEqual(
      expect.stringMatching(/^“Blocked\?”: “abusive” uses “equal to”/),
    );
    // Its input set on the board, not connected after the check
    const chosen = { ...decision, settings: { input: FLAGS } };
    const alone = { ...content, objects: [...content.objects, chosen] };
    expect(stateOf(alone, 'split_blocked').transitions[1].conditions).toEqual([
      expect.objectContaining({ type: 'contains', value: 'blocked' }),
    ]);
    // (new: nothing changed from live to say; the imported split's own TODO is still there)
    expect(toStudioFlow(alone).todo).not.toContainEqual(expect.stringContaining('“split_blocked”: blocked check'));
  });
});
