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

/**
 * The text counselors see in Aselo, and the helpline's own versions of it.
 *
 * Aselo (plugin-hrm-form/src/translations/index.ts) takes its own text (en.json, then the
 * language's file, then the locale's) and then the helpline's customStrings/Substitutions.json,
 * which has a block per base language ("en", "es"...) of whole strings by key. Nothing replaces
 * words inside a string: a changed string is the whole string, and it stops following Aselo's
 * own text when that changes. Field labels, answers and categories go through the same lookup,
 * keyed by their text, so a helpline can translate those here too.
 */
import type { DefinitionFileMap } from '../common/definitions';

export const SUBSTITUTIONS_FILE = 'customStrings/Substitutions.json';
// The helpline's terms and the strings they made (helplineTerms/terms.ts)
export const HELPLINE_TERMS_FILE = 'customStrings/HelplineTerms.json';

export type Strings = Record<string, string>;
type Substitutions = Record<string, Strings>;

// Where the text counselors see comes from
// Aselo's, made from the helpline's terms, written for the helpline, or a key only the helpline has
type TranslationSource = 'aselo' | 'terms' | 'helpline' | 'helplineOnly';

export type TranslationRow = {
  key: string;
  // Aselo's own text in this language ('' when only the helpline has the key, e.g. a field label)
  aseloText: string;
  // What counselors see
  text: string;
  source: TranslationSource;
  // Aselo has no text of its own for it in this language, so counselors see English
  inEnglish: boolean;
};

export type TranslationFilter = 'all' | 'changed' | 'untranslated';

const getSubstitutions = (files: DefinitionFileMap): Substitutions =>
  (files[SUBSTITUTIONS_FILE] ?? {}) as Substitutions;

const baseLanguageOf = (language: string) => language.split('-')[0];

const englishFirst = (a: string, b: string) => {
  if (a === b) return 0;
  if (a === 'en') return -1;
  if (b === 'en') return 1;
  return a.localeCompare(b);
};

/**
 * The languages the helpline has: its own (helplineLanguage), English, and any it has text for.
 * Substitutions are by base language, so these are too.
 */
export const helplineLanguages = (files: DefinitionFileMap, helplineLanguage?: string): string[] =>
  [
    ...new Set([
      baseLanguageOf(helplineLanguage ?? 'en'),
      'en',
      ...Object.keys(getSubstitutions(files)).map(baseLanguageOf),
    ]),
  ].sort(englishFirst);

/**
 * The locale whose Aselo text a language's defaults come from: the helpline's own locale when
 * it's that language (es-CL for a Chilean helpline), the base language otherwise.
 */
export const localeFor = (language: string, helplineLanguage?: string) =>
  helplineLanguage && baseLanguageOf(helplineLanguage) === language ? helplineLanguage : language;

export const getTranslationRows = (
  files: DefinitionFileMap,
  language: string,
  aselo: { strings: Strings; translated: string[] },
): TranslationRow[] => {
  const own = getSubstitutions(files)[language] ?? {};
  const fromTerms =
    language === 'en'
      ? (files[HELPLINE_TERMS_FILE] as { generated?: Strings } | undefined)?.generated ?? {}
      : ({} as Strings);
  const translated = new Set(aselo.translated);
  const keys = [...new Set([...Object.keys(aselo.strings), ...Object.keys(own)])];
  return keys.map(key => {
    const aseloText = aselo.strings[key] ?? '';
    const hasOwn = key in own;
    let source: TranslationSource = 'aselo';
    if (hasOwn) source = key in aselo.strings ? 'helpline' : 'helplineOnly';
    if (hasOwn && fromTerms[key] === own[key]) source = 'terms';
    return {
      key,
      aseloText,
      text: hasOwn ? own[key] : aseloText,
      source,
      inEnglish: language !== 'en' && !hasOwn && key in aselo.strings && !translated.has(key),
    };
  });
};

export const filterTranslationRows = (rows: TranslationRow[], filter: TranslationFilter, search: string) => {
  const query = search.trim().toLowerCase();
  return rows.filter(row => {
    if (filter === 'changed' && row.source === 'aselo') return false;
    if (filter === 'untranslated' && !row.inEnglish) return false;
    if (!query) return true;
    return `${row.key}\n${row.text}\n${row.aseloText}`.toLowerCase().includes(query);
  });
};

/**
 * Sets the helpline's text for a key in a language. Text that's the same as Aselo's own isn't
 * kept (so it goes on following Aselo's), and neither is an empty language block.
 */
export const setTranslation = (
  files: DefinitionFileMap,
  language: string,
  key: string,
  text: string | undefined,
  aseloText: string | undefined,
): DefinitionFileMap => {
  const substitutions = getSubstitutions(files);
  const { [key]: _previous, ...rest } = substitutions[language] ?? {};
  const keep = text !== undefined && text !== aseloText;
  const block = keep ? { ...rest, [key]: text } : rest;
  const { [language]: _block, ...otherLanguages } = substitutions;
  return {
    ...files,
    [SUBSTITUTIONS_FILE]: Object.keys(block).length > 0 ? { ...otherLanguages, [language]: block } : otherLanguages,
  };
};

// Several at once (find & replace, a spreadsheet): text by key
export const setTranslations = (
  files: DefinitionFileMap,
  language: string,
  changes: { key: string; text: string | undefined; aseloText: string | undefined }[],
) =>
  changes.reduce(
    (current, change) => setTranslation(current, language, change.key, change.text, change.aseloText),
    files,
  );

type FindOptions = { matchCase: boolean; wholeWord: boolean };

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findPattern = (find: string, { matchCase, wholeWord }: FindOptions) =>
  new RegExp(wholeWord ? `\\b${escapeRegExp(find)}\\b` : escapeRegExp(find), matchCase ? 'g' : 'gi');

// Keeps the case of the word replaced: "Child" -> "Help seeker" becomes "Help seeker", "CHILD" -> "HELP SEEKER"
const inCaseOf = (found: string, replacement: string) => {
  if (found === found.toUpperCase() && /[A-Z]/.test(found) && found.length > 1) return replacement.toUpperCase();
  if (found[0] === found[0].toUpperCase() && /[A-Za-z]/.test(found[0])) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement.charAt(0).toLowerCase() + replacement.slice(1);
};

type Replacement = { key: string; before: string; after: string; aseloText: string };

// The strings the text is in, and what each would become
export const findReplacements = (
  rows: TranslationRow[],
  find: string,
  replace: string,
  options: FindOptions,
): Replacement[] => {
  if (!find) return [];
  const pattern = findPattern(find, options);
  return rows
    .filter(row => row.text.search(pattern) >= 0)
    .map(row => ({
      key: row.key,
      before: row.text,
      // Without "match case", the replacement follows each match's capitals
      after: row.text.replace(pattern, found => (options.matchCase ? replace : inCaseOf(found, replace))),
      aseloText: row.aseloText,
    }));
};

// A spreadsheet of a language's text: key, Aselo's text, the helpline's
const TRANSLATIONS_CSV_HEADERS = ['Key', 'Aselo', 'Helpline'];

const csvCell = (value: string) => (/[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export const translationsToCsv = (rows: TranslationRow[]) =>
  [TRANSLATIONS_CSV_HEADERS, ...rows.map(row => [row.key, row.aseloText, row.text])]
    .map(cells => cells.map(csvCell).join(','))
    .join('\r\n');

type SpreadsheetImport = {
  changes: { key: string; text: string | undefined; aseloText: string | undefined }[];
  error?: string;
};

/**
 * Reads a spreadsheet back (the one exported, after a translator filled in the helpline's
 * column): only rows whose text changed count, and an empty cell goes back to Aselo's text.
 */
export const translationsFromSpreadsheet = (cells: string[][], rows: TranslationRow[]): SpreadsheetImport => {
  const [header = [], ...lines] = cells;
  const keyColumn = header.findIndex(cell => cell.trim().toLowerCase() === 'key');
  const textColumn = header.findIndex(cell => cell.trim().toLowerCase() === 'helpline');
  if (keyColumn < 0 || textColumn < 0) {
    return { changes: [], error: 'The first row needs a “Key” and a “Helpline” column, as in the exported file.' };
  }
  const byKey = new Map(rows.map(row => [row.key, row]));
  const changes = lines
    .filter(line => line[keyColumn]?.trim())
    .map(line => {
      const key = line[keyColumn].trim();
      const text = line[textColumn] ?? '';
      const row = byKey.get(key);
      return { key, text: text === '' ? undefined : text, aseloText: row?.aseloText, current: row?.text };
    })
    .filter(change => (change.text ?? change.aseloText) !== change.current)
    .map(({ key, text, aseloText }) => ({ key, text, aseloText }));
  return { changes };
};

// What a draft changes, for "Review your changes"
export const summarizeTranslationChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] => {
  const before = getSubstitutions(originalFiles);
  const after = getSubstitutions(draftFiles);
  const lines = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort().flatMap(language => {
    const was = before[language] ?? {};
    const now = after[language] ?? {};
    const keys = [...new Set([...Object.keys(was), ...Object.keys(now)])];
    const added = keys.filter(key => !(key in was) && key in now).length;
    const removed = keys.filter(key => key in was && !(key in now)).length;
    const edited = keys.filter(key => key in was && key in now && was[key] !== now[key]).length;
    if (added + removed + edited === 0) return [];
    const parts = [
      added && `${added} changed from Aselo’s text`,
      edited && `${edited} edited`,
      removed && `${removed} back to Aselo’s text`,
    ].filter(Boolean);
    return [`${language}: ${parts.join(', ')}`];
  });
  return lines.length > 0 ? [{ title: 'Translations', lines }] : [];
};
