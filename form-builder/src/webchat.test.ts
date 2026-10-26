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

// @vitest-environment jsdom

import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, test } from 'vitest';
import { DefinitionFiles, listHelplines, loadDefinitionFiles } from '../server/definitionsApi';
import {
  buildTextContext,
  changeWebchatFieldType,
  findUnmatchedAnswers,
  findWebchatFieldReferences,
  getPreEngagementForm,
  getWebchatLocales,
  localizeField,
  PRE_ENGAGEMENT_FILE,
  renamePrepopulateTargets,
  setPrepopulateTargets,
  setWebchatText,
  summarizeWebchatChanges,
  unlocalizeField,
  validateWebchat,
  webchatStrings,
  withTranslations,
} from './webchat';
import { sanitizeLabelHtml } from './components/webchat/sanitizeLabelHtml';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const formDefinitionsDir = path.join(repoRoot, 'lambdas/packages/hrm-form-definitions/form-definitions');
const helplinesConfigDir = path.join(repoRoot, 'twilio-iac/helplines');
const webchatConfigDir = path.join(repoRoot, 'aselo-webchat-react-app/configSrc');

const load = (code: string) =>
  loadDefinitionFiles(formDefinitionsDir, code, 'v1', helplinesConfigDir, webchatConfigDir);

let ca: DefinitionFiles;
let as: DefinitionFiles;
beforeAll(async () => {
  ca = await load('ca');
  as = await load('as');
});

describe('loading', () => {
  test('reads the webchat translations and settings with the form definitions', () => {
    expect(ca.webchat?.defaultLocale).toBe('en-CA');
    expect(as.webchat?.contactIdentifierField).toBe('ip');
    expect(getWebchatLocales(ca.files, 'en-CA')).toEqual(['en-CA', 'fr-CA']);
    expect(getWebchatLocales(as.files, 'en-US')).toEqual(['en-US', 'es-ES']);
  });

  test('merges translations like the webchat build: app defaults, then the helpline', () => {
    const fr = webchatStrings(ca.files, 'fr-CA');
    expect(fr.LabelNickname).toMatch(/^Pseudonyme/);
    // Not set by CA, so it comes from translationsSrc/fr.json or en.json
    expect(fr['Header-TitleBar-Title']).toBeTruthy();
  });
});

describe('editing text in a language', () => {
  test('a translated question keeps its key; the text goes into that language only', () => {
    const nickname = getPreEngagementForm(ca.files)!.fields![0];
    const context = buildTextContext(ca.files, 'fr-CA', ['en-CA', 'fr-CA']);
    const shown = localizeField(nickname, context.strings);
    expect(shown.label).toMatch(/^Pseudonyme/);

    const { field, translations } = unlocalizeField({ ...shown, label: 'Ton pseudo' }, nickname, context);
    expect(field.label).toBe('LabelNickname');
    expect(translations).toEqual([['LabelNickname', 'Ton pseudo']]);

    const files = withTranslations(ca.files, 'fr-CA', translations);
    expect(webchatStrings(files, 'fr-CA').LabelNickname).toBe('Ton pseudo');
    expect(webchatStrings(files, 'en-CA').LabelNickname).toMatch(/^Nickname/);
  });

  test('text written in the form stays in the form', () => {
    const nickname = getPreEngagementForm(as.files)!.fields![0];
    const context = buildTextContext(as.files, 'es-ES', ['en-US', 'es-ES']);
    const shown = localizeField(nickname, context.strings);
    const { field, translations } = unlocalizeField({ ...shown, label: 'Apodo' }, nickname, context);
    expect(field.label).toBe('Apodo');
    expect(translations).toEqual([]);
  });

  test('answers keep their saved value; new answers are text in the form', () => {
    const age = getPreEngagementForm(ca.files)!.fields!.find((field) => field.name === 'age')!;
    const context = buildTextContext(ca.files, 'en-CA', ['en-CA', 'fr-CA']);
    const shown = localizeField(age, context.strings);
    const options = [...(shown.options as { value: string; label: string }[]), { value: '99', label: '99' }];
    const { field } = unlocalizeField({ ...shown, options }, age, context);
    expect(field.options).toEqual([...(age.options as unknown[]), { value: '99', label: '99' }]);
  });

  test('for every helpline and language, showing and saving unchanged questions changes nothing', async () => {
    const helplines = await listHelplines(formDefinitionsDir);
    let checked = 0;
    for (const { code, versions } of helplines) {
      const { files, webchat } = await loadDefinitionFiles(
        formDefinitionsDir,
        code,
        versions[0],
        helplinesConfigDir,
        webchatConfigDir,
      );
      const fields = getPreEngagementForm(files)?.fields;
      if (!fields) continue;
      const locales = getWebchatLocales(files, webchat?.defaultLocale);
      for (const locale of locales.length > 0 ? locales : ['en-US']) {
        const context = buildTextContext(files, locale, locales);
        fields.forEach((field) => {
          const saved = unlocalizeField(localizeField(field, context.strings), field, context);
          expect(saved.field, `${code} ${locale} ${field.name}`).toEqual(field);
          expect(saved.translations).toEqual([]);
        });
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(15);
  });

  test('texts around the form: the webchat default is not written, other text is', () => {
    const unchanged = setWebchatText(as.files, as.files, 'en-US', 'PreEngagementPhase-Form-SubmitButtonLabel', 'Start chat');
    expect(unchanged['webchat-app/translations/en-US.json']).toEqual(as.files['webchat-app/translations/en-US.json']);

    const changed = setWebchatText(as.files, as.files, 'es-ES', 'PreEngagementPhase-Form-Description', '¡Hola!');
    expect((changed['webchat-app/translations/es-ES.json'] as Record<string, string>)['PreEngagementPhase-Form-Description']).toBe('¡Hola!');
    expect(summarizeWebchatChanges(as.files, changed)).toEqual([
      { title: 'Webchat texts', lines: ['“Introduction” (es-ES): ¡Hola!'] },
    ]);
  });
});

describe('questions', () => {
  test('switching kind adjusts what goes with it', () => {
    const select = changeWebchatFieldType({ type: 'input', name: 'q', label: 'Q', required: true }, 'select');
    expect(select).toEqual({ type: 'select', name: 'q', label: 'Q', required: true, defaultValue: '', options: [{ value: '', label: '' }] });
    expect(changeWebchatFieldType(select, 'checkbox')).toEqual({ type: 'checkbox', name: 'q', label: 'Q', required: { value: true } });
  });

  test('says what a question fills in and what depends on it', () => {
    const references = findWebchatFieldReferences(as.files, 'province');
    expect(references).toContain('The “District” dropdown depends on it');
    expect(references.some((reference) => reference.startsWith('Fills in the contact form (Caller information'))).toBe(true);
    expect(findWebchatFieldReferences(as.files, 'friendlyName')[0]).toMatch(/name counselors see/);
  });

  test('problems in the forms today are only warnings', async () => {
    const helplines = await listHelplines(formDefinitionsDir);
    for (const { code, versions } of helplines) {
      const { files } = await loadDefinitionFiles(formDefinitionsDir, code, versions[0]);
      validateWebchat(files, files).forEach((issue) => expect(issue.severity, `${code}: ${issue.message}`).toBe('warning'));
    }
  });

  test('a question without text, or a dropdown without answers, needs fixing', () => {
    const form = getPreEngagementForm(as.files)!;
    const draft = {
      ...as.files,
      [PRE_ENGAGEMENT_FILE]: {
        ...form,
        fields: [...form.fields!, { type: 'select', name: 'empty', label: '', options: [{ value: '', label: '' }] }],
      },
    };
    expect(validateWebchat(draft, as.files).map((issue) => issue.message)).toEqual([
      'Webchat form: question 10 has no text.',
      'Webchat form: Question 10 has no answers to choose from.',
    ]);
  });
});

describe('sanitizeLabelHtml', () => {
  test('keeps links and simple formatting, drops anything that could run', () => {
    expect(sanitizeLabelHtml('I accept the <a href="https://example.org" target="_self">terms</a>')).toBe(
      'I accept the <a href="https://example.org" target="_blank" rel="noreferrer">terms</a>',
    );
    expect(
      sanitizeLabelHtml('<b>Hi</b><script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)" onclick="x()">x</a>'),
    ).toBe('<b>Hi</b>alert(1)<a target="_blank" rel="noreferrer">x</a>');
  });
});

describe('filling in the contact form (PrepopulateMappings.json)', () => {
  test('adds, renames and removes what a question fills in, keeping the rest of the file', () => {
    const before = as.files['PrepopulateMappings.json'] as Record<string, any>;
    let files = setPrepopulateTargets(as.files, 'nickname', ['ChildInformationTab.firstName']);
    files = renamePrepopulateTargets(files, 'nickname', 'preferredName');
    const after = files['PrepopulateMappings.json'] as Record<string, any>;
    expect(after.preEngagement.preferredName).toBe('ChildInformationTab.firstName');
    expect(after.preEngagement.nickname).toBeUndefined();
    expect(after.formSelector).toEqual(before.formSelector);
    expect(after.survey).toEqual(before.survey);

    files = setPrepopulateTargets(files, 'preferredName', []);
    expect(files['PrepopulateMappings.json']).toEqual(before);
  });

  test('warns about dropdown answers the contact form field does not have', () => {
    const age = getPreEngagementForm(as.files)!.fields!.find((field) => field.name === 'age')!;
    const withExtra = { ...age, options: [...(age.options as any[]), { value: 'Ninety', label: 'Ninety' }] };
    expect(findUnmatchedAnswers(as.files, withExtra, 'ChildInformationTab.age')).toEqual(['Ninety']);
  });
});
