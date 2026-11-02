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
import { toStudioFlow, toStudioFlows } from '../src/flows/studioTemplate';
import { importHelpline } from './flowImport';
import { parseTemplate } from './hcl';

const helplinesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../twilio-iac/helplines');

const codes = readdirSync(helplinesDir).filter(
  (code) =>
    /^[a-z0-9]+$/.test(code) &&
    (existsSync(path.join(helplinesDir, code, 'staging.hcl')) ||
      existsSync(path.join(helplinesDir, code, 'production.hcl'))),
);

describe('Studio templates from boards', () => {
  test("an imported board, unchanged, gives back the live flow, for every helpline's flows", async () => {
    let compared = 0;
    for (const code of codes) {
      const { boards } = await importHelpline(helplinesDir, code);
      for (const { title, content } of boards) {
        const [generated] = toStudioFlows(content);
        expect(generated.template, title).toBeDefined();
        const original = parseTemplate(readFileSync(path.join(helplinesDir, generated.template!), 'utf8'));
        expect(parseTemplate(generated.text), title).toEqual(original);
        // Nothing changed on the board, so nothing to change in the .hcl files
        expect(generated.flowVars, title).toEqual([]);
        compared += 1;
      }
    }
    expect(compared).toBeGreaterThan(50);
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
    // A voice menu is a Gather and a Split on its digits
    expect(state('gather_input_voice_en_service')).toMatchObject({
      type: 'gather-input-on-call',
      transitions: [{ event: 'keypress', next: 'split_voice_en_service' }, { event: 'speech' }, { event: 'timeout' }],
      properties: { say: 'Press 1 or 2' },
    });
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
});
