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
import { describe, expect, test } from '@jest/globals';

import { parseDelimitedText } from '../linkedDropdowns/spreadsheet';
import {
  filterTranslationRows,
  findReplacements,
  getTranslationRows,
  helplineLanguages,
  localeFor,
  setTranslation,
  summarizeTranslationChanges,
  SUBSTITUTIONS_FILE,
  translationsFromSpreadsheet,
  translationsToCsv,
} from './translations';

const aselo = {
  strings: {
    'CallType-child': 'Child calling about self',
    'Case-Title': 'Case',
    'Profile-Title': 'Client Profile',
  },
  translated: ['CallType-child'],
};
const files = {
  [SUBSTITUTIONS_FILE]: {
    en: { 'CallType-child': 'Help seeker calling about self', Age: 'Age' },
    es: { 'Case-Title': 'Caso' },
  },
};

describe('the text counselors see', () => {
  test('comes from Aselo, or from the helpline when it changed it', () => {
    const rows = getTranslationRows(files, 'en', aselo);
    const byKey = Object.fromEntries(rows.map(row => [row.key, row]));
    expect(byKey['CallType-child']).toMatchObject({
      text: 'Help seeker calling about self',
      aseloText: 'Child calling about self',
      source: 'helpline',
    });
    expect(byKey['Case-Title']).toMatchObject({ text: 'Case', source: 'aselo', inEnglish: false });
    // A key only the helpline has, e.g. a field label looked up by its text
    expect(byKey.Age).toMatchObject({ text: 'Age', aseloText: '', source: 'helplineOnly' });
  });

  test('in another language, strings Aselo has no translation for are marked as English', () => {
    const rows = getTranslationRows(files, 'es', aselo);
    const byKey = Object.fromEntries(rows.map(row => [row.key, row]));
    expect(byKey['CallType-child'].inEnglish).toBe(false);
    expect(byKey['Case-Title']).toMatchObject({ text: 'Caso', inEnglish: false });
    expect(byKey['Profile-Title'].inEnglish).toBe(true);
    expect(filterTranslationRows(rows, 'untranslated', '').map(row => row.key)).toEqual(['Profile-Title']);
    expect(filterTranslationRows(rows, 'changed', '').map(row => row.key)).toEqual(['Case-Title']);
    expect(filterTranslationRows(rows, 'all', 'profile').map(row => row.key)).toEqual(['Profile-Title']);
  });

  test('languages: the helpline’s own first after English, and its locale for Aselo’s text', () => {
    expect(helplineLanguages(files, 'fr-CA')).toEqual(['en', 'es', 'fr']);
    expect(helplineLanguages({}, undefined)).toEqual(['en']);
    expect(localeFor('es', 'es-CL')).toBe('es-CL');
    expect(localeFor('en', 'es-CL')).toBe('en');
  });
});

describe('changing a string', () => {
  test('keeps it, unless it’s Aselo’s text again (then it follows Aselo’s)', () => {
    const changed = setTranslation(files, 'en', 'Case-Title', 'Incident', 'Case');
    expect((changed[SUBSTITUTIONS_FILE] as any).en['Case-Title']).toBe('Incident');
    const back = setTranslation(changed, 'en', 'Case-Title', 'Case', 'Case');
    expect('Case-Title' in (back[SUBSTITUTIONS_FILE] as any).en).toBe(false);
  });

  test('a language left with nothing of its own is removed', () => {
    const changed = setTranslation(files, 'es', 'Case-Title', undefined, 'Case');
    expect(Object.keys(changed[SUBSTITUTIONS_FILE] as object)).toEqual(['en']);
  });
});

describe('find & replace', () => {
  const rows = getTranslationRows({}, 'en', {
    strings: {
      a: 'Child calling about self',
      b: 'Copy child information',
      c: 'CHILD',
      d: 'Children',
      e: 'A childish thing',
    },
    translated: [],
  });

  test('whole words, with the replacement following each match’s capitals', () => {
    const found = findReplacements(rows, 'child', 'help seeker', { matchCase: false, wholeWord: true });
    expect(Object.fromEntries(found.map(change => [change.key, change.after]))).toEqual({
      a: 'Help seeker calling about self',
      b: 'Copy help seeker information',
      c: 'HELP SEEKER',
    });
  });

  test('match case and parts of words when asked', () => {
    expect(findReplacements(rows, 'Child', 'Person', { matchCase: true, wholeWord: false }).map(c => c.after)).toEqual([
      'Person calling about self',
      'Personren',
    ]);
  });

  test('characters with a meaning in patterns are found as written', () => {
    const special = getTranslationRows({}, 'en', { strings: { a: 'Price (USD)?', b: 'Price' }, translated: [] });
    expect(findReplacements(special, '(USD)?', '($)', { matchCase: false, wholeWord: false }).map(c => c.key)).toEqual([
      'a',
    ]);
  });
});

describe('spreadsheets', () => {
  test('export, fill in and import back: only the changed rows count; an empty cell goes back to Aselo’s', () => {
    const rows = getTranslationRows(files, 'en', aselo);
    const cells = parseDelimitedText(translationsToCsv(rows));
    expect(cells[0]).toEqual(['Key', 'Aselo', 'Helpline']);
    const edited = cells.map(line => {
      if (line[0] === 'Case-Title') return [line[0], line[1], 'Incident, report'];
      if (line[0] === 'CallType-child') return [line[0], line[1], ''];
      return line;
    });
    expect(translationsFromSpreadsheet(edited, rows).changes).toEqual([
      { key: 'CallType-child', text: undefined, aseloText: 'Child calling about self' },
      { key: 'Case-Title', text: 'Incident, report', aseloText: 'Case' },
    ]);
  });

  test('a spreadsheet without the columns says so', () => {
    expect(translationsFromSpreadsheet([['a', 'b']], []).error).toMatch(/“Key” and a “Helpline” column/);
  });
});

test('the review says how many strings changed, per language', () => {
  const changed = setTranslation(
    setTranslation(files, 'en', 'Case-Title', 'Incident', 'Case'),
    'en',
    'CallType-child',
    'Help Seeker calling about self',
    'Child calling about self',
  );
  expect(summarizeTranslationChanges(files, changed)).toEqual([
    { title: 'Translations', lines: ['en: 1 changed from Aselo’s text, 1 edited'] },
  ]);
  expect(summarizeTranslationChanges(files, files)).toEqual([]);
});
