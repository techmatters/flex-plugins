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

import { useEffect } from 'react';
import { isSignInEnabled, signOut } from './auth';
import { useAppDispatch, useAppSelector } from './store';
import { loadSession, selectIsAseloStaff, selectUser, viewAsHelplineStaffSet } from './sessionSlice';
import { HelplineWorkspace } from '../workspace/HelplineWorkspace';
import { openHelpline, selectWorkspace } from '../workspace/workspaceSlice';
import { DraftsList } from '../drafts/DraftsList';

export const App = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAseloStaff = useAppSelector(selectIsAseloStaff);
  const { helplines, viewAsHelplineStaff, error: sessionError } = useAppSelector(state => state.session);
  const { code, version, definitions, loading, error: helplineError } = useAppSelector(selectWorkspace);
  const error = sessionError ?? helplineError;

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  const selectHelpline = (newCode: string, newVersion?: string) => {
    const versions = helplines.find(helpline => helpline.code === newCode)?.versions ?? [];
    dispatch(openHelpline(newCode, newVersion ?? versions[0] ?? ''));
  };
  const versions = helplines.find(helpline => helpline.code === code)?.versions ?? [];

  return (
    <div className="app">
      <header className="top-bar">
        <h1>Aselo Form Builder</h1>
        <label>
          Helpline
          <select value={code} onChange={e => selectHelpline(e.target.value)}>
            <option value="">Choose a helpline…</option>
            {helplines.map(helpline => (
              <option key={helpline.code} value={helpline.code}>
                {helpline.code.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        {versions.length > 1 && (
          <label>
            Version
            <select value={version} onChange={e => selectHelpline(code, e.target.value)}>
              {versions.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        )}
        <span className="top-bar-user">
          {user && (
            <>
              {user.name} · {isAseloStaff ? 'Aselo staff' : 'Helpline staff'}
              {isSignInEnabled() && (
                <>
                  {' · '}
                  <button type="button" className="link-button" onClick={signOut}>
                    Sign out
                  </button>
                </>
              )}
            </>
          )}
        </span>
        {isAseloStaff && (
          <label className="staff-toggle" title="See and use the app as helpline staff do">
            <input
              type="checkbox"
              checked={viewAsHelplineStaff}
              onChange={e => dispatch(viewAsHelplineStaffSet(e.target.checked))}
            />
            View as helpline staff
          </label>
        )}
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {!code && !error && (
        <main className="empty-state">
          <p>Choose a helpline to see and edit its forms.</p>
          {user && <DraftsList />}
        </main>
      )}

      {loading && <main className="empty-state">Loading forms…</main>}

      {definitions && user && (
        // Reloading starts it again (the workspace slice's editorRevision restarts the editors)
        <HelplineWorkspace key={`${definitions.code}/${definitions.version}`} />
      )}
    </div>
  );
};
