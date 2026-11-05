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

import {
  aseloStaff,
  createHarness,
  formDefinitionsDir,
  helplinesConfigDir,
  webchatConfigDir,
} from '../testing/workspaceHarness';

const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };

let usnm: DefinitionFiles;
beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir, webchatConfigDir);
});
afterEach(cleanup);

const openTranslations = async () => {
  const harness = createHarness();
  harness.renderWorkspace(usnm, { user: aseloStaff });
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Translations' }));
  await waitFor(() => expect(screen.queryByText('Loading Aselo’s text…')).toBeNull());
  return harness;
};

const search = (text: string) =>
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search strings' }), { target: { value: text } });
const rowOf = (key: string) => screen.getByRole('button', { name: key }).closest('tr')!;

describe('translations', () => {
  test('only Aselo staff have them', async () => {
    const harness = createHarness();
    harness.renderWorkspace(usnm, { user: usnmStaff });
    await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Translations' })).toBeNull();
  });

  test('every string, with the ones the helpline changed marked', async () => {
    await openTranslations();
    search('CallType-child');
    const row = rowOf('CallType-child');
    // USNM's own text, rather than Aselo's "Child calling about self"
    expect(within(row).getByText('Help Seeker calling about self')).toBeTruthy();
    expect(within(row).getByText('Changed')).toBeTruthy();
    fireEvent.change(screen.getByRole('combobox', { name: 'Which strings' }), { target: { value: 'changed' } });
    search('');
    expect(screen.getByText(/of \d+ strings/).textContent).toMatch(/^1\d\d of/);
  });

  test('changing a string, and going back to Aselo’s text', async () => {
    const harness = await openTranslations();
    search('CaseList-Cases');
    fireEvent.click(screen.getByRole('button', { name: 'CaseList-Cases' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Text for CaseList-Cases (en)' }), {
      target: { value: 'Incident' },
    });
    await screen.findByText(/All changes saved/);
    expect((await harness.savedFile(usnm, 'customStrings/Substitutions.json')).en['CaseList-Cases']).toBe('Incident');

    fireEvent.click(screen.getByRole('button', { name: 'Use Aselo’s text again' }));
    await waitFor(async () =>
      expect('CaseList-Cases' in (await harness.savedFile(usnm, 'customStrings/Substitutions.json')).en).toBe(false),
    );
  });

  test('find & replace, leaving out the strings unticked', async () => {
    const harness = await openTranslations();
    fireEvent.click(screen.getByRole('button', { name: 'Find & replace' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Find' }), { target: { value: 'Help Seeker' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Replace with' }), { target: { value: 'person' } });
    const found = screen.getByText(/^Found in \d+ strings/).textContent!;
    const count = Number(found.match(/\d+/)![0]);
    expect(count).toBeGreaterThan(1);
    // Leave one as it is
    fireEvent.click(screen.getByRole('checkbox', { name: 'CallType-child' }));
    fireEvent.click(screen.getByRole('button', { name: `Replace in ${count - 1} strings` }));
    expect(screen.getByText(`Replaced in ${count - 1} strings.`)).toBeTruthy();
    await screen.findByText(/All changes saved/);
    const saved = (await harness.savedFile(usnm, 'customStrings/Substitutions.json')).en;
    expect(saved['CallType-child']).toBe('Help Seeker calling about self');
    expect(saved['CallType-caller']).toBe('Someone calling about a person');
  });

  test('the webchat’s text, in its own file per locale', async () => {
    const harness = await openTranslations();
    fireEvent.click(screen.getByRole('button', { name: 'Webchat (people contacting you)' }));
    await waitFor(() => expect(screen.getByRole('columnheader', { name: 'Text people see (en-US)' })).toBeTruthy());
    search('OpenWidgetButtonLabel');
    fireEvent.click(screen.getByRole('button', { name: 'EntryPoint-ClosedState-OpenWidgetButtonLabel' }));
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Text for EntryPoint-ClosedState-OpenWidgetButtonLabel (en-US)' }),
      { target: { value: 'Talk to us' } },
    );
    await screen.findByText(/All changes saved/);
    expect(
      (await harness.savedFile(usnm, 'webchat-app/translations/en-US.json'))[
        'EntryPoint-ClosedState-OpenWidgetButtonLabel'
      ],
    ).toBe('Talk to us');
    // USNM's own webchat text is kept
    expect((await harness.savedFile(usnm, 'webchat-app/translations/en-US.json')).Today).toBe('Today');
    expect(await harness.savedFile(usnm, 'customStrings/Substitutions.json')).toBeUndefined();
  });

  test('adding a language', async () => {
    await openTranslations();
    fireEvent.change(screen.getByRole('combobox', { name: 'Add a language' }), { target: { value: 'fr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(screen.getByRole('columnheader', { name: 'Text counselors see (fr)' })).toBeTruthy());
    await waitFor(() => expect(screen.queryByText('Loading Aselo’s text…')).toBeNull());
    search('CaseList-Cases');
    // Aselo's own French
    expect(within(rowOf('CaseList-Cases')).queryByText('English')).toBeNull();
  });
});
