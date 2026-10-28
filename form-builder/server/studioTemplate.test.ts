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
import { emptyBoard } from '../src/flows/model';
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
    const sms = boards.find((board) => board.content.frames[0].studio?.template.endsWith('/sms.tftpl'))!.content;
    const find = (studioName: string) => sms.objects.find((object) => object.studioName === studioName)!;

    const welcome = find('send_wait_sms_welcome');
    welcome.message = { ...welcome.message, script: 'Hello from the board' };
    const crisis = find('send_message_sms_tya_info');
    const generated = toStudioFlow(sms, sms.frames[0]);

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
    const moved = toStudioFlow(sms, sms.frames[0]);
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
