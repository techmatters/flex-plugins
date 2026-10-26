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
import { fetchDefinitionFiles, fetchHelplines } from './api';
import { HelplineWorkspace } from './components/HelplineWorkspace';

const STAFF_MODE_KEY = 'form-builder:staff-mode';

const readStaffMode = () => {
  try {
    return window.localStorage.getItem(STAFF_MODE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const App = () => {
  const [helplines, setHelplines] = useState<HelplineSummary[]>([]);
  const [code, setCode] = useState('');
  const [version, setVersion] = useState('');
  const [definitions, setDefinitions] = useState<DefinitionFiles>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  // Temporary switch until Okta sign-in decides who is Aselo staff (Phase 4)
  const [staffMode, setStaffMode] = useState(readStaffMode);

  useEffect(() => {
    fetchHelplines()
      .then((loadedHelplines) => {
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
  }, []);

  useEffect(() => {
    if (!code || !version) return;
    setLoading(true);
    setError(undefined);
    setDefinitions(undefined);
    fetchDefinitionFiles(code, version)
      .then(setDefinitions)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [code, version]);

  const selectHelpline = (newCode: string) => {
    setCode(newCode);
    const versions = helplines.find((helpline) => helpline.code === newCode)?.versions ?? [];
    setVersion(versions[0] ?? '');
  };

  const toggleStaffMode = (enabled: boolean) => {
    setStaffMode(enabled);
    try {
      window.localStorage.setItem(STAFF_MODE_KEY, String(enabled));
    } catch {
      // Not remembered if storage is unavailable
    }
  };

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
        <label className="staff-toggle" title="Shows settings that affect saved data and reporting">
          <input
            type="checkbox"
            checked={staffMode}
            onChange={(e) => toggleStaffMode(e.target.checked)}
          />
          Aselo staff mode
        </label>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {!code && !error && (
        <main className="empty-state">
          <p>Choose a helpline to see and edit its forms.</p>
        </main>
      )}

      {loading && <main className="empty-state">Loading forms…</main>}

      {definitions && (
        <HelplineWorkspace
          key={`${definitions.code}/${definitions.version}`}
          definitions={definitions}
          staffMode={staffMode}
        />
      )}
    </div>
  );
};
