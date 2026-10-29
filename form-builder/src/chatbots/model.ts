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
 * A helpline's chatbots (Amazon Lex V2) as conversations (docs/chatbot-designer.md): each bot
 * starts when the contact says something, greets them, asks its questions one after another (each
 * answer one of a list, or anything for built-in types like a US state), and says goodbye.
 *
 * In twilio-iac a bot is several JSON files under configs/lex_v2/<language>/: bots/<bot>.json (the
 * bot and its intents' questions, in order), intents/<intent>.json (what starts it, the opening and
 * closing messages), slots/<slot>.json (each question as Lex asks it) and slot_types/<type>.json
 * (the answers and the ways to say them). Each item remembers the file it came from.
 */

import type { DesignStatus } from '../designStatus';

export const CHATBOT_SCHEMA_VERSION = 1;

// Where an item is kept: its file under twilio-iac/helplines, and whether other helplines share it
// (configs/lex_v2/... rather than <code>/configs/lex_v2/...)
export type Source = { file?: string; shared?: boolean };

// A note left on a chatbot, a question, a list of answers or one answer, for the team and for
// Claude (the export carries the open ones)
export type DesignComment = { id: string; text: string; author: string; at: string; resolved?: boolean };

type Commented = { comments?: DesignComment[] };

export type AnswerOption = Commented & {
  // What's saved when the contact gives this answer
  value: string;
  // The other ways of saying it the bot understands ("1", "yes", "yeah")
  synonyms: string[];
};

/**
 * The answers a question takes (a Lex slot type), one of three kinds:
 * - a list: the answers it understands, each with other ways of saying it
 * - a pattern: anything matching a regular expression (a custom type whose parent is
 *   AMAZON.AlphaNumeric, with valueSelectionSetting.regexFilter), e.g. a 5-digit zip code
 * - Lex's own (builtin): AMAZON.State, AMAZON.Number..., no file
 */
export type AnswerKind = 'list' | 'pattern' | 'builtin';

export type AnswerType = Source &
  Commented & {
    name: string;
    // Lex's own types (AMAZON.State, AMAZON.Number...): any value of that kind
    builtin?: boolean;
    values: AnswerOption[];
    // A pattern answers must match, e.g. zip codes (valueSelectionSetting.regexFilter)
    pattern?: string;
    // The Lex type it extends (parentSlotTypeSignature): AMAZON.AlphaNumeric for patterns
    parent?: string;
    // valueSelectionSetting.resolutionStrategy: OriginalValue (keep what was typed) or TopResolution
    resolution?: string;
  };

export const answerKindOf = (type: AnswerType): AnswerKind =>
  type.builtin ? 'builtin' : type.pattern !== undefined ? 'pattern' : 'list';

export const PATTERN_PARENT = 'AMAZON.AlphaNumeric';

export type ChatbotQuestion = Source & {
  id: string;
  // The Lex slot: the answer's name in the conversation's results
  slot: string;
  answerType: string;
  question: string;
  // Said when the answer still isn't understood after the retries; the chatbot then stops
  failureMessage?: string;
  // How many more times the question is asked when the answer isn't understood
  retries: number;
  required: boolean;
  comments?: DesignComment[];
};

export type ChatbotIntent = Source & {
  id: string;
  name: string;
  // What the contact says (or Studio sends) that starts it
  utterances: string[];
  opening?: string;
  closing?: string;
  questions: ChatbotQuestion[];
};

export type Chatbot = Source & {
  id: string;
  // The key in lex_v2_bot_languages, e.g. en_USCH (also the configs folder)
  language: string;
  // e.g. pre_survey
  name: string;
  // Lex's locale, e.g. en_US
  locale: string;
  description?: string;
  intents: ChatbotIntent[];
  // Where it's deployed, from lex_v2_bot_languages in each environment's config
  environments: string[];
  // Imported, in progress, ready for Claude, implemented (designStatus.ts); absent: worked out
  status?: DesignStatus;
  // What it's for, who it's for, how it's started: the brief for the team and for Claude
  notes?: string;
  comments?: DesignComment[];
};

/**
 * Contact form fields each answer fills in (the "survey" part of the form definitions'
 * PrepopulateMappings.json), by the answer's name (the slot). Each inner list fills in the first
 * of its fields the contact's forms have ("ChildInformationTab.age"); all the lists are filled in.
 */
export type FormMappings = Record<string, string[][]>;

export type ChatbotDesign = {
  schemaVersion: number;
  helpline: string;
  bots: Chatbot[];
  // By language (as bots), then by name
  answerTypes: Record<string, Record<string, AnswerType>>;
  // Undefined until read from the form definitions (designs saved before mappings were kept)
  formMappings?: FormMappings;
  // The form definitions version holding PrepopulateMappings.json, e.g. v1
  formsVersion?: string;
  // The flex-plugins branch it was imported from, when not the default (master)
  importedFrom?: { branch: string; sha: string };
  // As imported, to tell what changed (the export lists the files to update)
  imported?: { bots: Chatbot[]; answerTypes: ChatbotDesign['answerTypes']; formMappings?: FormMappings };
};

export type ChatbotMeta = {
  revision: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type StoredChatbots = { code: string; meta: ChatbotMeta; design: ChatbotDesign };

// A helpline's chatbots, for the start page
export type ChatbotsSummary = {
  code: string;
  meta: ChatbotMeta;
  bots: {
    id: string;
    name: string;
    language: string;
    questions: number;
    status: DesignStatus;
    isNew: boolean;
    environments: string[];
  }[];
};

export const emptyChatbots = (helpline: string): ChatbotDesign => ({
  schemaVersion: CHATBOT_SCHEMA_VERSION,
  helpline,
  bots: [],
  answerTypes: {},
});

let nextId = 0;
export const newChatbotId = (prefix: string) => {
  nextId += 1;
  return `${prefix}-${Date.now().toString(36)}-${nextId}`;
};

// "pre_survey" -> "Pre-survey", "post_survey_yes" -> "Post-survey yes"
export const botLabel = (name: string) => {
  const words = name.replace(/_/g, ' ').replace(/\b(pre|post) survey\b/i, (found) => found.replace(' ', '-'));
  return words.charAt(0).toUpperCase() + words.slice(1);
};

// The language part of a configs folder name: en_USCH -> English
const LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  mt: 'Maltese',
  uk: 'Ukrainian',
  fil: 'Filipino',
  bem: 'Bemba',
  loz: 'Lozi',
  kqn: 'Kaonde',
  sw: 'Swahili',
  th: 'Thai',
  ar: 'Arabic',
  zh: 'Chinese',
};
export const languageLabel = (language: string) => {
  const [code, ...rest] = language.split('_');
  const name = LANGUAGES[code.toLowerCase()] ?? language;
  return rest.length > 0 && LANGUAGES[code.toLowerCase()] ? `${name} (${language})` : name;
};

export const answerTypeOf = (design: ChatbotDesign, bot: Chatbot, name: string): AnswerType | undefined =>
  design.answerTypes[bot.language]?.[name] ??
  (name.startsWith('AMAZON.') ? { name, builtin: true, values: [] } : undefined);

/**
 * Lex V2's own answer types (docs.aws.amazon.com/lexv2/latest/dg/built-in-slots.html): what the
 * contact can answer, and what's saved
 */
export const BUILTIN_TYPES: { name: string; label: string; saves: string; example: string; locales?: string }[] = [
  { name: 'AMAZON.FreeFormInput', label: 'anything they write', saves: 'what they wrote', example: 'My mum' },
  { name: 'AMAZON.Number', label: 'a number', saves: 'the number in digits', example: '16' },
  {
    name: 'AMAZON.Confirmation',
    label: 'yes, no, maybe or don’t know',
    saves: 'Yes, No, Maybe or Don’t know',
    example: 'yeah',
  },
  { name: 'AMAZON.State', label: 'a US state', saves: 'the state’s name', example: 'New Mexico' },
  { name: 'AMAZON.City', label: 'a city', saves: 'the city', example: 'Albuquerque' },
  { name: 'AMAZON.Country', label: 'a country', saves: 'the country', example: 'Chile' },
  { name: 'AMAZON.Date', label: 'a date', saves: 'the date as YYYY-MM-DD', example: '2010-05-03' },
  { name: 'AMAZON.Time', label: 'a time', saves: 'the time as HH:MM', example: '14:30' },
  { name: 'AMAZON.Duration', label: 'a length of time', saves: 'the duration (ISO 8601)', example: 'PT2H' },
  { name: 'AMAZON.EmailAddress', label: 'an email address', saves: 'the address', example: 'name@example.org' },
  { name: 'AMAZON.PhoneNumber', label: 'a phone number', saves: 'the digits', example: '5055550123' },
  { name: 'AMAZON.FirstName', label: 'a first name', saves: 'the name', example: 'Alex' },
  { name: 'AMAZON.LastName', label: 'a last name', saves: 'the name', example: 'Rivera' },
  { name: 'AMAZON.StreetName', label: 'a street name', saves: 'the street', example: 'Main Street' },
  { name: 'AMAZON.Percentage', label: 'a percentage', saves: 'the number with %', example: '50%' },
  { name: 'AMAZON.Currency', label: 'an amount of money', saves: 'currency and amount', example: 'USD 20.00' },
  {
    name: 'AMAZON.AlphaNumeric',
    label: 'letters and numbers',
    saves: 'what they wrote',
    example: 'APQ123',
  },
  {
    name: 'AMAZON.UKPostalCode',
    label: 'a UK postcode',
    saves: 'the postcode',
    example: 'SW1A 1AA',
    locales: 'en_GB',
  },
];

export const builtinInfo = (name: string) => BUILTIN_TYPES.find((type) => type.name === name);
export const builtinLabel = (name: string) => builtinInfo(name)?.label ?? name.replace('AMAZON.', '');

/**
 * Lex's rules for a pattern (built-in-slot-alphanumeric.html): letters, digits, classes and
 * bounded repeats; no *, + or {n,} (unbounded), no . ; up to 300 characters. Lex keeps at most
 * 30 characters of a matching answer. Returns what's wrong, in plain words.
 */
export const patternProblem = (pattern: string): string | undefined => {
  if (!pattern.trim()) return 'The pattern is empty.';
  if (pattern.length > 300) return 'Lex takes patterns of up to 300 characters.';
  const plain = pattern.replace(/\\./g, '');
  if (/[*+]/.test(plain) || /\{\d+,\}/.test(plain))
    return 'Lex doesn’t take unlimited repeats (*, + or {2,}): give a maximum, e.g. {1,30}.';
  if (/\./.test(plain)) return 'Lex doesn’t take “.” (any character): list the characters, e.g. [A-Za-z0-9 ].';
  try {
    new RegExp(pattern);
  } catch {
    return 'This isn’t a valid pattern.';
  }
  return undefined;
};

// Whether an answer matches a pattern, the whole answer (as Lex checks it)
export const matchesPattern = (pattern: string, answer: string) => {
  try {
    return answer.length <= 30 && new RegExp(`^(?:${pattern})$`).test(answer);
  } catch {
    return false;
  }
};

// Ready-made patterns
export const PATTERN_PRESETS: { label: string; pattern: string }[] = [
  { label: 'US zip code (5 digits)', pattern: '[0-9]{5}' },
  { label: 'Letters and spaces (up to 30)', pattern: '[A-Za-z ]{1,30}' },
  { label: 'A number of 1 to 3 digits', pattern: '[0-9]{1,3}' },
  { label: 'Phone number (10 digits)', pattern: '[0-9]{10}' },
  { label: 'Letters and numbers (up to 30)', pattern: '[A-Za-z0-9 ]{1,30}' },
];

// The contact form tabs a chatbot's answers can fill in, as in PrepopulateMappings.json
export const FORM_TABS: { key: string; label: string }[] = [
  { key: 'ChildInformationTab', label: 'Child information' },
  { key: 'CallerInformationTab', label: 'Caller information' },
  { key: 'CaseInformationTab', label: 'Case information' },
];

// Only answers given before the contact reaches a counselor fill in the contact form
export const fillsInContact = (bot: Pick<Chatbot, 'name'>) => !/^post_?survey/i.test(bot.name);
