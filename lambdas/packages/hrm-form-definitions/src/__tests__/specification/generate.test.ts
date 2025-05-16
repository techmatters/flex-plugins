/**
 * Copyright (C) 2021-2023 Technology Matters
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

import { generateDefaultForm, generateDefaultItem } from '../../specification';
import { FormInputType } from '../../formDefinition';

describe('generateDefaultItem', () => {
  test('Definition specification specifies a default - returns default', () => {
    const generated = generateDefaultItem({ default: 'Hi', required: false }, 'Bye');
    expect(generated).toBe('Hi');
  });
  test('Definition specification specifies no default - returns fallback', () => {
    const generated = generateDefaultItem({ required: true }, 'Bye');
    expect(generated).toBe('Bye');
  });
});

describe('generateDefaultForm', () => {
  test('Empty items map - returns empty array', () => {
    const generated = generateDefaultForm({ items: {} });
    expect(generated).toHaveLength(0);
  });
  test('Item with default specified in items map - returns default in the array', () => {
    const itemDefault = { type: FormInputType.Input, name: 'myItemName', label: 'My Item' };
    const generated = generateDefaultForm({
      items: { myItem: { required: false, default: itemDefault } },
    });
    expect(generated).toStrictEqual([itemDefault]);
  });
  test('Required item with no default specified in items map - returns fallback input with property name as name & label in the array', () => {
    const generated = generateDefaultForm({
      items: { myItem: { required: true } },
    });
    expect(generated).toHaveLength(1);
    expect(generated).toContainEqual({
      type: FormInputType.Input,
      name: 'myItem',
      label: 'myItem',
    });
  });
  test('Non required item with no default specified in items map - does not add anything to returned array', () => {
    const generated = generateDefaultForm({
      items: { myItem: { required: false } },
    });
    expect(generated).toHaveLength(0);
  });
  describe('Ordering', () => {
    const itemDefault1 = { type: FormInputType.Input, name: 'myItemName1', label: 'My Item 1' };
    const itemDefault2 = { type: FormInputType.Input, name: 'myItemName2', label: 'My Item 2' };
    const itemDefault3 = { type: FormInputType.Input, name: 'myItemName3', label: 'My Item 3' };
    const itemDefault4 = { type: FormInputType.Input, name: 'myItemName3', label: 'My Item 4' };

    test('Multiple items without explicit ordering - adds them to array in declaration order', () => {
      const generated = generateDefaultForm({
        items: {
          myItem3: { required: false, default: itemDefault3 },
          myItem0: { required: false },
          myItem1: { required: true, default: itemDefault1 },
          myItem5: { required: true },
          myItem4: { required: true, default: itemDefault4 },
          myItem2: { required: false, default: itemDefault2 },
        },
      });
      expect(generated).toStrictEqual([
        itemDefault3,
        itemDefault1,
        {
          type: FormInputType.Input,
          name: 'myItem5',
          label: 'myItem5',
        },
        itemDefault4,
        itemDefault2,
      ]);
    });

    test('Multiple items with explicit ordering - adds them to array in order', () => {
      const generated = generateDefaultForm({
        items: {
          myItem3: { required: false, default: itemDefault3, order: 3 },
          myItem0: { required: false },
          myItem1: { required: true, default: itemDefault1, order: 1 },
          myItem5: { required: true, order: 5 },
          myItem4: { required: true, default: itemDefault4, order: 4 },
          myItem2: { required: false, default: itemDefault2, order: 2 },
        },
      });
      expect(generated).toStrictEqual([
        itemDefault1,
        itemDefault2,
        itemDefault3,
        itemDefault4,
        {
          type: FormInputType.Input,
          name: 'myItem5',
          label: 'myItem5',
        },
      ]);
    });

    test('Multiple items with partial explicit ordering - adds explicitly ordered items first, then the rest in declaration order', () => {
      const generated = generateDefaultForm({
        items: {
          myItem3: { required: false, default: itemDefault3 },
          myItem0: { required: false },
          myItem1: { required: true, default: itemDefault1, order: 1 },
          myItem5: { required: true, order: 5 },
          myItem4: { required: true, default: itemDefault4, order: 4 },
          myItem2: { required: false, default: itemDefault2 },
        },
      });
      expect(generated).toStrictEqual([
        itemDefault1,
        itemDefault4,
        {
          type: FormInputType.Input,
          name: 'myItem5',
          label: 'myItem5',
        },
        itemDefault3,
        itemDefault2,
      ]);
    });
  });
});
