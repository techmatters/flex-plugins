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
 * how it's started, picked from the helpline's queues and its post_call_survey_* flows. Written as
 * USNM does it: ${task_queues.<key>} → { flowTrigger, studioFlowSid: ${studio_flow_sids.<key>} },
 * in common.json (both environments) or one environment's file.
 */
import { useEffect, useState } from 'react';
import type { DefinitionFileMap } from '../common/definitions';
import type { PostFlowChoices } from '@tech-matters/form-builder-shared';
import { getServiceConfigFile, isConfigObject, setServiceConfigValue } from './serviceConfig';
import type { ServiceConfigFileName } from '@tech-matters/form-builder-shared';

export const POST_STUDIO_FLOWS_KEYS = ['attributes', 'postStudioFlows'];

// What the Aselo lambdas (postStudioFlowTaskRouterListener) and the Flex plugin do with each
export const FLOW_TRIGGERS = [
  {
    value: 'inProgressCall',
    label: 'During the call (inProgressCall)',
    hint: 'Voice only. When the counselor leaves, the caller stays on the line and is sent into the survey.',
  },
  {
    value: 'rest',
    label: 'After the contact (rest)',
    hint: 'When the task ends, the flow is started through its REST API trigger, to the contact’s number (calls and messaging).',
  },
] as const;

// Besides queues: the lambdas fall back to the task channel (e.g. every voice task)
const CHANNEL_KEYS = [
  { key: 'voice', label: 'Any other voice task (voice channel)' },
  { key: 'chat', label: 'Any other chat task (chat channel)' },
];

type Where = 'both' | 'staging' | 'production';
const FILE_OF: Record<Where, ServiceConfigFileName> = { both: 'common', staging: 'staging', production: 'production' };
const WHERE_LABELS: Record<Where, string> = {
  both: 'Staging and production (common.json)',
  staging: 'Staging only (staging.json)',
  production: 'Production only (production.json)',
};
const FILES: ServiceConfigFileName[] = ['common', 'staging', 'production'];

const queueRef = (key: string) => `\${task_queues.${key}}`;
const flowRef = (key: string) => `\${studio_flow_sids.${key}}`;
const keyOf = (ref: string, kind: 'task_queues' | 'studio_flow_sids') =>
  ref.match(new RegExp(`^\\$\\{${kind}\\.([A-Za-z0-9_]+)\\}$`))?.[1];

type Entry = { file: ServiceConfigFileName; queue: string; flowTrigger: string; studioFlowSid: string };

export const postStudioFlowEntries = (files: DefinitionFileMap): Entry[] =>
  FILES.flatMap((file) => {
    const flows = getServiceConfigFile(files, file)?.attributes;
    const configured = isConfigObject(flows) ? flows.postStudioFlows : undefined;
    if (!isConfigObject(configured)) return [];
    return Object.entries(configured)
      .filter(([, value]) => isConfigObject(value))
      .map(([queue, value]) => {
        const settings = value as Record<string, unknown>;
        return {
          file,
          queue,
          flowTrigger: String(settings.flowTrigger ?? ''),
          studioFlowSid: String(settings.studioFlowSid ?? ''),
        };
      });
  });

// The environments a file reaches
const environmentsOf = (file: ServiceConfigFileName) =>
  file === 'common' ? (['staging', 'production'] as const) : file === 'development' ? [] : ([file] as const);

/**
 * Why an entry may not work where it's written: a queue or flow placeholder the environment's config
 * doesn't have (Terraform can't turn it into a SID there).
 */
export const entryWarnings = (entry: Pick<Entry, 'file' | 'queue' | 'studioFlowSid'>, choices?: PostFlowChoices) => {
  if (!choices) return [];
  const warnings: string[] = [];
  const queueKey = keyOf(entry.queue, 'task_queues');
  const flowKey = keyOf(entry.studioFlowSid, 'studio_flow_sids');
  environmentsOf(entry.file).forEach((environment) => {
    const queue = choices.queues.find((candidate) => candidate.key === queueKey);
    if (queueKey && !queue?.environments.includes(environment)) {
      warnings.push(`${environment}.hcl has no queue ${queueKey} yet.`);
    }
    const flow = choices.flows.find((candidate) => candidate.key === flowKey);
    if (flowKey && !flow?.environments.includes(environment)) {
      warnings.push(`${environment}.hcl has no ${flowKey} studio flow yet.`);
    }
  });
  return warnings;
};

const queueLabel = (ref: string, choices?: PostFlowChoices) => {
  const key = keyOf(ref, 'task_queues');
  if (!key) return CHANNEL_KEYS.find((channel) => channel.key === ref)?.label ?? ref;
  const name = choices?.queues.find((queue) => queue.key === key)?.name;
  return name && name !== key ? `${name} (${key})` : key;
};

const flowOptionLabel = (flow: PostFlowChoices['flows'][number]) => {
  if (flow.environments.length === 2) return flow.key;
  if (flow.environments.length === 1) return `${flow.key} (${flow.environments[0]} only)`;
  return `${flow.key} (on a board, not in the config yet)`;
};

type Props = {
  code: string;
  draftFiles: DefinitionFileMap;
  change: (updater: (files: DefinitionFileMap) => DefinitionFileMap) => void;
  loadChoices: (code: string) => Promise<PostFlowChoices>;
};

export const PostStudioFlowsEditor = ({ code, draftFiles, change, loadChoices }: Props) => {
  const [choices, setChoices] = useState<PostFlowChoices>();
  const [loadError, setLoadError] = useState<string>();
  const [queue, setQueue] = useState('');
  const [flowTrigger, setFlowTrigger] = useState<string>('rest');
  const [flow, setFlow] = useState('');
  const [where, setWhere] = useState<Where>('both');
  const [error, setError] = useState<string>();

  useEffect(() => {
    let current = true;
    loadChoices(code)
      .then((found) => current && setChoices(found))
      .catch((err: Error) => current && setLoadError(err.message));
    return () => {
      current = false;
    };
  }, [code, loadChoices]);

  const entries = postStudioFlowEntries(draftFiles);
  const write = (file: ServiceConfigFileName, queueKey: string, value: unknown) =>
    change((files) => setServiceConfigValue(files, file, [...POST_STUDIO_FLOWS_KEYS, queueKey], value));

  const add = () => {
    if (!queue || !flow) {
      setError('Choose a queue and a survey flow.');
      return;
    }
    const file = FILE_OF[where];
    if (entries.some((entry) => entry.file === file && entry.queue === queue)) {
      setError(`${file}.json already has a survey for ${queueLabel(queue, choices)}: change it in the list.`);
      return;
    }
    write(file, queue, { flowTrigger, studioFlowSid: flowRef(flow) });
    setQueue('');
    setError(undefined);
  };

  const triggerHint = FLOW_TRIGGERS.find((trigger) => trigger.value === flowTrigger)?.hint;
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
            {entries.map((entry) => {
              const label = `${queueLabel(entry.queue, choices)} in ${entry.file}.json`;
              const flowKey = keyOf(entry.studioFlowSid, 'studio_flow_sids');
              const warnings = entryWarnings(entry, choices);
              return (
                <tr key={`${entry.file}:${entry.queue}`}>
                  <td>
                    {queueLabel(entry.queue, choices)}
                    {warnings.map((warning) => (
                      <span key={warning} className="field-hint config-post-flows-warning">
                        {warning}
                      </span>
                    ))}
                  </td>
                  <td>
                    <select
                      aria-label={`When, for ${label}`}
                      value={entry.flowTrigger}
                      onChange={(e) =>
                        write(entry.file, entry.queue, {
                          flowTrigger: e.target.value,
                          studioFlowSid: entry.studioFlowSid,
                        })
                      }
                    >
                      {!FLOW_TRIGGERS.some((trigger) => trigger.value === entry.flowTrigger) && (
                        <option value={entry.flowTrigger}>{entry.flowTrigger || '(not set)'}</option>
                      )}
                      {FLOW_TRIGGERS.map((trigger) => (
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
                        onChange={(e) =>
                          write(entry.file, entry.queue, {
                            flowTrigger: entry.flowTrigger,
                            studioFlowSid: e.target.value,
                          })
                        }
                      >
                        {!flowChoices.some((candidate) => flowRef(candidate.key) === entry.studioFlowSid) && (
                          <option value={entry.studioFlowSid}>{flowKey ?? entry.studioFlowSid}</option>
                        )}
                        {flowChoices.map((candidate) => (
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
          <select aria-label="Survey queue" value={queue} onChange={(e) => setQueue(e.target.value)}>
            <option value="">Choose…</option>
            {(choices?.queues ?? []).map((candidate) => (
              <option key={candidate.key} value={queueRef(candidate.key)}>
                {candidate.name && candidate.name !== candidate.key
                  ? `${candidate.name} (${candidate.key})`
                  : candidate.key}
                {candidate.environments.length === 0 ? ' · routing design only' : ''}
              </option>
            ))}
            {CHANNEL_KEYS.map((channel) => (
              <option key={channel.key} value={channel.key}>
                {channel.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">When</span>
          <select aria-label="Survey trigger" value={flowTrigger} onChange={(e) => setFlowTrigger(e.target.value)}>
            {FLOW_TRIGGERS.map((trigger) => (
              <option key={trigger.value} value={trigger.value}>
                {trigger.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Survey flow</span>
          <select aria-label="Survey flow" value={flow} onChange={(e) => setFlow(e.target.value)}>
            <option value="">{flowChoices.length > 0 ? 'Choose…' : 'No post_call_survey_* flows'}</option>
            {flowChoices.map((candidate) => (
              <option key={candidate.key} value={candidate.key}>
                {flowOptionLabel(candidate)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Where</span>
          <select aria-label="Survey environments" value={where} onChange={(e) => setWhere(e.target.value as Where)}>
            {(Object.keys(WHERE_LABELS) as Where[]).map((key) => (
              <option key={key} value={key}>
                {WHERE_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="secondary-button" onClick={add}>
          Add survey
        </button>
      </div>
      {triggerHint && <p className="field-hint">{triggerHint}</p>}
      {queue &&
        flow &&
        entryWarnings({ file: FILE_OF[where], queue, studioFlowSid: flowRef(flow) }, choices).map((warning) => (
          <p key={warning} className="issue issue-warning">
            {warning} Add it there (or choose another environment) before applying.
          </p>
        ))}
      {error && <p className="issue-error-text">{error}</p>}
    </section>
  );
};
