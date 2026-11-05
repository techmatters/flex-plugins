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
 * Import a helpline's forms (Aselo staff), from master or another flex-plugins branch, e.g. a
 * version that only exists there: each version imported is listed for its helpline ("AS v4", or
 * "AS v4 (branch)" read from that branch) for Aselo and the helpline's staff, until it's removed.
 */
import { useCallback, useEffect } from 'react';

import { BranchPicker } from '../common/BranchPicker';
import { useAppDispatch, useAppSelector } from '../app/store';
import {
  importChosen,
  importFormsClosed,
  importVersion,
  loadImportBranches,
  previewImport,
  selectImportForms,
} from './importFormsSlice';

export const ImportForms = () => {
  const dispatch = useAppDispatch();
  const helplineCodes = useAppSelector(state => state.session.helplines).map(helpline => helpline.code);
  const { code, branch, versions, imported, error, working } = useAppSelector(selectImportForms);
  // Stable, as BranchPicker loads the branches when it changes
  const loadBranches = useCallback(() => dispatch(loadImportBranches()), [dispatch]);

  // Left (e.g. a helpline opened): it starts again next time
  useEffect(
    () => () => {
      dispatch(importFormsClosed());
    },
    [dispatch],
  );

  return (
    <section className="flows-import" aria-label="Import forms">
      <h3>Import a helpline&apos;s forms</h3>
      <p className="field-hint">
        Adds a version of a helpline&apos;s forms to the list below, for you and the helpline&apos;s staff to work on:
        as it is on master, or in the branch chosen (e.g. a version that only exists there; its changes are downloaded
        and committed to that branch). Nothing in the repo changes.
      </p>
      <div className="flows-import-pick">
        <select
          value={code}
          aria-label="Helpline to import"
          onChange={e => dispatch(importChosen({ code: e.target.value }))}
        >
          <option value="">Choose a helpline…</option>
          {helplineCodes.map(candidate => (
            <option key={candidate} value={candidate}>
              {candidate.toUpperCase()}
            </option>
          ))}
        </select>
        <BranchPicker load={loadBranches} value={branch} onChange={next => dispatch(importChosen({ branch: next }))} />
        <button
          type="button"
          className="secondary-button"
          disabled={!code || working}
          onClick={() => dispatch(previewImport())}
        >
          {working && !versions ? 'Reading…' : 'Preview'}
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      {versions && (
        <div className="flows-import-preview" role="region" aria-label="Import preview">
          <h4>
            {code.toUpperCase()} in <code>{branch || 'master'}</code>
          </h4>
          <ul className="flows-import-flows">
            {versions.map(version => (
              <li key={version}>
                <strong>{version}</strong>{' '}
                {imported.includes(version) ? (
                  <span className="field-hint">Imported: it&apos;s in the list below.</span>
                ) : (
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={working}
                    onClick={() => dispatch(importVersion(version))}
                  >
                    Import
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
