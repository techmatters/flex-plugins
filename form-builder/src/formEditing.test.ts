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

import { describe, expect, test } from 'vitest';
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import {
  applyColumnSplit,
  changeFieldType,
  createField,
  detectBlankOptionValue,
  getAllowedTypeSwitches,
  isFieldRequired,
  setFieldRequired,
  toFieldName,
  uniqueFieldName,
  updateField,
} from './formEditing';

const field = (json: Record<string, unknown>) => json as unknown as FormItemJsonDefinition;

describe('toFieldName', () => {
  test.each([
    ['Preferred language?', 'preferredLanguage'],
    ['  First   name ', 'firstName'],
    ['ZIP code', 'zipCode'],
    ['¿Cómo nos conociste?', 'comoNosConociste'],
    ['18+ years', 'field18Years'],
    ['???', 'newField'],
  ])('%s -> %s', (label, expected) => {
    expect(toFieldName(label)).toBe(expected);
  });
});

describe('uniqueFieldName', () => {
  test('adds a number when the name is taken', () => {
    expect(uniqueFieldName('age', ['name'])).toBe('age');
    expect(uniqueFieldName('age', ['age', 'age2'])).toBe('age3');
  });
});

describe('required', () => {
  test('uses the conventional error message and removes the key when turned off', () => {
    const required = setFieldRequired(field({ name: 'a', label: 'A', type: 'input' }), true);
    expect(required.required).toEqual({ value: true, message: 'RequiredFieldError' });
    expect(isFieldRequired(required)).toBe(true);
    const optional = setFieldRequired(required, false);
    expect('required' in optional).toBe(false);
  });
});

describe('updateField', () => {
  test('keeps unknown properties and removes ones set to undefined', () => {
    const original = field({ name: 'a', label: 'A', type: 'input', placeholder: 'x', metadata: { k: 1 } });
    const updated = updateField(original, { label: 'B', placeholder: undefined });
    expect(updated).toEqual({ name: 'a', label: 'B', type: 'input', metadata: { k: 1 } });
    expect(original.label).toBe('A');
  });
});

describe('createField', () => {
  test('creates a dropdown with the helpline’s blank option and a unique name', () => {
    const created = createField('select', ['newQuestion'], 'Unknown');
    expect(created).toEqual({
      name: 'newQuestion2',
      label: 'New question',
      type: 'select',
      isPII: false,
      options: [
        { value: 'Unknown', label: '' },
        { value: 'Option 1', label: 'Option 1' },
      ],
    });
  });
});

describe('changeFieldType', () => {
  test('dropdown to list removes the blank first option, and back adds it', () => {
    const select = createField('select', [], '');
    const list = changeFieldType(select, 'listbox-multiselect', '');
    expect('options' in list && list.options).toEqual([{ value: 'Option 1', label: 'Option 1' }]);
    const backToSelect = changeFieldType(list, 'select', '');
    expect('options' in backToSelect && backToSelect.options).toHaveLength(2);
  });

  test('drops textarea-only properties when switching to short text', () => {
    const textarea = field({ name: 'notes', label: 'Notes', type: 'textarea', rows: 10 });
    expect(changeFieldType(textarea, 'input', '')).toEqual({
      name: 'notes',
      label: 'Notes',
      type: 'input',
    });
  });
});

describe('getAllowedTypeSwitches', () => {
  const select = field({ name: 's', label: 'S', type: 'select', options: [] });
  const input = field({ name: 'i', label: 'I', type: 'input' });

  test('existing fields only allow the safe short/long text switch for helpline staff', () => {
    expect(getAllowedTypeSwitches(select, { isNew: false, staffMode: false })).toEqual(['select']);
    expect(getAllowedTypeSwitches(input, { isNew: false, staffMode: false })).toEqual([
      'input',
      'textarea',
    ]);
  });

  test('new fields and staff can switch within the group', () => {
    expect(getAllowedTypeSwitches(select, { isNew: true, staffMode: false })).toEqual([
      'select',
      'listbox-multiselect',
    ]);
    expect(getAllowedTypeSwitches(select, { isNew: false, staffMode: true })).toContain(
      'listbox-multiselect',
    );
  });
});

describe('detectBlankOptionValue', () => {
  test('uses the most common blank option value', () => {
    const select = (value: string) =>
      field({ name: 'x', label: 'X', type: 'select', options: [{ value, label: '' }] });
    expect(detectBlankOptionValue([[select('Unknown'), select('Unknown'), select('')]])).toBe(
      'Unknown',
    );
    expect(detectBlankOptionValue([[]])).toBe('');
  });
});

describe('applyColumnSplit', () => {
  const layout = { contact: { childInformation: { splitFormAt: 3 } }, case: { a: 1 } };

  test('always writes the split when the layout already had one', () => {
    expect(applyColumnSplit(layout, ['contact', 'childInformation'], 5, 10, true)).toEqual({
      contact: { childInformation: { splitFormAt: 5 } },
      case: { a: 1 },
    });
  });

  test('leaves the layout untouched when an implicit half split still applies', () => {
    const result = applyColumnSplit(layout, ['contact', 'callerInformation'], 3, 5, false);
    expect(result).toEqual(layout);
  });

  test('writes the split when the columns no longer split in half', () => {
    expect(applyColumnSplit({}, ['contact', 'callerInformation'], 1, 5, false)).toEqual({
      contact: { callerInformation: { splitFormAt: 1 } },
    });
  });

  test('removes a split it added once the columns are back to a half split', () => {
    const withSplit = { contact: { callerInformation: { splitFormAt: 1 } } };
    expect(applyColumnSplit(withSplit, ['contact', 'callerInformation'], 3, 5, false)).toEqual({
      contact: { callerInformation: {} },
    });
  });
});
