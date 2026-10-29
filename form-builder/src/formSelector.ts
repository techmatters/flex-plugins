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
 * The "formSelector" of PrepopulateMappings.json: when a contact arrives, which contact form
 * tabs are filled in from the chatbot (survey) and webchat form (preEngagement) answers, and
 * which call type is preselected. Mirrors hrm-form-definitions' formSelector/ and
 * account-scoped's populateHrmContactFormFromTaskByMappings.ts:
 *
 * - staticSelector: always the same tabs, and the call type given (or none).
 * - serviceUserChoiceSelector: a list of answers checked in order; the first one answered
 *   decides. Equal to aboutSelfValue (default "Yes") = about themselves: Case + Child,
 *   "Child calling about self". Any other answer: Case + Caller, "Someone calling about a
 *   child". No answer: chatbot answers fill Case only, webchat answers Case + Child, and the
 *   call type is "Child calling about self".
 * - No formSelector (or an unknown selectorType): serviceUserChoiceSelector checking
 *   "aboutSelf" in the chatbot.
 *
 * Only used when the helpline's use_prepopulate_mappings flag is on. Only the formSelector key
 * is written here; survey and preEngagement are left as they are.
 */
import type { DefinitionFileMap } from './definitions';
import { CONTACT_TABS } from './definitions';
import { isSameJson } from './changes';
import type { ValidationIssue } from './validation';
import { getPreEngagementForm, plainText, PREPOPULATE_MAPPINGS_FILE, visibleOptions } from './webchat';

export const FORM_SELECTOR_PREFIX = 'Filling in the contact';

// The tabs the lambda can fill in (hrm-form-definitions FORM_DEFINITION_MAP)
export const SELECTABLE_TABS = ['ChildInformationTab', 'CallerInformationTab', 'CaseInformationTab'] as const;
export type SelectableTab = (typeof SELECTABLE_TABS)[number];

// The call types the plugin knows for contacts with a form (hrm-types callTypes)
export const CALL_TYPE_CHILD = 'Child calling about self';
export const CALL_TYPE_CALLER = 'Someone calling about a child';
export const PRESELECTABLE_CALL_TYPES = [CALL_TYPE_CHILD, CALL_TYPE_CALLER];

export const DEFAULT_ABOUT_SELF_VALUE = 'Yes';

export type ChoiceSource = 'survey' | 'preEngagement';

// One answer to check. aboutSelfValue is kept as written: missing means "Yes".
export type ServiceUserChoice = { form: ChoiceSource; input: string; aboutSelfValue?: string };

export type FormSelector =
  { kind: 'static'; tabs: string[]; callType?: string } | { kind: 'choice'; choices: ServiceUserChoice[] };

export type FormSelectorInfo = {
  selector: FormSelector;
  // Not written in the file: Aselo's default applies
  implicit: boolean;
  // A selectorType Aselo doesn't know (it then uses the default)
  unknownType?: string;
  // A static selector without its list of tabs (the lambda fails on it)
  missingTabs?: boolean;
};

export const DEFAULT_CHOICES: ServiceUserChoice[] = [
  { form: 'survey', input: 'aboutSelf', aboutSelfValue: DEFAULT_ABOUT_SELF_VALUE },
];

type PrepopulateMappings = {
  formSelector?: { selectorType?: unknown; callType?: unknown; parameter?: unknown; [other: string]: unknown };
  survey?: Record<string, unknown>;
  preEngagement?: Record<string, unknown>;
  [other: string]: unknown;
};

const getMappings = (files: DefinitionFileMap) => files[PREPOPULATE_MAPPINGS_FILE] as PrepopulateMappings | undefined;

const readChoice = (entry: unknown): ServiceUserChoice => {
  const { form, input, aboutSelfValue } = (entry ?? {}) as Record<string, unknown>;
  return {
    form: form === 'preEngagement' ? 'preEngagement' : 'survey',
    input: String(input ?? ''),
    ...(aboutSelfValue !== undefined ? { aboutSelfValue: String(aboutSelfValue) } : {}),
  };
};

export const readFormSelector = (files: DefinitionFileMap): FormSelectorInfo => {
  const raw = getMappings(files)?.formSelector;
  const byDefault: FormSelectorInfo = { selector: { kind: 'choice', choices: DEFAULT_CHOICES }, implicit: true };
  if (!raw) return byDefault;
  if (raw.selectorType === 'staticSelector') {
    const tabs = (raw.parameter as { availableTabs?: unknown } | undefined)?.availableTabs;
    return {
      selector: {
        kind: 'static',
        tabs: Array.isArray(tabs) ? tabs.map(String) : [],
        ...(typeof raw.callType === 'string' && raw.callType ? { callType: raw.callType } : {}),
      },
      implicit: false,
      ...(Array.isArray(tabs) ? {} : { missingTabs: true }),
    };
  }
  if (raw.selectorType === 'serviceUserChoiceSelector') {
    // No parameter: the lambda's default list
    if (raw.parameter === undefined) return { ...byDefault, implicit: false };
    return {
      selector: { kind: 'choice', choices: Array.isArray(raw.parameter) ? raw.parameter.map(readChoice) : [] },
      implicit: false,
    };
  }
  return { ...byDefault, unknownType: String(raw.selectorType ?? '') };
};

// The JSON for the file, in the key order the helplines use
export const formSelectorJson = (selector: FormSelector) =>
  selector.kind === 'static'
    ? {
        selectorType: 'staticSelector',
        ...(selector.callType ? { callType: selector.callType } : {}),
        parameter: { availableTabs: selector.tabs },
      }
    : {
        selectorType: 'serviceUserChoiceSelector',
        parameter: selector.choices.map(({ form, input, aboutSelfValue }) => ({
          form,
          input,
          ...(aboutSelfValue !== undefined && aboutSelfValue !== '' ? { aboutSelfValue } : {}),
        })),
      };

/**
 * Writes the formSelector, keeping every other key of PrepopulateMappings.json (and its place
 * in the file). Nothing changes when the selector reads the same as before.
 */
export const setFormSelector = (files: DefinitionFileMap, selector: FormSelector): DefinitionFileMap => {
  const current = readFormSelector(files);
  if (!current.implicit && !current.unknownType && !current.missingTabs && isSameJson(current.selector, selector)) {
    return files;
  }
  const mappings = getMappings(files);
  const formSelector = formSelectorJson(selector);
  const next =
    mappings === undefined
      ? { formSelector, survey: {}, preEngagement: {} }
      : 'formSelector' in mappings
        ? { ...mappings, formSelector }
        : { formSelector, ...mappings };
  return { ...files, [PREPOPULATE_MAPPINGS_FILE]: next };
};

// Takes the formSelector out of the file, so Aselo's default applies again
export const removeFormSelector = (files: DefinitionFileMap): DefinitionFileMap => {
  const mappings = getMappings(files);
  if (!mappings || !('formSelector' in mappings)) return files;
  const { formSelector, ...others } = mappings;
  return { ...files, [PREPOPULATE_MAPPINGS_FILE]: others };
};

/**
 * What it does, in plain words
 */

export const tabTitle = (tabKey: string) => CONTACT_TABS.find((tab) => tab.key === tabKey)?.title ?? tabKey;

const listTabs = (tabs: string[]) => (tabs.length > 0 ? tabs.map(tabTitle).join(', ') : 'nothing');

export const SOURCE_TITLES: Record<ChoiceSource, string> = { survey: 'chatbot', preEngagement: 'webchat form' };

export const aboutSelfValueOf = (choice: ServiceUserChoice) => choice.aboutSelfValue || DEFAULT_ABOUT_SELF_VALUE;

const describeChoice = (choice: ServiceUserChoice) =>
  `“${choice.input}” in the ${SOURCE_TITLES[choice.form]} (about themselves when “${aboutSelfValueOf(choice)}”)`;

// What a contact gets in each case, for the panel's diagram
export type FormSelectorOutcome = { when: string; tabs: string[]; callType?: string; note?: string };

export const ABOUT_SELF_TABS = ['CaseInformationTab', 'ChildInformationTab'];
export const ABOUT_OTHER_TABS = ['CaseInformationTab', 'CallerInformationTab'];

export const formSelectorOutcomes = (selector: FormSelector): FormSelectorOutcome[] => {
  if (selector.kind === 'static') {
    return [{ when: 'Every contact', tabs: selector.tabs, callType: selector.callType }];
  }
  const values = [...new Set(selector.choices.map(aboutSelfValueOf))];
  const outcomes: FormSelectorOutcome[] = [];
  if (selector.choices.length > 0) {
    outcomes.push(
      {
        when: `The answer is ${values.map((value) => `“${value}”`).join(' or ')} (about themselves)`,
        tabs: ABOUT_SELF_TABS,
        callType: CALL_TYPE_CHILD,
      },
      { when: 'Any other answer (about someone else)', tabs: ABOUT_OTHER_TABS, callType: CALL_TYPE_CALLER },
    );
  }
  outcomes.push({
    when: selector.choices.length > 0 ? 'Not answered' : 'Every contact (no answers are listed to check)',
    tabs: ['CaseInformationTab', 'ChildInformationTab'],
    callType: CALL_TYPE_CHILD,
    note: 'Chatbot answers fill in Case information only; webchat form answers fill in Case information and Child information.',
  });
  return outcomes;
};

export const summarizeFormSelector = (info: FormSelectorInfo | FormSelector): string => {
  const selector = 'kind' in info ? info : info.selector;
  const implicit = 'kind' in info ? false : info.implicit;
  if (selector.kind === 'static') {
    return `Every contact fills in ${listTabs(selector.tabs)}; call type: ${selector.callType ?? 'none (the counselor picks)'}`;
  }
  const by = implicit ? ' (Aselo’s default, nothing is set)' : '';
  if (selector.choices.length === 0) {
    return `No answers are checked${by}: chatbot answers fill in Case information, webchat answers Case information and Child information; call type: ${CALL_TYPE_CHILD}`;
  }
  const decider =
    selector.choices.length === 1
      ? `The answer to ${describeChoice(selector.choices[0])} decides`
      : `The first answered of ${selector.choices.map(describeChoice).join(', then ')} decides`;
  return (
    `${decider}${by}: about themselves → ${listTabs(ABOUT_SELF_TABS)} (${CALL_TYPE_CHILD}); ` +
    `any other answer → ${listTabs(ABOUT_OTHER_TABS)} (${CALL_TYPE_CALLER}); ` +
    `no answer → chatbot answers fill in Case information only, webchat answers Case information and Child information (${CALL_TYPE_CHILD})`
  );
};

/**
 * Suggestions for the editor
 */

// Chatbot answer names: the keys the chatbot's answers are mapped from, plus "aboutSelf"
export const getSurveyAnswerNames = (files: DefinitionFileMap): string[] => {
  const names = Object.keys(getMappings(files)?.survey ?? {});
  return [...new Set(['aboutSelf', ...names])];
};

export const getWebchatQuestions = (files: DefinitionFileMap) =>
  (getPreEngagementForm(files)?.fields ?? []).map((field) => ({
    name: field.name,
    label: plainText(field.label),
    // Saved values of a dropdown's answers
    values: field.type === 'select' ? visibleOptions(field.options).map((option) => String(option.value)) : undefined,
  }));

/**
 * Checks
 */

const issue = (severity: ValidationIssue['severity'], message: string): ValidationIssue => ({
  severity,
  message: `${FORM_SELECTOR_PREFIX}: ${message}`,
});

// The tabs each source can fill in, whatever the answers
const reachableTabs = (selector: FormSelector): string[] =>
  selector.kind === 'static' ? selector.tabs : [...SELECTABLE_TABS];

// Mapping targets: [[a, b], c] means "a, or b if a's tab isn't filled in" and "c"
const mappingGroups = (value: unknown): string[][] =>
  (Array.isArray(value) ? value : [value]).map((entry) =>
    (Array.isArray(entry) ? entry : [entry]).filter((target): target is string => typeof target === 'string'),
  );

const checkFormSelector = (files: DefinitionFileMap): ValidationIssue[] => {
  const mappings = getMappings(files);
  if (!mappings) return [];
  const info = readFormSelector(files);
  const { selector } = info;
  const issues: ValidationIssue[] = [];
  if (info.unknownType !== undefined) {
    issues.push(
      issue(
        'warning',
        `Aselo doesn’t know the selector “${info.unknownType}”, so it checks “aboutSelf” in the chatbot.`,
      ),
    );
  }
  const hasForm = (tabKey: string) => {
    const tab = CONTACT_TABS.find((contactTab) => contactTab.key === tabKey);
    return Boolean(tab && files[tab.filePath] !== undefined);
  };

  if (selector.kind === 'static') {
    if (info.missingTabs) issues.push(issue('error', 'the list of contact form tabs to fill in is missing.'));
    else if (selector.tabs.length === 0) issues.push(issue('error', 'no contact form tab is filled in.'));
    selector.tabs
      .filter((tab) => !(SELECTABLE_TABS as readonly string[]).includes(tab))
      .forEach((tab) => issues.push(issue('error', `“${tab}” isn’t a contact form tab Aselo can fill in.`)));
    selector.tabs
      .filter((tab) => (SELECTABLE_TABS as readonly string[]).includes(tab) && !hasForm(tab))
      .forEach((tab) => issues.push(issue('warning', `this helpline has no ${tabTitle(tab)} form.`)));
    if (selector.callType && !PRESELECTABLE_CALL_TYPES.includes(selector.callType)) {
      issues.push(issue('error', `“${selector.callType}” isn’t a call type Aselo can preselect.`));
    }
  } else {
    const questions = getWebchatQuestions(files);
    selector.choices.forEach((choice, index) => {
      const name = choice.input ? `“${choice.input}”` : `Answer ${index + 1}`;
      if (!choice.input.trim()) {
        issues.push(issue('error', `answer ${index + 1} has no name.`));
        return;
      }
      if (choice.form !== 'preEngagement') return;
      const question = questions.find((candidate) => candidate.name === choice.input);
      if (!question) {
        issues.push(issue('warning', `${name} isn’t a question in the webchat form.`));
      } else if (question.values && !question.values.includes(aboutSelfValueOf(choice))) {
        issues.push(
          issue('warning', `“${aboutSelfValueOf(choice)}” isn’t one of the answers to ${name} in the webchat form.`),
        );
      }
    });
    if (selector.choices.length === 0) {
      issues.push(issue('warning', 'no answers are listed, so every contact is treated as not answered.'));
    }
  }

  // Answers mapped onto tabs that are never filled in
  const reachable = reachableTabs(selector);
  (['survey', 'preEngagement'] as const).forEach((source) => {
    Object.entries(mappings[source] ?? {}).forEach(([answer, value]) => {
      mappingGroups(value)
        .filter((group) => group.length > 0 && !group.some((target) => reachable.includes(target.split('.')[0])))
        .forEach((group) =>
          issues.push(
            issue(
              'warning',
              `“${answer}” from the ${SOURCE_TITLES[source]} fills in ${group
                .map((target) => tabTitle(target.split('.')[0]))
                .join(' or ')}, which is never filled in.`,
            ),
          ),
        );
    });
  });
  return issues;
};

// Problems that were already there before the user's changes are only warnings
export const validateFormSelector = (
  draftFiles: DefinitionFileMap,
  originalFiles: DefinitionFileMap,
): ValidationIssue[] => {
  const before = new Set(checkFormSelector(originalFiles).map((found) => found.message));
  return checkFormSelector(draftFiles).map((found) =>
    found.severity === 'error' && before.has(found.message)
      ? {
          ...found,
          severity: 'warning' as const,
          message: `${found.message} (This was already the case before your changes.)`,
        }
      : found,
  );
};

export const formSelectorChanged = (originalFiles: DefinitionFileMap, draftFiles: DefinitionFileMap) =>
  !isSameJson(getMappings(originalFiles)?.formSelector, getMappings(draftFiles)?.formSelector);

// A changed selector does nothing while the helpline still uses PrepopulateKeys.json
export const checkFormSelectorFlag = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
  usePrepopulateMappings: boolean,
): ValidationIssue[] =>
  !usePrepopulateMappings && formSelectorChanged(originalFiles, draftFiles)
    ? [
        issue(
          'warning',
          'this helpline still fills in contacts the old way (PrepopulateKeys.json), so this change only takes effect once “use_prepopulate_mappings” is turned on.',
        ),
      ]
    : [];

/**
 * For the review dialog and CHANGES.md
 */
export const summarizeFormSelectorChanges = (
  originalFiles: DefinitionFileMap,
  draftFiles: DefinitionFileMap,
): { title: string; lines: string[] }[] =>
  formSelectorChanged(originalFiles, draftFiles)
    ? [
        {
          title: FORM_SELECTOR_PREFIX,
          lines: [
            `Now: ${summarizeFormSelector(readFormSelector(draftFiles))}`,
            `Before: ${summarizeFormSelector(readFormSelector(originalFiles))}`,
          ],
        },
      ]
    : [];
