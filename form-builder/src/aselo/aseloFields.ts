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
 * Starting values and validation for the "Try it out" preview, following the Flex plugin's
 * form components (plugin-hrm-form/src/components/forms) so the preview behaves like Aselo,
 * including its quirks - e.g. a required dropdown whose blank first answer has the value
 * "Unknown" counts as answered, exactly as it does for counselors.
 */
import type {
  DependentOptions,
  FormItemJsonDefinition,
  SelectOption,
} from '@hrm-form-definitions/formDefinition/types';
import { resolveOptions } from '../definitions';

export type FieldValue = string | boolean | 'mixed' | string[] | undefined;
export type FormValues = Record<string, FieldValue>;

const NUMERIC_PATTERN = /^[0-9]+$/;
const NUMERIC_MESSAGE = 'This field only accepts numeric input.';
const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const EMAIL_MESSAGE = 'Entered value does not match email format';
export const REQUIRED_MESSAGE = 'RequiredFieldError';

type Rule<T> = { value: T; message: string };

const pad = (n: number) => String(n).padStart(2, '0');

export const initialValueFor = (
  item: FormItemJsonDefinition,
  referenceData: Record<string, unknown>,
): FieldValue => {
  const initializeWithCurrent = (item as { initializeWithCurrent?: boolean }).initializeWithCurrent;
  const now = new Date();
  switch (item.type) {
    case 'select': {
      // As getInitialValue in the plugin's formValues.ts: the default answer, or the first one
      const options = resolveOptions(item, referenceData) ?? [];
      return String(item.defaultOption?.value || (options[0]?.value ?? ''));
    }
    case 'dependent-select':
      return String(item.defaultOption?.value ?? '');
    case 'checkbox':
    case 'copy-to':
      return item.initialChecked === true;
    case 'mixed-checkbox':
      return typeof item.initialChecked === 'boolean' ? item.initialChecked : 'mixed';
    case 'listbox-multiselect':
      return [];
    case 'radio-input':
      return item.defaultOption ? String(item.defaultOption.value) : '';
    case 'date-input':
      return initializeWithCurrent
        ? `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
        : '';
    case 'time-input':
      return initializeWithCurrent ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : '';
    default:
      return '';
  }
};

const ruleOf = <T>(rule: unknown): Rule<T> | undefined =>
  rule && typeof rule === 'object' && 'value' in rule ? (rule as Rule<T>) : undefined;

const isRequired = (item: FormItemJsonDefinition) =>
  typeof item.required === 'boolean' ? item.required : Boolean(item.required?.value);

const requiredMessage = (item: FormItemJsonDefinition) =>
  typeof item.required === 'object' && item.required?.message
    ? item.required.message
    : REQUIRED_MESSAGE;

/**
 * Lists of answers a linked dropdown currently offers (none until the one above is answered)
 */
export const dependentOptionsFor = (
  item: Extract<FormItemJsonDefinition, { dependsOn: string }>,
  values: FormValues,
  referenceData: Record<string, unknown>,
): SelectOption[] => {
  const lists = resolveOptions<DependentOptions>(item, referenceData) ?? {};
  const dependeeValue = values[item.dependsOn];
  return typeof dependeeValue === 'string' && dependeeValue ? lists[dependeeValue] ?? [] : [];
};

/**
 * The error message key or text to show under a field, or undefined if it's fine
 */
export const validateField = (
  item: FormItemJsonDefinition,
  values: FormValues,
  referenceData: Record<string, unknown>,
): string | undefined => {
  const value = values[item.name];
  const required = isRequired(item);

  switch (item.type) {
    case 'dependent-select': {
      // Only required once the dropdown above has given it answers to choose from
      const hasOptions = dependentOptionsFor(item, values, referenceData).length > 0;
      return hasOptions && required && value === String(item.defaultOption?.value ?? '')
        ? requiredMessage(item)
        : undefined;
    }
    case 'checkbox':
    case 'copy-to':
      return required && value !== true ? requiredMessage(item) : undefined;
    case 'mixed-checkbox':
      return undefined;
    case 'listbox-multiselect':
      return required && (!Array.isArray(value) || value.length === 0)
        ? requiredMessage(item)
        : undefined;
    default:
      break;
  }

  const text = typeof value === 'string' ? value : '';
  if (required && !text) return requiredMessage(item);
  if (!text) return undefined;
  if (item.type === 'numeric-input' && !NUMERIC_PATTERN.test(text)) return NUMERIC_MESSAGE;
  if (item.type === 'email' && !EMAIL_PATTERN.test(text)) return EMAIL_MESSAGE;

  const minLength = ruleOf<number>(item.minLength);
  if (minLength && text.length < minLength.value) return minLength.message;
  const maxLength = ruleOf<number>(item.maxLength);
  if (maxLength && text.length > maxLength.value) return maxLength.message;
  const min = ruleOf<number>(item.min);
  if (min && Number(text) < min.value) return min.message;
  const max = ruleOf<number>(item.max);
  if (max && Number(text) > max.value) return max.message;
  return undefined;
};
