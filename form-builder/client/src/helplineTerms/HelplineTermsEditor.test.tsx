/** @jest-environment ./jest/jsdomEnvironment.cjs */
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
import { afterEach, beforeAll, describe, expect, test } from '@jest/globals';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, loadDefinitionFiles } from '@tech-matters/form-builder-server/definitionsApi';
import type { ApiUser } from '@tech-matters/form-builder-shared';

import { aseloStaff, createHarness, formDefinitionsDir, helplinesConfigDir } from '../testing/workspaceHarness';

const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };
const zaStaff: ApiUser = { name: 'Childline person', role: 'helpline-staff', helplines: ['za'] };

let usnm: DefinitionFiles;
let za: DefinitionFiles;
let usch: DefinitionFiles;
beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir);
  za = await loadDefinitionFiles(formDefinitionsDir, 'za', 'v1', helplinesConfigDir);
  usch = await loadDefinitionFiles(formDefinitionsDir, 'usch', 'v1', helplinesConfigDir);
});
afterEach(cleanup);

const openTerms = async (definitions: DefinitionFiles, user: ApiUser) => {
  const harness = createHarness();
  harness.renderWorkspace(definitions, { user });
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Helpline terms' }));
  await waitFor(() => expect(screen.queryByText('Loading Aselo’s text…')).toBeNull());
  return harness;
};

const card = (question: RegExp) => screen.getByRole('region', { name: question });

describe('helpline terms', () => {
  test('helpline staff choose their words, and Aselo’s text follows them', async () => {
    const harness = await openTerms(za, zaStaff);
    const child = card(/person your helpline supports/);
    fireEvent.click(within(child).getByRole('button', { name: 'young person' }));
    // How counselors will see it
    expect(within(child).getByText('Young person calling about self')).toBeTruthy();
    expect(within(child).getByText('was “Child calling about self”')).toBeTruthy();

    await screen.findByText(/All changes saved/);
    const saved = await harness.savedFile(za, 'customStrings/Substitutions.json');
    expect(saved.en['CallType-child']).toBe('Young person calling about self');
    expect(saved.en['ContactDetails-GeneralDetails-ChildHearAboutUs']).toBe('How did the young person hear about us?');
    expect((await harness.savedFile(za, 'customStrings/HelplineTerms.json')).terms.child).toEqual({
      singular: 'young person',
      plural: 'young people',
    });
    // The builder's own tab name follows it
    expect(screen.getByRole('button', { name: 'Young person information' })).toBeTruthy();
  });

  test('something else: the plural follows what’s typed', async () => {
    const harness = await openTerms(za, zaStaff);
    const caseCard = card(/call a case\?/);
    fireEvent.click(within(caseCard).getByRole('button', { name: 'Something else' }));
    fireEvent.change(within(caseCard).getByRole('textbox', { name: 'One' }), { target: { value: 'inquiry' } });
    expect((within(caseCard).getByRole('textbox', { name: 'Several' }) as HTMLInputElement).value).toBe('inquiries');
    expect(within(caseCard).getByText('Search again for an inquiry')).toBeTruthy();
    await screen.findByText(/All changes saved/);
    expect((await harness.savedFile(za, 'customStrings/Substitutions.json')).en['BottomBar-AddContactToNewCase']).toBe(
      'Add to Inquiry',
    );

    // Back to Aselo's word: nothing of the terms is left
    fireEvent.click(within(caseCard).getByRole('button', { name: /^case/ }));
    // Back as it was, so the draft has nothing to save for it
    await waitFor(async () => expect(await harness.savedFile(za, 'customStrings/Substitutions.json')).toBeUndefined());
    // A file it didn't have isn't left behind
    expect(await harness.savedFile(za, 'customStrings/HelplineTerms.json')).toBeUndefined();
  });

  test('the words a helpline already uses are offered, and strings written by hand are kept', async () => {
    const harness = await openTerms(usnm, usnmStaff);
    const offer = screen.getByText('Your helpline’s text in Aselo already uses these words:').closest('div')!;
    // USNM says "help seeker" for both the child and the caller
    expect(within(offer).getAllByText('help seeker')).toHaveLength(2);
    expect(within(offer).getByText('connection')).toBeTruthy();
    fireEvent.click(within(offer).getByRole('button', { name: 'Use these words' }));
    await screen.findByText(/All changes saved/);
    const saved = await harness.savedFile(usnm, 'customStrings/Substitutions.json');
    // Written by hand: kept
    const original = usnm.files['customStrings/Substitutions.json'] as Record<string, Record<string, string>>;
    expect(saved.en['CallType-child']).toBe(original.en['CallType-child']);
    // Helpline staff aren't offered to replace them
    expect(screen.queryByRole('button', { name: /from the terms too/ })).toBeNull();
    expect(card(/call each call/).textContent).toMatch(/keep their own wording/);
  });

  test('Aselo staff can have the strings written by hand made from the terms too', async () => {
    const harness = await openTerms(usnm, aseloStaff);
    fireEvent.click(screen.getByRole('button', { name: 'Use these words' }));
    const child = card(/person your helpline supports/);
    fireEvent.click(within(child).getByRole('button', { name: /from the terms too/ }));
    await screen.findByText(/All changes saved/);
    expect((await harness.savedFile(usnm, 'customStrings/Substitutions.json')).en['CallType-child']).toBe(
      'Help seeker calling about self',
    );
  });

  test('Aselo staff see where Aselo’s words still appear: Studio flow texts and chatbots', async () => {
    await openTerms(usch, aseloStaff);
    // Nothing to look for until a word changes
    expect(screen.queryByRole('region', { name: /Where else these words appear/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    const child = card(/person your helpline supports/);
    fireEvent.click(within(child).getByRole('button', { name: 'young person' }));
    const elsewhere = screen.getByRole('region', { name: /Where else these words appear/ });
    expect(within(elsewhere).getByText(/These still say “child”, “children”/)).toBeTruthy();
    fireEvent.click(within(elsewhere).getByRole('button', { name: 'Look in Studio flows and chatbots' }));
    await within(elsewhere).findByText('twilio-iac/helplines/usch/production.hcl');
    expect(within(elsewhere).getByRole('heading', { name: /Flow texts and settings/ })).toBeTruthy();
    expect(within(elsewhere).getAllByText('Child').length).toBeGreaterThan(0);
  });

  test('helpline staff don’t see it', async () => {
    await openTerms(za, zaStaff);
    fireEvent.click(within(card(/person your helpline supports/)).getByRole('button', { name: 'young person' }));
    expect(screen.queryByRole('region', { name: /Where else these words appear/ })).toBeNull();
  });
});
