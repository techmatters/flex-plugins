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
 * Helpline terms: the helpline's own words for what Aselo calls a child, a caller, a case, a
 * client profile, a counselor and a contact, used everywhere in Aselo's English text.
 *
 * Aselo can only change whole strings (customStrings/Substitutions.json), so each Aselo string
 * with one of those words becomes a template with a slot where the word is (its form: singular
 * or plural; its capitals: as in the sentence, first letter, every word or all capitals; and the
 * "a"/"an" before it), and the helpline's words fill the slots. The words chosen and the strings
 * they made are kept in customStrings/HelplineTerms.json (Aselo doesn't read it), so they can be
 * made again when Aselo's text changes, and so strings someone wrote by hand are told apart and
 * never overwritten.
 */
import type { DefinitionFileMap } from '../common/definitions';
import { HELPLINE_TERMS_FILE, SUBSTITUTIONS_FILE } from '../translations/translations';

export type TermId = 'child' | 'caller' | 'case' | 'profile' | 'counselor' | 'contact';
type Form = 'singular' | 'plural';
// A client profile has a full name ("Client Profile") and a short one ("Profile")
type Variant = 'full' | 'short';
// How the word is written where it is: as typed, first letter capital, every word, all capitals
type Casing = 'asTyped' | 'first' | 'title' | 'upper';

export type TermWords = { singular: string; plural: string; shortSingular?: string; shortPlural?: string };
export type HelplineTerms = Partial<Record<TermId, TermWords>>;
type TermsFile = { terms: HelplineTerms; generated: Record<string, string> };

export type TermDefinition = {
  id: TermId;
  question: string;
  // What Aselo calls it
  aselo: TermWords;
  presets: TermWords[];
  hint: string;
};

const words = (singular: string, plural: string, shortSingular?: string, shortPlural?: string): TermWords => ({
  singular,
  plural,
  ...(shortSingular ? { shortSingular, shortPlural } : {}),
});

export const TERM_DEFINITIONS: TermDefinition[] = [
  {
    id: 'child',
    question: 'What do you call the person your helpline supports?',
    aselo: words('child', 'children'),
    presets: [
      words('service user', 'service users'),
      words('help seeker', 'help seekers'),
      words('young person', 'young people'),
      words('client', 'clients'),
      words('victim', 'victims'),
      words('survivor', 'survivors'),
    ],
    hint: 'The person a contact is about. Aselo says “child”, e.g. “Child calling about self”.',
  },
  {
    id: 'caller',
    question: 'What do you call someone who contacts you about another person?',
    aselo: words('caller', 'callers'),
    presets: [
      words('help seeker', 'help seekers'),
      words('third party', 'third parties'),
      words('concerned adult', 'concerned adults'),
      words('reporter', 'reporters'),
    ],
    hint: 'Someone contacting the helpline on behalf of someone else, e.g. a parent or a teacher.',
  },
  {
    id: 'case',
    question: 'What do you call a case?',
    aselo: words('case', 'cases'),
    presets: [
      words('incident', 'incidents'),
      words('report', 'reports'),
      words('referral', 'referrals'),
      words('external notification', 'external notifications'),
      words('file', 'files'),
    ],
    hint: 'What counselors open to follow up on someone over several contacts.',
  },
  {
    id: 'profile',
    question: 'What do you call a client profile?',
    aselo: words('client profile', 'client profiles', 'profile', 'profiles'),
    presets: [
      words('client record', 'client records', 'record', 'records'),
      words('peer profile', 'peer profiles', 'profile', 'profiles'),
      words('master name record', 'master name records', 'record', 'records'),
    ],
    hint: 'What Aselo keeps about a phone number or chat user across contacts. The short name is used on its own, e.g. “Edit Profile”.',
  },
  {
    id: 'counselor',
    question: 'What do you call the people who answer contacts?',
    aselo: words('counselor', 'counselors'),
    presets: [
      words('volunteer', 'volunteers'),
      words('advocate', 'advocates'),
      words('specialist', 'specialists'),
      words('crisis counselor', 'crisis counselors'),
      words('counsellor', 'counsellors'),
    ],
    hint: 'Your helpline’s staff and volunteers who take calls and chats.',
  },
  {
    id: 'contact',
    question: 'What do you call each call, chat or message conversation?',
    aselo: words('contact', 'contacts'),
    presets: [
      words('connection', 'connections'),
      words('conversation', 'conversations'),
      words('interaction', 'interactions'),
    ],
    hint: 'One call, chat or SMS conversation and the form counselors fill in for it.',
  },
];

/**
 * Aselo strings that use one of the words in a sense the helpline's words don't replace: "please
 * contact your support team" (a verb), a resource's or a reporter's contact details, a voicemail's
 * phone number, and the CSAM report's legal wording.
 */
export const EXCLUDED_KEYS = new Set([
  'TranscriptSection-PermanentError',
  'RecordingSection-Error',
  'Resources-View-ContactInfo',
  'TaskPanel-ActiveVoicemail-CallerPhoneNumberLabel',
  'CSAMReportForm-Header',
  'CSAMReportForm-ContactDetails',
  'CSAMReportForm-ContactDetailsDescription',
  'CSAMReportForm-ContactDetailsInfo',
  'CSAMCLCReportForm-Header',
  'CSAMCLCReportForm-ChildAge',
  'CSAMCLCReportForm-AgeVerified',
  'CSAMCLCReportForm-CopyLink',
  'CSAMCLC-ActionHeaderAdded',
  'TabbedForms-ReportsChildLink',
]);

type Slot = { term: TermId; form: Form; variant: Variant; casing: Casing; article?: string; original: string };
type TermTemplate = (string | Slot)[];

// Longest first, so "client profile" is found before "profile"
const MATCHERS: { pattern: RegExp; term: TermId; variant: Variant; plural: (word: string) => boolean }[] = [
  { pattern: /^client profiles?$/i, term: 'profile', variant: 'full', plural: word => /s$/i.test(word) },
  { pattern: /^profiles?$/i, term: 'profile', variant: 'short', plural: word => /s$/i.test(word) },
  { pattern: /^child(ren)?$/i, term: 'child', variant: 'full', plural: word => /ren$/i.test(word) },
  { pattern: /^callers?$/i, term: 'caller', variant: 'full', plural: word => /s$/i.test(word) },
  { pattern: /^cases?$/i, term: 'case', variant: 'full', plural: word => /s$/i.test(word) },
  { pattern: /^counsell?ors?$/i, term: 'counselor', variant: 'full', plural: word => /s$/i.test(word) },
  { pattern: /^contacts?$/i, term: 'contact', variant: 'full', plural: word => /s$/i.test(word) },
];
const WORD_PATTERN = /\b(?:client profiles?|profiles?|child(?:ren)?|callers?|cases?|counsell?ors?|contacts?)\b/gi;

// Placeholders ({{caseId}}) and markup (<a ...>) are left alone
const PROTECTED_PATTERN = /(\{\{[^}]*\}\}|<[^>]*>)/;

// Small words a title leaves in lower case
const TITLE_SMALL_WORDS = new Set(['into', 'from', 'with', 'about', 'onto', 'over', 'than', 'that', 'this', 'your']);

/**
 * A string written in title case ("Copy Child Information into Current Contact"), or only the
 * word itself ("Cases"): a heading or a button, where every word of the helpline's starts with a
 * capital.
 */
const isTitleCase = (text: string) => {
  const longWords = (
    text
      .replace(/\{\{[^}]*\}\}|<[^>]*>/g, ' ')
      .replace(WORD_PATTERN, ' ')
      .match(/[A-Za-z]{4,}/g) ?? []
  ).filter(word => !TITLE_SMALL_WORDS.has(word));
  return longWords.every(word => /^[A-Z]/.test(word));
};

const casingOf = (word: string, titleCase: boolean): Casing => {
  if (word.length > 1 && word === word.toUpperCase()) return 'upper';
  if (/^[A-Z]/.test(word)) return titleCase ? 'title' : 'first';
  return 'asTyped';
};

/** An Aselo string as a template, or undefined when it has none of the words (or is excluded). */
// eslint-disable-next-line sonarjs/cognitive-complexity
export const templateOf = (key: string, text: string): TermTemplate | undefined => {
  if (EXCLUDED_KEYS.has(key)) return undefined;
  const titleCase = isTitleCase(text);
  const template: TermTemplate = [];
  let hasSlot = false;
  text.split(PROTECTED_PATTERN).forEach((part, index) => {
    // Odd parts are placeholders and markup
    if (index % 2 === 1) {
      template.push(part);
      return;
    }
    let last = 0;
    part.replace(WORD_PATTERN, (found: string, offset: number) => {
      const matcher = MATCHERS.find(candidate => candidate.pattern.test(found))!;
      let before = part.slice(last, offset);
      // "a"/"an" right before the word follows the helpline's word ("an incident")
      const article = before.match(/\b(an?|An?|AN?)\s$/);
      if (article) before = before.slice(0, before.length - article[0].length);
      if (before) template.push(before);
      template.push({
        term: matcher.term,
        form: matcher.plural(found) ? 'plural' : 'singular',
        variant: matcher.variant,
        casing: casingOf(found, titleCase),
        ...(article ? { article: article[1] } : {}),
        original: `${article ? article[0] : ''}${found}`,
      });
      hasSlot = true;
      last = offset + found.length;
      return found;
    });
    if (last < part.length) template.push(part.slice(last));
  });
  return hasSlot ? template : undefined;
};

const wordFor = (words: TermWords, form: Form, variant: Variant) => {
  if (variant === 'short') return (form === 'plural' ? words.shortPlural : words.shortSingular) ?? '';
  return form === 'plural' ? words.plural : words.singular;
};

const capitalized = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const inCasing = (text: string, casing: Casing) => {
  if (casing === 'upper') return text.toUpperCase();
  if (casing === 'first') return capitalized(text);
  if (casing === 'title') return text.split(' ').map(capitalized).join(' ');
  return text;
};

const articleFor = (article: string, word: string) => {
  const an = /^[aeiou]/i.test(word);
  const lower = an ? 'an' : 'a';
  if (article === article.toUpperCase() && article.length > 1) return lower.toUpperCase();
  return /^[A]/.test(article) ? capitalized(lower) : lower;
};

/** The string with the helpline's words; slots for words not chosen keep Aselo's. */
export const fillTemplate = (template: TermTemplate, terms: HelplineTerms): string =>
  template
    .map(part => {
      if (typeof part === 'string') return part;
      const chosen = terms[part.term];
      const word = chosen ? wordFor(chosen, part.form, part.variant) : '';
      if (!word) return part.original;
      const written = inCasing(word, part.casing);
      return part.article ? `${articleFor(part.article, written)} ${written}` : written;
    })
    .join('');

type TermCatalogue = { key: string; english: string; template: TermTemplate }[];

// Every Aselo string with one of the words, as a template
export const termCatalogue = (english: Record<string, string>): TermCatalogue =>
  Object.entries(english).flatMap(([key, text]) => {
    const template = typeof text === 'string' ? templateOf(key, text) : undefined;
    return template ? [{ key, english: text, template }] : [];
  });

export const termsUsedBy = (template: TermTemplate) =>
  new Set(template.flatMap(part => (typeof part === 'string' ? [] : [part.term])));

const readTermsFile = (files: DefinitionFileMap): TermsFile => {
  const file = (files[HELPLINE_TERMS_FILE] ?? {}) as Partial<TermsFile>;
  return { terms: file.terms ?? {}, generated: file.generated ?? {} };
};

export const getHelplineTerms = (files: DefinitionFileMap) => readTermsFile(files).terms;

const englishSubstitutions = (files: DefinitionFileMap) =>
  ((files[SUBSTITUTIONS_FILE] ?? {}) as Record<string, Record<string, string>>).en ?? {};

/**
 * Strings someone wrote by hand: in Substitutions.json, but not as the terms last made them.
 * They're left as they are.
 */
export const handWrittenKeys = (files: DefinitionFileMap, catalogue: TermCatalogue): string[] => {
  const { generated } = readTermsFile(files);
  const own = englishSubstitutions(files);
  return catalogue.filter(({ key }) => key in own && own[key] !== generated[key]).map(({ key }) => key);
};

const hasWords = (term?: TermWords) => Boolean(term && (term.singular.trim() || term.plural.trim()));

/**
 * Sets the helpline's terms and makes the strings that use them. Strings written by hand stay,
 * unless `replaceHandWritten` lists them (Aselo staff choosing to). A string that comes out as
 * Aselo's own text isn't kept.
 */
export const applyHelplineTerms = (
  files: DefinitionFileMap,
  terms: HelplineTerms,
  catalogue: TermCatalogue,
  replaceHandWritten: string[] = [],
): DefinitionFileMap => {
  const previous = readTermsFile(files);
  const handWritten = new Set(handWrittenKeys(files, catalogue).filter(key => !replaceHandWritten.includes(key)));
  const substitutions = { ...((files[SUBSTITUTIONS_FILE] ?? {}) as Record<string, Record<string, string>>) };
  const english = { ...(substitutions.en ?? {}) };
  const generated: Record<string, string> = {};
  const chosen = Object.fromEntries(Object.entries(terms).filter(([, term]) => hasWords(term))) as HelplineTerms;
  const inCatalogue = new Set(catalogue.map(entry => entry.key));

  // Strings made before for keys Aselo no longer has with the words
  Object.entries(previous.generated).forEach(([key, text]) => {
    if (!inCatalogue.has(key) && english[key] === text) delete english[key];
  });
  catalogue.forEach(({ key, english: aseloText, template }) => {
    if (handWritten.has(key)) return;
    const text = fillTemplate(template, chosen);
    if (text === aseloText) {
      delete english[key];
    } else {
      english[key] = text;
      generated[key] = text;
    }
  });

  const { en: _english, ...otherLanguages } = substitutions;
  const nextSubstitutions = Object.keys(english).length > 0 ? { ...otherLanguages, en: english } : otherLanguages;
  const hasTerms = Object.keys(chosen).length > 0;
  const { [HELPLINE_TERMS_FILE]: _terms, ...rest } = files;
  return {
    ...rest,
    [SUBSTITUTIONS_FILE]: nextSubstitutions,
    ...(hasTerms || HELPLINE_TERMS_FILE in files ? { [HELPLINE_TERMS_FILE]: { terms: chosen, generated } } : {}),
  };
};

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const mostCommon = (values: string[]) => {
  const counts = new Map<string, number>();
  values.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};

/**
 * The words a helpline already uses in strings written by hand (e.g. USNM's "help seeker"):
 * each string with one term is matched against Aselo's, and what's where the word was counts.
 * Words in the middle of a sentence count most, as they show how the word is written.
 */
export const guessHelplineTerms = (files: DefinitionFileMap, catalogue: TermCatalogue): HelplineTerms => {
  const own = englishSubstitutions(files);
  const found: Record<string, { asTyped: string[]; other: string[] }> = {};
  catalogue.forEach(({ key, template }) => {
    const text = own[key];
    if (text === undefined || termsUsedBy(template).size !== 1) return;
    const slots = template.filter((part): part is Slot => typeof part !== 'string');
    const pattern = new RegExp(
      `^${template
        .map(part => (typeof part === 'string' ? escapeRegExp(part) : `${part.article ? '(?:an?|An?|AN?) ' : ''}(.+?)`))
        .join('')}$`,
    );
    const match = text.match(pattern);
    if (!match) return;
    slots.forEach((slot, index) => {
      const value = match[index + 1].trim();
      if (!value || value.toLowerCase() === slot.original.replace(/^an? /i, '').toLowerCase()) return;
      const bucket = `${slot.term}:${slot.variant}:${slot.form}`;
      found[bucket] ??= { asTyped: [], other: [] };
      found[bucket][slot.casing === 'asTyped' ? 'asTyped' : 'other'].push(value);
    });
  });
  const wordOf = (term: TermId, variant: Variant, form: Form) => {
    const bucket = found[`${term}:${variant}:${form}`];
    if (!bucket) return undefined;
    // Mid-sentence it's written as it is; elsewhere capitals may be the sentence's
    return mostCommon(bucket.asTyped) ?? mostCommon(bucket.other)?.toLowerCase();
  };
  const guessed: HelplineTerms = {};
  TERM_DEFINITIONS.forEach(({ id }) => {
    const singular = wordOf(id, 'full', 'singular');
    const plural = wordOf(id, 'full', 'plural');
    if (!singular && !plural) return;
    const shortSingular = wordOf(id, 'short', 'singular');
    const shortPlural = wordOf(id, 'short', 'plural');
    guessed[id] = {
      singular: singular ?? '',
      plural: plural ?? pluralOf(singular ?? ''),
      ...(id === 'profile'
        ? { shortSingular: shortSingular ?? '', shortPlural: shortPlural ?? pluralOf(shortSingular ?? '') }
        : {}),
    };
  });
  return guessed;
};

const IRREGULAR_PLURALS: Record<string, string> = { child: 'children', person: 'people', man: 'men', woman: 'women' };

/** A plural to start from ("young person" -> "young people", "third party" -> "third parties"). */
export const pluralOf = (singular: string) => {
  if (!singular.trim()) return '';
  const parts = singular.split(' ');
  const last = parts.pop()!;
  const lower = last.toLowerCase();
  let plural: string;
  if (IRREGULAR_PLURALS[lower]) plural = IRREGULAR_PLURALS[lower];
  else if (/[^aeiou]y$/i.test(last)) plural = `${last.slice(0, -1)}ies`;
  else if (/(s|x|z|ch|sh)$/i.test(last)) plural = `${last}es`;
  else plural = `${last}s`;
  if (IRREGULAR_PLURALS[lower] && /^[A-Z]/.test(last)) plural = capitalized(plural);
  return [...parts, plural].join(' ');
};

/**
 * Aselo's words for the terms the helpline changed: what to look for in what the terms don't
 * reach (its Studio flows, chatbots, automatic messages, webchat)
 */
export const replacedAseloWords = (terms: HelplineTerms): string[] =>
  TERM_DEFINITIONS.filter(({ id }) => hasWords(terms[id])).flatMap(({ id, aselo }) => [
    aselo.singular,
    aselo.plural,
    ...(aselo.shortSingular ? [aselo.shortSingular, aselo.shortPlural ?? ''] : []),
    ...(id === 'counselor' ? ['counsellor', 'counsellors'] : []),
  ]);

const wordsPattern = (words: string[]) =>
  new RegExp(`\\b(${words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i');

/**
 * Texts in the draft the terms don't change that still have Aselo's words: the automatic chat
 * messages and the post-survey message, and the webchat's text, by file
 */
export const draftWordUsage = (files: DefinitionFileMap, words: string[], filePaths: string[]) => {
  if (words.length === 0) return [];
  const pattern = wordsPattern(words);
  const textsOf = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (value && typeof value === 'object') return Object.values(value).flatMap(textsOf);
    return [];
  };
  return filePaths
    .map(filePath => ({ filePath, texts: textsOf(files[filePath]).filter(text => pattern.test(text)) }))
    .filter(({ texts }) => texts.length > 0);
};

// The contact tabs that are about a term: their names in the builder follow the helpline's word
const TAB_TERMS: Record<string, TermId> = { CallerInformationTab: 'caller', ChildInformationTab: 'child' };

/** The builder's name for a contact tab, in the helpline's words when it has them ("Help seeker information"). */
export const contactTabTitle = (tab: { key: string; title: string }, terms: HelplineTerms) => {
  const term = terms[TAB_TERMS[tab.key]];
  return term?.singular.trim() ? `${capitalized(term.singular.trim())} information` : tab.title;
};

/** What the terms change, for "Review your changes". */
export const summarizeHelplineTermChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] => {
  const before = getHelplineTerms(originalFiles);
  const after = getHelplineTerms(draftFiles);
  const lines = TERM_DEFINITIONS.flatMap(({ id, aselo }) => {
    const was = before[id];
    const now = after[id];
    if (JSON.stringify(was) === JSON.stringify(now)) return [];
    const describe = (term?: TermWords) =>
      term ? `“${term.singular}” / “${term.plural}”` : `Aselo’s “${aselo.singular}”`;
    return [`${capitalized(aselo.singular)}: ${describe(was)} → ${describe(now)}`];
  });
  return lines.length > 0 ? [{ title: 'Helpline terms', lines }] : [];
};
