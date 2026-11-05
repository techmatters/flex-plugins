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
 * The pre-engagement form as visitors see it in the webchat, and it can be filled in. It
 * follows aselo-webchat-react-app: PreEngagementFormPhase.tsx, Header.tsx and
 * components/forms/formInputs (Input, Select, DependentSelect, Checkbox, validation.ts).
 */
import type { SelectOption } from '@hrm-form-definitions/formDefinition/types';

import { useAppDispatch, useAppSelector } from '../app/store';
import { localizeText, PreEngagementForm, Strings, WebchatField } from './webchat';
import { answerPreview, previewStartedSet, PreviewValue as Value, selectWebchat } from './webchatSlice';
import { sanitizeLabelHtml } from './sanitizeLabelHtml';
import './webchat.css';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

// validation.ts in the webchat app
const validate = (field: WebchatField, value: Value): string | undefined => {
  if (field.required) {
    if (typeof field.required === 'object') {
      if (field.required.value !== value) return field.required.message || 'RequiredFieldError';
    } else if (value === undefined || value === '') {
      return 'RequiredFieldError';
    }
  }
  if (field.type === 'email' && value && !EMAIL_PATTERN.test(String(value))) {
    return 'EmailFieldPatternError';
  }
  return undefined;
};

const initialValue = (field: WebchatField): Value => (field.type === 'checkbox' ? Boolean(field.initialChecked) : '');

type Props = {
  form: PreEngagementForm;
  strings: Strings;
};

export const WebchatPreview = ({ form, strings }: Props) => {
  const fields = form.fields ?? [];
  const dispatch = useAppDispatch();
  // What's filled in lives in the store (webchatSlice.ts)
  const { values, touched, started } = useAppSelector(selectWebchat).preview;
  const t = (key: unknown) => localizeText(strings, key);

  const valueOf = (field: WebchatField) => values[field.name] ?? initialValue(field);
  const errorOf = (field: WebchatField) => validate(field, valueOf(field));
  const valid = fields.every(field => !errorOf(field));

  const setValue = (name: string, value: Value) => dispatch(answerPreview(fields, name, value));

  const renderError = (field: WebchatField) => {
    const error = errorOf(field);
    return error && touched.includes(field.name) ? <span className="webchat-error">{t(error)}</span> : null;
  };

  const renderLabel = (field: WebchatField) => (
    <span className="webchat-label-text">
      {t(field.label)} {field.required ? '*' : ''}
    </span>
  );

  const renderOptions = (options: SelectOption[]) =>
    options.map((option, index) => (
      <option key={index} value={String(option.value)}>
        {t(option.label)}
      </option>
    ));

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const renderField = (field: WebchatField) => {
    const error = Boolean(errorOf(field) && touched.includes(field.name));
    const id = `webchat-preview-${field.name}`;
    switch (field.type) {
      case 'input':
      case 'email':
        return (
          <label htmlFor={id} className="webchat-label">
            {renderLabel(field)}
            <input
              id={id}
              type="text"
              className={`webchat-input${error ? ' has-error' : ''}`}
              placeholder={field.placeholder === undefined ? undefined : t(field.placeholder)}
              value={String(valueOf(field))}
              onChange={e => setValue(field.name, e.target.value)}
            />
          </label>
        );
      case 'select':
        return (
          <label htmlFor={id} className="webchat-label">
            {renderLabel(field)}
            <select
              id={id}
              className={`webchat-select${error ? ' has-error' : ''}`}
              value={String(valueOf(field))}
              onChange={e => setValue(field.name, e.target.value)}
            >
              {renderOptions((field.options ?? []) as SelectOption[])}
            </select>
          </label>
        );
      case 'dependent-select': {
        const above = field.dependsOn ? values[field.dependsOn] : undefined;
        const list = above ? (field.options as Record<string, SelectOption[]> | undefined)?.[String(above)] ?? [] : [];
        return (
          <label htmlFor={id} className="webchat-label">
            {renderLabel(field)}
            <select
              id={id}
              className={`webchat-select${error ? ' has-error' : ''}`}
              disabled={!above}
              value={String(valueOf(field))}
              onChange={e => setValue(field.name, e.target.value)}
            >
              {renderOptions(list)}
            </select>
          </label>
        );
      }
      case 'checkbox':
        return (
          <label htmlFor={id} className="webchat-checkbox">
            <input
              id={id}
              type="checkbox"
              className={error ? 'has-error' : ''}
              checked={Boolean(valueOf(field))}
              onChange={e => setValue(field.name, e.target.checked)}
            />
            <span>
              {/* The webchat shows checkbox labels as HTML, so they can hold a link */}
              {/* eslint-disable-next-line react/no-danger -- sanitized by sanitizeLabelHtml, as the webchat does */}
              <span dangerouslySetInnerHTML={{ __html: sanitizeLabelHtml(t(field.label)) }} />
              {field.required ? '*' : ''}
            </span>
          </label>
        );
      default:
        return <div>Invalid form definition: {JSON.stringify(field)}</div>;
    }
  };

  const title = t('PreEngagementPhase-Form-Title');
  const description = t('PreEngagementPhase-Form-Description');

  return (
    <div className="webchat-window" aria-label="Webchat preview">
      <header className="webchat-header">
        <h2>{t('Header-TitleBar-Title')}</h2>
      </header>
      {started ? (
        <div className="webchat-started">
          <p>Here the chat would start, and a counselor would see these answers.</p>
          <ul>
            {fields.map(field => (
              <li key={field.name}>
                <strong>{t(field.label).replace(/<[^>]*>/g, '')}</strong>: {String(valueOf(field)) || '—'}
              </li>
            ))}
          </ul>
          <button type="button" className="webchat-button" onClick={() => dispatch(previewStartedSet(false))}>
            Back to the form
          </button>
        </div>
      ) : (
        <form
          className="webchat-form"
          onSubmit={e => {
            e.preventDefault();
            dispatch(previewStartedSet(true));
          }}
        >
          {title && <h3 className="webchat-title">{title}</h3>}
          {description && <p className="webchat-description">{description}</p>}
          <div className="webchat-fields">
            {fields.map(field => (
              <div key={field.name} className="webchat-field">
                {renderField(field)}
                {renderError(field)}
              </div>
            ))}
          </div>
          <button type="submit" className="webchat-button" disabled={!valid}>
            {t('PreEngagementPhase-Form-SubmitButtonLabel')}
          </button>
        </form>
      )}
    </div>
  );
};
