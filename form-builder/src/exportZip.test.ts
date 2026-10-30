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

import { describe, expect, test } from 'vitest';
import { buildExportZip, serializeDefinitionFile } from './exportZip';
import { summarizeFormChanges } from './changes';
import { CONTACT_TABS } from './definitions';

const callerForm = [
  { name: 'firstName', label: 'First name', type: 'input' },
  { name: 'age', label: 'Age', type: 'input' },
];

const originalFiles = {
  'tabbedForms/CallerInformationTab.json': callerForm,
  'CaseStatus.json': { open: { value: 'open' } },
};

const draftFiles = {
  ...originalFiles,
  'tabbedForms/CallerInformationTab.json': [
    { name: 'age', label: 'Age (years)', type: 'input' },
    { name: 'language', label: 'Language', type: 'input' },
  ],
};

describe('summarizeFormChanges', () => {
  test('describes added, removed and edited fields', () => {
    const summary = summarizeFormChanges(
      CONTACT_TABS[0],
      callerForm as never,
      draftFiles['tabbedForms/CallerInformationTab.json'] as never,
    );
    expect(summary.added).toEqual(['Language (language)']);
    expect(summary.removed).toEqual(['First name (firstName)']);
    expect(summary.edited).toEqual(['Age (years) (age)']);
  });
});

describe('buildExportZip', () => {
  test('contains only changed files, at their repo paths, plus CHANGES.md', async () => {
    const zip = buildExportZip({
      code: 'usnm',
      version: 'v1',
      originalFiles,
      draftFiles,
      warnings: [{ severity: 'warning', message: 'Check the Insights mapping' }],
    });
    const paths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);
    expect(paths.sort()).toEqual([
      'CHANGES.md',
      'lambdas/packages/hrm-form-definitions/form-definitions/usnm/v1/tabbedForms/CallerInformationTab.json',
    ]);

    const exported = await zip
      .file(
        'lambdas/packages/hrm-form-definitions/form-definitions/usnm/v1/tabbedForms/CallerInformationTab.json',
      )!
      .async('string');
    expect(exported).toBe(serializeDefinitionFile(draftFiles['tabbedForms/CallerInformationTab.json']));
    expect(exported.endsWith('}\n]\n')).toBe(true);

    const changes = await zip.file('CHANGES.md')!.async('string');
    expect(changes).toContain('- Added: Language (language)');
    expect(changes).toContain('Check the Insights mapping');
  });
});
