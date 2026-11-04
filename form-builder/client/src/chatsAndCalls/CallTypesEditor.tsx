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
 * Edits CallTypeButtons.json: the buttons on the "categorize this contact" screen. What's edited
 * and how lives in callTypesSlice.ts.
 *
 * - Buttons that open the form ("data") must be named child or caller; the plugin saves its
 *   own fixed call type for them, so their label can change freely. Having a "caller" button
 *   is what turns on the Caller tab.
 * - Buttons that close the contact without a form ("non-data") save their label as the
 *   contact's call type, so renaming an existing one splits reporting. That needs staff mode.
 */
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { selectDraftFiles, selectOriginalFiles } from '../drafts/draftSlice';
import { selectDefinitions, selectWorkspace, tryItOutOpened } from '../workspace/workspaceSlice';
import { getCallTypeButtons } from './sections';
import {
  addNonDataButtons,
  addPastedButtons,
  bulkTextChanged,
  openCallTypes,
  removeNonData,
  renameNonData,
  reorderNonData,
  selectCallTypes,
  setDataLabel,
  toggleCaller,
} from './callTypesSlice';
import { AseloCallTypeScreen } from '../aseloPreview/AseloCallTypeScreen';
import { useStrings } from '../aseloPreview/translations';
import { SortableRows } from '../common/SortableRows';
import '../aseloPreview/aselo.css';

export const CallTypesEditor = () => {
  const dispatch = useAppDispatch();
  const draftFiles = useAppSelector(selectDraftFiles);
  const originalFiles = useAppSelector(selectOriginalFiles);
  const staffMode = useAppSelector(selectActingAsStaff);
  const helplineLanguage = useAppSelector(selectDefinitions)?.helplineLanguage;
  const { editorRevision } = useAppSelector(selectWorkspace);
  const { nonDataRows, bulkText } = useAppSelector(selectCallTypes);
  const strings = useStrings(helplineLanguage ?? 'en-US', draftFiles);
  const buttons = getCallTypeButtons(draftFiles);
  const originalNames = useMemo(
    () => new Set(getCallTypeButtons(originalFiles).map((button) => button.name)),
    [originalFiles],
  );
  const dataButtons = buttons.filter((button) => button.category === 'data');
  const hasCaller = dataButtons.some((button) => button.name === 'caller');

  // Starts from the draft when it opens, and when the draft's files are replaced (discarded, reloaded)
  useEffect(() => {
    dispatch(openCallTypes());
  }, [dispatch, editorRevision]);

  const onToggleCaller = () => {
    if (
      hasCaller &&
      originalNames.has('caller') &&
      !window.confirm(
        'Remove the "someone calling about another person" button? Counselors will no longer see the Caller tab for new contacts.',
      )
    ) {
      return;
    }
    dispatch(toggleCaller());
  };

  const onRemoveNonData = (id: string) => {
    const row = nonDataRows.find((candidate) => candidate.id === id)!;
    if (
      originalNames.has(row.value.name) &&
      !window.confirm(
        `Remove “${row.value.label}”? Contacts already saved with it stay as they are; counselors just won't see the button anymore.`,
      )
    ) {
      return;
    }
    dispatch(removeNonData(id));
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
                onChange={(e) => dispatch(setDataLabel(button.name, e.target.value))}
              />
            </label>
          ))}
          <label className="field field-checkbox">
            <input type="checkbox" checked={hasCaller} onChange={onToggleCaller} />
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
            rows={nonDataRows}
            labelOf={(button) => button.label}
            onReorder={(rows) => dispatch(reorderNonData(rows))}
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
                    onChange={(e) => dispatch(renameNonData(row.id, e.target.value))}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove ${row.value.label}`}
                    onClick={() => onRemoveNonData(row.id)}
                  >
                    ×
                  </button>
                </div>
              );
            }}
          />
          {bulkText === undefined ? (
            <div className="option-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => dispatch(addNonDataButtons(['New button']))}
              >
                + Add a button
              </button>
              <button type="button" className="link-button" onClick={() => dispatch(bulkTextChanged(''))}>
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
                onChange={(e) => dispatch(bulkTextChanged(e.target.value))}
              />
              <div className="option-actions">
                <button type="button" className="secondary-button" onClick={() => dispatch(addPastedButtons())}>
                  Add these
                </button>
                <button type="button" className="link-button" onClick={() => dispatch(bulkTextChanged(undefined))}>
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
          <button
            type="button"
            className="secondary-button"
            onClick={() => dispatch(tryItOutOpened({ focus: 'callTypes' }))}
          >
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
