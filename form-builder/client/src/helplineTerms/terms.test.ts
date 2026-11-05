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
import fs from 'fs';
import path from 'path';

import { describe, expect, test } from '@jest/globals';

import { formDefinitionsDir } from '../testing/workspaceHarness';
import { HELPLINE_TERMS_FILE, SUBSTITUTIONS_FILE } from '../translations/translations';
import {
  applyHelplineTerms,
  EXCLUDED_KEYS,
  fillTemplate,
  guessHelplineTerms,
  handWrittenKeys,
  HelplineTerms,
  pluralOf,
  summarizeHelplineTermChanges,
  termCatalogue,
  templateOf,
} from './terms';

const pluginTranslations = path.join(formDefinitionsDir, '../../../../plugin-hrm-form/src/translations');
const english = JSON.parse(fs.readFileSync(path.join(pluginTranslations, 'en.json'), 'utf8')) as Record<string, string>;
const catalogue = termCatalogue(english);
const byKey = Object.fromEntries(catalogue.map(entry => [entry.key, entry]));

const terms: HelplineTerms = {
  child: { singular: 'help seeker', plural: 'help seekers' },
  case: { singular: 'incident', plural: 'incidents' },
  contact: { singular: 'connection', plural: 'connections' },
  counselor: { singular: 'advocate', plural: 'advocates' },
  profile: { singular: 'client record', plural: 'client records', shortSingular: 'record', shortPlural: 'records' },
};
const filled = (key: string, chosen: HelplineTerms = terms) => fillTemplate(byKey[key].template, chosen);

describe('Aselo’s strings with the helpline’s words', () => {
  test('every word in its place, singular or plural, with the sentence’s capitals', () => {
    expect(filled('CallType-child')).toBe('Help seeker calling about self');
    expect(filled('CallType-caller')).toBe('Someone calling about a help seeker');
    expect(filled('CaseHeader-CopyChildInfo')).toBe('Copy Help Seeker Information into Current Connection');
    expect(filled('SearchResultsIndex-Cases')).toBe('Incidents');
    expect(filled('CaseList-Filters-CaseCount-Plural')).toBe('{{count}} incidents');
    expect(filled('TeamsView-Counsellors')).toBe('advocates');
    expect(filled('Profile-Title')).toBe('Client Record');
    expect(filled('Profile-EditHeader')).toBe('Edit Record');
    expect(filled('CallTypeButtons-Categorize')).toBe('categorize this connection');
  });

  test('"a" or "an" follows the word', () => {
    expect(filled('SearchResultsIndex-SearchAgainForCase')).toBe('Search again for an incident');
    expect(filled('SearchResultsIndex-SearchAgainForContact')).toBe('Search again for a connection');
  });

  test('placeholders and the words not chosen stay as they are', () => {
    // Only in a placeholder: nothing to change
    expect(byKey['Case-ActionHeaderAdded']).toBeUndefined();
    expect(filled('Case-ActionHeaderCounselor')).toBe('Advocate:');
    expect(filled('ContactDetails-GeneralDetails-RepeatCaller')).toBe('Repeat Caller?');
    // With no words chosen, every string is Aselo's
    catalogue.forEach(entry => expect(fillTemplate(entry.template, {})).toBe(entry.english));
  });

  test('strings using a word in another sense are left out', () => {
    EXCLUDED_KEYS.forEach(key => expect(templateOf(key, english[key] ?? 'contact')).toBeUndefined());
    expect(byKey['TranscriptSection-PermanentError']).toBeUndefined();
    // Every excluded key is still one of Aselo's (or the list needs looking at)
    EXCLUDED_KEYS.forEach(key => expect(english[key]).toBeDefined());
  });
});

describe('applying the terms', () => {
  const usnm = JSON.parse(
    fs.readFileSync(path.join(formDefinitionsDir, 'usnm/v1/customStrings/Substitutions.json'), 'utf8'),
  ) as Record<string, Record<string, string>>;

  test('makes the strings, keeps the ones written by hand, and remembers which it made', () => {
    const files = { [SUBSTITUTIONS_FILE]: usnm };
    const handWritten = handWrittenKeys(files, catalogue);
    expect(handWritten).toContain('CallType-child');
    const applied = applyHelplineTerms(files, terms, catalogue);
    const own = (applied[SUBSTITUTIONS_FILE] as typeof usnm).en;
    // Written by hand: as it was
    expect(own['CallType-child']).toBe(usnm.en['CallType-child']);
    // Not written by hand before: made from the terms
    expect(own['CaseList-Filters-CaseCount-Plural']).toBe('{{count}} incidents');
    // Other languages untouched
    expect((applied[SUBSTITUTIONS_FILE] as typeof usnm).es).toEqual(usnm.es);
    const { generated } = applied[HELPLINE_TERMS_FILE] as { generated: Record<string, string> };
    expect(generated['CaseList-Filters-CaseCount-Plural']).toBe('{{count}} incidents');
    expect(generated['CallType-child']).toBeUndefined();

    // Changing a word again updates what it made; going back to Aselo's removes it
    const again = applyHelplineTerms(applied, { ...terms, case: { singular: 'report', plural: 'reports' } }, catalogue);
    expect((again[SUBSTITUTIONS_FILE] as typeof usnm).en['CaseList-Filters-CaseCount-Plural']).toBe(
      '{{count}} reports',
    );
    const none = applyHelplineTerms(again, {}, catalogue);
    expect('CaseList-Filters-CaseCount-Plural' in (none[SUBSTITUTIONS_FILE] as typeof usnm).en).toBe(false);
    expect((none[SUBSTITUTIONS_FILE] as typeof usnm).en['CallType-child']).toBe(usnm.en['CallType-child']);
  });

  test('Aselo staff can have strings written by hand made from the terms too', () => {
    const files = { [SUBSTITUTIONS_FILE]: usnm };
    const applied = applyHelplineTerms(files, terms, catalogue, ['CallType-child']);
    expect((applied[SUBSTITUTIONS_FILE] as typeof usnm).en['CallType-child']).toBe('Help seeker calling about self');
  });

  test('the words a helpline already uses are found in its strings', () => {
    const guessed = guessHelplineTerms({ [SUBSTITUTIONS_FILE]: usnm }, catalogue);
    expect(guessed.child?.singular).toBe('help seeker');
    expect(guessed.contact).toEqual({ singular: 'connection', plural: 'connections' });
  });

  test('the review says which words changed', () => {
    const applied = applyHelplineTerms({}, { case: { singular: 'incident', plural: 'incidents' } }, catalogue);
    expect(summarizeHelplineTermChanges({}, applied)).toEqual([
      { title: 'Helpline terms', lines: ['Case: Aselo’s “case” → “incident” / “incidents”'] },
    ]);
  });
});

test('plurals to start from', () => {
  expect(pluralOf('help seeker')).toBe('help seekers');
  expect(pluralOf('third party')).toBe('third parties');
  expect(pluralOf('young person')).toBe('young people');
  expect(pluralOf('child')).toBe('children');
  expect(pluralOf('witness')).toBe('witnesses');
});
