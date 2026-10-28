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
 * Import a live helpline (Aselo staff): read its Studio flows from twilio-iac on master, show what
 * was found and what needs a person, then create a board per Studio flow (as in Studio) and copy
 * its recordings into the recordings bucket (staging's into staging, production's into production).
 */
import { useState } from 'react';
import type { HelplineImport, ImportedFlow } from '../../server/flowImport';
import type { BoardClient } from './boardClient';

type Props = {
  client: BoardClient;
  helplineCodes: string[];
  onOpen: (code: string, id: string) => void;
};

type Copying = { done: number; total: number; failed: string[] };

// The flow's channels that aren't in all of its environments, e.g. "chat: staging only"
const onlyIn = (flow: ImportedFlow) =>
  Object.entries(flow.channelEnvironments)
    .filter(([, environments]) => environments.length < flow.environments.length)
    .map(([channel, [environment]]) => `${channel}: ${environment} only`);

export const ImportHelpline = ({ client, helplineCodes, onOpen }: Props) => {
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<HelplineImport>();
  const [error, setError] = useState<string>();
  const [working, setWorking] = useState(false);
  const [copyRecordings, setCopyRecordings] = useState(true);
  const [copying, setCopying] = useState<Copying>();
  // The boards made, one per Studio flow
  // The flows to import, by their place in the preview (all of them to start with)
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [created, setCreated] = useState<{ code: string; id: string; title: string }[]>();

  const load = async () => {
    setWorking(true);
    setError(undefined);
    setPreview(undefined);
    setCopying(undefined);
    setCreated(undefined);
    try {
      const found = await client.previewImport(code);
      setPreview(found);
      setSelected(new Set(found.boards.map((_, index) => index)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setWorking(false);
    }
  };

  const chosenBoards = preview?.boards.filter((_, index) => selected.has(index)) ?? [];
  // Only the recordings the chosen flows play
  const chosenFiles = new Set(chosenBoards.flatMap((board) => board.recordingFiles));
  const chosenRecordings = preview?.recordings.filter((recording) => chosenFiles.has(recording.fileName)) ?? [];

  const toggle = (index: number) => {
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelected(next);
  };

  const create = async () => {
    if (!preview || chosenBoards.length === 0) return;
    setWorking(true);
    setError(undefined);
    try {
      const boards = [];
      for (const { title, content } of chosenBoards) {
        const board = await client.create(code, title, undefined, content);
        boards.push({ code: board.code, id: board.id, title });
      }
      setCreated(boards);
      if (copyRecordings && chosenRecordings.length > 0) {
        const progress: Copying = { done: 0, total: chosenRecordings.length, failed: [] };
        setCopying({ ...progress });
        for (const recording of chosenRecordings) {
          try {
            await client.importRecording(code, recording);
          } catch (err) {
            progress.failed.push(`${recording.environment}/${recording.fileName}: ${(err as Error).message}`);
          }
          progress.done += 1;
          setCopying({ ...progress, failed: [...progress.failed] });
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setWorking(false);
    }
  };

  const environmentsOf = (environment: string) =>
    chosenRecordings.filter((recording) => recording.environment === environment).length;

  return (
    <section className="flows-import">
      <h3>Import a live helpline</h3>
      <p className="field-hint">
        Builds a board for each of a helpline&apos;s Studio flows on master (its templates, the texts in its staging and
        production settings), and copies its recordings into the recordings bucket. Nothing in Twilio or the repo
        changes.
      </p>
      <div className="flows-import-pick">
        <select value={code} aria-label="Helpline to import" onChange={(e) => setCode(e.target.value)}>
          <option value="">Choose a helpline…</option>
          {helplineCodes.map((candidate) => (
            <option key={candidate} value={candidate}>
              {candidate.toUpperCase()}
            </option>
          ))}
        </select>
        <button type="button" className="secondary-button" disabled={!code || working} onClick={load}>
          {working && !preview ? 'Reading…' : 'Preview'}
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      {preview && (
        <div className="flows-import-preview" role="region" aria-label="Import preview">
          <h4>Studio flows found</h4>
          <p className="field-hint">Each one becomes its own board. Untick the ones you don&apos;t want.</p>
          <ul className="flows-import-flows">
            {preview.report.flows.map((flow, index) => (
              <li key={flow.template}>
                <label className="field-checkbox">
                  <input
                    type="checkbox"
                    checked={selected.has(index)}
                    disabled={Boolean(created)}
                    onChange={() => toggle(index)}
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
                    {flow.environments.map((environment) => (
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
                onClick={() => setSelected(new Set(preview.boards.map((_, index) => index)))}
              >
                All
              </button>
              <button type="button" className="link-button" onClick={() => setSelected(new Set())}>
                None
              </button>
            </div>
          )}
          <p>
            {chosenRecordings.length === 0
              ? 'No recordings to copy.'
              : `${chosenRecordings.length} recordings to copy: ${environmentsOf('staging')} for staging, ${environmentsOf('production')} for production.`}
          </p>
          {preview.report.notes.length > 0 && (
            <>
              <h4>To look at</h4>
              <ul className="flows-import-notes">
                {preview.report.notes.map((note) => (
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
                    onChange={(e) => setCopyRecordings(e.target.checked)}
                  />
                  <span>Copy the recordings</span>
                </label>
              )}
              <button
                type="button"
                className="primary-button"
                disabled={working || chosenBoards.length === 0}
                onClick={create}
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
                {copying.failed.map((failure) => (
                  <li key={failure}>{failure}</li>
                ))}
              </ul>
            </div>
          )}
          {created && !working && (
            <>
              <h4>Boards made</h4>
              <ul className="flows-import-boards">
                {created.map((board) => (
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
