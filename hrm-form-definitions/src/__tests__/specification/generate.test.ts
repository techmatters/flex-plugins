import { generateDefaultForm, generateDefaultItem } from '../../specification';

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
    const itemDefault = { type: 'input', name: 'myItemName', label: 'My Item' };
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
      type: 'input',
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
    const itemDefault1 = { type: 'input', name: 'myItemName1', label: 'My Item 1' };
    const itemDefault2 = { type: 'input', name: 'myItemName2', label: 'My Item 2' };
    const itemDefault3 = { type: 'input', name: 'myItemName3', label: 'My Item 3' };
    const itemDefault4 = { type: 'input', name: 'myItemName3', label: 'My Item 4' };

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
          type: 'input',
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
          type: 'input',
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
          type: 'input',
          name: 'myItem5',
          label: 'myItem5',
        },
        itemDefault3,
        itemDefault2,
      ]);
    });
  });
});
