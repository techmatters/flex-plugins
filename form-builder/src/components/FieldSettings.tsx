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
 * Settings for the selected field. Helpline staff see plain-language options; the field's
 * saved name, and changes that affect data already collected, need Aselo staff mode.
 */
import type { FormItemJsonDefinition, SelectOption } from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap, FormTarget } from '../definitions';
import { findFieldReferences } from '../fieldReferences';
import { findChainsThroughField } from '../linkedDropdowns';
import {
  changeFieldType,
  FIELD_TYPE_INFO,
  FieldType,
  getAllowedTypeSwitches,
  isChoiceType,
  isFieldRequired,
  setFieldRequired,
  toFieldName,
  uniqueFieldName,
  updateField,
} from '../formEditing';
import { isProtectedField } from '../specification';
import type { ValidationIssue } from '../validation';
import { OptionsEditor } from './OptionsEditor';
import { translate, useStrings } from '../aselo/translations';

type Props = {
  tab: FormTarget;
  helplineLanguage?: string;
  // Sets the helpline's own wording for a translation key (customStrings/Substitutions.json)
  onChangeTranslation: (key: string, text: string) => void;
  item: FormItemJsonDefinition;
  // The field as it was loaded; undefined for a field added in this draft
  originalItem?: FormItemJsonDefinition;
  otherNames: string[];
  draftFiles: DefinitionFileMap;
  // Every field in this form, to find the linked dropdowns this field belongs to
  formItems: FormItemJsonDefinition[];
  staffMode: boolean;
  blankOptionValue: string;
  issues: ValidationIssue[];
  onChange: (item: FormItemJsonDefinition) => void;
  onEditLinked: (chain: string[]) => void;
  onRemove: () => void;
  onClose: () => void;
};

// Field types that are part of Aselo itself; only their label can be edited here
const SPECIAL_TYPES = ['file-upload', 'button', 'copy-to', 'custom-contact-component', 'search-input', 'radio-input'];

export const FieldSettings = ({
  tab,
  helplineLanguage,
  onChangeTranslation,
  item,
  originalItem,
  otherNames,
  draftFiles,
  formItems,
  staffMode,
  blankOptionValue,
  issues,
  onChange,
  onEditLinked,
  onRemove,
  onClose,
}: Props) => {
  const isNew = !originalItem;
  const type = item.type as FieldType;
  const isProtected = isProtectedField(tab, item.name);
  const isSpecial = SPECIAL_TYPES.includes(type);
  const usesSharedOptions = 'optionsReferenceKey' in item;
  const linkedChains = findChainsThroughField(formItems, item.name);
  const isLinked = linkedChains.length > 0;
  // The top dropdown of a linked set has its answers edited together with the levels below
  const isLinkedTop = isLinked && linkedChains[0][0] === item.name;
  const labelOf = (name: string) => {
    const field = formItems.find((other) => other.name === name);
    return field?.label || name;
  };
  // Switching a linked dropdown to another kind would break the link
  const allowedTypes = isLinked ? [type] : getAllowedTypeSwitches(item, { isNew, staffMode });
  const references = isNew ? [] : findFieldReferences(draftFiles, tab, item.name);

  // A new field's saved name follows its label, until someone sets the name by hand
  const autoName = (label: string) => uniqueFieldName(toFieldName(label), otherNames);
  const nameFollowsLabel = isNew && item.name === autoName(item.label);

  const changeLabel = (label: string) =>
    onChange(updateField(item, nameFollowsLabel ? { label, name: autoName(label) } : { label }));

  const changeName = (name: string) => onChange(updateField(item, { name: name.trim() }));

  /**
   * The help box (description) shows under the field. Its parts can be translation keys (as in
   * AS); those are shown in the helpline's language and edited in its own wording, the rest is
   * text in the form. Emptying both parts of a box written in the form removes it.
   */
  const strings = useStrings(helplineLanguage ?? 'en-US', draftFiles);
  const description = item.description as { title?: string; content?: string } | undefined;
  // Until the translations load, a key can't be told from text, so editing waits for them
  const stringsLoaded = Object.keys(strings).length > 0;
  const isKey = (text?: string) => Boolean(text) && text! in strings;
  const shownDescription = {
    title: translate(strings, description?.title ?? ''),
    content: translate(strings, description?.content ?? ''),
  };
  const changeDescription = (part: 'title' | 'content', text: string) => {
    const stored = description?.[part];
    if (isKey(stored)) {
      onChangeTranslation(stored!, text);
      return;
    }
    const next = { title: description?.title ?? '', content: description?.content ?? '', [part]: text };
    onChange(
      updateField(item, { description: next.title.trim() || next.content.trim() ? next : undefined }),
    );
  };

  const confirmRemove = () => {
    if (isNew) {
      onRemove();
      return;
    }
    const lines = [
      `Remove “${item.label || item.name}” from ${tab.title}?`,
      '',
      'Answers already saved in this field will no longer be shown on contacts.',
    ];
    if (references.length > 0) {
      lines.push('', 'This field is also used by:', ...references.map((ref) => `• ${ref}`));
    }
    if (window.confirm(lines.join('\n'))) onRemove();
  };

  return (
    <div className="field-settings">
      <div className="field-settings-header">
        <h3>{isNew ? 'New field' : 'Field settings'}</h3>
        <button type="button" className="link-button" onClick={onClose}>
          Close
        </button>
      </div>

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
          value={item.label}
          placeholder="What counselors will see"
          onChange={(e) => changeLabel(e.target.value)}
        />
      </label>

      <div className="field">
        <span className="field-label">Help box under the field (optional)</span>
        <input
          type="text"
          aria-label="Help box title"
          placeholder="Title, e.g. How to ask"
          value={shownDescription.title}
          disabled={!stringsLoaded}
          onChange={(e) => changeDescription('title', e.target.value)}
        />
        <textarea
          rows={3}
          aria-label="Help box text"
          placeholder="Guidance for counselors about this question"
          value={shownDescription.content}
          disabled={!stringsLoaded}
          onChange={(e) => changeDescription('content', e.target.value)}
        />
        <span className="field-hint">
          Counselors see it in a yellow box under the field; long text shows two lines with “see
          more”.
        </span>
      </div>

      <label className="field">
        <span className="field-label">Kind of answer</span>
        {allowedTypes.length > 1 ? (
          <select
            value={type}
            onChange={(e) =>
              onChange(changeFieldType(item, e.target.value as FieldType, blankOptionValue))
            }
          >
            {allowedTypes.map((allowedType) => (
              <option key={allowedType} value={allowedType}>
                {FIELD_TYPE_INFO[allowedType].label}
              </option>
            ))}
          </select>
        ) : (
          <span className="read-only-value">{FIELD_TYPE_INFO[type]?.label ?? type}</span>
        )}
        {allowedTypes.length === 1 && !isNew && !isSpecial && !isLinked && (
          <span className="field-hint">
            This field already has saved answers, so its kind can only be changed by Aselo staff.
          </span>
        )}
      </label>

      {isLinked && (
        <div className="linked-section">
          <span className="field-label">Linked dropdowns</span>
          {linkedChains.map((chain) => (
            <div key={chain.join('>')} className="linked-chain">
              <span>{chain.map(labelOf).join(' → ')}</span>
              <button
                type="button"
                className="secondary-button"
                onClick={() => onEditLinked(chain)}
              >
                Edit answers
              </button>
            </div>
          ))}
        </div>
      )}

      {isSpecial ? (
        <p className="field-hint">
          This is a special Aselo field. Only its question can be changed here.
        </p>
      ) : (
        <>
          <label className="field field-checkbox">
            <input
              type="checkbox"
              checked={isFieldRequired(item)}
              onChange={(e) => onChange(setFieldRequired(item, e.target.checked))}
            />
            <span>Counselors must answer this</span>
          </label>


          {isChoiceType(type) && !usesSharedOptions && !isLinkedTop && 'options' in item && (
            <div className="field">
              <span className="field-label">Answers</span>
              <OptionsEditor
                options={item.options as SelectOption[]}
                originalValues={
                  new Set(
                    ((originalItem && 'options' in originalItem
                      ? originalItem.options
                      : []) as SelectOption[]).map((option) => String(option.value)),
                  )
                }
                staffMode={staffMode}
                onChange={(options) => onChange(updateField(item, { options }))}
              />
            </div>
          )}

          {usesSharedOptions && !isLinked && (
            <p className="field-hint">
              This field's answers come from a list shared with other fields. Ask Aselo staff to
              change them.
            </p>
          )}
        </>
      )}

      <label className="field field-checkbox">
        <input
          type="checkbox"
          checked={Boolean(item.isPII)}
          disabled={!isNew && !staffMode}
          onChange={(e) => onChange(updateField(item, { isPII: e.target.checked }))}
        />
        <span>
          Could the answer identify someone? (for example a name, phone number or address)
        </span>
      </label>
      {!isNew && !staffMode && (
        <p className="field-hint">
          Changing this affects how answers already saved are protected, so only Aselo staff can
          change it.
        </p>
      )}

      {staffMode && (
        <details className="staff-section" open={isNew}>
          <summary>Aselo staff settings</summary>
          <label className="field">
            <span className="field-label">Saved as (field name)</span>
            {isNew ? (
              <input type="text" value={item.name} onChange={(e) => changeName(e.target.value)} />
            ) : (
              <span className="read-only-value">
                <code>{item.name}</code>
              </span>
            )}
            <span className="field-hint">
              {isNew
                ? 'Generated from the question. It can’t be changed once the field has been applied, because saved contacts use it.'
                : 'Locked: saved contacts and reports use this name.'}
            </span>
          </label>
        </details>
      )}

      {references.length > 0 && (
        <div className="references">
          <span className="field-label">This field is also used by</span>
          <ul>
            {references.map((reference) => (
              <li key={reference}>{reference}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="field-settings-footer">
        <button
          type="button"
          className="danger-button"
          onClick={confirmRemove}
          disabled={isProtected}
        >
          Remove this field
        </button>
        {isProtected && (
          <span className="field-hint">Aselo needs this field, so it can't be removed.</span>
        )}
      </div>
    </div>
  );
};
