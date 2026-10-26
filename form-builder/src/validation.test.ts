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

import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, test } from 'vitest';
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import { listHelplines, loadDefinitionFiles } from '../server/definitionsApi';
import { CONTACT_TABS, DefinitionFileMap, getForm } from './definitions';
import { createField } from './formEditing';
import { validateContactTab } from './validation';
import { findFieldReferences } from './fieldReferences';

const formDefinitionsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../lambdas/packages/hrm-form-definitions/form-definitions',
);

const [callerTab, childTab, caseTab] = CONTACT_TABS;

let usnm: DefinitionFileMap;
// The demo helpline has every field the Aselo specification requires (USNM doesn't)
let demo: DefinitionFileMap;

beforeAll(async () => {
  usnm = (await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1')).files;
  demo = (await loadDefinitionFiles(formDefinitionsDir, 'as', 'v1')).files;
});

const withForm = (
  files: DefinitionFileMap,
  filePath: string,
  update: (form: FormItemJsonDefinition[]) => FormItemJsonDefinition[],
) => ({ ...files, [filePath]: update(getForm(files, filePath) ?? []) });

const errorsOf = (issues: ReturnType<typeof validateContactTab>) =>
  issues.filter((issue) => issue.severity === 'error').map((issue) => issue.message);

describe('validateContactTab', () => {
  test('unchanged definitions never block export, for every helpline', async () => {
    const helplines = await listHelplines(formDefinitionsDir);
    for (const { code, versions } of helplines) {
      for (const version of versions) {
        const { files } = await loadDefinitionFiles(formDefinitionsDir, code, version);
        for (const tab of CONTACT_TABS) {
          expect(errorsOf(validateContactTab(files, files, tab)), `${code}/${version}`).toEqual([]);
        }
      }
    }
  });

  test('removing a field the Aselo specification requires is an error', () => {
    const draft = withForm(demo, caseTab.filePath, (form) =>
      form.filter((item) => item.name !== 'callSummary'),
    );
    expect(errorsOf(validateContactTab(draft, demo, caseTab))).toContain(
      'Aselo requires a field saved as “callSummary” in Case information.',
    );
  });

  test('a required field the helpline never had is only a warning', () => {
    const issues = validateContactTab(usnm, usnm, caseTab);
    expect(issues).toContainEqual(
      expect.objectContaining({
        severity: 'warning',
        message: expect.stringContaining('“callSummary”'),
      }),
    );
  });

  test('flags duplicate names, missing labels and dropdowns without answers', () => {
    const draft = withForm(usnm, callerTab.filePath, (form) => [
      ...form,
      { ...createField('input', [], ''), name: form[0].name },
      { ...createField('input', [], ''), name: 'unlabelled', label: '' },
      { ...createField('select', [], ''), name: 'emptyChoice', options: [{ value: '', label: '' }] },
    ] as FormItemJsonDefinition[]);
    const errors = errorsOf(validateContactTab(draft, usnm, callerTab));
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('More than one field is saved as'),
        expect.stringContaining('has no label'),
        expect.stringContaining('needs at least one answer'),
      ]),
    );
  });

  test('warns, without blocking, when reporting expects a removed field', () => {
    const draft = withForm(usnm, childTab.filePath, (form) =>
      form.filter((item) => item.name !== 'zipCode'),
    );
    const issues = validateContactTab(draft, usnm, childTab);
    expect(issues).toContainEqual(
      expect.objectContaining({
        severity: 'warning',
        message: expect.stringContaining('Reporting still expects a field saved as “zipCode”'),
      }),
    );
  });
});

describe('findFieldReferences', () => {
  test('finds Insights and prepopulation uses of a field', () => {
    const references = findFieldReferences(usnm, childTab, 'zipCode');
    expect(references).toContain('Reporting: saved to the Insights column “case”');
  });
});
