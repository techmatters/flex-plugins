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

const openFeatures = async (harness: ReturnType<typeof createHarness>, staff: boolean) => {
  harness.renderWorkspace(usnm, staff ? { user: aseloStaff } : {});
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Features' }));
};

describe('helpline features', () => {
  test('Aselo staff switch a feature off, and the review says to apply the service configuration', async () => {
    const harness = createHarness();
    await openFeatures(harness, true);
    fireEvent.click(screen.getByRole('switch', { name: /Client profiles/ }));
    await screen.findByText(/All changes saved/);
    // Written into the service configuration (USNM doesn't set it, so in common.json)
    const common = await harness.savedFile(usnm, 'service-configuration/common.json');
    expect(common.attributes.enableClientProfiles).toBe(false);
    expect(common.attributes.feature_flags.enable_client_profiles).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Review & apply' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).getByText('Client profiles: switched off')).toBeTruthy();
    expect(within(dialog).getByText(/make service-config-apply with HL=usnm/)).toBeTruthy();
  });

  test('Aselo staff see which permission rules decide what counselors can do with cases', async () => {
    await openFeatures(createHarness(), true);
    expect(screen.getByText(/permission rules \(“usnm”\)/)).toBeTruthy();
  });

  test('helpline staff don’t see helpline features at all', async () => {
    createHarness().renderWorkspace(usnm);
    await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Features' })).toBeNull();
  });
});
