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

/**
 * Client profiles, edited through the workspace with AS's real definitions.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, listHelplines, loadDefinitionFiles } from '../../../server/definitionsApi';
import { createHarness, formDefinitionsDir, helplinesConfigDir } from '../../testing/workspaceHarness';
import { approximateDuration, splitDuration, validateProfiles } from '../../profiles';

let as: DefinitionFiles;
beforeAll(async () => {
  as = await loadDefinitionFiles(formDefinitionsDir, 'as', 'v1', helplinesConfigDir);
});

let harness: ReturnType<typeof createHarness>;
beforeEach(() => {
  harness = createHarness();
});
afterEach(cleanup);

const open = async () => {
  harness.renderWorkspace(as);
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Profiles' }));
};

const saved = async (filePath: string) => {
  await screen.findByText(/All changes saved/);
  return harness.savedFile(as, filePath);
};

describe('client profiles editor', () => {
  test('adds a section saved under a name from its title; existing names stay', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: '+ Add a section' }));
    fireEvent.change(screen.getByDisplayValue('New section'), { target: { value: 'Safety plan' } });

    const sections = await saved('profileForms/Sections.json');
    expect(sections.map((section: { name: string }) => section.name)).toEqual([
      'summary',
      'recommendedApproach',
      'details',
      'safetyPlan',
    ]);
    expect(sections[3]).toMatchObject({ label: 'Safety plan', type: 'textarea', isPII: true });
    // Existing sections can't be removed by helpline staff
    expect(screen.queryByRole('button', { name: 'Remove Summary' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Remove Safety plan' })).toBeTruthy();
  });

  test('changes how long a blocking option lasts, in days', async () => {
    await open();
    const [first] = screen.getAllByRole('spinbutton', { name: /How long/ });
    // AS's first option is 24 hours, shown as 1 day
    expect((first as HTMLInputElement).value).toBe('1');
    fireEvent.change(first, { target: { value: '3' } });

    const durations = await saved('profileForms/FlagDurations.json');
    expect(durations[0]).toEqual({ flag: 'blocked', label: 'Short Term Block (24 Hours)', durationInHours: '72' });
    expect(within(screen.getByRole('list', { name: 'Status options' })).getAllByRole('listitem')).toHaveLength(2);
  });

  test('two options with the same length need fixing', async () => {
    await open();
    const [, second] = screen.getAllByRole('spinbutton', { name: /How long/ });
    fireEvent.change(screen.getAllByRole('combobox', { name: /Unit for/ })[1], { target: { value: 'hours' } });
    fireEvent.change(second, { target: { value: '24' } });
    expect(
      await screen.findByText(/two “blocked” options last 24 hours; each needs a different duration/),
    ).toBeTruthy();
  });
});

describe('profile helpers', () => {
  test('durations are shown in the largest exact unit, with an approximation for long ones', () => {
    expect(splitDuration(24)).toEqual({ amount: 1, unit: 'days' });
    expect(splitDuration(168)).toEqual({ amount: 1, unit: 'weeks' });
    expect(splitDuration(43848)).toEqual({ amount: 261, unit: 'weeks' });
    expect(splitDuration(720)).toEqual({ amount: 30, unit: 'days' });
    expect(approximateDuration(43848)).toBe('about 5 years');
    expect(approximateDuration(24)).toBeUndefined();
  });

  test('profiles in the repo today only produce warnings', async () => {
    for (const { code, versions } of await listHelplines(formDefinitionsDir)) {
      const { files } = await loadDefinitionFiles(formDefinitionsDir, code, versions[0]);
      validateProfiles(files, files).forEach((issue) =>
        expect(issue.severity, `${code}: ${issue.message}`).toBe('warning'),
      );
    }
  });
});
