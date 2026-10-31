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
import type { BoardContent, Connection, FlowObject } from './model';
import { emptyBoard } from './model';
import {
  answer,
  coverageOf,
  renderLiquid,
  SimRun,
  startRun,
  testedPathOf,
  Unknown,
  validTestedPaths,
  visitedBy,
} from './simulate';

const object = (id: string, type: FlowObject['type'], extra: Partial<FlowObject> = {}): FlowObject => ({
  id,
  type,
  frameId: 'f',
  text: id,
  x: 0,
  y: 0,
  width: 100,
  height: 60,
  ...extra,
});
const connect = (from: string, to: string, exit?: string): Connection => ({ id: `${from}>${to}`, from, to, exit });
const board = (objects: FlowObject[], connections: Connection[]): BoardContent => ({
  ...emptyBoard('Test'),
  frames: [{ id: 'f', title: 'SMS', x: 0, y: 0, width: 900, height: 600, channel: 'sms' }],
  objects,
  connections,
});
const path = (run: SimRun) => run.steps.map((step) => (step.exit ? `${step.objectId}:${step.exit}` : step.objectId));

describe('Liquid', () => {
  const values: Record<string, unknown> = { 'flow.variables.count': '2', 'a.b': 'Yes' };
  const lookup = (key: string) => {
    if (key.startsWith('widgets.f_')) throw new Unknown(key);
    return values[key];
  };
  test("Repeat counters, ifs and filters, as Studio's", () => {
    const counter = '{% if flow.variables.count %}{{flow.variables.count | plus: 1}}{% else %}1{% endif %}';
    expect(renderLiquid(counter, lookup)).toBe('3');
    expect(renderLiquid(counter, () => undefined)).toBe('1');
    expect(renderLiquid('{{a.b | downcase}}-{{missing}}', lookup)).toBe('yes-');
    expect(
      renderLiquid(
        "{% if a.b == 'Yes' and flow.variables.count > 1 %}ok{% elsif x %}no{% else %}none{% endif %}",
        lookup,
      ),
    ).toBe('ok');
    expect(() => renderLiquid('{{widgets.f_check.parsed.flags}}', lookup)).toThrow(Unknown);
  });
});

describe('a run', () => {
  // The USCH case: a language menu, flow memory, a chatbot that hands the conversation back, then a
  // split on its release flag and on the language kept
  const content = board(
    [
      object('trigger', 'incoming'),
      object('done', 'decision', {
        studioName: 'split_pre_survey_complete',
        exits: ['true', 'noMatch'],
        settings: { input: '{{trigger.conversation.ChannelAttributes.preSurveyComplete}}' },
      }),
      object('ask', 'questionMessaging', { studioName: 'send_wait_sms_language' }),
      object('lang', 'decision', { studioName: 'split_language', exits: ['1', '2', 'noMatch'] }),
      object('keepEn', 'setFlowMemory', {
        studioName: 'f_setFlowMemory_lang_en',
        variables: [{ key: 'language', value: 'en' }],
      }),
      object('bot', 'chatbot', {
        studioName: 'f_captureChannelWithBot_pre_survey',
        settings: { botSuffix: 'pre_survey', releaseFlag: 'preSurveyComplete', releaseType: 'triggerStudioFlow' },
      }),
      object('chosen', 'decision', {
        studioName: 'split_language_chosen',
        exits: ['en', 'es', 'noMatch'],
        settings: { input: '{{trigger.conversation.ChannelAttributes.flowMemory.language}}' },
      }),
      object('queue', 'sendToQueue', { studioName: 'send_to_queue_en' }),
      object('again', 'repeat', { studioName: 'repeat_language', settings: { maxRepeats: '2' } }),
      object('close', 'sendMessageAndClose', { studioName: 'f_sendMessageAndRunJanitor_timeout' }),
    ],
    [
      connect('trigger', 'done'),
      connect('done', 'chosen', 'true'),
      connect('done', 'ask', 'noMatch'),
      connect('ask', 'lang', 'reply'),
      connect('ask', 'again', 'timeout'),
      connect('again', 'ask', 'repeat'),
      connect('again', 'close', 'max reached'),
      connect('lang', 'keepEn', '1'),
      connect('lang', 'ask', 'noMatch'),
      connect('keepEn', 'bot', 'success'),
      connect('keepEn', 'bot', 'failed'),
      connect('chosen', 'queue', 'en'),
    ],
  );

  test('asks for the reply, splits on it (the widget before it), and keeps flow memory for the second execution', () => {
    let run = startRun(content, 'trigger');
    // First execution: not back from the bot yet, so the language is asked
    expect(run.prompt).toMatchObject({ kind: 'reply', objectId: 'ask' });
    run = answer(content, run, { kind: 'reply', text: '1' });
    expect(run.prompt).toMatchObject({ kind: 'choose', objectId: 'keepEn', exits: ['success', 'failed'] });
    run = answer(content, run, { kind: 'exit', exit: 'success' });
    expect(run.attributes).toEqual({ flowMemory: { language: 'en' } });
    // The bot starts and has the conversation; its release starts the flow again
    run = answer(content, run, { kind: 'exit', exit: 'success' });
    expect(run.prompt).toMatchObject({ kind: 'release', memoryAttribute: 'memory', releaseFlag: 'preSurveyComplete' });
    run = answer(content, run, { kind: 'release', memory: { age: '15' } });
    expect(run.execution).toBe(2);
    expect(run.attributes).toEqual({
      flowMemory: { language: 'en' },
      memory: { age: '15' },
      preSurveyComplete: 'true',
    });
    // Second execution: back from the bot, on to the queue for the language kept; the queue's outcome is asked
    expect(run.prompt).toMatchObject({ kind: 'choose', objectId: 'queue' });
    run = answer(content, run, { kind: 'exit', exit: 'callComplete' });
    expect(run.ended).toMatchObject({ kind: 'end' });
    expect(path(run)).toEqual([
      'trigger',
      'done:noMatch',
      'ask:reply',
      'lang:1',
      'keepEn:success',
      'bot:success',
      'trigger',
      'done:true',
      'chosen:en',
      'queue:callComplete',
    ]);
    expect(run.steps.map((step) => step.execution)).toEqual([1, 1, 1, 1, 1, 1, 2, 2, 2, 2]);
    const visited = visitedBy(run);
    expect(visited.objects.get('trigger')).toEqual([1, 7]);
    expect(visited.connections.has('chosen>queue')).toBe(true);
  });

  test('pausing at every widget: what goes on by itself waits for Next, with what it worked out', () => {
    let run = startRun(content, 'trigger', true);
    // The trigger goes on; the first split waits, with what it read
    expect(run.prompt).toEqual({
      kind: 'continue',
      objectId: 'done',
      exit: 'noMatch',
      note: '{{trigger.conversation.ChannelAttributes.preSurveyComplete}} = “”',
    });
    run = answer(content, run, { kind: 'continue' });
    expect(run.prompt).toMatchObject({ kind: 'reply', objectId: 'ask' });
    run = answer(content, run, { kind: 'reply', text: '1' });
    expect(run.prompt).toMatchObject({ kind: 'continue', objectId: 'lang', exit: '1' });
    expect(path(answer(content, run, { kind: 'continue' })).slice(-2)).toEqual(['lang:1', 'keepEn']);
  });

  test('Repeat counts for real: after the maximum, its way out', () => {
    let run = startRun(content, 'trigger');
    run = answer(content, run, { kind: 'exit', exit: 'timeout' });
    expect(run.prompt).toMatchObject({ kind: 'reply', objectId: 'ask' });
    run = answer(content, run, { kind: 'exit', exit: 'timeout' });
    run = answer(content, run, { kind: 'exit', exit: 'timeout' });
    expect(run.variables).toEqual({ language_counter: '3' });
    // Send message and close ends the conversation: its unconnected way out is the end
    expect(run.prompt).toMatchObject({ kind: 'choose', objectId: 'close' });
    run = answer(content, run, { kind: 'exit', exit: 'success' });
    expect(run.ended).toMatchObject({ kind: 'end' });
  });

  test("an unconnected way out is a dead end; one marked as ending isn't; a split it can't read is asked", () => {
    let run = startRun(content, 'trigger');
    run = answer(content, run, { kind: 'reply', text: '2' });
    // "2" isn't connected: the run stops and says so
    expect(run.ended).toMatchObject({ kind: 'deadEnd', objectId: 'lang', exit: '2' });
    const ended = {
      ...content,
      objects: content.objects.map((candidate) =>
        candidate.id === 'lang' ? { ...candidate, endedExits: ['2'] } : candidate,
      ),
    };
    run = answer(ended, startRun(ended, 'trigger'), { kind: 'reply', text: '2' });
    expect(run.ended).toMatchObject({ kind: 'end' });

    const unknown = {
      ...content,
      objects: content.objects.map((candidate) =>
        candidate.id === 'done'
          ? { ...candidate, settings: { input: '{{widgets.f_getProfileFlagsForIdentifier.parsed.flags}}' } }
          : candidate,
      ),
    };
    expect(startRun(unknown, 'trigger').prompt).toMatchObject({
      kind: 'choose',
      objectId: 'done',
      exits: ['true', 'noMatch'],
    });
  });

  test('tested paths: green while nothing on them changes, and what of the board they cover', () => {
    let run = startRun(content, 'trigger');
    run = answer(content, run, { kind: 'reply', text: 'hello' });
    // noMatch goes back to the question: stop there
    run = answer(content, run, { kind: 'stop' });
    const tested = testedPathOf(content, run, 'Alejandro', 'p1');
    expect(validTestedPaths(content, [tested])).toHaveLength(1);
    const coverage = coverageOf(content, [tested]);
    expect(coverage.waysOut.find((way) => way.objectId === 'lang' && way.exit === 'noMatch')?.tested).toBe(true);
    expect(coverage.waysOut.find((way) => way.objectId === 'lang' && way.exit === '1')?.tested).toBe(false);
    // Moving or renaming the text doesn't matter; a way out changed on the path does
    const moved = {
      ...content,
      objects: content.objects.map((candidate) => ({ ...candidate, x: 500, text: 'Moved' })),
    };
    expect(validTestedPaths(moved, [tested])).toHaveLength(1);
    const changed = {
      ...content,
      objects: content.objects.map((candidate) =>
        candidate.id === 'lang' ? { ...candidate, exits: ['1', '2', '3', 'noMatch'] } : candidate,
      ),
    };
    expect(validTestedPaths(changed, [tested])).toHaveLength(0);
  });
});
