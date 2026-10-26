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
import { describe, expect, test } from 'vitest';
import { listHelplines, loadDefinitionFiles, readHelplineLanguage } from './definitionsApi';

const formDefinitionsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../lambdas/packages/hrm-form-definitions/form-definitions',
);

describe('definitionsApi', () => {
  test('lists helplines with their versions', async () => {
    const helplines = await listHelplines(formDefinitionsDir);
    expect(helplines.find((helpline) => helpline.code === 'usnm')?.versions).toContain('v1');
  });

  test('loads every helpline version from the repo without parse errors', async () => {
    const helplines = await listHelplines(formDefinitionsDir);
    for (const { code, versions } of helplines) {
      for (const version of versions) {
        const { files, errors } = await loadDefinitionFiles(formDefinitionsDir, code, version);
        expect(errors, `${code}/${version}`).toEqual([]);
        expect(Object.keys(files).length, `${code}/${version}`).toBeGreaterThan(0);
      }
    }
  });

  test('returns files keyed by their path inside the version directory', async () => {
    const { files } = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1');
    expect(Array.isArray(files['tabbedForms/CallerInformationTab.json'])).toBe(true);
    expect(files['CaseSections.json']).toBeDefined();
  });

  test.each([
    ['..', 'v1'],
    ['usnm', '../usch/v1'],
    ['USNM', 'v1'],
  ])('rejects invalid helpline/version %s/%s', async (code, version) => {
    await expect(loadDefinitionFiles(formDefinitionsDir, code, version)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test('reads the helpline language from its Flex service configuration', async () => {
    const helplinesConfigDir = path.resolve(formDefinitionsDir, '../../../../twilio-iac/helplines');
    expect(await readHelplineLanguage(helplinesConfigDir, 'ca')).toBe('en-CA');
    expect(await readHelplineLanguage(helplinesConfigDir, 'cl')).toMatch(/^es/);
    expect(await readHelplineLanguage(helplinesConfigDir, 'nosuchhelpline')).toBeUndefined();
    const { helplineLanguage } = await loadDefinitionFiles(
      formDefinitionsDir,
      'ca',
      'v1',
      helplinesConfigDir,
    );
    expect(helplineLanguage).toBe('en-CA');
  });

  test('returns 404 for an unknown helpline', async () => {
    await expect(loadDefinitionFiles(formDefinitionsDir, 'nosuchhelpline', 'v1')).rejects.toMatchObject(
      { statusCode: 404 },
    );
  });
});
