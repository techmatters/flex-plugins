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

import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, loadDefinitionFiles } from '../../../server/definitionsApi';
import { aseloStaff, createHarness, formDefinitionsDir, helplinesConfigDir } from '../../testing/workspaceHarness';

let usnm: DefinitionFiles;
beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir);
});
afterEach(cleanup);

const openServiceConfig = async () => {
  const harness = createHarness();
  harness.renderWorkspace(usnm, { user: aseloStaff });
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Service configuration' }));
  return harness;
};

const settingRow = (name: string) => screen.getByRole('button', { name }).closest('tr')!;

describe('service configuration', () => {
  test('shows what staging and production get, and which file it comes from', async () => {
    await openServiceConfig();
    const row = settingRow('form_definitions_base_url');
    expect(within(row).getByText(/assets-staging/)).toBeTruthy();
    expect(within(row).getByText(/assets-production/)).toBeTruthy();
    expect(within(row).getByText('Differs')).toBeTruthy();

    // Set by the helpline, overriding Aselo's default, described from the plugin's FeatureFlags.ts
    const cannedResponses = settingRow('enable_canned_responses');
    expect(within(cannedResponses).getAllByText('common')).toHaveLength(2);
    expect(within(cannedResponses).getByText('Enables Canned Responses')).toBeTruthy();

    // Aselo defaults are only listed when asked for
    expect(screen.queryByRole('button', { name: 'seenOnboarding' })).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Which settings' }), { target: { value: 'all' } });
    expect(within(settingRow('seenOnboarding')).getAllByText('Aselo default')).toHaveLength(2);
  });

  test('a setting is changed for one environment, and the review says how to apply it', async () => {
    const harness = await openServiceConfig();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search settings' }), { target: { value: 'system_down' } });
    fireEvent.click(screen.getByRole('button', { name: 'system_down' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'attributes.system_down in staging.json' }), {
      target: { value: 'true' },
    });
    await screen.findByText(/All changes saved/);
    expect((await harness.savedFile(usnm, 'service-configuration/staging.json')).attributes.system_down).toBe(true);
    expect(await harness.savedFile(usnm, 'service-configuration/production.json')).toBeUndefined();
    expect(within(settingRow('system_down')).getByText('Changed')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Review & apply' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).getByText('attributes.system_down: off → on')).toBeTruthy();
    expect(within(dialog).getByText(/service-config-apply with HL=usnm for HL_ENV=staging\./)).toBeTruthy();
  });

  test('adding a setting, and editing a file as JSON', async () => {
    const harness = await openServiceConfig();
    fireEvent.change(screen.getByPlaceholderText('attributes.feature_flags.enable_lex'), {
      target: { value: 'attributes.feature_flags.enable_language_selector' },
    });
    fireEvent.change(screen.getByPlaceholderText('true'), { target: { value: 'true' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await screen.findByText(/All changes saved/);
    expect(
      (await harness.savedFile(usnm, 'service-configuration/common.json')).attributes.feature_flags
        .enable_language_selector,
    ).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Files (JSON)' }));
    fireEvent.click(screen.getByRole('tab', { name: 'production.json' }));
    const editor = screen.getByRole('textbox', { name: 'production.json' });
    fireEvent.change(editor, { target: { value: '{ "attributes": ' } });
    expect(screen.getByText(/Not valid, not saved/)).toBeTruthy();
    fireEvent.change(editor, { target: { value: '{ "attributes": { "system_down": true } }' } });
    await waitFor(async () =>
      expect(await harness.savedFile(usnm, 'service-configuration/production.json')).toEqual({
        attributes: { system_down: true },
      }),
    );
  });

  test('helpline staff don’t see it', async () => {
    createHarness().renderWorkspace(usnm);
    await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Service configuration' })).toBeNull();
  });
});
