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
 * Renders the editor with real helpline definitions and drives it like a user would, with
 * drafts saved through the real API code (kept in memory).
 * Drag and drop isn't simulated here (jsdom has no layout); the column logic it relies on is
 * covered by applyColumnSplit's unit tests.
 */
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, loadDefinitionFiles } from '../../server/definitionsApi';
import {
  aseloStaff,
  createHarness,
  formDefinitionsDir,
  helplinesConfigDir,
} from '../testing/workspaceHarness';

let usnm: DefinitionFiles;
let demo: DefinitionFiles;
const CALLER_TAB = 'tabbedForms/CallerInformationTab.json';

beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir);
  demo = await loadDefinitionFiles(formDefinitionsDir, 'as', 'v1', helplinesConfigDir);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const fieldCard = (label: string) =>
  screen.getByRole('button', { name: `${label}. Click to edit, or drag to move.` });

const findFieldCard = (label: string) =>
  screen.findByRole('button', { name: `${label}. Click to edit, or drag to move.` });

const renameRelationship = async (newLabel: string) => {
  fireEvent.click(await findFieldCard('Relationship to Help Seeker'));
  fireEvent.change(screen.getByDisplayValue('Relationship to Help Seeker'), {
    target: { value: newLabel },
  });
};

describe('HelplineWorkspace', () => {
  test('editing a question, adding a field, saving and reviewing the changes', async () => {
    const { renderWorkspace, savedFile } = createHarness();
    renderWorkspace(usnm);
    expect(await screen.findByText('No changes yet')).toBeTruthy();

    await renameRelationship('Relationship to the person seeking help');
    expect(within(fieldCard('Relationship to the person seeking help')).getByText('Edited')).toBeTruthy();

    // Add a new short text field and name it
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add a field' })[0]);
    fireEvent.click(screen.getByRole('button', { name: /^Short text/ }));
    expect(screen.getByRole('heading', { name: 'New field' })).toBeTruthy();
    fireEvent.change(screen.getByDisplayValue('New question'), {
      target: { value: 'Preferred language' },
    });
    expect(within(fieldCard('Preferred language')).getByText('New')).toBeTruthy();

    // The draft is saved on the server
    await waitFor(async () => {
      const saved = await savedFile(usnm, CALLER_TAB);
      expect(saved?.map((item: { name: string }) => item.name)).toContain('preferredLanguage');
    });
    // (adding a field also moves the column split in LayoutDefinitions.json)
    expect(await screen.findByText(/Draft: 2 files changed · All changes saved/)).toBeTruthy();

    // Review lists both changes in plain language
    fireEvent.click(screen.getByRole('button', { name: 'Review & submit' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).getByText('Preferred language (preferredLanguage)')).toBeTruthy();
    expect(
      within(dialog).getByText('Relationship to the person seeking help (relationshipToHelpSeeker)'),
    ).toBeTruthy();
  });

  test('a field with no question blocks submitting until it is fixed', async () => {
    const { renderWorkspace } = createHarness();
    renderWorkspace(usnm);
    await renameRelationship('');
    expect(screen.getAllByText(/has no label/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Review & submit' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).getByText('Fix these first')).toBeTruthy();
    expect(
      (within(dialog).getByRole('button', { name: 'Submit for review' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  test('helpline staff submit for review, and Aselo is notified', async () => {
    const { renderWorkspace, context } = createHarness();
    renderWorkspace(usnm);
    await renameRelationship('Relationship');
    await screen.findByText(/All changes saved/);

    fireEvent.click(screen.getByRole('button', { name: 'Review & submit' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).queryByRole('button', { name: 'Apply' })).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit for review' }));

    expect(await within(dialog).findByText(/Submitted\. The Aselo team has been told/)).toBeTruthy();
    expect(context.notifier.draftSubmitted).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Submitted for review by Helpline person/)).toBeTruthy();
  });

  test('Aselo staff apply, which uses up the draft', async () => {
    const { renderWorkspace, context, store } = createHarness();
    renderWorkspace(usnm, { user: aseloStaff });
    await renameRelationship('Relationship');
    await screen.findByText(/All changes saved/);

    fireEvent.click(screen.getByRole('button', { name: 'Review & apply' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    const result = await screen.findByRole('dialog', { name: 'Changes applied' });
    expect(within(result).getByText(`lambdas/packages/hrm-form-definitions/form-definitions/usnm/v1/${CALLER_TAB}`)).toBeTruthy();
    expect(context.applier!.apply).toHaveBeenCalledTimes(1);
    expect(await store.get('usnm', 'v1')).toBeUndefined();
  });

  test('without Apply in the builder, Aselo staff download the changes and open the PR themselves', async () => {
    const { renderWorkspace } = createHarness();
    renderWorkspace(usnm, { user: aseloStaff, applyInBuilder: false });
    await renameRelationship('Relationship');
    await screen.findByText(/All changes saved/);

    fireEvent.click(screen.getByRole('button', { name: 'Review & apply' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).queryByRole('button', { name: 'Apply' })).toBeNull();
    expect(within(dialog).getByRole('button', { name: 'Download as zip' })).toBeTruthy();
    expect(within(dialog).getByText(/open a PR .*Once it is merged, discard this draft/)).toBeTruthy();
  });

  test('restores the saved draft when the helpline is opened again', async () => {
    const { renderWorkspace } = createHarness();
    const { unmount } = renderWorkspace(usnm);
    await renameRelationship('Relationship');
    await screen.findByText(/All changes saved/);
    unmount();

    renderWorkspace(usnm);
    expect(await findFieldCard('Relationship')).toBeTruthy();
    expect(screen.getByText(/Last change by Helpline person/)).toBeTruthy();
  });

  test('stops saving, and asks to reload, when someone else changed the draft', async () => {
    const { renderWorkspace } = createHarness();
    const onReload = vi.fn();
    renderWorkspace(usnm, { onReload });
    await screen.findByText('No changes yet');

    // Someone else saves the same helpline's draft first
    const other = renderWorkspace(usnm, { user: aseloStaff });
    fireEvent.click(
      (await within(other.container).findAllByRole('button', { name: /^Relationship to Help Seeker\./ }))[0],
    );
    fireEvent.change(within(other.container).getByDisplayValue('Relationship to Help Seeker'), {
      target: { value: 'Changed by Aselo' },
    });
    await within(other.container).findByText(/All changes saved/);
    other.unmount();

    await renameRelationship('Changed by helpline');
    expect(await screen.findByText(/Aselo person changed this draft/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(onReload).toHaveBeenCalled();
  });

  test('discarding brings back the original form and deletes the draft', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { renderWorkspace, store } = createHarness();
    renderWorkspace(usnm);
    await renameRelationship('Relationship');
    await screen.findByText(/All changes saved/);

    fireEvent.click(screen.getByRole('button', { name: 'Discard draft' }));
    expect(await findFieldCard('Relationship to Help Seeker')).toBeTruthy();
    expect(await screen.findByText('No changes yet')).toBeTruthy();
    expect(await store.get('usnm', 'v1')).toBeUndefined();
  });

  test('fields Aselo relies on cannot be removed', async () => {
    const { renderWorkspace } = createHarness();
    renderWorkspace(demo);
    fireEvent.click(await screen.findByRole('button', { name: 'Case information' }));
    const summaryLabel = (demo.files['tabbedForms/CaseInformationTab.json'] as { name: string; label: string }[])
      .find((item) => item.name === 'callSummary')!.label;
    fireEvent.click(await findFieldCard(summaryLabel));
    expect(
      (screen.getByRole('button', { name: 'Remove this field' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  test('removing an existing field asks for confirmation first', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { renderWorkspace } = createHarness();
    renderWorkspace(usnm);
    fireEvent.click(await findFieldCard('Relationship to Help Seeker'));
    fireEvent.click(screen.getByRole('button', { name: 'Remove this field' }));
    expect(confirm).toHaveBeenCalled();
    expect(fieldCard('Relationship to Help Seeker')).toBeTruthy();

    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Remove this field' }));
    expect(screen.queryByRole('button', { name: /^Relationship to Help Seeker\./ })).toBeNull();
  });
});

describe('help boxes (field descriptions)', () => {
  const childTab = 'tabbedForms/ChildInformationTab.json';
  const openChildField = async (label: string) => {
    const harness = createHarness();
    harness.renderWorkspace(demo);
    fireEvent.click(await screen.findByRole('button', { name: 'Child information' }));
    fireEvent.click(await findFieldCard(label));
    return harness;
  };

  test('a help box written in the form is edited in the form, and removed when emptied', async () => {
    const { savedFile } = await openChildField('Last Name');
    expect(await screen.findByDisplayValue('Last Name description title in two lines')).toBeTruthy();
    await waitFor(() =>
      expect((screen.getByRole('textbox', { name: 'Help box text' }) as HTMLTextAreaElement).disabled).toBe(false),
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Help box text' }), {
      target: { value: 'Ask only if they want to share it.' },
    });
    await screen.findByText(/All changes saved/);
    const lastName = (await savedFile(demo, childTab)).find((item: { name: string }) => item.name === 'lastName');
    expect(lastName.description).toEqual({
      title: 'Last Name description title in two lines',
      content: 'Ask only if they want to share it.',
    });

    fireEvent.change(screen.getByRole('textbox', { name: 'Help box title' }), { target: { value: '' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Help box text' }), { target: { value: '' } });
    await screen.findByText(/All changes saved/);
    await waitFor(async () => {
      const saved = (await savedFile(demo, childTab)).find((item: { name: string }) => item.name === 'lastName');
      expect('description' in saved).toBe(false);
    });
  });

  test('a translated help box is shown in the helpline’s language and edited in its own wording', async () => {
    const { savedFile } = await openChildField('First Name');
    // AS uses translation keys here; the text comes from the plugin's translations
    expect(await screen.findByDisplayValue('First Name description')).toBeTruthy();
    fireEvent.change(screen.getByRole('textbox', { name: 'Help box title' }), {
      target: { value: 'About first names' },
    });
    await screen.findByText(/All changes saved/);
    expect((await savedFile(demo, 'customStrings/Substitutions.json')).en['AsV1-ChildInformationTab-FirstName-Title']).toBe(
      'About first names',
    );
    // The form keeps its key
    expect(await savedFile(demo, childTab)).toBeUndefined();
  });
});
