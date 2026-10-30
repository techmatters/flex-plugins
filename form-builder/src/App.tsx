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

import { useEffect, useState } from 'react';
import type { DefinitionFiles, HelplineSummary } from '../server/definitionsApi';
import type { Me } from '../server/api';
import { fetchDefinitionFiles, fetchHelplines } from './api';
import { isSignInEnabled, signOut } from './auth';
import { DraftClient, httpDraftClient } from './draftClient';
import { HelplineWorkspace } from './components/HelplineWorkspace';
import { DraftsList } from './components/DraftsList';

type Props = {
  draftClient?: DraftClient;
};

export const App = ({ draftClient = httpDraftClient }: Props) => {
  const [user, setUser] = useState<Me>();
  const [helplines, setHelplines] = useState<HelplineSummary[]>([]);
  const [code, setCode] = useState('');
  const [version, setVersion] = useState('');
  const [definitions, setDefinitions] = useState<DefinitionFiles>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  // Bumped to load the helpline again (after applying, or when someone else changed the draft)
  const [reloadCount, setReloadCount] = useState(0);
  // Aselo staff can see the app as helpline staff do
  const [viewAsHelplineStaff, setViewAsHelplineStaff] = useState(false);

  const isAseloStaff = user?.role === 'aselo-staff';
  const actingAsStaff = isAseloStaff && !viewAsHelplineStaff;

  const selectHelpline = (newCode: string, newVersion?: string) => {
    setCode(newCode);
    const versions = helplines.find((helpline) => helpline.code === newCode)?.versions ?? [];
    setVersion(newVersion ?? versions[0] ?? '');
  };

  useEffect(() => {
    Promise.all([draftClient.me(), fetchHelplines()])
      .then(([me, loadedHelplines]) => {
        setUser(me);
        setHelplines(loadedHelplines);
        // Allow linking straight to a helpline, e.g. ?helpline=usnm
        const linkedCode = new URLSearchParams(window.location.search).get('helpline');
        const linked = loadedHelplines.find((helpline) => helpline.code === linkedCode);
        if (linked) {
          setCode(linked.code);
          setVersion(linked.versions[0]);
        }
      })
      .catch((err: Error) => setError(err.message));
  }, [draftClient]);

  useEffect(() => {
    if (!code || !version) return;
    setLoading(true);
    setError(undefined);
    setDefinitions(undefined);
    fetchDefinitionFiles(code, version)
      .then(setDefinitions)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [code, version, reloadCount]);

  const versions = helplines.find((helpline) => helpline.code === code)?.versions ?? [];

  return (
    <div className="app">
      <header className="top-bar">
        <h1>Aselo Form Builder</h1>
        <label>
          Helpline
          <select value={code} onChange={(e) => selectHelpline(e.target.value)}>
            <option value="">Choose a helpline…</option>
            {helplines.map((helpline) => (
              <option key={helpline.code} value={helpline.code}>
                {helpline.code.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        {versions.length > 1 && (
          <label>
            Version
            <select value={version} onChange={(e) => setVersion(e.target.value)}>
              {versions.map((v) => (
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
              onChange={(e) => setViewAsHelplineStaff(e.target.checked)}
            />
            View as helpline staff
          </label>
        )}
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {!code && !error && (
        <main className="empty-state">
          <p>Choose a helpline to see and edit its forms.</p>
          {user && (
            <DraftsList
              draftClient={draftClient}
              isAseloStaff={isAseloStaff}
              onOpen={(draftCode, draftVersion) => selectHelpline(draftCode, draftVersion)}
            />
          )}
        </main>
      )}

      {loading && <main className="empty-state">Loading forms…</main>}

      {definitions && user && (
        <HelplineWorkspace
          key={`${definitions.code}/${definitions.version}/${reloadCount}`}
          definitions={definitions}
          staffMode={actingAsStaff}
          canApply={actingAsStaff}
          applyInBuilder={user?.applyInBuilder !== false}
          draftClient={draftClient}
          onReload={() => setReloadCount((count) => count + 1)}
        />
      )}
    </div>
  );
};
