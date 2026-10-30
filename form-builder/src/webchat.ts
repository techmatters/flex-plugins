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
 * The webchat pre-engagement form (webchat/PreEngagementForm.json) and the webchat's texts.
 *
 * The webchat app (aselo-webchat-react-app) shows each label through its translations: a
 * label is either a translation key or the text itself. Its translations are merged like
 * scripts/mergeConfigs.js does:
 *
 *   translationsSrc/en.json -> <language>.json -> <locale>.json
 *     -> configSrc/<code>/translations/<locale>.json (the helpline's own, edited here)
 *
 * and the helpline's translation files decide which languages the webchat offers.
 */
import type { SelectOption } from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap } from './definitions';
import { CONTACT_TABS, getForm } from './definitions';
import { isSameJson } from './changes';
import { toFieldName, uniqueFieldName } from './formEditing';
import type { ValidationIssue } from './validation';
import { WEBCHAT_TRANSLATIONS_PREFIX, webchatLocaleOf } from '../server/filePaths';

export const PRE_ENGAGEMENT_FILE = 'webchat/PreEngagementForm.json';

export type Strings = Record<string, string>;

export type WebchatFieldType = 'input' | 'email' | 'select' | 'dependent-select' | 'checkbox';

// Fields are kept as raw JSON so properties the editor doesn't know about survive
export type WebchatField = {
  type: WebchatFieldType;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean | { value: boolean; message?: string };
  options?: SelectOption[] | Record<string, SelectOption[]>;
  dependsOn?: string;
  defaultValue?: string;
  initialChecked?: boolean;
  [other: string]: unknown;
};

export type PreEngagementForm = {
  description?: string;
  submitLabel?: string;
  fields?: WebchatField[];
  [other: string]: unknown;
};

export const WEBCHAT_FIELD_TYPE_INFO: Record<WebchatFieldType, { label: string; description: string }> = {
  input: { label: 'Short text', description: 'One line of text, like a nickname' },
  email: { label: 'Email address', description: 'Checks that it looks like an email address' },
  select: { label: 'Dropdown', description: 'Pick one answer from a list' },
  'dependent-select': {
    label: 'Linked dropdown',
    description: 'Its answers change depending on another dropdown',
  },
  checkbox: { label: 'Checkbox', description: 'A tick box, for example to accept terms' },
};

export const ADDABLE_WEBCHAT_FIELD_TYPES: WebchatFieldType[] = ['input', 'email', 'select', 'checkbox'];

/**
 * Pre-engagement fields that mean something to the webchat or Aselo beyond the form
 */
export const describeSpecialField = (
  name: string,
  contactIdentifierField?: string,
): string | undefined => {
  if (name === 'friendlyName') return 'Its answer is the name counselors see for the chat.';
  if (name === 'language' || name === 'locale') return 'Its answer switches the webchat’s language.';
  if (name === contactIdentifierField) return 'Its answer identifies the contact (for blocking and profiles).';
  return undefined;
};

export const getPreEngagementForm = (files: DefinitionFileMap): PreEngagementForm | undefined =>
  files[PRE_ENGAGEMENT_FILE] as PreEngagementForm | undefined;

export const webchatTranslationsPath = (locale: string) =>
  `${WEBCHAT_TRANSLATIONS_PREFIX}${locale}.json`;

/**
 * The webchat's languages: one per translation file the helpline has, the default first
 */
export const getWebchatLocales = (files: DefinitionFileMap, defaultLocale = 'en-US'): string[] => {
  const locales = Object.keys(files)
    .filter((filePath) => filePath.startsWith(WEBCHAT_TRANSLATIONS_PREFIX))
    .map(webchatLocaleOf)
    .sort();
  return locales.includes(defaultLocale)
    ? [defaultLocale, ...locales.filter((locale) => locale !== defaultLocale)]
    : locales;
};

export const getHelplineWebchatStrings = (files: DefinitionFileMap, locale: string) =>
  files[webchatTranslationsPath(locale)] as Strings | undefined;

// The webchat app's own translation files (small, so bundled up front)
const baseFiles = import.meta.glob<Strings>(
  '../../aselo-webchat-react-app/translationsSrc/*.json',
  { import: 'default', eager: true },
);
const baseFile = (name: string): Strings =>
  baseFiles[`../../aselo-webchat-react-app/translationsSrc/${name}.json`] ?? {};

// e.g. 'es-CL' -> en.json, es.json, es-CL.json
export const baseWebchatStrings = (locale: string): Strings => {
  const [language] = locale.split('-');
  return { ...baseFile('en'), ...baseFile(language), ...baseFile(locale) };
};

export const webchatStrings = (files: DefinitionFileMap, locale: string): Strings => ({
  ...baseWebchatStrings(locale),
  ...getHelplineWebchatStrings(files, locale),
});

// What the visitor sees for a label, like the webchat's localizeKey
export const localizeText = (strings: Strings, stored: unknown): string => {
  const text = String(stored ?? '');
  return strings[text] ?? text;
};

/**
 * Texts around the form, set in the helpline's translations
 */
export const WEBCHAT_TEXTS: { key: string; title: string; hint: string; multiline?: boolean }[] = [
  { key: 'Header-TitleBar-Title', title: 'Window title', hint: 'At the top of the chat window.' },
  {
    key: 'PreEngagementPhase-Form-Title',
    title: 'Form heading',
    hint: 'Above the questions. Leave empty for none.',
  },
  {
    key: 'PreEngagementPhase-Form-Description',
    title: 'Introduction',
    hint: 'Under the heading, before the questions. Leave empty for none.',
    multiline: true,
  },
  {
    key: 'PreEngagementPhase-Form-SubmitButtonLabel',
    title: 'Start button',
    hint: 'The button that starts the chat.',
  },
  {
    key: 'RequiredFieldError',
    title: 'Missing answer message',
    hint: 'Shown under a required question that hasn’t been answered.',
  },
];

/**
 * Saving edited text. A text stays where it already lives:
 * - a translation key keeps its key, and the new text goes into this language's
 *   translations (so other languages keep theirs);
 * - text written straight into the form stays in the form (it shows the same in every
 *   language, as it does today);
 * - new text goes into the form.
 */
export type TextContext = {
  locale: string;
  // Merged translations for this language
  strings: Strings;
  // Every translation key the webchat knows, in any of the helpline's languages
  knownKeys: Set<string>;
  // Whether the helpline has its own translations file for this language
  canTranslate: boolean;
};

export const buildTextContext = (files: DefinitionFileMap, locale: string, locales: string[]): TextContext => ({
  locale,
  strings: webchatStrings(files, locale),
  knownKeys: new Set(
    (locales.length > 0 ? locales : [locale]).flatMap((other) => Object.keys(webchatStrings(files, other))),
  ),
  canTranslate: getHelplineWebchatStrings(files, locale) !== undefined,
});

export type TextUpdate = { stored: string; translation?: [key: string, text: string] };

export const updateText = (stored: unknown, text: string, context: TextContext): TextUpdate => {
  if (typeof stored === 'string') {
    if (localizeText(context.strings, stored) === text) return { stored };
    if (context.canTranslate && context.knownKeys.has(stored)) {
      return { stored, translation: [stored, text] };
    }
  }
  return { stored: text };
};

// The same field with its texts shown in one language
export const localizeField = (field: WebchatField, strings: Strings): WebchatField => {
  const localized: WebchatField = { ...field, label: localizeText(strings, field.label) };
  if (field.placeholder !== undefined) localized.placeholder = localizeText(strings, field.placeholder);
  if (typeof field.required === 'object' && field.required.message !== undefined) {
    localized.required = { ...field.required, message: localizeText(strings, field.required.message) };
  }
  const localizeOptions = (options: SelectOption[]) =>
    options.map((option) => ({ ...option, label: localizeText(strings, option.label) }));
  if (Array.isArray(field.options)) localized.options = localizeOptions(field.options);
  else if (field.options) {
    localized.options = Object.fromEntries(
      Object.entries(field.options).map(([key, options]) => [key, localizeOptions(options)]),
    );
  }
  return localized;
};

/**
 * Turns an edited, localized field back into what's stored: the field JSON plus any
 * translations to write. `stored` is the field before the edit (undefined for a new one).
 */
export const unlocalizeField = (
  edited: WebchatField,
  stored: WebchatField | undefined,
  context: TextContext,
): { field: WebchatField; translations: [string, string][] } => {
  const translations: [string, string][] = [];
  const text = (before: unknown, after: string) => {
    const update = updateText(before, after, context);
    if (update.translation) translations.push(update.translation);
    return update.stored;
  };
  const field: WebchatField = { ...edited, label: text(stored?.label, edited.label) };
  if (edited.placeholder !== undefined) {
    field.placeholder = text(stored?.placeholder, edited.placeholder);
  }
  if (typeof edited.required === 'object' && edited.required.message !== undefined) {
    const before = typeof stored?.required === 'object' ? stored.required.message : undefined;
    field.required = { ...edited.required, message: text(before, edited.required.message) };
  }
  const unlocalizeOptions = (options: SelectOption[], storedOptions: unknown) => {
    const byValue = new Map(
      (Array.isArray(storedOptions) ? (storedOptions as SelectOption[]) : []).map((option) => [
        String(option.value),
        option,
      ]),
    );
    return options.map((option) => ({
      ...option,
      label: text(byValue.get(String(option.value))?.label, String(option.label)),
    }));
  };
  if (Array.isArray(edited.options)) {
    field.options = unlocalizeOptions(edited.options, stored?.options);
  } else if (edited.options) {
    const storedGroups = (stored?.options && !Array.isArray(stored.options) ? stored.options : {}) as Record<
      string,
      SelectOption[]
    >;
    field.options = Object.fromEntries(
      Object.entries(edited.options).map(([key, options]) => [
        key,
        unlocalizeOptions(options, storedGroups[key]),
      ]),
    );
  }
  return { field, translations };
};

// Writes translations into the helpline's file for a language
export const withTranslations = (
  files: DefinitionFileMap,
  locale: string,
  translations: [string, string][],
): DefinitionFileMap => {
  if (translations.length === 0) return files;
  const filePath = webchatTranslationsPath(locale);
  return {
    ...files,
    [filePath]: { ...(files[filePath] as Strings | undefined), ...Object.fromEntries(translations) },
  };
};

/**
 * Sets one of the texts around the form (WEBCHAT_TEXTS) for a language. Text that is just
 * the webchat's default isn't written, unless the helpline already had it.
 */
export const setWebchatText = (
  files: DefinitionFileMap,
  originalFiles: DefinitionFileMap,
  locale: string,
  key: string,
  text: string,
): DefinitionFileMap => {
  const filePath = webchatTranslationsPath(locale);
  const current = { ...(files[filePath] as Strings | undefined) };
  const hadIt = key in ((originalFiles[filePath] as Strings | undefined) ?? {});
  if (!hadIt && baseWebchatStrings(locale)[key] === text) delete current[key];
  else current[key] = text;
  return { ...files, [filePath]: current };
};

export const isRequired = (field: WebchatField) =>
  typeof field.required === 'object' ? Boolean(field.required.value) : Boolean(field.required);

// The options of a dropdown, without the empty "nothing chosen yet" one
export const visibleOptions = (options: unknown): SelectOption[] =>
  (Array.isArray(options) ? (options as SelectOption[]) : []).filter(
    (option) => !(option.value === '' && !option.label),
  );

/**
 * Editing fields
 */

// Labels can hold HTML (checkbox links); names and summaries use the plain text
export const plainText = (text: unknown) => String(text ?? '').replace(/<[^>]*>/g, '').trim();

export const webchatFieldName = (label: string, otherNames: Iterable<string>) =>
  uniqueFieldName(toFieldName(plainText(label)) || 'question', [...otherNames]);

const BLANK_OPTION: SelectOption = { value: '', label: '' };

export const createWebchatField = (
  type: WebchatFieldType,
  otherNames: Iterable<string>,
): WebchatField => {
  const label = 'New question';
  const base: WebchatField = { type, name: webchatFieldName(label, otherNames), label };
  if (type === 'select') return { ...base, required: false, defaultValue: '', options: [BLANK_OPTION] };
  if (type === 'checkbox') return base;
  return { ...base, required: false };
};

/**
 * Switches a field's kind, keeping its question and adjusting what goes with each kind.
 * A checkbox is "required" by having to be ticked ({ value: true }), the others by being
 * answered (true).
 */
export const changeWebchatFieldType = (field: WebchatField, type: WebchatFieldType): WebchatField => {
  const { options, defaultValue, placeholder, initialChecked, required, ...rest } = field;
  const answered = isRequired(field);
  if (type === 'checkbox') {
    return { ...rest, type, ...(answered ? { required: { value: true } } : {}) };
  }
  const next: WebchatField = { ...rest, type, required: answered };
  if (type === 'select') {
    next.defaultValue = '';
    next.options = Array.isArray(options) && options.length > 0 ? options : [BLANK_OPTION];
  } else if (placeholder !== undefined) {
    next.placeholder = placeholder;
  }
  return next;
};

/**
 * What else relies on a pre-engagement field: its special meaning, the contact form fields
 * it fills in (PrepopulateMappings.json, or the older PrepopulateKeys.json), and dropdowns
 * that depend on it.
 */
export const findWebchatFieldReferences = (
  files: DefinitionFileMap,
  fieldName: string,
  contactIdentifierField?: string,
): string[] => {
  const references: string[] = [];
  const special = describeSpecialField(fieldName, contactIdentifierField);
  if (special) references.push(special);

  const describeTarget = (target: string) => {
    const [tabKey, targetName] = target.split('.');
    const tab = CONTACT_TABS.find((contactTab) => contactTab.key === tabKey);
    const targetField = tab && getForm(files, tab.filePath)?.find((item) => item.name === targetName);
    return tab ? `${tab.title}: ${targetField?.label || targetName}` : target;
  };
  getPrepopulateTargets(files, fieldName).targets.forEach((target) =>
    references.push(`Fills in the contact form (${describeTarget(target)})`),
  );

  const legacyKeys = (files['PrepopulateKeys.json'] ?? {}) as {
    preEngagement?: Record<string, string[]>;
  };
  Object.entries(legacyKeys.preEngagement ?? {})
    .filter(([, names]) => Array.isArray(names) && names.includes(fieldName))
    .forEach(([tabKey]) => references.push(`Fills in the contact form (${describeTarget(`${tabKey}.${fieldName}`)})`));

  (getPreEngagementForm(files)?.fields ?? [])
    .filter((field) => field.type === 'dependent-select' && field.dependsOn === fieldName)
    .forEach((field) => references.push(`The “${plainText(field.label)}” dropdown depends on it`));
  // Some helplines have the same mapping in both prepopulation files
  return [...new Set(references)];
};

/**
 * Which contact form fields a question fills in, in PrepopulateMappings.json (the plugin
 * reads it when the helpline's use_prepopulate_mappings flag is on; the older
 * PrepopulateKeys.json is never written here). A target is "<Tab>.<field>", e.g.
 * "ChildInformationTab.age". Several targets are all filled in.
 */
export const PREPOPULATE_MAPPINGS_FILE = 'PrepopulateMappings.json';

type PrepopulateMappings = { preEngagement?: Record<string, unknown>; [other: string]: unknown };

export const getPrepopulateTargets = (
  files: DefinitionFileMap,
  fieldName: string,
): { targets: string[]; editable: boolean } => {
  const value = (files[PREPOPULATE_MAPPINGS_FILE] as PrepopulateMappings | undefined)?.preEngagement?.[fieldName];
  if (value === undefined) return { targets: [], editable: true };
  const entries = Array.isArray(value) ? value : [value];
  // Nested lists mean "whichever of these the form has"; that's left to Aselo staff
  const editable = entries.every((entry) => typeof entry === 'string');
  return { targets: entries.flat().filter((entry): entry is string => typeof entry === 'string'), editable };
};

export const setPrepopulateTargets = (
  files: DefinitionFileMap,
  fieldName: string,
  targets: string[],
): DefinitionFileMap => {
  const mappings = (files[PREPOPULATE_MAPPINGS_FILE] ?? {}) as PrepopulateMappings;
  if (targets.length === 0 && mappings.preEngagement?.[fieldName] === undefined) return files;
  const { [fieldName]: removed, ...others } = mappings.preEngagement ?? {};
  const preEngagement =
    targets.length === 0 ? others : { ...mappings.preEngagement, [fieldName]: targets.length === 1 ? targets[0] : targets };
  return {
    ...files,
    [PREPOPULATE_MAPPINGS_FILE]: {
      ...(files[PREPOPULATE_MAPPINGS_FILE] ? mappings : { survey: {} }),
      preEngagement,
    },
  };
};

// Moves a question's targets when its saved name changes (only for questions new in this draft)
export const renamePrepopulateTargets = (files: DefinitionFileMap, from: string, to: string) => {
  const { targets } = getPrepopulateTargets(files, from);
  if (from === to || targets.length === 0) return files;
  return setPrepopulateTargets(setPrepopulateTargets(files, from, []), to, targets);
};

// Contact form fields a question can fill in, by tab
export const getPrepopulateCandidates = (files: DefinitionFileMap) =>
  CONTACT_TABS.filter((tab) => ['ChildInformationTab', 'CallerInformationTab', 'CaseInformationTab'].includes(tab.key))
    .map((tab) => ({
      tab,
      fields: (getForm(files, tab.filePath) ?? []).filter(
        (item) => !['button', 'copy-to', 'custom-contact-component', 'file-upload'].includes(item.type),
      ),
    }))
    .filter((group) => group.fields.length > 0);

/**
 * Answers of a dropdown question that the contact form field it fills in doesn't have, so
 * they'd be left blank there
 */
export const findUnmatchedAnswers = (
  files: DefinitionFileMap,
  field: WebchatField,
  target: string,
): string[] => {
  if (field.type !== 'select' || !Array.isArray(field.options)) return [];
  const [tabKey, targetName] = target.split('.');
  const tab = CONTACT_TABS.find((contactTab) => contactTab.key === tabKey);
  const targetField = tab && getForm(files, tab.filePath)?.find((item) => item.name === targetName);
  if (!targetField || !('options' in targetField) || !Array.isArray(targetField.options)) return [];
  const targetValues = new Set(targetField.options.map((option) => String(option.value)));
  return visibleOptions(field.options)
    .map((option) => String(option.value))
    .filter((value) => !targetValues.has(value));
};

/**
 * Checks, for the workspace and review
 */
const checkWebchatForm = (files: DefinitionFileMap): ValidationIssue[] => {
  const fields = getPreEngagementForm(files)?.fields;
  if (!fields) return [];
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  fields.forEach((field, index) => {
    const name = plainText(field.label) ? `“${plainText(field.label)}”` : `Question ${index + 1}`;
    const add = (message: string, severity: ValidationIssue['severity'] = 'error') =>
      issues.push({ severity, fieldName: field.name, message: `Webchat form: ${message}` });
    if (!String(field.label ?? '').trim()) add(`question ${index + 1} has no text.`);
    if (seen.has(field.name)) add(`more than one question is saved as “${field.name}”.`);
    seen.add(field.name);
    if (field.type === 'select' && visibleOptions(field.options).length === 0) {
      add(`${name} has no answers to choose from.`);
    }
    if (field.type === 'dependent-select') {
      const parentIndex = fields.findIndex((other) => other.name === field.dependsOn);
      if (parentIndex < 0) add(`${name} depends on a question that isn't in the form.`);
      else if (parentIndex > index) add(`${name} must come after the question it depends on.`);
    }
  });
  return issues;
};

// Problems that were already there before the user's changes are only warnings
export const validateWebchat = (
  draftFiles: DefinitionFileMap,
  originalFiles: DefinitionFileMap,
): ValidationIssue[] => {
  const before = new Set(checkWebchatForm(originalFiles).map((found) => found.message));
  const issues = checkWebchatForm(draftFiles).map((found) =>
    found.severity === 'error' && before.has(found.message)
      ? {
          ...found,
          severity: 'warning' as const,
          message: `${found.message} (This was already the case before your changes.)`,
        }
      : found,
  );
  if (changedWebchatTranslationFiles(originalFiles, draftFiles).length > 0) {
    issues.push({
      severity: 'warning',
      message:
        'The webchat’s texts changed. They live in aselo-webchat-react-app, so the webchat needs to be redeployed after the PR is merged (the form itself is deployed with the form definitions).',
    });
  }
  return issues;
};

export const changedWebchatTranslationFiles = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
) =>
  Object.keys(draftFiles).filter(
    (filePath) =>
      filePath.startsWith(WEBCHAT_TRANSLATIONS_PREFIX) &&
      !isSameJson(originalFiles[filePath], draftFiles[filePath]),
  );

/**
 * Plain-language description of the changes, for the review dialog and CHANGES.md
 */
export const summarizeWebchatChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
  defaultLocale = 'en-US',
): { title: string; lines: string[] }[] => {
  const summaries: { title: string; lines: string[] }[] = [];
  const before = getPreEngagementForm(originalFiles)?.fields ?? [];
  const after = getPreEngagementForm(draftFiles)?.fields ?? [];
  if (!isSameJson(before, after)) {
    const strings = webchatStrings(draftFiles, defaultLocale);
    const describe = (field: WebchatField) => `“${plainText(localizeText(strings, field.label))}”`;
    const beforeByName = new Map(before.map((field) => [field.name, field]));
    const afterNames = new Set(after.map((field) => field.name));
    const lines: string[] = [];
    after.forEach((field) => {
      const previous = beforeByName.get(field.name);
      if (!previous) lines.push(`Added: ${describe(field)}`);
      else if (!isSameJson(previous, field)) lines.push(`Changed: ${describe(field)}`);
    });
    before
      .filter((field) => !afterNames.has(field.name))
      .forEach((field) => lines.push(`Removed: ${describe(field)}`));
    const kept = (fields: WebchatField[], others: Set<string>) =>
      fields.map((field) => field.name).filter((name) => others.has(name));
    if (!isSameJson(kept(before, afterNames), kept(after, new Set(beforeByName.keys())))) {
      lines.push('Questions were reordered');
    }
    summaries.push({ title: 'Webchat form', lines });
  }

  const mappingsBefore = (originalFiles[PREPOPULATE_MAPPINGS_FILE] as PrepopulateMappings | undefined)?.preEngagement ?? {};
  const mappingsAfter = (draftFiles[PREPOPULATE_MAPPINGS_FILE] as PrepopulateMappings | undefined)?.preEngagement ?? {};
  const mappingLines = [...new Set([...Object.keys(mappingsBefore), ...Object.keys(mappingsAfter)])]
    .filter((name) => !isSameJson(mappingsBefore[name], mappingsAfter[name]))
    .map((name) => {
      const { targets } = getPrepopulateTargets(draftFiles, name);
      return targets.length > 0
        ? `“${name}” fills in ${targets.join(', ')}`
        : `“${name}” no longer fills in the contact form`;
    });
  if (mappingLines.length > 0) {
    summaries.push({ title: 'Webchat answers filled into the contact form', lines: mappingLines });
  }

  const translationLines = changedWebchatTranslationFiles(originalFiles, draftFiles).flatMap(
    (filePath) => {
      const locale = webchatLocaleOf(filePath);
      const beforeStrings = (originalFiles[filePath] ?? {}) as Strings;
      const afterStrings = (draftFiles[filePath] ?? {}) as Strings;
      return [...new Set([...Object.keys(beforeStrings), ...Object.keys(afterStrings)])]
        .filter((key) => beforeStrings[key] !== afterStrings[key])
        .map((key) => {
          const title = WEBCHAT_TEXTS.find((info) => info.key === key)?.title ?? key;
          if (afterStrings[key] === undefined) return `Back to the default: ${title} (${locale})`;
          return `“${title}” (${locale}): ${afterStrings[key]}`;
        });
    },
  );
  if (translationLines.length > 0) {
    summaries.push({ title: 'Webchat texts', lines: translationLines });
  }
  return summaries;
};
