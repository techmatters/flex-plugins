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
 * Renders the editor with real helpline definitions and drives it like a user would.
 * Drag and drop isn't simulated here (jsdom has no layout); the column logic it relies on is
 * covered by applyColumnSplit's unit tests.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DefinitionFiles, loadDefinitionFiles } from '../../server/definitionsApi';
import { HelplineWorkspace } from './HelplineWorkspace';

const formDefinitionsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../lambdas/packages/hrm-form-definitions/form-definitions',
);

let usnm: DefinitionFiles;
let demo: DefinitionFiles;

beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1');
  demo = await loadDefinitionFiles(formDefinitionsDir, 'as', 'v1');
});

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const fieldCard = (label: string) =>
  screen.getByRole('button', { name: `${label}. Click to edit, or drag to move.` });

describe('HelplineWorkspace', () => {
  test('editing a question, adding a field and reviewing the changes', () => {
    render(<HelplineWorkspace definitions={usnm} staffMode={false} />);
    expect(screen.getByText('No changes yet')).toBeTruthy();

    // Edit an existing question
    fireEvent.click(fieldCard('Relationship to Help Seeker'));
    fireEvent.change(screen.getByDisplayValue('Relationship to Help Seeker'), {
      target: { value: 'Relationship to the person seeking help' },
    });
    expect(within(fieldCard('Relationship to the person seeking help')).getByText('Edited')).toBeTruthy();
    expect(screen.getByText('Draft: 1 file changed, saved in this browser')).toBeTruthy();

    // Add a new short text field and name it
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add a field' })[0]);
    fireEvent.click(screen.getByRole('button', { name: /^Short text/ }));
    expect(screen.getByRole('heading', { name: 'New field' })).toBeTruthy();
    fireEvent.change(screen.getByDisplayValue('New question'), {
      target: { value: 'Preferred language' },
    });
    expect(within(fieldCard('Preferred language')).getByText('New')).toBeTruthy();

    // The draft is kept in this browser
    expect(window.localStorage.getItem('form-builder:draft:usnm:v1')).toContain('preferredLanguage');

    // Review lists both changes in plain language
    fireEvent.click(screen.getByRole('button', { name: 'Review & export' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).getByText('Preferred language (preferredLanguage)')).toBeTruthy();
    expect(
      within(dialog).getByText('Relationship to the person seeking help (relationshipToHelpSeeker)'),
    ).toBeTruthy();
    expect(
      (within(dialog).getByRole('button', { name: 'Download changes' }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  test('a field with no question blocks export until it is fixed', () => {
    render(<HelplineWorkspace definitions={usnm} staffMode={false} />);
    fireEvent.click(fieldCard('Relationship to Help Seeker'));
    fireEvent.change(screen.getByDisplayValue('Relationship to Help Seeker'), {
      target: { value: '' },
    });
    expect(screen.getAllByText(/has no label/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Review & export' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).getByText('Fix these before exporting')).toBeTruthy();
    expect(
      (within(dialog).getByRole('button', { name: 'Download changes' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  test('restores a saved draft when the helpline is opened again', () => {
    const { unmount } = render(<HelplineWorkspace definitions={usnm} staffMode={false} />);
    fireEvent.click(fieldCard('Relationship to Help Seeker'));
    fireEvent.change(screen.getByDisplayValue('Relationship to Help Seeker'), {
      target: { value: 'Relationship' },
    });
    unmount();

    render(<HelplineWorkspace definitions={usnm} staffMode={false} />);
    expect(screen.getByText(/Your unsaved changes from .* were restored\./)).toBeTruthy();
    expect(fieldCard('Relationship')).toBeTruthy();
  });

  test('warns when the draft is too big to keep in this browser', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    render(<HelplineWorkspace definitions={usnm} staffMode={false} />);
    fireEvent.click(fieldCard('Relationship to Help Seeker'));
    fireEvent.change(screen.getByDisplayValue('Relationship to Help Seeker'), {
      target: { value: 'Relationship' },
    });
    expect(screen.getByText(/too big to keep in this browser/)).toBeTruthy();
    expect(screen.getByText('Draft: 1 file changed')).toBeTruthy();
  });

  test('discarding brings back the original form', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<HelplineWorkspace definitions={usnm} staffMode={false} />);
    fireEvent.click(fieldCard('Relationship to Help Seeker'));
    fireEvent.change(screen.getByDisplayValue('Relationship to Help Seeker'), {
      target: { value: 'Relationship' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Discard all changes' }));
    expect(fieldCard('Relationship to Help Seeker')).toBeTruthy();
    expect(screen.getByText('No changes yet')).toBeTruthy();
    expect(window.localStorage.getItem('form-builder:draft:usnm:v1')).toBeNull();
  });

  test('fields Aselo relies on cannot be removed', () => {
    render(<HelplineWorkspace definitions={demo} staffMode={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Case information' }));
    const summaryLabel = (demo.files['tabbedForms/CaseInformationTab.json'] as { name: string; label: string }[])
      .find((item) => item.name === 'callSummary')!.label;
    fireEvent.click(fieldCard(summaryLabel));
    expect(
      (screen.getByRole('button', { name: 'Remove this field' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  test('removing an existing field asks for confirmation first', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<HelplineWorkspace definitions={usnm} staffMode={false} />);
    fireEvent.click(fieldCard('Relationship to Help Seeker'));
    fireEvent.click(screen.getByRole('button', { name: 'Remove this field' }));
    expect(confirm).toHaveBeenCalled();
    expect(fieldCard('Relationship to Help Seeker')).toBeTruthy();

    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Remove this field' }));
    expect(screen.queryByRole('button', { name: /^Relationship to Help Seeker\./ })).toBeNull();
  });
});
