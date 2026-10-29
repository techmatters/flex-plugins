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

import { beforeAll, describe, expect, test } from 'vitest';
import { DefinitionFiles, loadDefinitionFiles } from '../server/definitionsApi';
import { formDefinitionsDir, helplinesConfigDir, webchatConfigDir } from './testing/workspaceHarness';
import type { DefinitionFileMap } from './definitions';
import {
  checkFormSelectorFlag,
  formSelectorJson,
  readFormSelector,
  setFormSelector,
  summarizeFormSelector,
  summarizeFormSelectorChanges,
  validateFormSelector,
} from './formSelector';
import { PREPOPULATE_MAPPINGS_FILE } from './webchat';
import { summarizeSectionChanges, validateSections } from './sections';

const load = (code: string) =>
  loadDefinitionFiles(formDefinitionsDir, code, 'v1', helplinesConfigDir, webchatConfigDir);

let usnm: DefinitionFiles;
let usch: DefinitionFiles;
let usvc: DefinitionFiles;
beforeAll(async () => {
  [usnm, usch, usvc] = await Promise.all([load('usnm'), load('usch'), load('usvc')]);
});

const mappingsOf = (files: DefinitionFileMap) => files[PREPOPULATE_MAPPINGS_FILE] as Record<string, any>;

const withMappings = (files: DefinitionFileMap, mappings: unknown): DefinitionFileMap => ({
  ...files,
  [PREPOPULATE_MAPPINGS_FILE]: mappings,
});

describe('reading', () => {
  test('a static selector (usnm)', () => {
    expect(readFormSelector(usnm.files)).toEqual({
      selector: { kind: 'static', tabs: ['ChildInformationTab'], callType: 'Child calling about self' },
      implicit: false,
    });
    expect(summarizeFormSelector(readFormSelector(usnm.files))).toBe(
      'Every contact fills in Child information; call type: Child calling about self',
    );
  });

  test('a service user choice, keeping a missing aboutSelfValue as missing (usch)', () => {
    const { selector } = readFormSelector(usch.files);
    expect(selector).toEqual({
      kind: 'choice',
      choices: [
        { form: 'preEngagement', input: 'aboutSelf', aboutSelfValue: 'Yes' },
        { form: 'survey', input: 'aboutSelf' },
      ],
    });
    expect(summarizeFormSelector(readFormSelector(usch.files))).toMatch(
      /^The first answered of “aboutSelf” in the webchat form \(about themselves when “Yes”\), then “aboutSelf” in the chatbot \(about themselves when “Yes”\) decides: about themselves → Case information, Child information \(Child calling about self\); any other answer → Case information, Caller information \(Someone calling about a child\)/,
    );
  });

  test('no formSelector means checking “aboutSelf” in the chatbot', () => {
    const { formSelector, ...rest } = mappingsOf(usnm.files);
    const info = readFormSelector(withMappings(usnm.files, rest));
    expect(info).toEqual({
      selector: { kind: 'choice', choices: [{ form: 'survey', input: 'aboutSelf', aboutSelfValue: 'Yes' }] },
      implicit: true,
    });
    expect(summarizeFormSelector(info)).toMatch(
      /^The answer to “aboutSelf” in the chatbot .* decides \(Aselo’s default/,
    );
    // No file at all: the same
    const { [PREPOPULATE_MAPPINGS_FILE]: removed, ...noFile } = usnm.files;
    expect(readFormSelector(noFile).implicit).toBe(true);
  });

  test('an unknown selector type also falls back to the default', () => {
    const info = readFormSelector(withMappings(usnm.files, { formSelector: { selectorType: 'other' } }));
    expect(info.unknownType).toBe('other');
    expect(info.selector).toEqual({
      kind: 'choice',
      choices: [{ form: 'survey', input: 'aboutSelf', aboutSelfValue: 'Yes' }],
    });
  });
});

describe('writing', () => {
  test.each(['usnm', 'usch', 'usvc'])('reads and writes %s back unchanged', (code) => {
    const files = { usnm, usch, usvc }[code]!.files;
    const info = readFormSelector(files);
    expect(formSelectorJson(info.selector)).toEqual(mappingsOf(files).formSelector);
    expect(setFormSelector(files, info.selector)).toBe(files);
  });

  test('keeps every other key, and the formSelector’s place in the file', () => {
    const next = setFormSelector(usch.files, {
      kind: 'static',
      tabs: ['ChildInformationTab', 'CaseInformationTab'],
    });
    const written = mappingsOf(next);
    expect(Object.keys(written)).toEqual(Object.keys(mappingsOf(usch.files)));
    expect(written.survey).toEqual(mappingsOf(usch.files).survey);
    expect(written.preEngagement).toEqual(mappingsOf(usch.files).preEngagement);
    expect(written.formSelector).toEqual({
      selectorType: 'staticSelector',
      parameter: { availableTabs: ['ChildInformationTab', 'CaseInformationTab'] },
    });
  });

  test('writes an explicit selector first when there was none, and creates the file if needed', () => {
    const { formSelector, ...rest } = mappingsOf(usnm.files);
    const selector = { kind: 'choice' as const, choices: [{ form: 'survey' as const, input: 'aboutSelf' }] };
    const next = mappingsOf(setFormSelector(withMappings(usnm.files, rest), selector));
    expect(Object.keys(next)[0]).toBe('formSelector');
    expect(next.formSelector).toEqual({
      selectorType: 'serviceUserChoiceSelector',
      parameter: [{ form: 'survey', input: 'aboutSelf' }],
    });
    const { [PREPOPULATE_MAPPINGS_FILE]: removed, ...noFile } = usnm.files;
    expect(mappingsOf(setFormSelector(noFile, selector))).toEqual({
      formSelector: next.formSelector,
      survey: {},
      preEngagement: {},
    });
  });
});

describe('checks', () => {
  const messages = (draft: DefinitionFileMap, original: DefinitionFileMap) =>
    validateFormSelector(draft, original).map((found) => `${found.severity}: ${found.message}`);

  test('unknown and empty tabs are errors', () => {
    const unknown = setFormSelector(usnm.files, { kind: 'static', tabs: ['ContactlessTaskTab'] });
    expect(messages(unknown, usnm.files)).toContain(
      'error: Filling in the contact: “ContactlessTaskTab” isn’t a contact form tab Aselo can fill in.',
    );
    const empty = setFormSelector(usnm.files, { kind: 'static', tabs: [] });
    expect(messages(empty, usnm.files)).toContain('error: Filling in the contact: no contact form tab is filled in.');
    // Already broken before: only a warning
    expect(messages(empty, empty)).toContain(
      'warning: Filling in the contact: no contact form tab is filled in. (This was already the case before your changes.)',
    );
  });

  test('answers mapped onto tabs that are never filled in (usnm’s webchat answers for the Caller tab)', () => {
    expect(messages(usnm.files, usnm.files)).toContain(
      'warning: Filling in the contact: “province” from the webchat form fills in Caller information, which is never filled in.',
    );
    expect(validateSections(usnm.files, usnm.files).every((found) => found.severity === 'warning')).toBe(true);
  });

  test('webchat answers must be questions of the webchat form, with the answer among its options', () => {
    // usvc checks "startForm", which isn't in its webchat form
    expect(messages(usvc.files, usvc.files)).toContain(
      'warning: Filling in the contact: “startForm” isn’t a question in the webchat form.',
    );
    expect(messages(usch.files, usch.files)).toEqual([]);
    const wrongValue = setFormSelector(usch.files, {
      kind: 'choice',
      choices: [{ form: 'preEngagement', input: 'aboutSelf', aboutSelfValue: 'Myself' }],
    });
    expect(messages(wrongValue, usch.files)).toContain(
      'warning: Filling in the contact: “Myself” isn’t one of the answers to “aboutSelf” in the webchat form.',
    );
    const unnamed = setFormSelector(usch.files, { kind: 'choice', choices: [{ form: 'survey', input: '' }] });
    expect(messages(unnamed, usch.files)).toContain('error: Filling in the contact: answer 1 has no name.');
  });

  test('a change with use_prepopulate_mappings off is flagged for the reviewer', () => {
    const changed = setFormSelector(usnm.files, {
      kind: 'static',
      tabs: ['ChildInformationTab', 'CaseInformationTab'],
    });
    expect(checkFormSelectorFlag(usnm.files, changed, false)).toHaveLength(1);
    expect(checkFormSelectorFlag(usnm.files, changed, true)).toEqual([]);
    expect(checkFormSelectorFlag(usnm.files, usnm.files, false)).toEqual([]);
  });
});

describe('review', () => {
  test('describes the change before and after', () => {
    const changed = setFormSelector(usnm.files, {
      kind: 'static',
      tabs: ['ChildInformationTab', 'CaseInformationTab'],
    });
    const expected = {
      title: 'Filling in the contact',
      lines: [
        'Now: Every contact fills in Child information, Case information; call type: none (the counselor picks)',
        'Before: Every contact fills in Child information; call type: Child calling about self',
      ],
    };
    expect(summarizeFormSelectorChanges(usnm.files, changed)).toEqual([expected]);
    expect(summarizeSectionChanges(usnm.files, changed)).toContainEqual(expected);
    expect(summarizeFormSelectorChanges(usnm.files, usnm.files)).toEqual([]);
  });
});
