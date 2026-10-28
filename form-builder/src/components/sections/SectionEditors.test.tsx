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
 * Call types, canned responses and automatic messages, edited through the workspace with
 * USNM's real definitions.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, loadDefinitionFiles } from '../../../server/definitionsApi';
import { createHarness } from '../../testing/workspaceHarness';
import { validateSections } from '../../sections';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
let usnm: DefinitionFiles;

beforeAll(async () => {
  usnm = await loadDefinitionFiles(
    path.join(repoRoot, 'lambdas/packages/hrm-form-definitions/form-definitions'),
    'usnm',
    'v1',
    path.join(repoRoot, 'twilio-iac/helplines'),
  );
});


let harness: ReturnType<typeof createHarness>;
beforeEach(() => {
  harness = createHarness();
});

// Renders the workspace and waits for the (empty) draft to load
const renderLoaded = async (definitions: DefinitionFiles) => {
  harness.renderWorkspace(definitions);
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
};

// A file as saved in the draft, once the latest change has been saved
const savedDraftFile = async (definitions: DefinitionFiles, filePath: string) => {
  await screen.findByText(/All changes saved/);
  return harness.savedFile(definitions, filePath);
};
afterEach(cleanup);

const savedDraft = (filePath: string) => savedDraftFile(usnm, filePath);

const open = async (navLabel: string) => {
  await renderLoaded(usnm);
  fireEvent.click(screen.getByRole('button', { name: navLabel }));
};

describe('call types', () => {
  test('existing “close without a form” buttons are locked; new ones can be added', async () => {
    await open('Call types');
    expect((screen.getByDisplayValue('Silence') as HTMLInputElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '+ Add a button' }));
    fireEvent.change(screen.getByDisplayValue('New button'), {
      target: { value: 'Abusive contact' },
    });
    expect(await savedDraft('CallTypeButtons.json')).toContainEqual({
      type: 'button',
      name: 'abusiveContact',
      label: 'Abusive contact',
      category: 'non-data',
    });
    // The Aselo preview next to the editor shows the new button
    expect(await screen.findByRole('button', { name: 'Abusive contact' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Review & submit' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).getByText('Added: “Abusive contact”')).toBeTruthy();
  });

  test('turning on “someone calling about another person” adds a caller button', async () => {
    await open('Call types');
    fireEvent.click(screen.getByRole('checkbox', { name: /someone calling about another person/ }));
    expect(await savedDraft('CallTypeButtons.json')).toContainEqual(
      expect.objectContaining({ name: 'caller', category: 'data' }),
    );
  });
});

describe('canned responses', () => {
  // Slow (reads a spreadsheet), so it can pass 5 seconds when the whole suite runs at once
  test('says they are switched off, and adds responses pasted from a spreadsheet', { timeout: 15_000 }, async () => {
    await open('Canned responses');
    expect(screen.getAllByText(/switched off for this helpline/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Paste from a spreadsheet' }));
    fireEvent.change(screen.getByPlaceholderText(/Greeting/), {
      target: { value: 'Safety\tAre you safe right now?\nBreathing\tLet’s take a breath together.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add these responses' }));

    const saved = (await savedDraft('CannedResponses.json')) as { label: string; text: string }[];
    expect(saved.slice(-2)).toEqual([
      { label: 'Safety', text: 'Are you safe right now?' },
      { label: 'Breathing', text: 'Let’s take a breath together.' },
    ]);
    // The preview dropdown offers them
    expect(screen.getByRole('option', { name: 'Safety' })).toBeTruthy();
  });
});

describe('automatic messages', () => {
  test('edits a message for a language and shows it in the conversation preview', async () => {
    await open('Automatic messages');
    fireEvent.change(screen.getByRole('textbox', { name: 'Welcome' }), {
      target: { value: 'Hi, you are now connected with NAMI.' },
    });
    expect((await savedDraft('customStrings/Messages.json')).en.WelcomeMsg).toBe(
      'Hi, you are now connected with NAMI.',
    );
    expect(screen.getAllByText('Hi, you are now connected with NAMI.').length).toBe(2);
  });

  test('emptying a message removes it so Aselo’s default is sent', async () => {
    await open('Automatic messages');
    fireEvent.change(screen.getByRole('textbox', { name: 'Outside opening hours' }), {
      target: { value: '' },
    });
    expect('ClosedOutOfShift' in (await savedDraft('customStrings/Messages.json')).en).toBe(false);
    expect(screen.getByText(/Aselo's default \(shown above\) is sent/)).toBeTruthy();
  });

  test('switches language', async () => {
    await open('Automatic messages');
    fireEvent.click(screen.getByRole('tab', { name: 'es' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Survey thank-you' }), {
      target: { value: '¡Gracias!' },
    });
    expect((await savedDraft('customStrings/postSurveyMessages.json')).es.postSurveyCompleteMessage).toBe(
      '¡Gracias!',
    );
  });
});

describe('validateSections', () => {
  test('two “close without a form” buttons with the same text is an error', async () => {
    const buttons = usnm.files['CallTypeButtons.json'] as { label: string }[];
    const draft = {
      ...usnm.files,
      'CallTypeButtons.json': [...buttons, { ...buttons[1], name: 'another' }],
    };
    expect(validateSections(draft, usnm.files)).toContainEqual(
      expect.objectContaining({ severity: 'error', message: expect.stringContaining('more than one button') }),
    );
  });

  test('problems USNM already had (two canned responses called “Share more”) are only warnings', async () => {
    expect(validateSections(usnm.files, usnm.files).every((found) => found.severity === 'warning')).toBe(
      true,
    );
  });
});
