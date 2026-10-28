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
import type { BoardContent } from './model';
import { BOARD_SCHEMA_VERSION, exitsOf, suggestStudioName } from './model';
import {
  CanvasNode,
  duplicate,
  facingSide,
  nextExit,
  ObjectNode,
  reparent,
  toContent,
  toEdges,
  toNodes,
} from './canvasModel';

const board: BoardContent = {
  schemaVersion: BOARD_SCHEMA_VERSION,
  title: 'USNM contact flows',
  frames: [
    {
      id: 'f-voice',
      title: 'Voice: post-queue',
      x: 100,
      y: 100,
      width: 900,
      height: 600,
      channel: 'voice',
      stage: 'postqueue',
    },
  ],
  objects: [
    {
      id: 'o-hours',
      type: 'checkOperatingHours',
      frameId: 'f-voice',
      x: 40,
      y: 40,
      width: 190,
      height: 72,
      text: 'Check operating hours',
    },
    {
      id: 'o-english',
      type: 'decision',
      frameId: 'f-voice',
      x: 40,
      y: 200,
      width: 190,
      height: 110,
      text: 'Is English?',
      exits: ['Yes', 'No'],
    },
    {
      id: 'o-closed',
      type: 'playMessage',
      x: 1200,
      y: 300,
      width: 220,
      height: 72,
      text: 'Post queue closed',
      message: { channel: 'voice', language: 'en', script: 'We are closed.' },
      thread: {
        resolved: false,
        comments: [{ id: 'm-1', author: 'Ale', at: '2026-10-28T12:00:00Z', text: 'Recording missing' }],
      },
    },
  ],
  connections: [
    { id: 'c-1', from: 'o-hours', to: 'o-english', exit: 'open', fromSide: 'bottom', toSide: 'top' },
    { id: 'c-2', from: 'o-english', to: 'o-closed', exit: 'No', fromSide: 'right', toSide: 'left' },
  ],
  stickies: [
    { id: 's-1', frameId: 'f-voice', x: 400, y: 40, width: 160, height: 120, text: '2 minutes', color: 'yellow' },
  ],
};

describe('canvas model', () => {
  test('a board survives the trip to the canvas and back', () => {
    expect(toContent(board.title, toNodes(board), toEdges(board))).toEqual(board);
  });

  test('frames come first and hold their objects', () => {
    const nodes = toNodes(board);
    expect(nodes[0]).toMatchObject({ id: 'f-voice', type: 'frame' });
    expect(nodes.find((node) => node.id === 'o-hours')?.parentId).toBe('f-voice');
    expect(nodes.find((node) => node.id === 'o-closed')?.parentId).toBeUndefined();
  });

  test('moving an object onto a frame puts it in the frame, and off it takes it out', () => {
    let nodes: CanvasNode[] = toNodes(board);
    // o-closed is at 1200,300 (absolute); move it over the frame
    nodes = nodes.map((node) => (node.id === 'o-closed' ? { ...node, position: { x: 400, y: 400 } } : node));
    nodes = reparent(nodes, 'o-closed');
    expect(nodes.find((node) => node.id === 'o-closed')).toMatchObject({
      parentId: 'f-voice',
      position: { x: 300, y: 300 },
    });

    // o-hours is at 40,40 in the frame (140,140 absolute); move it out
    nodes = nodes.map((node) => (node.id === 'o-hours' ? { ...node, position: { x: 1000, y: 40 } } : node));
    nodes = reparent(nodes, 'o-hours');
    expect(nodes.find((node) => node.id === 'o-hours')).toMatchObject({
      parentId: undefined,
      position: { x: 1100, y: 140 },
    });
    expect(nodes[0].type).toBe('frame');
  });

  test('a new connection takes the next unused way out, and each way out connects once', () => {
    const nodes = toNodes(board);
    const edges = toEdges(board);
    const node = (id: string) => nodes.find((candidate) => candidate.id === id) as ObjectNode;

    expect(nextExit(node('o-english'), edges)).toEqual({ ok: true, exit: 'Yes' });
    expect(nextExit(node('o-hours'), edges)).toEqual({ ok: true, exit: 'closed' });

    // One unnamed way out: one connection
    expect(nextExit(node('o-closed'), [])).toEqual({ ok: true });
    const fromMessage = { ...edges[0], id: 'c-3', source: 'o-closed', data: {} };
    expect(nextExit(node('o-closed'), [fromMessage])).toMatchObject({
      ok: false,
      reason: expect.stringContaining('only one way out'),
    });
    // ...unless that connection is the one being moved
    expect(nextExit(node('o-closed'), [fromMessage], 'c-3')).toEqual({ ok: true });

    // All of a decision's ways out used
    const both = [...edges, { ...edges[1], id: 'c-4', data: { exit: 'Yes' } }];
    expect(nextExit(node('o-english'), both)).toMatchObject({
      ok: false,
      reason: expect.stringContaining('Add a way out'),
    });

    // Objects that end the flow
    const end = { ...node('o-closed'), data: { object: { ...node('o-closed').data.object, type: 'end' as const } } };
    expect(nextExit(end, [])).toMatchObject({ ok: false });
  });

  test('a connection dropped on an object arrives on the side facing its source', () => {
    const target = { x: 0, y: 0, width: 100, height: 60 };
    expect(facingSide({ x: 0, y: -200, width: 100, height: 60 }, target)).toBe('top');
    expect(facingSide({ x: 0, y: 200, width: 100, height: 60 }, target)).toBe('bottom');
    expect(facingSide({ x: -300, y: 20, width: 100, height: 60 }, target)).toBe('left');
    expect(facingSide({ x: 300, y: -20, width: 100, height: 60 }, target)).toBe('right');
  });

  test('copies get new ids, keep the connections between them, and stay in their frame', () => {
    const nodes = toNodes(board);
    const edges = toEdges(board);
    const copied = nodes.filter((node) => node.id === 'o-hours' || node.id === 'o-english');
    const result = duplicate(copied, edges, new Set(nodes.map((node) => node.id)));
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes.map((node) => node.id)).not.toContain('o-hours');
    expect(result.nodes.map((node) => node.parentId)).toEqual(['f-voice', 'f-voice']);
    expect(result.nodes[0].position).toEqual({ x: 80, y: 80 });
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toMatchObject({
      source: result.nodes[0].id,
      target: result.nodes[1].id,
      data: { exit: 'open' },
    });

    // Copying a frame copies what's inside, at the same place in the new frame
    const withFrame = duplicate(nodes, edges, new Set());
    const frameCopy = withFrame.nodes[0];
    expect(frameCopy.type).toBe('frame');
    expect(withFrame.nodes.filter((node) => node.parentId === frameCopy.id)).toHaveLength(3);
  });
});

describe('objects', () => {
  test('Studio names follow the standards', () => {
    const voice = { stage: 'postqueue' as const, channel: 'voice' as const };
    // Checks that call an account-scoped route are named after it
    expect(suggestStudioName({ type: 'checkOperatingHours', text: 'Check operating hours' })).toBe('f_operatingHours');
    expect(suggestStudioName({ type: 'checkClientProfile', text: 'Blocked?' })).toBe('f_getProfileFlagsForIdentifier');
    expect(
      suggestStudioName({ type: 'checkQueueAvailability', text: 'x', settings: { targetSkills: 'TYA,Calls' } }, voice),
    ).toBe('postqueue_f_isSkilledWorkerAvailable_tya_calls');
    expect(suggestStudioName({ type: 'checkWorkerLoggedIn', text: 'x' })).toBe('f_isSkilledWorkerLoggedIn');
    expect(suggestStudioName({ type: 'function', text: 'Save post survey' })).toBe('f_savePostSurvey');
    expect(suggestStudioName({ type: 'decision', text: 'Is English?' }, voice)).toBe('postqueue_split_is_english');
    expect(
      suggestStudioName({ type: 'playMessage', text: 'Post queue closed', message: { language: 'en' } }, voice),
    ).toBe('postqueue_play_message_voice_en_post_queue_closed');
    expect(
      suggestStudioName({ type: 'sendMessage', text: 'Keep waiting', message: { channel: 'sms', language: 'es' } }),
    ).toBe('send_message_sms_es_keep_waiting');
    expect(suggestStudioName({ type: 'sendToQueue', text: 'Queue' })).toBe('send_to_queue');
    expect(suggestStudioName({ type: 'sendToQueue', text: 'Spanish TYA' })).toBe('send_to_queue_spanish_tya');
    expect(suggestStudioName({ type: 'end', text: 'End' })).toBeUndefined();
  });

  test('ways out come from the object when it sets them, otherwise from its kind', () => {
    expect(exitsOf({ type: 'decision', exits: ['Yes', 'No'] })).toEqual(['Yes', 'No']);
    expect(exitsOf({ type: 'decision' })).toEqual(['Yes', 'No', 'noMatch']);
    expect(exitsOf({ type: 'checkOperatingHours', exits: ['x'] })).toEqual(['open', 'closed', 'holiday', 'failed']);
    expect(exitsOf({ type: 'playMessage' })).toEqual(['']);
  });
});
