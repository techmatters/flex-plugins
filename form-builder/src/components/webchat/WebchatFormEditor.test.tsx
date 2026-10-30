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
 * The webchat form editor, driven through the workspace with CA's (translated, two
 * languages) and AS's (text in the form) real definitions and webchat translations.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, loadDefinitionFiles } from '../../../server/definitionsApi';
import {
  createHarness,
  formDefinitionsDir,
  helplinesConfigDir,
  webchatConfigDir,
} from '../../testing/workspaceHarness';
import { baseWebchatStrings, PRE_ENGAGEMENT_FILE } from '../../webchat';
import { WebchatPreview } from './WebchatPreview';

let ca: DefinitionFiles;
let as: DefinitionFiles;
beforeAll(async () => {
  ca = await loadDefinitionFiles(formDefinitionsDir, 'ca', 'v1', helplinesConfigDir, webchatConfigDir);
  as = await loadDefinitionFiles(formDefinitionsDir, 'as', 'v1', helplinesConfigDir, webchatConfigDir);
});

let harness: ReturnType<typeof createHarness>;
beforeEach(() => {
  harness = createHarness();
});
afterEach(cleanup);

const openWebchat = async (definitions: DefinitionFiles) => {
  harness.renderWorkspace(definitions);
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Webchat form' }));
};

const savedDraft = async (definitions: DefinitionFiles, filePath: string) => {
  await screen.findByText(/All changes saved/);
  return harness.savedFile(definitions, filePath);
};

const preview = () => screen.getByLabelText('Webchat preview');

describe('webchat form editor', () => {
  test('edits a translated question in French; the form keeps its translation key', async () => {
    await openWebchat(ca);
    expect(within(preview()).getByText(/Nickname \(please do not share your real name\)/)).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'fr-CA' }));
    fireEvent.click(screen.getByRole('button', { name: /^Pseudonyme/ }));
    fireEvent.change(screen.getByDisplayValue(/^Pseudonyme/), { target: { value: 'Ton pseudo' } });

    expect((await savedDraft(ca, 'webchat-app/translations/fr-CA.json')).LabelNickname).toBe('Ton pseudo');
    expect(await harness.savedFile(ca, PRE_ENGAGEMENT_FILE)).toBeUndefined();
    expect(within(preview()).getByText(/Ton pseudo/)).toBeTruthy();
  });

  test('edits the introduction for one language, with a note for the reviewer', async () => {
    await openWebchat(ca);
    fireEvent.click(screen.getByRole('tab', { name: 'fr-CA' }));
    fireEvent.change(screen.getByRole('textbox', { name: /^Introduction/ }), {
      target: { value: 'Bienvenue!' },
    });
    expect((await savedDraft(ca, 'webchat-app/translations/fr-CA.json'))['PreEngagementPhase-Form-Description']).toBe(
      'Bienvenue!',
    );
    expect(within(preview()).getByText('Bienvenue!')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Review & submit' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).getByText('“Introduction” (fr-CA): Bienvenue!')).toBeTruthy();
    expect(within(dialog).getByText(/the webchat needs to be redeployed/)).toBeTruthy();
    expect(within(dialog).getByText('aselo-webchat-react-app/configSrc/ca/translations/fr-CA.json')).toBeTruthy();
  });

  test('adds a question, which shows in the webchat preview', async () => {
    await openWebchat(as);
    fireEvent.click(screen.getByRole('button', { name: '+ Add a question' }));
    fireEvent.click(screen.getByRole('button', { name: /^Short text/ }));
    fireEvent.change(screen.getByDisplayValue('New question'), { target: { value: 'Preferred name' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Visitors must answer this' }));

    const saved = await savedDraft(as, PRE_ENGAGEMENT_FILE);
    expect(saved.fields.at(-1)).toEqual({
      type: 'input',
      name: 'preferredName',
      label: 'Preferred name',
      required: true,
    });
    expect(within(preview()).getByLabelText('Preferred name *')).toBeTruthy();
  });

  test('says what an existing question is used for before removing it', async () => {
    await openWebchat(as);
    fireEvent.click(screen.getByRole('button', { name: /^Province/ }));
    expect(screen.getByText('The “District” dropdown depends on it')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Edit answers' })).toBeTruthy();
  });
});

describe('filling in the contact form', () => {
  test('shows and changes the contact form fields a question fills in', async () => {
    await openWebchat(as);
    fireEvent.click(screen.getByRole('button', { name: /^Nickname/ }));
    expect(screen.getByText(/Nothing: counselors don't get this answer filled in/)).toBeTruthy();

    const firstName = (as.files['tabbedForms/ChildInformationTab.json'] as { name: string; label: string }[]).find(
      (item) => item.name === 'firstName',
    )!;
    fireEvent.change(screen.getByRole('combobox', { name: 'Fill in another contact form field' }), {
      target: { value: 'ChildInformationTab.firstName' },
    });
    expect((await savedDraft(as, 'PrepopulateMappings.json')).preEngagement.friendlyName).toBe(
      'ChildInformationTab.firstName',
    );
    expect(screen.getByText(`Child information: ${firstName.label}`)).toBeTruthy();
  });
});

describe('webchat preview', () => {
  test('starts the chat only once required questions are answered, like the webchat', () => {
    render(
      <WebchatPreview
        strings={baseWebchatStrings('en-US')}
        form={{
          fields: [
            {
              type: 'checkbox',
              name: 'terms',
              label: 'I accept the <a href="https://example.org">terms</a>',
              required: { value: true, message: 'You need to accept the terms.' },
            },
          ],
        }}
      />,
    );
    const start = screen.getByRole('button', { name: 'Start chat' }) as HTMLButtonElement;
    expect(start.disabled).toBe(true);
    expect(screen.getByRole('link', { name: 'terms' }).getAttribute('href')).toBe('https://example.org');

    const terms = screen.getByRole('checkbox');
    fireEvent.click(terms);
    expect(start.disabled).toBe(false);
    fireEvent.click(terms);
    expect(screen.getByText('You need to accept the terms.')).toBeTruthy();
  });
});
