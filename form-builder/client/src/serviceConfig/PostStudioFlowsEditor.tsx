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
 * The post-call surveys (attributes.postStudioFlows): which Studio flow runs for each queue, and
 * how it's started, picked from the helpline's queues and its post_call_survey_* flows
 * (postStudioFlows.ts; its state and changes: postStudioFlowsSlice.ts).
 */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectDraftFiles } from '../drafts/draftSlice';
import { selectDefinitions } from '../workspace/workspaceSlice';
import {
  CHANNEL_KEYS,
  entryWarnings,
  FILE_OF,
  FLOW_TRIGGERS,
  flowOptionLabel,
  flowRef,
  keyOf,
  postStudioFlowEntries,
  queueLabel,
  queueRef,
  Where,
  WHERE_LABELS,
} from './postStudioFlows';
import {
  addPostStudioFlow,
  newSurveyChanged,
  openPostStudioFlows,
  selectPostStudioFlows,
  setPostStudioFlow,
} from './postStudioFlowsSlice';

export const PostStudioFlowsEditor = () => {
  const dispatch = useAppDispatch();
  const code = useAppSelector(selectDefinitions)?.code ?? '';
  const draftFiles = useAppSelector(selectDraftFiles);
  const { choices, loadError, queue, flowTrigger, flow, where, error } = useAppSelector(selectPostStudioFlows);

  // The helpline's queues and flows, loaded when it shows
  useEffect(() => {
    dispatch(openPostStudioFlows());
  }, [code, dispatch]);

  const entries = postStudioFlowEntries(draftFiles);
  const write = (file: Parameters<typeof setPostStudioFlow>[0], queueKey: string, value: unknown) =>
    dispatch(setPostStudioFlow(file, queueKey, value));

  const triggerHint = FLOW_TRIGGERS.find(trigger => trigger.value === flowTrigger)?.hint;
  const flowChoices = choices?.flows ?? [];

  return (
    <section className="config-post-flows" aria-label="Post-call surveys">
      <h3>Post-call surveys (postStudioFlows)</h3>
      <p className="field-hint">
        The Studio flow that runs after a contact, per queue. Flows are the helpline’s post_call_survey_* Studio flows;
        placeholders become each environment’s SIDs when the service configuration is applied.
      </p>
      {loadError && <p className="issue issue-warning">Couldn’t load the queues and flows: {loadError}</p>}

      {entries.length > 0 ? (
        <table className="config-table config-post-flows-table">
          <thead>
            <tr>
              <th>Queue</th>
              <th>When</th>
              <th>Survey flow</th>
              <th>Where</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => {
              const label = `${queueLabel(entry.queue, choices)} in ${entry.file}.json`;
              const flowKey = keyOf(entry.studioFlowSid, 'studio_flow_sids');
              const warnings = entryWarnings(entry, choices);
              return (
                <tr key={`${entry.file}:${entry.queue}`}>
                  <td>
                    {queueLabel(entry.queue, choices)}
                    {warnings.map(warning => (
                      <span key={warning} className="field-hint config-post-flows-warning">
                        {warning}
                      </span>
                    ))}
                  </td>
                  <td>
                    <select
                      aria-label={`When, for ${label}`}
                      value={entry.flowTrigger}
                      onChange={e =>
                        write(entry.file, entry.queue, {
                          flowTrigger: e.target.value,
                          studioFlowSid: entry.studioFlowSid,
                        })
                      }
                    >
                      {!FLOW_TRIGGERS.some(trigger => trigger.value === entry.flowTrigger) && (
                        <option value={entry.flowTrigger}>{entry.flowTrigger || '(not set)'}</option>
                      )}
                      {FLOW_TRIGGERS.map(trigger => (
                        <option key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {flowKey || flowChoices.length > 0 ? (
                      <select
                        aria-label={`Survey flow, for ${label}`}
                        value={entry.studioFlowSid}
                        onChange={e =>
                          write(entry.file, entry.queue, {
                            flowTrigger: entry.flowTrigger,
                            studioFlowSid: e.target.value,
                          })
                        }
                      >
                        {!flowChoices.some(candidate => flowRef(candidate.key) === entry.studioFlowSid) && (
                          <option value={entry.studioFlowSid}>{flowKey ?? entry.studioFlowSid}</option>
                        )}
                        {flowChoices.map(candidate => (
                          <option key={candidate.key} value={flowRef(candidate.key)}>
                            {flowOptionLabel(candidate)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <code>{entry.studioFlowSid}</code>
                    )}
                  </td>
                  <td>{entry.file === 'common' ? 'Staging and production' : `${entry.file} only`}</td>
                  <td>
                    <button
                      type="button"
                      className="link-button"
                      aria-label={`Remove ${label}`}
                      onClick={() => write(entry.file, entry.queue, undefined)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="muted">No post-call surveys yet.</p>
      )}

      <div className="config-add-fields">
        <label className="field">
          <span className="field-label">Queue</span>
          <select
            aria-label="Survey queue"
            value={queue}
            onChange={e => dispatch(newSurveyChanged({ queue: e.target.value }))}
          >
            <option value="">Choose…</option>
            {(choices?.queues ?? []).map(candidate => (
              <option key={candidate.key} value={queueRef(candidate.key)}>
                {candidate.name && candidate.name !== candidate.key
                  ? `${candidate.name} (${candidate.key})`
                  : candidate.key}
                {candidate.environments.length === 0 ? ' · routing design only' : ''}
              </option>
            ))}
            {CHANNEL_KEYS.map(channel => (
              <option key={channel.key} value={channel.key}>
                {channel.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">When</span>
          <select
            aria-label="Survey trigger"
            value={flowTrigger}
            onChange={e => dispatch(newSurveyChanged({ flowTrigger: e.target.value }))}
          >
            {FLOW_TRIGGERS.map(trigger => (
              <option key={trigger.value} value={trigger.value}>
                {trigger.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Survey flow</span>
          <select
            aria-label="Survey flow"
            value={flow}
            onChange={e => dispatch(newSurveyChanged({ flow: e.target.value }))}
          >
            <option value="">{flowChoices.length > 0 ? 'Choose…' : 'No post_call_survey_* flows'}</option>
            {flowChoices.map(candidate => (
              <option key={candidate.key} value={candidate.key}>
                {flowOptionLabel(candidate)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Where</span>
          <select
            aria-label="Survey environments"
            value={where}
            onChange={e => dispatch(newSurveyChanged({ where: e.target.value as Where }))}
          >
            {(Object.keys(WHERE_LABELS) as Where[]).map(key => (
              <option key={key} value={key}>
                {WHERE_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="secondary-button" onClick={() => dispatch(addPostStudioFlow())}>
          Add survey
        </button>
      </div>
      {triggerHint && <p className="field-hint">{triggerHint}</p>}
      {queue &&
        flow &&
        entryWarnings({ file: FILE_OF[where], queue, studioFlowSid: flowRef(flow) }, choices).map(warning => (
          <p key={warning} className="issue issue-warning">
            {warning} Add it there (or choose another environment) before applying.
          </p>
        ))}
      {error && <p className="issue-error-text">{error}</p>}
    </section>
  );
};
