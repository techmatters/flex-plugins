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
 * One form field drawn the way the Flex plugin draws it. Each case mirrors a component in
 * plugin-hrm-form/src/components/forms/components; the styles are in aselo.css.
 */
import { useState } from 'react';
import type {
  FormItemJsonDefinition,
  SelectOption,
} from '@hrm-form-definitions/formDefinition/types';
import { resolveOptions } from '../definitions';
import { dependentOptionsFor, FieldValue, FormValues } from './aseloFields';
import { Strings, translate } from './translations';

type Props = {
  item: FormItemJsonDefinition;
  values: FormValues;
  referenceData: Record<string, unknown>;
  strings: Strings;
  error?: string;
  onChange: (value: FieldValue) => void;
};

const isRequired = (item: FormItemJsonDefinition) =>
  typeof item.required === 'boolean' ? item.required : Boolean(item.required?.value);

const RequiredAsterisk = () => (
  <span aria-hidden="true" className="aselo-required">
    *
  </span>
);

const cssSize = (size: number | string | undefined, fallback: number) =>
  size === undefined ? `${fallback}px` : typeof size === 'number' ? `${size}px` : size;

// The custom checkbox square: grey when empty, blue with a tick, red with a cross (mixed "no")
const CheckboxBox = ({ state }: { state: boolean }) => (
  <span className={`aselo-checkbox-box ${state ? 'is-yes' : ''}`} aria-hidden="true">
    {state ? '✓' : ''}
  </span>
);

const MixedBox = ({ state }: { state: boolean | 'mixed' }) => (
  <span
    className={`aselo-checkbox-box ${state === true ? 'is-yes' : ''} ${state === false ? 'is-no' : ''}`}
    aria-hidden="true"
  >
    {state === true ? '✓' : state === false ? '✕' : ''}
  </span>
);

const Description = ({ item, strings }: { item: FormItemJsonDefinition; strings: Strings }) => {
  const [expanded, setExpanded] = useState(false);
  const description = item.description as { title?: string; content?: string } | undefined;
  if (!description || typeof description !== 'object') return null;
  return (
    <div className="aselo-description">
      <strong>{translate(strings, description.title)}</strong>
      <span className={expanded ? '' : 'aselo-description-collapsed'}>
        {translate(strings, description.content)}
      </span>
      <button type="button" className="aselo-link" onClick={() => setExpanded(!expanded)}>
        {translate(strings, expanded ? 'ReadLess' : 'ReadMore')}
      </button>
    </div>
  );
};

const Options = ({ options, strings }: { options: SelectOption[]; strings: Strings }) => (
  <>
    {options.map((option, index) => (
      <option
        key={index}
        value={String(option.value)}
        className={option.value === '' ? 'aselo-option-empty' : undefined}
      >
        {translate(strings, option.label)}
      </option>
    ))}
  </>
);

export const AseloField = ({ item, values, referenceData, strings, error, onChange }: Props) => {
  const value = values[item.name];
  const id = `aselo-${item.name}`;
  const label = translate(strings, item.label);
  const required = isRequired(item);
  const errorText = error ? (
    <span className="aselo-error" role="alert">
      {translate(strings, error)}
    </span>
  ) : null;

  const labelRow = (
    <div className="aselo-label-row">
      <span>
        {label}
        {required && <RequiredAsterisk />}
      </span>
    </div>
  );

  const renderInput = () => {
    switch (item.type) {
      case 'input':
      case 'email':
      case 'numeric-input':
      case 'date-input':
      case 'time-input':
        return (
          <label className="aselo-form-label" htmlFor={id}>
            {labelRow}
            <input
              id={id}
              // Email and number boxes are plain text boxes in Aselo, checked when saving
              type={item.type === 'date-input' ? 'date' : item.type === 'time-input' ? 'time' : 'text'}
              className={`aselo-input ${error ? 'has-error' : ''}`}
              value={typeof value === 'string' ? value : ''}
              aria-invalid={Boolean(error)}
              onChange={(e) => onChange(e.target.value)}
            />
            {errorText}
          </label>
        );

      case 'search-input':
        return (
          <label className="aselo-form-label" htmlFor={id}>
            <span className="aselo-visually-hidden">{label}</span>
            <span className="aselo-search">
              <span aria-hidden="true">⌕</span>
              <input
                id={id}
                className="aselo-input"
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => onChange(e.target.value)}
              />
            </span>
          </label>
        );

      case 'textarea':
        return (
          <label className="aselo-form-label" htmlFor={id}>
            <div className="aselo-label-row" style={{ width: cssSize(item.width, 217) }}>
              <span>
                {label}
                {required && <RequiredAsterisk />}
              </span>
            </div>
            <textarea
              id={id}
              className={`aselo-textarea ${error ? 'has-error' : ''}`}
              rows={'rows' in item && item.rows ? item.rows : 10}
              style={{ width: cssSize(item.width, 217) }}
              value={typeof value === 'string' ? value : ''}
              aria-invalid={Boolean(error)}
              onChange={(e) => onChange(e.target.value)}
            />
            {errorText}
          </label>
        );

      case 'select':
      case 'dependent-select': {
        const isDependent = item.type === 'dependent-select';
        const options = isDependent
          ? [
              ...(item.defaultOption ? [item.defaultOption] : []),
              ...dependentOptionsFor(item, values, referenceData),
            ]
          : resolveOptions(item, referenceData) ?? [];
        // A linked dropdown with nothing to choose from yet is faded out and disabled
        const disabled = isDependent && options.length <= 1;
        return (
          <label
            className="aselo-form-label"
            htmlFor={id}
            style={disabled ? { opacity: 0.3 } : undefined}
          >
            {labelRow}
            <span className="aselo-select-wrapper">
              <select
                id={id}
                className={`aselo-select ${error ? 'has-error' : ''}`}
                value={typeof value === 'string' ? value : ''}
                disabled={disabled}
                aria-invalid={Boolean(error)}
                onChange={(e) => onChange(e.target.value)}
              >
                <Options options={options} strings={strings} />
              </select>
            </span>
            {errorText}
          </label>
        );
      }

      case 'checkbox':
      case 'copy-to':
        return (
          <label className="aselo-form-label" htmlFor={id}>
            <span className={`aselo-checkbox-wrapper ${error ? 'has-error' : ''}`}>
              <input
                id={id}
                type="checkbox"
                className="aselo-visually-hidden"
                checked={value === true}
                onChange={(e) => onChange(e.target.checked)}
              />
              <CheckboxBox state={value === true} />
              <span>
                {label}
                {required && <RequiredAsterisk />}
              </span>
            </span>
            {errorText}
          </label>
        );

      case 'mixed-checkbox': {
        const state = value === true || value === false ? value : 'mixed';
        // Each click moves through: unanswered -> yes -> no -> unanswered
        const next = state === 'mixed' ? true : state === true ? false : 'mixed';
        return (
          <div className="aselo-form-label">
            <span className="aselo-checkbox-wrapper">
              <button
                type="button"
                role="checkbox"
                aria-checked={state}
                aria-label={label}
                className="aselo-mixed-button"
                onClick={() => onChange(next)}
              >
                <MixedBox state={state} />
              </button>
              <span>
                {label}
                {required && <RequiredAsterisk />}
              </span>
            </span>
          </div>
        );
      }

      case 'listbox-multiselect': {
        const selected = Array.isArray(value) ? value : [];
        const options = resolveOptions(item, referenceData) ?? [];
        const toggle = (optionValue: string) =>
          onChange(
            selected.includes(optionValue)
              ? selected.filter((v) => v !== optionValue)
              : [...selected, optionValue],
          );
        return (
          <div
            className={`aselo-listbox ${error ? 'has-error' : ''}`}
            role="group"
            aria-label={label}
            style={{
              height: cssSize('height' in item ? item.height : undefined, 250),
              width: cssSize('width' in item ? item.width : undefined, 220),
            }}
          >
            {labelRow}
            <div className="aselo-listbox-options">
              {options.map((option, index) => {
                const optionValue = String(option.value);
                const checked = selected.includes(optionValue);
                return (
                  <label key={index} className="aselo-listbox-option">
                    <input
                      type="checkbox"
                      className="aselo-visually-hidden"
                      checked={checked}
                      onChange={() => toggle(optionValue)}
                    />
                    <CheckboxBox state={checked} />
                    <span>{translate(strings, option.label)}</span>
                  </label>
                );
              })}
            </div>
            {errorText}
          </div>
        );
      }

      case 'radio-input': {
        const options = resolveOptions(item, referenceData) ?? [];
        return (
          <fieldset className={`aselo-fieldset ${error ? 'has-error' : ''}`}>
            {item.label && labelRow}
            {options.map((option, index) => (
              <label key={index} className="aselo-radio-option">
                <input
                  type="radio"
                  className="aselo-radio"
                  name={id}
                  checked={value === String(option.value)}
                  onChange={() => onChange(String(option.value))}
                />
                {translate(strings, option.label)}
              </label>
            ))}
            {errorText}
          </fieldset>
        );
      }

      case 'file-upload':
        return (
          <div className="aselo-form-label">
            {labelRow}
            <span className="aselo-button aselo-button-secondary aselo-file-button">
              {translate(strings, 'UploadFile-ButtonText')}
            </span>
          </div>
        );

      case 'custom-contact-component':
        return (
          <div className="aselo-custom-component">
            Aselo built-in: {item.component}
          </div>
        );

      default:
        return <div className="aselo-custom-component">INVALID FORM INPUT: {item.name}</div>;
    }
  };

  return (
    <div className="aselo-field">
      {renderInput()}
      <Description item={item} strings={strings} />
    </div>
  );
};
