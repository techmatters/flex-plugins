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
import type { Board } from './model';
import { BOARD_SCHEMA_VERSION } from './model';
import { exportFileName, scriptRows, toFlowExport } from './exports';
import type { RecordingsList } from './recordings';

const board: Board = {
  code: 'usnm',
  id: 'abcd1234',
  meta: { revision: 3, createdAt: 'then', createdBy: 'Ale', updatedAt: '2026-10-28T12:00:00Z', updatedBy: 'Ale' },
  content: {
    schemaVersion: BOARD_SCHEMA_VERSION,
    title: 'USNM contact flows',
    frames: [
      {
        id: 'f-pre',
        title: 'Voice: pre-queue',
        x: 0,
        y: 0,
        width: 900,
        height: 600,
        channel: 'voice',
        stage: 'prequeue',
      },
      {
        id: 'f-post',
        title: 'Voice: post-queue',
        x: 0,
        y: 700,
        width: 900,
        height: 600,
        channel: 'voice',
        stage: 'postqueue',
      },
      { id: 'f-sms', title: 'SMS', x: 1000, y: 0, width: 900, height: 600, channel: 'sms' },
    ],
    objects: [
      {
        id: 'o-tya',
        type: 'checkQueueAvailability',
        frameId: 'f-pre',
        text: 'TYA specialist free?',
        studioName: 'f_isSkilledWorkerAvailable_tya_calls',
        settings: { targetSkills: 'TYA,Calls', targetChannel: 'voice' },
        x: 40,
        y: 200,
        width: 210,
        height: 72,
      },
      {
        id: 'o-welcome',
        type: 'playMessage',
        frameId: 'f-pre',
        text: 'Welcome',
        studioName: 'play_message_voice_en_welcome',
        message: { channel: 'voice', language: 'en', script: 'Thank you for calling.' },
        endedExits: [''],
        x: 40,
        y: 40,
        width: 220,
        height: 72,
        thread: { resolved: false, comments: [{ id: 'm', author: 'Ale', at: 'now', text: 'Shorter?' }] },
      },
      {
        id: 'o-keep',
        type: 'sendMessage',
        frameId: 'f-sms',
        text: 'Keep waiting',
        studioName: 'postqueue_send_message_sms_en_keep_waiting',
        message: { language: 'en' },
        x: 40,
        y: 40,
        width: 220,
        height: 72,
      },
      {
        id: 'o-closed',
        type: 'playMessage',
        frameId: 'f-post',
        text: 'Closed',
        message: { channel: 'voice', language: 'es', script: 'Estamos cerrados.' },
        x: 40,
        y: 40,
        width: 220,
        height: 72,
      },
    ],
    connections: [{ id: 'c1', from: 'o-tya', to: 'o-welcome', exit: 'available' }],
    stickies: [
      {
        id: 's1',
        frameId: 'f-pre',
        text: 'Record the welcome',
        color: 'yellow',
        x: 400,
        y: 40,
        width: 160,
        height: 120,
        task: { status: 'todo', assignee: 'Ale' },
      },
    ],
  },
};

describe('JSON for Claude', () => {
  test('one flow per Studio flow, objects with their names, exits, calls and recordings', () => {
    const exported = toFlowExport(board);
    expect(exported.board).toEqual({
      helpline: 'usnm',
      id: 'abcd1234',
      title: 'USNM contact flows',
      // Saved before statuses, not imported: being designed
      status: 'in-progress',
      statusLabel: 'In progress',
      isNew: true,
      updatedAt: '2026-10-28T12:00:00Z',
      updatedBy: 'Ale',
    });
    expect(exported.about).toMatch(/only when board.status is "ready"/);
    expect(toFlowExport({ ...board, content: { ...board.content, status: 'ready' } }).board).toMatchObject({
      status: 'ready',
      statusLabel: 'Ready for Claude',
    });
    expect(exported.about).toMatch(/twilio-iac\/AGENTS\.md/);

    // The two voice frames are one Studio flow
    expect(exported.flows.map((flow) => [flow.key, flow.frames.map((frame) => frame.title)])).toEqual([
      ['channel:voice', ['Voice: pre-queue', 'Voice: post-queue']],
      ['channel:sms', ['SMS']],
    ]);
    const voice = exported.flows[0].objects;
    expect(voice.find((item) => item.id === 'o-tya')).toEqual({
      id: 'o-tya',
      type: 'checkQueueAvailability',
      kind: 'Skilled worker available?',
      studioWidget: 'HTTP Request + Split',
      studioName: 'f_isSkilledWorkerAvailable_tya_calls',
      text: 'TYA specialist free?',
      frame: 'f-pre',
      stage: 'prequeue',
      call: {
        route: 'worker/isSkilledWorkerAvailable',
        urlTemplate: '${lambda_twilio_account_scoped_url}/worker/isSkilledWorkerAvailable',
        body: { targetSkills: 'TYA,Calls', targetChannel: 'voice' },
      },
      exits: [
        { name: 'available', to: 'o-welcome', toStudioName: 'play_message_voice_en_welcome' },
        { name: 'not available' },
        { name: 'failed' },
      ],
    });
    expect(voice.find((item) => item.id === 'o-welcome')).toMatchObject({
      message: { channel: 'voice', language: 'en', recordingFile: 'play_message_voice_en_welcome.mp3' },
      exits: [{ name: '', endsFlow: true }],
      openComments: [{ author: 'Ale', text: 'Shorter?' }],
    });
    // No name yet, so no recording file yet
    expect(voice.find((item) => item.id === 'o-closed')?.message).toEqual({
      channel: 'voice',
      language: 'es',
      script: 'Estamos cerrados.',
      status: 'Script ready',
    });

    // Sticky notes (and their tasks) stay on the board: only widgets' comments are exported
    expect(exported).not.toHaveProperty('notes');
    expect(JSON.stringify(exported)).not.toContain('Record the welcome');
    expect(exported.checks).toContainEqual({
      severity: 'warning',
      message: '“Closed” has no Studio name yet.',
      objectId: 'o-closed',
    });
    expect(exported.layout['o-tya']).toEqual({ x: 40, y: 200, width: 210, height: 72, frame: 'f-pre' });
  });

  test('carries each frame written as a Studio flow template, with its variables and TODOs', () => {
    const { studioTemplates } = toFlowExport(board);
    expect(studioTemplates.map((template) => template.title)).toEqual(['Voice: pre-queue', 'Voice: post-queue', 'SMS']);
    const [preQueue] = studioTemplates;
    expect(preQueue.text.startsWith('${\n  jsonencode({')).toBe(true);
    expect(preQueue.text).toContain('"name": "f_isSkilledWorkerAvailable_tya_calls"');
    // Designed from scratch: no Trigger yet, a send to queue to set up...
    expect(preQueue.todo).toContain('The flow has no incoming call or message (its Trigger).');
    // ...and the SMS message's text goes in flow_vars
    expect(studioTemplates[2].variables).toEqual([
      {
        scope: 'flow_vars',
        name: 'postqueue_send_message_sms_en_keep_waiting',
        value: '',
        widget: 'postqueue_send_message_sms_en_keep_waiting',
      },
    ]);
  });

  test('is named after the helpline and board', () => {
    expect(exportFileName(board, '.flows.json')).toBe('usnm-usnm_contact_flows.flows.json');
  });
});

describe('recordings and scripts', () => {
  test('one row per message, by frame then top to bottom', () => {
    expect(scriptRows(board.content)).toEqual([
      {
        Frame: 'Voice: pre-queue',
        'Studio name': 'play_message_voice_en_welcome',
        'Recording file': 'play_message_voice_en_welcome.mp3',
        Kind: 'Play message (voice)',
        Channel: 'voice',
        Language: 'en',
        'Text on the board': 'Welcome',
        Script: 'Thank you for calling.',
        Status: 'Script ready',
      },
      {
        Frame: 'Voice: post-queue',
        'Studio name': '',
        'Recording file': '',
        Kind: 'Play message (voice)',
        Channel: 'voice',
        Language: 'es',
        'Text on the board': 'Closed',
        Script: 'Estamos cerrados.',
        Status: 'Script ready',
      },
      {
        Frame: 'SMS',
        'Studio name': 'postqueue_send_message_sms_en_keep_waiting',
        'Recording file': '',
        Kind: 'Send message',
        Channel: 'sms',
        Language: 'en',
        'Text on the board': 'Keep waiting',
        Script: '',
        Status: 'No script',
      },
    ]);
  });
});

describe('with the helpline recordings', () => {
  const stored = (etag: string, environment: string) => ({
    etag,
    size: 100,
    lastModified: 'now',
    url: `https://recordings.test/usnm/${environment}/play_message_voice_en_welcome.wav`,
  });
  const recordings: RecordingsList = {
    baseUrls: {
      staging: 'https://recordings.test/usnm/staging',
      production: 'https://recordings.test/usnm/production',
    },
    recordings: [
      {
        fileName: 'play_message_voice_en_welcome.wav',
        staging: stored('new', 'staging'),
        production: stored('old', 'production'),
        approvedBy: 'Aselo person',
      },
    ],
  };

  test('the JSON gives each recording its status and where to play it', () => {
    const exported = toFlowExport(board, recordings);
    expect(exported.recordingsBaseUrl).toEqual(recordings.baseUrls);
    expect(exported.flows[0].objects.find((item) => item.id === 'o-welcome')?.message).toMatchObject({
      // Approved, but production still has the older file
      status: 'Approved',
      recordingFile: 'play_message_voice_en_welcome.wav',
      recordingUrls: {
        staging: 'https://recordings.test/usnm/staging/play_message_voice_en_welcome.wav',
        production: 'https://recordings.test/usnm/production/play_message_voice_en_welcome.wav',
      },
    });
    expect(exported.checks).toContainEqual({
      severity: 'warning',
      message: '“Welcome”: its recording is approved but not published to production yet.',
      objectId: 'o-welcome',
    });
  });

  test('the spreadsheet says how far along each one is', () => {
    const [welcome] = scriptRows(board.content, recordings);
    expect(welcome).toMatchObject({ 'Recording file': 'play_message_voice_en_welcome.wav', Status: 'Approved' });
  });
});
