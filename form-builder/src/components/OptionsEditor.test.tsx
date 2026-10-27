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

import { useState } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { SelectOption } from '@hrm-form-definitions/formDefinition/types';
import { OptionsEditor, parsePastedAnswers } from './OptionsEditor';

afterEach(cleanup);

describe('pasting answers', () => {
  test('one per line, with or without a saved value', () => {
    expect(parsePastedAnswers('Spanish\n0 | 00\n\nUnder 18 | U18\n')).toEqual([
      { label: 'Spanish', value: 'Spanish' },
      { label: '0', value: '00' },
      { label: 'Under 18', value: 'U18' },
    ]);
  });

  test('all on one line, separated by commas', () => {
    expect(parsePastedAnswers('Yes, No,Maybe | M')).toEqual([
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
      { label: 'Maybe', value: 'M' },
    ]);
  });

  test('two columns from a spreadsheet (text, then saved value)', () => {
    expect(parsePastedAnswers('0\t00\r\n1\t01\r\nOther\t')).toEqual([
      { label: '0', value: '00' },
      { label: '1', value: '01' },
      { label: 'Other', value: 'Other' },
    ]);
  });
});

const Harness = ({ initial, staffMode = false }: { initial: SelectOption[]; staffMode?: boolean }) => {
  const [options, setOptions] = useState(initial);
  return (
    <>
      <OptionsEditor
        options={options}
        originalValues={new Set(initial.map((option) => String(option.value)))}
        staffMode={staffMode}
        onChange={setOptions}
      />
      <output data-testid="options">{JSON.stringify(options)}</output>
    </>
  );
};
const currentOptions = () => JSON.parse(screen.getByTestId('options').textContent!) as SelectOption[];

describe('saved values', () => {
  const ages = [
    { value: '', label: '' },
    { value: '00', label: '0' },
    { value: '01', label: '1' },
  ];

  test('are shown when an answer is saved under something else than its text, and locked for helpline staff', () => {
    render(<Harness initial={ages} />);
    expect(screen.getByText(/it has to be answered/)).toBeTruthy();
    expect(screen.getByText('“00”')).toBeTruthy();
    expect(screen.queryAllByRole('textbox', { name: 'Saved value' })).toHaveLength(0);
  });

  test('Aselo staff can change them', () => {
    render(<Harness initial={ages} staffMode />);
    fireEvent.change(screen.getAllByRole('textbox', { name: 'Saved value' })[0], { target: { value: '0' } });
    expect(currentOptions()[1]).toEqual({ value: '0', label: '0' });
  });

  test('a new answer follows its text until it gets its own saved value', () => {
    render(<Harness initial={[{ value: 'Unknown', label: '' }, { value: 'Yes', label: 'Yes' }]} />);
    expect(screen.getByText(/saved as “Unknown”/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show saved values' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Add an answer' }));
    const answers = screen.getAllByRole('textbox', { name: 'Answer' });
    fireEvent.change(answers[1], { target: { value: 'No' } });
    expect(currentOptions()[2]).toEqual({ value: 'No', label: 'No' });

    const values = screen.getAllByRole('textbox', { name: 'Saved value' });
    fireEvent.change(values[0], { target: { value: 'N' } });
    fireEvent.change(screen.getAllByRole('textbox', { name: 'Answer' })[1], { target: { value: 'Not at all' } });
    expect(currentOptions()[2]).toEqual({ value: 'N', label: 'Not at all' });
  });

  test('pasted answers keep the values they were pasted with', () => {
    render(<Harness initial={[{ value: 'Unknown', label: '' }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Paste several at once' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Answers to add/ }), { target: { value: '0 | 00\n1 | 01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add these answers' }));
    expect(currentOptions()).toEqual([
      { value: 'Unknown', label: '' },
      { value: '00', label: '0' },
      { value: '01', label: '1' },
    ]);
    expect(screen.getAllByRole('textbox', { name: 'Saved value' })).toHaveLength(2);
  });
});
