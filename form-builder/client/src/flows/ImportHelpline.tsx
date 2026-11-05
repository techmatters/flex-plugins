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
 * Import a live helpline (Aselo staff): read its Studio flows from twilio-iac on master (or another
 * branch, e.g. the one its changes are being made in), show what
 * was found and what needs a person, then create a board per Studio flow (as in Studio) and copy
 * its recordings into the recordings bucket (staging's into staging, production's into production).
 */
import { useCallback } from 'react';
import type { ImportedFlow } from '@tech-matters/form-builder-shared';

import { BranchPicker, ImportedFrom } from '../common/BranchPicker';
import { useAppDispatch, useAppSelector } from '../app/store';
import {
  createImportedBoards,
  fetchImportBranches,
  importFlowsSelected,
  importFlowToggled,
  importOptionsChanged,
  importSourceChosen,
  openBoard,
  previewImport,
  selectFlows,
  selectHelplineCodes,
  selectImportChoice,
} from './flowsSlice';

// The flow's channels that aren't in all of its environments, e.g. "chat: staging only"
const onlyIn = (flow: ImportedFlow) =>
  Object.entries(flow.channelEnvironments)
    .filter(([, environments]) => environments.length < flow.environments.length)
    .map(([channel, [environment]]) => `${channel}: ${environment} only`);

// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
export const ImportHelpline = () => {
  const dispatch = useAppDispatch();
  const helplineCodes = useAppSelector(selectHelplineCodes);
  const { code, branch, preview, error, working, copyRecordings, standardNames, copying, selected, created } =
    useAppSelector(selectFlows).importer;
  const { chosenBoards, chosenRecordings } = useAppSelector(selectImportChoice);
  // The branches to import from (for the picker, which reads them itself)
  const loadBranches = useCallback(() => dispatch(fetchImportBranches()), [dispatch]);
  const onOpen = (boardCode: string, id: string) => dispatch(openBoard({ code: boardCode, id }));

  const environmentsOf = (environment: string) =>
    chosenRecordings.filter(recording => recording.environment === environment).length;

  return (
    <section className="flows-import">
      <h3>Import a live helpline</h3>
      <p className="field-hint">
        Builds a board for each of a helpline&apos;s Studio flows on master, or the branch chosen (its templates, the
        texts in its staging and production settings), and copies its recordings into the recordings bucket. Nothing in
        Twilio or the repo changes.
      </p>
      <div className="flows-import-pick">
        <select
          value={code}
          aria-label="Helpline to import"
          onChange={e => dispatch(importSourceChosen({ code: e.target.value }))}
        >
          <option value="">Choose a helpline…</option>
          {helplineCodes.map(candidate => (
            <option key={candidate} value={candidate}>
              {candidate.toUpperCase()}
            </option>
          ))}
        </select>
        <BranchPicker
          load={loadBranches}
          value={branch}
          onChange={next => dispatch(importSourceChosen({ branch: next }))}
        />
        <button
          type="button"
          className="secondary-button"
          disabled={!code || working}
          onClick={() => dispatch(previewImport())}
        >
          {working && !preview ? 'Reading…' : 'Preview'}
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      {preview && (
        <div className="flows-import-preview" role="region" aria-label="Import preview">
          <h4>Studio flows found</h4>
          <ImportedFrom source={preview.source} />
          <p className="field-hint">Each one becomes its own board. Untick the ones you don&apos;t want.</p>
          <ul className="flows-import-flows">
            {preview.report.flows.map((flow, index) => (
              <li key={`${flow.name}-${index}`}>
                <label className="field-checkbox">
                  <input
                    type="checkbox"
                    checked={selected.includes(index)}
                    disabled={Boolean(created)}
                    onChange={() => dispatch(importFlowToggled(index))}
                  />
                  <span>
                    {flow.channels.length > 0 ? (
                      <>
                        <span className="flow-import-channels">[{flow.channels.join(', ')}]</span>
                        {' · '}
                        <strong className="flow-import-name">{flow.name}</strong>
                      </>
                    ) : (
                      <strong className="flow-import-name">{flow.name}</strong>
                    )}
                    : {flow.widgets} widgets{' '}
                    {flow.environments.map(environment => (
                      <span key={environment} className={`flow-env-badge ${environment}`}>
                        {environment === 'staging' ? 'Staging' : 'Production'}
                      </span>
                    ))}{' '}
                    <span className="field-hint">({flow.template})</span>
                    {onlyIn(flow).length > 0 && (
                      <span className="field-hint flow-env-channels">{onlyIn(flow).join(' · ')}</span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {preview.boards.length > 1 && !created && (
            <div className="option-actions">
              <button
                type="button"
                className="link-button"
                onClick={() => dispatch(importFlowsSelected(preview.boards.map((_, index) => index)))}
              >
                All
              </button>
              <button type="button" className="link-button" onClick={() => dispatch(importFlowsSelected([]))}>
                None
              </button>
            </div>
          )}
          <p>
            {chosenRecordings.length === 0
              ? 'No recordings to copy.'
              : `${chosenRecordings.length} recordings to copy: ${environmentsOf(
                  'staging',
                )} for staging, ${environmentsOf('production')} for production.`}
          </p>
          {preview.report.notes.length > 0 && (
            <>
              <h4>To look at</h4>
              <ul className="flows-import-notes">
                {preview.report.notes.map(note => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </>
          )}

          {!created && (
            <div className="option-actions">
              {chosenRecordings.length > 0 && (
                <label className="field-checkbox">
                  <input
                    type="checkbox"
                    checked={copyRecordings}
                    onChange={e => dispatch(importOptionsChanged({ copyRecordings: e.target.checked }))}
                  />
                  <span>Copy the recordings</span>
                </label>
              )}
              {copyRecordings && chosenRecordings.some(recording => recording.widgets?.length) && (
                <label
                  className="field-checkbox"
                  title="Each copy is named after the widget that plays it, and the widgets play those. The Studio flows then need the Aselo recordings bucket as their recordings folder."
                >
                  <input
                    type="checkbox"
                    checked={standardNames}
                    onChange={e => dispatch(importOptionsChanged({ standardNames: e.target.checked }))}
                  />
                  <span>
                    Give recordings with older names the standard one (
                    {chosenRecordings.filter(recording => recording.widgets?.length).length} files)
                  </span>
                </label>
              )}
              <button
                type="button"
                className="primary-button"
                disabled={working || chosenBoards.length === 0}
                onClick={() => dispatch(createImportedBoards())}
              >
                {chosenBoards.length === 1 ? 'Create the board' : `Create the ${chosenBoards.length} boards`}
              </button>
            </div>
          )}
          {copying && (
            <p role="status">
              {copying.done < copying.total
                ? `Copying recordings… ${copying.done} of ${copying.total}`
                : `Copied ${copying.total - copying.failed.length} of ${copying.total} recordings.`}
            </p>
          )}
          {copying && copying.failed.length > 0 && (
            <div className="alert alert-error">
              Not copied:
              <ul>
                {copying.failed.map(failure => (
                  <li key={failure}>{failure}</li>
                ))}
              </ul>
            </div>
          )}
          {created && !working && (
            <>
              <h4>Boards made</h4>
              <ul className="flows-import-boards">
                {created.map(board => (
                  <li key={board.id}>
                    <button type="button" className="link-button" onClick={() => onOpen(board.code, board.id)}>
                      {board.title}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
};
