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

/**
 * Pure functions for editing form fields. They never mutate their inputs and only add or
 * remove the properties they own, so anything else on a field is preserved on export.
 */
import type {
  FormInputType,
  FormItemJsonDefinition,
  SelectOption,
} from '@hrm-form-definitions/formDefinition/types';

export type FieldType = `${FormInputType}`;

// Field JSON as an open object, for writing properties the union type doesn't allow directly
type FieldJson = Record<string, unknown>;

const asField = (json: FieldJson) => json as unknown as FormItemJsonDefinition;

export const REQUIRED_FIELD_MESSAGE = 'RequiredFieldError';

export const FIELD_TYPE_INFO: Record<FieldType, { label: string; description: string }> = {
  input: { label: 'Short text', description: 'One line of text, like a name or a city' },
  textarea: { label: 'Long text', description: 'Several lines of text, like notes or a summary' },
  select: { label: 'Dropdown', description: 'Pick one answer from a list' },
  'listbox-multiselect': {
    label: 'Multiple choice list',
    description: 'Tick any number of answers from a list',
  },
  checkbox: { label: 'Checkbox', description: 'A single tick box for yes or no' },
  'mixed-checkbox': {
    label: 'Yes / No / Unknown',
    description: 'A tick box that can also be left as unknown',
  },
  'date-input': { label: 'Date', description: 'A calendar date' },
  'time-input': { label: 'Time', description: 'A time of day' },
  'numeric-input': { label: 'Number', description: 'Numbers only' },
  email: { label: 'Email address', description: 'Checks that it looks like an email address' },
  'search-input': { label: 'Search box', description: 'A text box styled for searching' },
  'radio-input': { label: 'Radio buttons', description: 'Pick one answer, all shown at once' },
  'dependent-select': {
    label: 'Linked dropdown',
    description: 'Its answers change depending on another dropdown',
  },
  'file-upload': { label: 'File upload', description: 'Attach a file' },
  button: { label: 'Button', description: 'A call type button' },
  'copy-to': { label: 'Copy answers', description: 'Copies answers from another section' },
  'custom-contact-component': {
    label: 'Built-in Aselo component',
    description: 'A special component provided by Aselo',
  },
};

// Types helpline staff can add from the "Add a field" menu, in the order shown
export const ADDABLE_FIELD_TYPES: FieldType[] = [
  'input',
  'textarea',
  'select',
  'listbox-multiselect',
  'checkbox',
  'mixed-checkbox',
  'date-input',
  'time-input',
  'numeric-input',
  'email',
];

/**
 * Groups of types a field can be switched between. Types in the same group store the same
 * kind of value, so switching doesn't break data that was already saved.
 */
const TYPE_GROUPS: FieldType[][] = [
  ['input', 'textarea', 'email', 'numeric-input'],
  ['select', 'listbox-multiselect'],
  ['checkbox', 'mixed-checkbox'],
];

// Switches that are always harmless, even for fields that already have saved data
const SAFE_EXISTING_TYPE_SWITCHES: FieldType[] = ['input', 'textarea'];

const CHOICE_TYPES: FieldType[] = ['select', 'listbox-multiselect', 'radio-input'];
const CHECKBOX_TYPES: FieldType[] = ['checkbox', 'mixed-checkbox', 'copy-to'];

export const isChoiceType = (type: string) => CHOICE_TYPES.includes(type as FieldType);

export const usesPlaceholder = (type: string) =>
  ['input', 'textarea', 'email', 'numeric-input', 'search-input'].includes(type);

/**
 * Types this field could be switched to (including its current type).
 * New fields can switch within their group. Existing fields hold saved data, so only
 * Aselo staff can make those switches, except for the always-safe short/long text switch.
 */
export const getAllowedTypeSwitches = (
  item: FormItemJsonDefinition,
  { isNew, staffMode }: { isNew: boolean; staffMode: boolean },
): FieldType[] => {
  const type = item.type as FieldType;
  const group = TYPE_GROUPS.find((types) => types.includes(type));
  if (!group || 'optionsReferenceKey' in item) return [type];
  if (isNew || staffMode) return group;
  return SAFE_EXISTING_TYPE_SWITCHES.includes(type) ? SAFE_EXISTING_TYPE_SWITCHES : [type];
};

/**
 * Turns a label into a camelCase field name, e.g. "Preferred language?" -> "preferredLanguage".
 * Field names are the keys contact data is saved under, so they only use letters and digits.
 */
export const toFieldName = (label: string): string => {
  const words = label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  const name = words
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('');
  if (!name) return 'newField';
  return /^[0-9]/.test(name) ? `field${name}` : name;
};

export const uniqueFieldName = (baseName: string, existingNames: Iterable<string>): string => {
  const taken = new Set(existingNames);
  if (!taken.has(baseName)) return baseName;
  let suffix = 2;
  while (taken.has(`${baseName}${suffix}`)) suffix += 1;
  return `${baseName}${suffix}`;
};

export const isFieldRequired = (item: FormItemJsonDefinition) =>
  typeof item.required === 'boolean' ? item.required : Boolean(item.required?.value);

export const setFieldRequired = (
  item: FormItemJsonDefinition,
  required: boolean,
): FormItemJsonDefinition => {
  const { required: _previous, ...rest } = item as unknown as FieldJson;
  return required
    ? asField({ ...rest, required: { value: true, message: REQUIRED_FIELD_MESSAGE } })
    : asField(rest);
};

export const updateField = (
  item: FormItemJsonDefinition,
  changes: FieldJson,
): FormItemJsonDefinition => {
  const updated: FieldJson = { ...(item as unknown as FieldJson), ...changes };
  // Setting a property to undefined removes it, rather than exporting an empty value
  Object.keys(changes).forEach((key) => {
    if (changes[key] === undefined) delete updated[key];
  });
  return asField(updated);
};

/**
 * The first option of a dropdown is conventionally a blank "nothing chosen yet" entry.
 */
export const isBlankOption = (option: SelectOption, index: number) =>
  index === 0 && String(option.label ?? '').trim() === '';

/**
 * Helplines differ in the value they use for the blank first dropdown option
 * ('' or 'Unknown'), so new dropdowns follow whatever this helpline already uses.
 */
export const detectBlankOptionValue = (forms: FormItemJsonDefinition[][]): string => {
  const counts = new Map<string, number>();
  forms.flat().forEach((item) => {
    if (item.type !== 'select' || !('options' in item) || !Array.isArray(item.options)) return;
    const first = item.options[0];
    if (first && isBlankOption(first, 0)) {
      const value = String(first.value);
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  });
  const [mostCommon] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return mostCommon ? mostCommon[0] : '';
};

export const createField = (
  type: FieldType,
  existingNames: Iterable<string>,
  blankOptionValue: string,
): FormItemJsonDefinition => {
  const label = 'New question';
  const field: FieldJson = {
    name: uniqueFieldName(toFieldName(label), existingNames),
    label,
    type,
    isPII: false,
  };
  if (type === 'select') {
    field.options = [
      { value: blankOptionValue, label: '' },
      { value: 'Option 1', label: 'Option 1' },
    ];
  }
  if (type === 'listbox-multiselect') {
    field.options = [{ value: 'Option 1', label: 'Option 1' }];
  }
  return asField(field);
};

/**
 * Switches a field's type, dropping properties that only made sense for the old type.
 * The blank first option is added or removed when switching between dropdown and list.
 */
export const changeFieldType = (
  item: FormItemJsonDefinition,
  newType: FieldType,
  blankOptionValue: string,
): FormItemJsonDefinition => {
  const field: FieldJson = { ...(item as unknown as FieldJson), type: newType };
  if (newType !== 'textarea') {
    delete field.rows;
    delete field.width;
  }
  if (!usesPlaceholder(newType)) delete field.placeholder;
  if (!CHECKBOX_TYPES.includes(newType)) delete field.initialChecked;
  if (newType !== 'select') {
    delete field.defaultOption;
    delete field.unknownOption;
  }
  if (Array.isArray(field.options)) {
    const options = field.options as SelectOption[];
    const hasBlank = options.length > 0 && isBlankOption(options[0], 0);
    if (newType === 'select' && !hasBlank) {
      field.options = [{ value: blankOptionValue, label: '' }, ...options];
    } else if (newType === 'listbox-multiselect' && hasBlank) {
      field.options = options.slice(1);
    }
  }
  return asField(field);
};

type LayoutJson = Record<string, unknown>;

/**
 * Records where a form is split into two columns, in LayoutDefinitions.json.
 *
 * Without splitFormAt the plugin splits forms in half. To keep the export minimal, the value
 * is only written when the layout already had one or the columns no longer split in half.
 */
export const applyColumnSplit = (
  layout: LayoutJson,
  layoutPath: string[],
  leftColumnCount: number,
  totalCount: number,
  hadExplicitSplit: boolean,
): LayoutJson => {
  const isHalfSplit = leftColumnCount === Math.ceil(totalCount / 2);
  const writeSplit = hadExplicitSplit || !isHalfSplit;

  const setIn = (node: LayoutJson, [key, ...rest]: string[]): LayoutJson => {
    const child = (node[key] as LayoutJson | undefined) ?? {};
    if (rest.length > 0) {
      const updatedChild = setIn(child, rest);
      return updatedChild === child && !(key in node) ? node : { ...node, [key]: updatedChild };
    }
    const { splitFormAt: _previous, ...entry } = child;
    const updatedEntry = writeSplit ? { ...entry, splitFormAt: leftColumnCount } : entry;
    // Don't leave behind an empty entry this function created
    if (!writeSplit && Object.keys(updatedEntry).length === 0 && !(key in node)) return node;
    return { ...node, [key]: updatedEntry };
  };

  return setIn(layout, layoutPath);
};
