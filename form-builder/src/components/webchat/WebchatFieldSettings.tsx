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
 * Settings for one pre-engagement question, with its texts in the language being edited.
 * The saved name is locked once the question exists, because answers are copied into the
 * contact form and reports by name.
 */
import type { SelectOption } from '@hrm-form-definitions/formDefinition/types';
import {
  changeWebchatFieldType,
  isRequired,
  WEBCHAT_FIELD_TYPE_INFO,
  WebchatField,
  WebchatFieldType,
  webchatFieldName,
} from '../../webchat';
import type { ContactTab } from '../../definitions';
import type { ValidationIssue } from '../../validation';
import { OptionsEditor } from '../OptionsEditor';

type Props = {
  // The question with its texts in the language being edited
  field: WebchatField;
  // The question as it was loaded; undefined for one added in this draft
  originalField?: WebchatField;
  otherNames: string[];
  staffMode: boolean;
  // Part of linked dropdowns: answers are edited for the whole set
  linkedChains: string[][];
  labelOf: (name: string) => string;
  references: string[];
  issues: ValidationIssue[];
  // The language's texts live in the form itself, the same for every language
  textIsShared: boolean;
  // Contact form fields this question fills in (PrepopulateMappings.json)
  prepopulate: {
    targets: string[];
    editable: boolean;
    candidates: { tab: ContactTab; fields: { name: string; label: string }[] }[];
    // Whether the helpline reads PrepopulateMappings.json (use_prepopulate_mappings)
    inUse: boolean;
    // Dropdown answers each target field doesn't have
    unmatchedAnswers: (target: string) => string[];
  };
  onChangeTargets: (targets: string[]) => void;
  onChange: (field: WebchatField) => void;
  onEditLinked: (chain: string[]) => void;
  onRemove: () => void;
};

export const WebchatFieldSettings = ({
  field,
  originalField,
  otherNames,
  staffMode,
  linkedChains,
  labelOf,
  references,
  issues,
  textIsShared,
  prepopulate,
  onChangeTargets,
  onChange,
  onEditLinked,
  onRemove,
}: Props) => {
  const isNew = !originalField;
  const isLinked = linkedChains.length > 0;
  const isLinkedTop = isLinked && linkedChains[0][0] === field.name;
  // Short text and email both save text, so switching between them is always safe
  const textTypes: WebchatFieldType[] = ['input', 'email'];
  let allowedTypes: WebchatFieldType[] = [field.type];
  if (isNew && !isLinked) allowedTypes = ['input', 'email', 'select', 'checkbox'];
  else if (textTypes.includes(field.type)) allowedTypes = textTypes;

  const nameFollowsLabel = isNew && field.name === webchatFieldName(field.label, otherNames);
  const changeLabel = (label: string) =>
    onChange({
      ...field,
      label,
      ...(nameFollowsLabel ? { name: webchatFieldName(label, otherNames) } : {}),
    });

  // What the question fills in is shown in its own setting
  const otherReferences = references.filter((reference) => !reference.startsWith('Fills in the contact form'));
  const requiredMessage = typeof field.required === 'object' ? (field.required.message ?? '') : '';
  const setCheckboxRequired = (mustTick: boolean, message = requiredMessage) => {
    const { required, ...rest } = field;
    onChange(
      mustTick ? { ...rest, required: { value: true, ...(message ? { message } : {}) } } : rest,
    );
  };

  const confirmRemove = () => {
    if (isNew) {
      onRemove();
      return;
    }
    const lines = [`Remove “${field.label.replace(/<[^>]*>/g, '')}” from the webchat form?`];
    if (references.length > 0) lines.push('', 'Also note:', ...references.map((ref) => `• ${ref}`));
    if (window.confirm(lines.join('\n'))) onRemove();
  };

  return (
    <div className="field-settings webchat-field-settings">
      {issues.length > 0 && (
        <ul className="issue-list">
          {issues.map((issue) => (
            <li key={issue.message} className={`issue issue-${issue.severity}`}>
              {issue.message}
            </li>
          ))}
        </ul>
      )}

      <label className="field">
        <span className="field-label">Question</span>
        <input
          type="text"
          value={field.label}
          placeholder="What visitors will see"
          onChange={(e) => changeLabel(e.target.value)}
        />
        {field.type === 'checkbox' && (
          <span className="field-hint">
            To link to a page, write for example{' '}
            <code>{'I accept the <a href="https://…">terms</a>'}</code>
          </span>
        )}
        {textIsShared && (
          <span className="field-hint">This text isn't translated: it shows in every language.</span>
        )}
      </label>

      <label className="field">
        <span className="field-label">Kind of answer</span>
        {allowedTypes.length > 1 ? (
          <select
            value={field.type}
            onChange={(e) => onChange(changeWebchatFieldType(field, e.target.value as WebchatFieldType))}
          >
            {allowedTypes.map((type) => (
              <option key={type} value={type}>
                {WEBCHAT_FIELD_TYPE_INFO[type].label}
              </option>
            ))}
          </select>
        ) : (
          <span className="read-only-value">{WEBCHAT_FIELD_TYPE_INFO[field.type]?.label ?? field.type}</span>
        )}
      </label>

      {(field.type === 'input' || field.type === 'email') && (
        <label className="field">
          <span className="field-label">Hint inside the box (optional)</span>
          <input
            type="text"
            value={field.placeholder ?? ''}
            onChange={(e) => {
              const { placeholder, ...rest } = field;
              onChange(e.target.value ? { ...rest, placeholder: e.target.value } : rest);
            }}
          />
        </label>
      )}

      {field.type === 'checkbox' ? (
        <>
          <label className="field field-checkbox">
            <input
              type="checkbox"
              checked={isRequired(field)}
              onChange={(e) => setCheckboxRequired(e.target.checked)}
            />
            <span>Must be ticked to start the chat</span>
          </label>
          {isRequired(field) && (
            <label className="field">
              <span className="field-label">Message if it isn't ticked (optional)</span>
              <input
                type="text"
                value={requiredMessage}
                onChange={(e) => setCheckboxRequired(true, e.target.value)}
              />
            </label>
          )}
        </>
      ) : (
        <label className="field field-checkbox">
          <input
            type="checkbox"
            checked={isRequired(field)}
            onChange={(e) => onChange({ ...field, required: e.target.checked })}
          />
          <span>Visitors must answer this</span>
        </label>
      )}

      {isLinked && (
        <div className="linked-section">
          <span className="field-label">Linked dropdowns</span>
          {linkedChains.map((chain) => (
            <div key={chain.join('>')} className="linked-chain">
              <span>{chain.map(labelOf).join(' → ')}</span>
              <button type="button" className="secondary-button" onClick={() => onEditLinked(chain)}>
                Edit answers
              </button>
            </div>
          ))}
        </div>
      )}

      {field.type === 'select' && !isLinkedTop && Array.isArray(field.options) && (
        <div className="field">
          <span className="field-label">Answers</span>
          <OptionsEditor
            options={field.options as SelectOption[]}
            originalValues={
              new Set(
                (Array.isArray(originalField?.options) ? (originalField.options as SelectOption[]) : []).map(
                  (option) => String(option.value),
                ),
              )
            }
            staffMode={staffMode}
            onChange={(options) => onChange({ ...field, options })}
          />
        </div>
      )}

      <div className="field">
        <span className="field-label">Fills in on the contact form</span>
        {prepopulate.targets.length === 0 && (
          <span className="field-hint">Nothing: counselors don't get this answer filled in.</span>
        )}
        <ul className="prepopulate-targets">
          {prepopulate.targets.map((target) => {
            const [tabKey, targetName] = target.split('.');
            const group = prepopulate.candidates.find((candidate) => candidate.tab.key === tabKey);
            const targetLabel = group?.fields.find((item) => item.name === targetName)?.label;
            const unmatched = prepopulate.unmatchedAnswers(target);
            return (
              <li key={target}>
                <span>
                  {group?.tab.title ?? tabKey}: {targetLabel || targetName}
                  {!targetLabel && ' (not in the contact form)'}
                </span>
                {prepopulate.editable && (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Stop filling in ${targetLabel || targetName}`}
                    onClick={() => onChangeTargets(prepopulate.targets.filter((other) => other !== target))}
                  >
                    ×
                  </button>
                )}
                {unmatched.length > 0 && (
                  <span className="field-hint prepopulate-warning">
                    That field has no answer for {unmatched.map((value) => `“${value}”`).join(', ')}, so
                    it's left empty when visitors choose {unmatched.length === 1 ? 'it' : 'them'}.
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {prepopulate.editable ? (
          <select
            aria-label="Fill in another contact form field"
            value=""
            onChange={(e) => e.target.value && onChangeTargets([...prepopulate.targets, e.target.value])}
          >
            <option value="">+ Fill in a contact form field…</option>
            {prepopulate.candidates.map(({ tab, fields }) => (
              <optgroup key={tab.key} label={tab.title}>
                {fields
                  .filter((item) => !prepopulate.targets.includes(`${tab.key}.${item.name}`))
                  .map((item) => (
                    <option key={item.name} value={`${tab.key}.${item.name}`}>
                      {item.label || item.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        ) : (
          <span className="field-hint">This uses an advanced setting; ask Aselo staff to change it.</span>
        )}
        {!prepopulate.inUse && (
          <span className="field-hint">
            This helpline still fills in contacts the old way (PrepopulateKeys.json), so this takes
            effect once Aselo staff turn on “use_prepopulate_mappings”.
          </span>
        )}
      </div>

      {staffMode && (
        <details className="staff-section" open={isNew}>
          <summary>Aselo staff settings</summary>
          <label className="field">
            <span className="field-label">Saved as (field name)</span>
            {isNew ? (
              <input
                type="text"
                value={field.name}
                onChange={(e) => onChange({ ...field, name: e.target.value.trim() })}
              />
            ) : (
              <span className="read-only-value">
                <code>{field.name}</code>
              </span>
            )}
            <span className="field-hint">
              {isNew
                ? 'Generated from the question. It can’t be changed once applied: answers are copied into contacts by this name.'
                : 'Locked: answers are copied into contacts by this name.'}
            </span>
          </label>
        </details>
      )}

      {otherReferences.length > 0 && (
        <div className="references">
          <span className="field-label">Good to know</span>
          <ul>
            {otherReferences.map((reference) => (
              <li key={reference}>{reference}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="field-settings-footer">
        <button type="button" className="danger-button" onClick={confirmRemove}>
          Remove this question
        </button>
      </div>
    </div>
  );
};
