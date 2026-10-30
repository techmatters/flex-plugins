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
 * Renders a single form field roughly the way it appears to counselors in Aselo.
 * Fields are interactive (so dependent dropdowns can be tried out) but nothing is saved.
 */
import type {
  DependentOptions,
  FormItemJsonDefinition,
  SelectOption,
} from '@hrm-form-definitions/formDefinition/types';
import { resolveOptions } from '../definitions';

type Props = {
  item: FormItemJsonDefinition;
  referenceData: Record<string, unknown>;
  value: string;
  // Current value of the field a dependent-select depends on
  dependeeValue?: string;
  onChange: (value: string) => void;
};

const isRequired = (item: FormItemJsonDefinition) =>
  typeof item.required === 'boolean' ? item.required : Boolean(item.required?.value);

const Label = ({ item }: { item: FormItemJsonDefinition }) => (
  <span className="field-label">
    {item.label || <em className="muted">(no label)</em>}
    {isRequired(item) && <span className="required">*</span>}
    {item.isPII && <span className="badge badge-pii">PII</span>}
  </span>
);

const SelectOptions = ({ options }: { options: SelectOption[] }) => (
  <>
    {/* Keyed by position: some helplines reuse a value (e.g. a blank and a visible "Unknown") */}
    {options.map((option, index) => (
      <option key={index} value={String(option.value)}>
        {option.label}
      </option>
    ))}
  </>
);

export const FieldPreview = ({ item, referenceData, value, dependeeValue, onChange }: Props) => {
  switch (item.type) {
    case 'input':
    case 'search-input':
    case 'email':
    case 'numeric-input':
    case 'date-input':
    case 'time-input': {
      const inputType = {
        input: 'text',
        'search-input': 'search',
        email: 'email',
        'numeric-input': 'number',
        'date-input': 'date',
        'time-input': 'time',
      }[item.type];
      return (
        <label className="field">
          <Label item={item} />
          <input
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );
    }

    case 'textarea':
      return (
        <label className="field">
          <Label item={item} />
          <textarea
            rows={'rows' in item && item.rows ? item.rows : 4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );

    case 'select': {
      const options = resolveOptions(item, referenceData) ?? [];
      return (
        <label className="field">
          <Label item={item} />
          <select value={value} onChange={(e) => onChange(e.target.value)}>
            <SelectOptions options={options} />
          </select>
        </label>
      );
    }

    case 'dependent-select': {
      const optionsByDependee = resolveOptions<DependentOptions>(item, referenceData) ?? {};
      const options = (dependeeValue && optionsByDependee[dependeeValue]) || [];
      return (
        <label className="field">
          <Label item={item} />
          <select
            value={value}
            disabled={options.length === 0}
            onChange={(e) => onChange(e.target.value)}
          >
            {item.defaultOption && <SelectOptions options={[item.defaultOption]} />}
            <SelectOptions options={options} />
          </select>
          <span className="field-hint">Options depend on “{item.dependsOn}”</span>
        </label>
      );
    }

    case 'radio-input':
      return (
        <fieldset className="field">
          <Label item={item} />
          {(resolveOptions(item, referenceData) ?? []).map((option, index) => (
            <label key={index} className="inline-option">
              <input
                type="radio"
                name={item.name}
                checked={value === String(option.value)}
                onChange={() => onChange(String(option.value))}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      );

    case 'listbox-multiselect':
      return (
        <fieldset className="field">
          <Label item={item} />
          <div className="listbox">
            {(resolveOptions(item, referenceData) ?? []).map((option, index) => (
              <label key={index} className="inline-option">
                <input type="checkbox" />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      );

    case 'checkbox':
    case 'mixed-checkbox':
    case 'copy-to':
      return (
        <label className="field field-checkbox">
          <input type="checkbox" defaultChecked={item.initialChecked === true} />
          <Label item={item} />
          {item.type === 'copy-to' && (
            <span className="field-hint">Copies values from “{item.target}”</span>
          )}
        </label>
      );

    case 'file-upload':
      return (
        <label className="field">
          <Label item={item} />
          <input type="file" disabled />
        </label>
      );

    case 'button':
      return (
        <button type="button" className="call-type-button">
          {item.label}
        </button>
      );

    case 'custom-contact-component':
      return (
        <div className="field">
          <Label item={item} />
          <div className="custom-component">Built-in component: {item.component}</div>
        </div>
      );

    default:
      return (
        <div className="field">
          <Label item={item} />
          <div className="custom-component">
            Unsupported field type: {(item as { type: string }).type}
          </div>
        </div>
      );
  }
};
