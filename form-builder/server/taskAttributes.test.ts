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

import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';
import { boardChecks } from '../src/flows/checks';
import { emptyBoard } from '../src/flows/model';
import type { BoardContent, FlowObject } from '../src/flows/model';
import { toStudioFlow } from '../src/flows/studioTemplate';
import {
  isChannelAttributesReference,
  STANDARD_TASK_ATTRIBUTES,
  standardTaskAttributes,
  taskAttributeNames,
  taskAttributesProblem,
} from '../src/flows/taskAttributes';
import { importHelpline } from './flowImport';

const helplinesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../twilio-iac/helplines');

describe('task attributes of "Send to queue" widgets', () => {
  test('the standard ones are the same as the templates in twilio-iac', () => {
    Object.entries(STANDARD_TASK_ATTRIBUTES).forEach(([template, json]) => {
      expect(json, template).toBe(
        readFileSync(path.join(helplinesDir, template), 'utf8').replace(/\r\n/g, '\n').trimEnd(),
      );
    });
  });

  test('every channel-attributes template reads as JSON once Studio and Terraform fill it in', () => {
    const templates = readdirSync(helplinesDir, { recursive: true, encoding: 'utf8' }).filter(
      (file) => /channel-attributes[\\/][^\\/]+\.tftpl$/.test(file) && !file.includes('node_modules'),
    );
    expect(templates.length).toBeGreaterThan(10);
    templates.forEach((file) => {
      const json = readFileSync(path.join(helplinesDir, file), 'utf8');
      expect(taskAttributesProblem(json), file).toBeUndefined();
    });
    expect(taskAttributeNames(STANDARD_TASK_ATTRIBUTES['templates/channel-attributes/voice.tftpl'])).toEqual([
      'type',
      'name',
      'ignoreAgent',
      'helpline',
      'transferTargetType',
      'channelType',
      'conversations',
    ]);
    expect(taskAttributesProblem('{ "channelType": "voice", }')).toBeDefined();
  });

  test('the reference to the channel attributes, in both ways templates write it', () => {
    expect(isChannelAttributesReference('${channel_attributes.default}')).toBe(true);
    expect(isChannelAttributesReference({ expression: 'channel_attributes["default"]' })).toBe(true);
    expect(isChannelAttributesReference('{"type": "inbound"}')).toBe(false);
  });

  test("the import shows the channel's attributes, picked as Terraform picks them", async () => {
    const { boards } = await importHelpline(helplinesDir, 'usch');
    const queues = boards.flatMap((board) => board.content.objects.filter((object) => object.type === 'sendToQueue'));
    const sms = queues.find(
      (object) =>
        object.taskAttributes?.source.kind === 'channelAttributes' &&
        object.taskAttributes.source.template ===
          'usch/templates/channel-attributes/sms_courage_first-conversations.tftpl',
    )!;
    expect(sms.taskAttributes!.source).toEqual({
      kind: 'channelAttributes',
      template: 'usch/templates/channel-attributes/sms_courage_first-conversations.tftpl',
      channels: ['sms_courage_first'],
    });
    expect(sms.taskAttributes!.json).toBe(
      readFileSync(
        path.join(helplinesDir, 'usch/templates/channel-attributes/sms_courage_first-conversations.tftpl'),
        'utf8',
      ).trimEnd(),
    );
    // Written in the widget (USCH's voice flows)
    expect(queues.some((object) => object.taskAttributes?.source.kind === 'inline')).toBe(true);
  });

  test('changed on the board, they are listed for their template; the widget keeps the reference', async () => {
    const { boards } = await importHelpline(helplinesDir, 'usch');
    const board = boards.find((candidate) =>
      candidate.content.objects.some(
        (object) => object.type === 'sendToQueue' && object.taskAttributes?.source.kind === 'channelAttributes',
      ),
    )!;
    const content = structuredClone(board.content);
    const queue = content.objects.find(
      (object) => object.type === 'sendToQueue' && object.taskAttributes?.source.kind === 'channelAttributes',
    )!;
    queue.taskAttributes!.json = queue.taskAttributes!.json.replace('{', '{\n  "priorityContact": true,');
    const flow = toStudioFlow(
      content,
      content.frames.find((frame) => frame.id === queue.frameId),
    );
    const state = flow.flow.states.find((candidate) => candidate.name === queue.studio!.name)!;
    expect(isChannelAttributesReference(state.properties.attributes)).toBe(true);
    expect(flow.taskAttributes).toEqual([
      expect.objectContaining({ widget: queue.studio!.name, change: 'changed', json: queue.taskAttributes!.json }),
    ]);
    expect(flow.todo.join(' ')).toMatch(/task attributes are changed/);
  });

  test('a new "Send to queue": the standard ones for its channel, checked like any other', () => {
    const queue: FlowObject = {
      id: 'q',
      type: 'sendToQueue',
      frameId: 'f',
      text: 'Send to queue',
      studioName: 'send_to_queue',
      x: 0,
      y: 0,
      width: 160,
      height: 60,
      taskAttributes: standardTaskAttributes('instagram'),
    };
    const content: BoardContent = {
      ...emptyBoard('Test'),
      frames: [{ id: 'f', title: 'Instagram', channel: 'instagram', x: 0, y: 0, width: 600, height: 400 }],
      objects: [queue],
    };
    const flow = toStudioFlow(content, content.frames[0]);
    expect(flow.flow.states[0].properties.attributes).toBe('${channel_attributes.default}');
    expect(flow.taskAttributes[0]).toMatchObject({
      change: 'new',
      source: { template: 'templates/channel-attributes/custom-channel-conversations.tftpl' },
    });
    expect(boardChecks(content).some((issue) => /task attributes/.test(issue.message))).toBe(false);
    queue.taskAttributes = { ...queue.taskAttributes!, json: '{ "channelType": ' };
    expect(boardChecks(content).some((issue) => /task attributes aren't valid JSON/.test(issue.message))).toBe(true);
  });
});
