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
 * The definition files outside the contact forms that staff can edit: call type buttons,
 * canned responses and the automatic chat messages. Reading, checking and describing changes.
 */
import type {
  CallTypeButtonsEntry,
  CannedResponsesDefinitions,
} from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap } from './definitions';
import { isSameJson } from './changes';
import type { ValidationIssue } from './validation';
import { summarizeWebchatChanges, validateWebchat } from './webchat';

export const CALL_TYPE_BUTTONS_FILE = 'CallTypeButtons.json';
export const CANNED_RESPONSES_FILE = 'CannedResponses.json';
export const MESSAGES_FILE = 'customStrings/Messages.json';
export const POST_SURVEY_MESSAGES_FILE = 'customStrings/postSurveyMessages.json';

// Call type names the plugin maps to its own call types (plugin-hrm-form DomainConstants)
export const DATA_CALL_TYPE_NAMES = ['child', 'caller'] as const;

export const getCallTypeButtons = (files: DefinitionFileMap): CallTypeButtonsEntry[] =>
  (files[CALL_TYPE_BUTTONS_FILE] as CallTypeButtonsEntry[] | undefined) ?? [];

export const getCannedResponses = (files: DefinitionFileMap): CannedResponsesDefinitions =>
  (files[CANNED_RESPONSES_FILE] as CannedResponsesDefinitions | undefined) ?? [];

export type LocalizedMessages = Record<string, Record<string, string>>;

export const getMessages = (files: DefinitionFileMap): LocalizedMessages =>
  (files[MESSAGES_FILE] as LocalizedMessages | undefined) ?? {};

/**
 * postSurveyMessages.json comes in two shapes in the repo: grouped by language
 * ({ "en": { "triggerMessage": ... } }) or flat ({ "triggerMessage": ... }). The account-scoped
 * lambda reads both, so the editor keeps whichever shape a helpline already uses.
 */
export const isFlatMessages = (value: unknown): value is Record<string, string> =>
  Boolean(value) &&
  typeof value === 'object' &&
  Object.values(value as object).length > 0 &&
  Object.values(value as object).every((entry) => typeof entry === 'string');

type MessageInfo = { key: string; title: string; when: string };

// Where each message is sent from, found in plugin-hrm-form and lambdas/account-scoped
export const CHAT_MESSAGES: MessageInfo[] = [
  {
    key: 'WelcomeMsg',
    title: 'Welcome',
    when: 'Sent to the contact when a counselor accepts the conversation.',
  },
  {
    key: 'GoodbyeMsg',
    title: 'Goodbye',
    when: 'Sent when the counselor ends the conversation.',
  },
  {
    key: 'EndChatMsg',
    title: 'Contact ended the chat',
    when: 'Sent when the contact ends the chat themselves.',
  },
  {
    key: 'ClosedOutOfShift',
    title: 'Outside opening hours',
    when: "Sent when someone writes outside the helpline's opening hours.",
  },
  {
    key: 'ClosedHolidays',
    title: 'Closed for a holiday',
    when: 'Sent when someone writes on a day the helpline is closed for a holiday.',
  },
  {
    key: 'UnsupportedMediaErrorMsg',
    title: 'Unsupported attachment',
    when: "Sent when the contact sends something Aselo can't receive, such as a sticker or a video.",
  },
];

export const POST_SURVEY_MESSAGES: MessageInfo[] = [
  {
    key: 'triggerMessage',
    title: 'Survey invitation',
    when: 'Sent after the conversation ends, inviting the contact to answer a short survey.',
  },
  {
    key: 'postSurveyCompleteMessage',
    title: 'Survey thank-you',
    when: 'Sent when the contact finishes the survey.',
  },
];

/**
 * Checks
 */

const issue = (
  severity: ValidationIssue['severity'],
  message: string,
): ValidationIssue => ({ severity, message });

const checkCallTypes = (files: DefinitionFileMap): ValidationIssue[] => {
  if (files[CALL_TYPE_BUTTONS_FILE] === undefined) return [];
  const buttons = getCallTypeButtons(files);
  const issues: ValidationIssue[] = [];
  if (!buttons.some((button) => button.category === 'data')) {
    issues.push(issue('error', 'Call types: there must be at least one button that opens the contact form.'));
  }
  if (buttons.some((button) => !String(button.label ?? '').trim())) {
    issues.push(issue('error', 'Call types: every button needs a label.'));
  }
  // Non-data contacts are saved with the button label, so labels must be unique
  const labels = buttons
    .filter((button) => button.category === 'non-data')
    .map((button) => String(button.label ?? '').trim().toLowerCase());
  const repeated = labels.filter((label, index) => label && labels.indexOf(label) !== index);
  if (repeated.length > 0) {
    issues.push(
      issue('error', `Call types: more than one button is labelled “${repeated[0]}”.`),
    );
  }
  return issues;
};

const checkCannedResponses = (files: DefinitionFileMap): ValidationIssue[] => {
  const responses = getCannedResponses(files);
  const issues: ValidationIssue[] = [];
  if (responses.some((response) => !String(response.label ?? '').trim())) {
    issues.push(issue('error', 'Canned responses: every response needs a name.'));
  }
  if (responses.some((response) => !String(response.text ?? '').trim())) {
    issues.push(issue('error', 'Canned responses: every response needs text.'));
  }
  // Labels can be numbers in the JSON (USNM has "label": 211)
  const labels = responses.map((response) => String(response.label ?? '').trim().toLowerCase());
  const repeated = labels.find((label, index) => label && labels.indexOf(label) !== index);
  if (repeated) {
    issues.push(
      issue(
        'warning',
        `Canned responses: more than one response is called “${repeated}”, so counselors can't tell them apart in the list.`,
      ),
    );
  }
  return issues;
};

const checkSections = (files: DefinitionFileMap) => [
  ...checkCallTypes(files),
  ...checkCannedResponses(files),
];

// Problems that were already there before the user's changes are only warnings
export const validateSections = (
  draftFiles: DefinitionFileMap,
  originalFiles: DefinitionFileMap,
): ValidationIssue[] => {
  const before = new Set(checkSections(originalFiles).map((found) => found.message));
  const sectionIssues = checkSections(draftFiles).map((found): ValidationIssue =>
    found.severity === 'error' && before.has(found.message)
      ? {
          ...found,
          severity: 'warning',
          message: `${found.message} (This was already the case before your changes.)`,
        }
      : found,
  );
  return [...sectionIssues, ...validateWebchat(draftFiles, originalFiles)];
};

/**
 * Plain-language descriptions of changes, for the review dialog and CHANGES.md
 */

export type SectionChangeSummary = { title: string; lines: string[] };

const describeList = <T>(
  before: T[],
  after: T[],
  keyOf: (item: T) => string,
  describe: (item: T) => string,
): string[] => {
  const beforeKeys = new Map(before.map((item) => [keyOf(item), item]));
  const afterKeys = new Map(after.map((item) => [keyOf(item), item]));
  const lines: string[] = [];
  after.forEach((item) => {
    const previous = beforeKeys.get(keyOf(item));
    if (!previous) lines.push(`Added: ${describe(item)}`);
    else if (!isSameJson(previous, item)) lines.push(`Changed: ${describe(previous)} → ${describe(item)}`);
  });
  before
    .filter((item) => !afterKeys.has(keyOf(item)))
    .forEach((item) => lines.push(`Removed: ${describe(item)}`));
  const keptBefore = before.map(keyOf).filter((key) => afterKeys.has(key));
  const keptAfter = after.map(keyOf).filter((key) => beforeKeys.has(key));
  if (!isSameJson(keptBefore, keptAfter)) lines.push('Reordered');
  return lines;
};

const describeMessages = (before: unknown, after: unknown): string[] => {
  const asLocalized = (value: unknown): LocalizedMessages =>
    isFlatMessages(value) ? { '(all languages)': value } : ((value ?? {}) as LocalizedMessages);
  const beforeMessages = asLocalized(before);
  const afterMessages = asLocalized(after);
  const languages = [...new Set([...Object.keys(beforeMessages), ...Object.keys(afterMessages)])];
  return languages.flatMap((language) => {
    const keys = [
      ...new Set([
        ...Object.keys(beforeMessages[language] ?? {}),
        ...Object.keys(afterMessages[language] ?? {}),
      ]),
    ];
    return keys
      .filter((key) => beforeMessages[language]?.[key] !== afterMessages[language]?.[key])
      .map((key) => {
        const title =
          [...CHAT_MESSAGES, ...POST_SURVEY_MESSAGES].find((info) => info.key === key)?.title ?? key;
        if (afterMessages[language]?.[key] === undefined) return `Removed: ${title} (${language})`;
        if (beforeMessages[language]?.[key] === undefined) return `Added: ${title} (${language})`;
        return `Changed: ${title} (${language})`;
      });
  });
};

export const summarizeSectionChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
  webchatDefaultLocale?: string,
): SectionChangeSummary[] => {
  const summaries: SectionChangeSummary[] = [];
  const changed = (filePath: string) => !isSameJson(originalFiles[filePath], draftFiles[filePath]);

  if (changed(CALL_TYPE_BUTTONS_FILE)) {
    summaries.push({
      title: 'Call types',
      lines: describeList(
        getCallTypeButtons(originalFiles),
        getCallTypeButtons(draftFiles),
        (button) => button.name,
        (button) => `“${button.label}”`,
      ),
    });
  }
  if (changed(CANNED_RESPONSES_FILE)) {
    summaries.push({
      title: 'Canned responses',
      lines: describeList(
        getCannedResponses(originalFiles),
        getCannedResponses(draftFiles),
        (response) => String(response.label),
        (response) => `“${response.label}”`,
      ),
    });
  }
  if (changed(MESSAGES_FILE)) {
    summaries.push({
      title: 'Automatic chat messages',
      lines: describeMessages(originalFiles[MESSAGES_FILE], draftFiles[MESSAGES_FILE]),
    });
  }
  if (changed(POST_SURVEY_MESSAGES_FILE)) {
    summaries.push({
      title: 'Post-chat survey messages',
      lines: describeMessages(
        originalFiles[POST_SURVEY_MESSAGES_FILE],
        draftFiles[POST_SURVEY_MESSAGES_FILE],
      ),
    });
  }
  summaries.push(...summarizeWebchatChanges(originalFiles, draftFiles, webchatDefaultLocale));
  return summaries;
};
