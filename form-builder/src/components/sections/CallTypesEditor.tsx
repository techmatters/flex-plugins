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
 * Edits CallTypeButtons.json: the buttons on the "categorize this contact" screen.
 *
 * - Buttons that open the form ("data") must be named child or caller; the plugin saves its
 *   own fixed call type for them, so their label can change freely. Having a "caller" button
 *   is what turns on the Caller tab.
 * - Buttons that close the contact without a form ("non-data") save their label as the
 *   contact's call type, so renaming an existing one splits reporting. That needs staff mode.
 */
import { useMemo, useState } from 'react';
import type { CallTypeButtonsEntry } from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap } from '../../definitions';
import { toFieldName, uniqueFieldName } from '../../formEditing';
import { CALL_TYPE_BUTTONS_FILE, getCallTypeButtons } from '../../sections';
import { AseloCallTypeScreen } from '../../aselo/AseloCallTypeScreen';
import { useStrings } from '../../aselo/translations';
import { SortableRows, toRows, useRows } from './SortableRows';
import '../../aselo/aselo.css';

type Props = {
  draftFiles: DefinitionFileMap;
  originalFiles: DefinitionFileMap;
  staffMode: boolean;
  helplineLanguage?: string;
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
  onTryItOut: () => void;
};

const NEW_CALLER_LABEL = 'Someone calling about another person';

export const CallTypesEditor = ({
  draftFiles,
  originalFiles,
  staffMode,
  helplineLanguage,
  onChangeFiles,
  onTryItOut,
}: Props) => {
  const strings = useStrings(helplineLanguage ?? 'en-US', draftFiles);
  const buttons = getCallTypeButtons(draftFiles);
  const originalNames = useMemo(
    () => new Set(getCallTypeButtons(originalFiles).map((button) => button.name)),
    [originalFiles],
  );
  const dataButtons = buttons.filter((button) => button.category === 'data');
  const [bulkText, setBulkText] = useState<string>();

  const write = (data: CallTypeButtonsEntry[], nonData: CallTypeButtonsEntry[]) =>
    onChangeFiles((files) => ({ ...files, [CALL_TYPE_BUTTONS_FILE]: [...data, ...nonData] }));

  const nonData = useRows(
    buttons.filter((button) => button.category === 'non-data'),
    (values) => write(dataButtons, values),
  );

  const setDataLabel = (name: string, label: string) =>
    write(
      dataButtons.map((button) => (button.name === name ? { ...button, label } : button)),
      nonData.rows.map((row) => row.value),
    );

  const hasCaller = dataButtons.some((button) => button.name === 'caller');
  const toggleCaller = () => {
    const next = hasCaller
      ? dataButtons.filter((button) => button.name !== 'caller')
      : [
          ...dataButtons,
          { type: 'button' as const, name: 'caller', label: NEW_CALLER_LABEL, category: 'data' as const },
        ];
    if (
      hasCaller &&
      originalNames.has('caller') &&
      !window.confirm(
        'Remove the "someone calling about another person" button? Counselors will no longer see the Caller tab for new contacts.',
      )
    ) {
      return;
    }
    write(next, nonData.rows.map((row) => row.value));
  };

  const takenNames = () => [
    ...dataButtons.map((button) => button.name),
    ...nonData.rows.map((row) => row.value.name),
  ];

  const addNonData = (labels: string[]) => {
    const names = takenNames();
    const added = labels
      .map((label) => label.trim())
      .filter(Boolean)
      .map((label): CallTypeButtonsEntry => {
        const name = uniqueFieldName(toFieldName(label), names);
        names.push(name);
        return { type: 'button', name, label, category: 'non-data' };
      });
    nonData.commit([...nonData.rows, ...toRows(added)]);
  };

  const renameNonData = (id: string, label: string) =>
    nonData.commit(
      nonData.rows.map((row) => {
        if (row.id !== id) return row;
        const isNew = !originalNames.has(row.value.name);
        // A new button's name follows its label; an existing one keeps its name
        const others = takenNames().filter((name) => name !== row.value.name);
        const name = isNew ? uniqueFieldName(toFieldName(label), others) : row.value.name;
        return { ...row, value: { ...row.value, label, name } };
      }),
    );

  const removeNonData = (id: string) => {
    const row = nonData.rows.find((candidate) => candidate.id === id)!;
    if (
      originalNames.has(row.value.name) &&
      !window.confirm(
        `Remove “${row.value.label}”? Contacts already saved with it stay as they are; counselors just won't see the button anymore.`,
      )
    ) {
      return;
    }
    nonData.commit(nonData.rows.filter((candidate) => candidate.id !== id));
  };

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>Call types</h2>
          <p className="muted">
            The buttons counselors see before the contact form. They choose one to say what kind
            of contact this is.
          </p>

          <h3 className="section-heading">Buttons that open the contact form</h3>
          {dataButtons.map((button) => (
            <label key={button.name} className="field">
              <span className="field-label">
                {button.name === 'caller' ? 'Someone calling about another person' : 'Person calling about themselves'}
              </span>
              <input
                type="text"
                value={button.label}
                onChange={(e) => setDataLabel(button.name, e.target.value)}
              />
            </label>
          ))}
          <label className="field field-checkbox">
            <input type="checkbox" checked={hasCaller} onChange={toggleCaller} />
            <span>
              Also offer “someone calling about another person”. This adds the Caller tab to the
              contact form.
            </span>
          </label>

          <h3 className="section-heading">Buttons that close the contact without a form</h3>
          <p className="field-hint">
            For contacts like silent calls or wrong numbers. The contact is saved with the
            button's text, so existing buttons can only be renamed by Aselo staff.
          </p>
          <SortableRows
            rows={nonData.rows}
            labelOf={(button) => button.label}
            onReorder={nonData.commit}
            renderRow={(row) => {
              const locked = originalNames.has(row.value.name) && !staffMode;
              return (
                <div className="row-inline">
                  <input
                    type="text"
                    value={row.value.label}
                    disabled={locked}
                    aria-label="Button text"
                    title={locked ? 'Contacts are saved with this text, so only Aselo staff can rename it.' : undefined}
                    onChange={(e) => renameNonData(row.id, e.target.value)}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove ${row.value.label}`}
                    onClick={() => removeNonData(row.id)}
                  >
                    ×
                  </button>
                </div>
              );
            }}
          />
          {bulkText === undefined ? (
            <div className="option-actions">
              <button type="button" className="secondary-button" onClick={() => addNonData(['New button'])}>
                + Add a button
              </button>
              <button type="button" className="link-button" onClick={() => setBulkText('')}>
                Paste several at once
              </button>
            </div>
          ) : (
            <div className="bulk-add">
              <textarea
                rows={5}
                value={bulkText}
                autoFocus
                aria-label="Button texts, one per line"
                placeholder="One button per line"
                onChange={(e) => setBulkText(e.target.value)}
              />
              <div className="option-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    addNonData(bulkText.split('\n'));
                    setBulkText(undefined);
                  }}
                >
                  Add these
                </button>
                <button type="button" className="link-button" onClick={() => setBulkText(undefined)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="section-preview">
        <div className="section-preview-header">
          <span className="field-label">How it looks in Aselo</span>
          <button type="button" className="secondary-button" onClick={onTryItOut}>
            Try it out in Aselo
          </button>
        </div>
        <div className="aselo section-preview-frame">
          <div className="aselo-tab-content">
            <AseloCallTypeScreen
              buttons={buttons}
              strings={strings}
              taskType="chat"
              onDataCallType={() => {}}
            />
          </div>
        </div>
      </aside>
    </div>
  );
};
