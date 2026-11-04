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
 * Edits CannedResponses.json: ready-made messages counselors pick from a dropdown above the
 * chat message box. The dropdown only shows when the helpline's enable_canned_responses
 * feature flag is on. What's edited and how lives in cannedResponsesSlice.ts.
 */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectDraftFiles } from '../drafts/draftSlice';
import { selectDefinitions, selectWorkspace, tryItOutOpened } from '../workspace/workspaceSlice';
import { getFeatures } from '../serviceConfig/helplineFeatures';
import {
  addPastedResponses,
  addResponse,
  openCannedResponses,
  pasteTextChanged,
  previewMessageChanged,
  removeResponse,
  reorderResponses,
  selectCannedResponses,
  updateResponse,
} from './cannedResponsesSlice';
import { translate, useStrings } from '../aseloPreview/translations';
import { SortableRows } from '../common/SortableRows';
import '../aseloPreview/aselo.css';
import '../aseloPreview/flexDesktop.css';

export const CannedResponsesEditor = () => {
  const dispatch = useAppDispatch();
  const draftFiles = useAppSelector(selectDraftFiles);
  const definitions = useAppSelector(selectDefinitions);
  const { editorRevision } = useAppSelector(selectWorkspace);
  const { rows, pasteText, previewMessage } = useAppSelector(selectCannedResponses);
  const strings = useStrings(definitions?.helplineLanguage ?? 'en-US', draftFiles);
  // The feature as the draft sets it, or the helpline's flag
  const enabled =
    getFeatures(draftFiles, definitions?.serviceConfigDefaults)?.enableCannedResponses ??
    definitions?.featureFlags?.enable_canned_responses !== false;

  // Starts from the draft when it opens, and when the draft's files are replaced (discarded, reloaded)
  useEffect(() => {
    dispatch(openCannedResponses());
  }, [dispatch, editorRevision]);

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>Canned responses</h2>
          <p className="muted">
            Ready-made messages counselors can pick in a chat, then edit before sending.
          </p>
          {!enabled && (
            <p className="issue issue-warning">
              Canned responses are switched off for this helpline, so counselors don't see them
              yet. Ask Aselo staff to turn on <code>enable_canned_responses</code>.
            </p>
          )}

          <SortableRows
            rows={rows}
            labelOf={(response) => response.label}
            onReorder={(next) => dispatch(reorderResponses(next))}
            renderRow={(row) => (
              <div className="canned-response-row">
                <div className="row-inline">
                  <input
                    type="text"
                    value={row.value.label}
                    placeholder="Name shown in the list"
                    aria-label="Name"
                    onChange={(e) => dispatch(updateResponse(row.id, { label: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove ${row.value.label}`}
                    onClick={() => dispatch(removeResponse(row.id))}
                  >
                    ×
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={row.value.text}
                  placeholder="The message counselors will send"
                  aria-label="Message"
                  onChange={(e) => dispatch(updateResponse(row.id, { text: e.target.value }))}
                />
              </div>
            )}
          />

          {pasteText === undefined ? (
            <div className="option-actions">
              <button type="button" className="secondary-button" onClick={() => dispatch(addResponse())}>
                + Add a response
              </button>
              <button type="button" className="link-button" onClick={() => dispatch(pasteTextChanged(''))}>
                Paste from a spreadsheet
              </button>
            </div>
          ) : (
            <div className="bulk-add">
              <label className="field">
                <span className="field-label">
                  Copy two columns from Excel or Google Sheets (name, then message) and paste them
                  here
                </span>
                <textarea
                  rows={6}
                  value={pasteText}
                  autoFocus
                  onChange={(e) => dispatch(pasteTextChanged(e.target.value))}
                  placeholder={'Greeting\tHi, thanks for reaching out.'}
                />
              </label>
              <div className="option-actions">
                <button type="button" className="secondary-button" onClick={() => dispatch(addPastedResponses())}>
                  Add these responses
                </button>
                <button type="button" className="link-button" onClick={() => dispatch(pasteTextChanged(undefined))}>
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
            onClick={() => dispatch(tryItOutOpened({ focus: 'cannedResponses' }))}
          >
            Try it out in Aselo
          </button>
        </div>
        <div className="aselo section-preview-frame flex-desktop">
          <div className="flex-canned-responses">
            <span className="aselo-select-wrapper aselo-select-full">
              <select
                className="aselo-select aselo-select-full"
                aria-label={translate(strings, 'CannedResponses')}
                value=""
                onChange={(e) => dispatch(previewMessageChanged(e.target.value))}
              >
                <option value="" disabled>
                  {translate(strings, 'CannedResponses')}
                </option>
                {rows.map((row) => (
                  <option key={row.id} value={row.value.text}>
                    {row.value.label}
                  </option>
                ))}
              </select>
            </span>
          </div>
          <div className="flex-message-input">
            {previewMessage ? (
              <span className="flex-message-draft">{previewMessage}</span>
            ) : (
              <span className="flex-message-placeholder">Type message</span>
            )}
            <span className="flex-send-button">Send</span>
          </div>
          <p className="field-hint section-preview-hint">
            Pick a response to see it land in the message box.
          </p>
        </div>
      </aside>
    </div>
  );
};
