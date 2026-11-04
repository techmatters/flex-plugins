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
 * The helpline's service configuration, for Aselo staff: every setting with what staging and
 * production get and which file that comes from, editable per file, or each file as JSON.
 * Changes go into the draft like any other; applying to Twilio stays make service-config-apply.
 * What's edited and how lives in serviceConfigSlice.ts.
 */
import { Fragment, useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectDraftFiles } from '../drafts/draftSlice';
import { selectDefinitions, selectWorkspace } from '../workspace/workspaceSlice';
import {
  applyNoteFor,
  ConfigLayer,
  ConfigObject,
  describeSetting,
  describeValue,
  differsBetweenEnvironments,
  getServiceConfigFile,
  hasPlaceholder,
  isConfigObject,
  knownSettingPaths,
  serviceConfigEnvironments,
  SETTING_GROUPS,
  SettingRow,
} from './serviceConfig';
import {
  addChanged,
  addSetting,
  editServiceConfig,
  fileTabChanged,
  filterChanged,
  JsonText,
  loadPostFlowChoices,
  modeChanged,
  openServiceConfig,
  searchChanged,
  selectChangedSettingPaths,
  selectServiceConfig,
  selectSettingRows,
  selectVisibleSettingRows,
  setSettingValue,
  settingJsonKey,
  SettingsFilter,
  settingToggled,
  typeFileJson,
  typeSettingJson,
} from './serviceConfigSlice';
import { repoServiceConfigDir, ServiceConfigFileName } from '@tech-matters/form-builder-shared';
import type { DefinitionFileMap } from '../common/definitions';
import { PostStudioFlowsEditor } from './PostStudioFlowsEditor';

const FILTERS: { key: SettingsFilter; label: string }[] = [
  { key: 'helpline', label: 'Set by this helpline' },
  { key: 'all', label: 'All, including Aselo defaults' },
  { key: 'differs', label: 'Different between environments' },
  { key: 'changed', label: 'Changed in this draft' },
];

const LAYER_LABELS: Record<ConfigLayer, string> = {
  defaults: 'Aselo default',
  common: 'common',
  staging: 'staging',
  production: 'production',
  development: 'development',
};

const FILE_DESCRIPTIONS: Record<ServiceConfigFileName, string> = {
  common: 'All environments',
  staging: 'Staging only',
  production: 'Production only',
  development: 'Development only',
};

const ValueText = ({ value }: { value: unknown }) => {
  if (value === undefined) return <span className="muted">—</span>;
  if (typeof value === 'boolean') {
    return <span className={`config-pill ${value ? 'config-on' : 'config-off'}`}>{value ? 'On' : 'Off'}</span>;
  }
  if (isConfigObject(value)) {
    const count = Object.keys(value).length;
    return <span className="config-value">{`{ ${count} setting${count === 1 ? '' : 's'} }`}</span>;
  }
  return (
    <span className="config-value" title={typeof value === 'string' ? value : JSON.stringify(value)}>
      {describeValue(value)}
    </span>
  );
};

type ValueKind = 'boolean' | 'number' | 'string' | 'json';

const kindOf = (value: unknown): ValueKind => {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  return 'json';
};

const emptyValueOf = (kind: ValueKind): unknown => ({ boolean: false, number: 0, string: '', json: {} })[kind];

/** The value one file sets for a setting: typed control, "not set", or JSON for anything else. */
const FileValueInput = ({
  label,
  value,
  hint,
  json,
  onChange,
  onJsonChange,
}: {
  label: string;
  value: unknown;
  // A value of the right type, from the other files, for when this file doesn't set it
  hint: unknown;
  // JSON being typed for it, when it's edited as JSON
  json?: JsonText;
  onChange: (value: unknown) => void;
  onJsonChange: (text: string) => void;
}) => {
  const kind = kindOf(value === undefined ? hint : value);

  if (kind === 'boolean' && (value === undefined || typeof value === 'boolean')) {
    return (
      <select
        aria-label={label}
        value={value === undefined ? '' : String(value)}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value === 'true')}
      >
        <option value="">Not set</option>
        <option value="true">On</option>
        <option value="false">Off</option>
      </select>
    );
  }
  if (value === undefined) {
    return (
      <span className="config-not-set">
        <span className="muted">Not set</span>
        <button
          type="button"
          className="link-button"
          aria-label={`Set ${label}`}
          onClick={() => onChange(hint === undefined || hint === null ? emptyValueOf(kind) : hint)}
        >
          Set here
        </button>
      </span>
    );
  }
  const remove = (
    <button type="button" className="link-button" aria-label={`Remove ${label}`} onClick={() => onChange(undefined)}>
      Remove
    </button>
  );
  if (kind === 'string' && typeof value === 'string') {
    return (
      <span className="config-input-row">
        <input type="text" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
        {remove}
      </span>
    );
  }
  if (kind === 'number' && typeof value === 'number') {
    return (
      <span className="config-input-row">
        <input
          type="number"
          aria-label={label}
          className="narrow-input"
          value={value}
          onChange={(e) => e.target.value !== '' && onChange(Number(e.target.value))}
        />
        {remove}
      </span>
    );
  }
  const jsonText = json?.text ?? JSON.stringify(value, null, 2) ?? '';
  return (
    <span className="config-json">
      <textarea
        aria-label={label}
        rows={Math.min(12, Math.max(2, jsonText.split('\n').length))}
        value={jsonText}
        spellCheck={false}
        onChange={(e) => onJsonChange(e.target.value)}
      />
      {json?.error && <span className="issue-error-text">Not valid JSON, not saved: {json.error}</span>}
      {remove}
    </span>
  );
};

const SettingEditor = ({ row, fileNames }: { row: SettingRow; fileNames: ServiceConfigFileName[] }) => {
  const dispatch = useAppDispatch();
  const { settingJson } = useAppSelector(selectServiceConfig);
  const hint = [...fileNames].reverse().map((name) => row.byLayer[name]).find((value) => value !== undefined) ?? row.byLayer.defaults;
  const note = applyNoteFor(row.keys);
  const set = (name: ServiceConfigFileName, value: unknown) => dispatch(setSettingValue(row.path, row.keys, name, value));
  return (
    <div className="config-setting-editor">
      {note && <p className="issue issue-warning">{note}</p>}
      {Object.values(row.byLayer).some(hasPlaceholder) && (
        <p className="field-hint">
          ${'{task_queues.…}'}, ${'{workflow_sids.…}'} and ${'{studio_flow_sids.…}'} placeholders are replaced
          with the environment’s SIDs when applied.
        </p>
      )}
      <table className="config-files-table">
        <tbody>
          <tr>
            <th scope="row">
              Aselo defaults
              <span className="field-hint">Every helpline (change in the repo)</span>
            </th>
            <td>
              <ValueText value={row.byLayer.defaults} />
            </td>
          </tr>
          {fileNames.map((name) => (
            <tr key={name}>
              <th scope="row">
                {name}.json
                <span className="field-hint">{FILE_DESCRIPTIONS[name]}</span>
              </th>
              <td>
                {row.byLayer[name] === null ? (
                  <span className="config-not-set">
                    <span className="muted">Removed here (null)</span>
                    <button type="button" className="link-button" onClick={() => set(name, undefined)}>
                      Undo
                    </button>
                  </span>
                ) : (
                  <FileValueInput
                    label={`${row.path} in ${name}.json`}
                    value={row.byLayer[name]}
                    hint={hint}
                    json={settingJson[settingJsonKey(row.path, name)]}
                    onChange={(value) => set(name, value)}
                    onJsonChange={(text) => dispatch(typeSettingJson(row.path, row.keys, name, text))}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AddSetting = ({ rows, fileNames }: { rows: SettingRow[]; fileNames: ServiceConfigFileName[] }) => {
  const dispatch = useAppDispatch();
  const { pathText, fileName, valueText, error } = useAppSelector(selectServiceConfig).add;
  const suggestions = useMemo(() => {
    const present = new Set(rows.map((row) => row.path));
    return knownSettingPaths().filter((path) => !present.has(path));
  }, [rows]);

  return (
    <div className="config-add">
      <h3>Add a setting</h3>
      <div className="config-add-fields">
        <label className="field">
          <span className="field-label">Setting</span>
          <input
            type="text"
            list="service-config-suggestions"
            placeholder="attributes.feature_flags.enable_lex"
            value={pathText}
            onChange={(e) => dispatch(addChanged({ pathText: e.target.value }))}
          />
          <datalist id="service-config-suggestions">
            {suggestions.map((path) => (
              <option key={path} value={path} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span className="field-label">File</span>
          <select
            value={fileName}
            onChange={(e) => dispatch(addChanged({ fileName: e.target.value as ServiceConfigFileName }))}
          >
            {fileNames.map((name) => (
              <option key={name} value={name}>
                {name}.json ({FILE_DESCRIPTIONS[name].toLowerCase()})
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Value</span>
          <input
            type="text"
            placeholder="true"
            value={valueText}
            onChange={(e) => dispatch(addChanged({ valueText: e.target.value }))}
          />
        </label>
        <button type="button" className="secondary-button" onClick={() => dispatch(addSetting())}>
          Add
        </button>
      </div>
      <p className="field-hint">
        Values are read as JSON (true, 15, {'{"a": 1}'}, ["sms"]); anything else is kept as text.
      </p>
      {error && <p className="issue-error-text">{error}</p>}
    </div>
  );
};

/** One file as JSON, saved into the draft whenever it's valid. */
const FileJsonEditor = ({
  name,
  config,
  json,
  readOnly,
  onChange,
}: {
  name: string;
  config: ConfigObject | undefined;
  // What's typed, when anything is (until then, the file as it is)
  json?: JsonText;
  readOnly?: boolean;
  onChange?: (text: string) => void;
}) => {
  const text = json?.text ?? (config ? JSON.stringify(config, null, 2) : '{}');
  return (
    <div className="config-file-json">
      {!config && !readOnly && <p className="muted">There’s no {name} yet. Anything written here creates it.</p>}
      <textarea
        aria-label={name}
        value={text}
        readOnly={readOnly}
        spellCheck={false}
        rows={Math.min(40, Math.max(8, text.split('\n').length + 1))}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {json?.error && <p className="issue-error-text">Not valid, not saved: {json.error}</p>}
    </div>
  );
};

export const ServiceConfigEditor = () => {
  const dispatch = useAppDispatch();
  const draftFiles = useAppSelector(selectDraftFiles);
  const definitions = useAppSelector(selectDefinitions);
  const { editorRevision } = useAppSelector(selectWorkspace);
  const { mode, filter, search, openPath, fileTab, fileJson } = useAppSelector(selectServiceConfig);
  const rows = useAppSelector(selectSettingRows);
  const changedPaths = useAppSelector(selectChangedSettingPaths);
  const visible = useAppSelector(selectVisibleSettingRows);
  const code = definitions?.code ?? '';
  const defaults = definitions?.serviceConfigDefaults;

  // Starts again when it opens, and when the draft's files are replaced (discarded, reloaded)
  useEffect(() => {
    dispatch(openServiceConfig());
  }, [dispatch, editorRevision]);

  // Post-call surveys (postStudioFlows): their choices load once per helpline, so the loader stays the same
  const loadChoices = useCallback((helplineCode: string) => dispatch(loadPostFlowChoices(helplineCode)), [dispatch]);
  const changeFiles = useCallback(
    (updater: (files: DefinitionFileMap) => DefinitionFileMap) => dispatch(editServiceConfig(updater)),
    [dispatch],
  );

  const environments = serviceConfigEnvironments(draftFiles);
  const fileNames: ServiceConfigFileName[] = ['common', ...environments];

  return (
    <section className="panel service-config-panel">
      <h2>Service configuration</h2>
      <p className="muted">
        How Flex is set up for {code.toUpperCase()}, as written in the repo ({repoServiceConfigDir(code)}). The repo is the
        source of truth: each environment gets Aselo’s defaults, then common.json, then its own file. After the PR is
        merged, Aselo staff apply it with make service-config-plan and make service-config-apply.
      </p>

      <div className="mode-switch" role="group" aria-label="Show">
        <button type="button" className={mode === 'settings' ? 'active' : ''} onClick={() => dispatch(modeChanged('settings'))}>
          Settings
        </button>
        <button type="button" className={mode === 'files' ? 'active' : ''} onClick={() => dispatch(modeChanged('files'))}>
          Files (JSON)
        </button>
      </div>

      {mode === 'settings' ? (
        <>
          <div className="config-toolbar">
            <input
              type="search"
              aria-label="Search settings"
              placeholder="Search settings"
              value={search}
              onChange={(e) => dispatch(searchChanged(e.target.value))}
            />
            <select
              aria-label="Which settings"
              value={filter}
              onChange={(e) => dispatch(filterChanged(e.target.value as SettingsFilter))}
            >
              {FILTERS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <span className="muted">
              {visible.length} of {rows.length} settings
            </span>
          </div>

          {SETTING_GROUPS.map((group) => {
            const groupRows = visible.filter((row) => row.group === group.key);
            if (groupRows.length === 0) return null;
            return (
              <div key={group.key} className="config-group">
                <h3>
                  {group.title}
                  <span className="muted count">{groupRows.length}</span>
                </h3>
                <table className="config-table">
                  <thead>
                    <tr>
                      <th>Setting</th>
                      {environments.map((env) => (
                        <th key={env}>{env.charAt(0).toUpperCase() + env.slice(1)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupRows.map((row) => {
                      const description = describeSetting(row);
                      const isOpen = openPath === row.path;
                      return (
                        <Fragment key={row.path}>
                          <tr className={isOpen ? 'config-row-open' : undefined}>
                            <td>
                              <button
                                type="button"
                                className="config-setting-name"
                                aria-expanded={isOpen}
                                onClick={() => dispatch(settingToggled(row.path))}
                              >
                                <code>{row.keys[row.keys.length - 1]}</code>
                              </button>
                              {changedPaths.has(row.path) && <span className="badge badge-edited">Changed</span>}
                              {differsBetweenEnvironments(row) && <span className="badge badge-env">Differs</span>}
                              {row.group === 'other' && row.keys.length > 1 && (
                                <span className="field-hint">{row.path}</span>
                              )}
                              {description && <span className="field-hint">{description}</span>}
                            </td>
                            {environments.map((env) => {
                              const effective = row.effective[env];
                              return (
                                <td key={env}>
                                  <ValueText value={effective?.value} />
                                  {effective && effective.from.length > 0 && (
                                    <span className="config-source">
                                      {effective.from.map((layer) => LAYER_LABELS[layer]).join(' + ')}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                          {isOpen && (
                            <tr className="config-row-editor">
                              <td colSpan={environments.length + 1}>
                                <SettingEditor row={row} fileNames={fileNames} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
          {visible.length === 0 && <p className="muted">No settings match.</p>}

          <PostStudioFlowsEditor
            code={code}
            draftFiles={draftFiles}
            change={changeFiles}
            loadChoices={loadChoices}
          />

          <AddSetting rows={rows} fileNames={fileNames} />
        </>
      ) : (
        <>
          <div className="language-tabs" role="tablist" aria-label="File">
            {(['common', 'staging', 'production', 'development', 'defaults'] as const)
              .filter((name) => name === 'defaults' || fileNames.includes(name))
              .map((name) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={fileTab === name}
                  className={fileTab === name ? 'active' : ''}
                  onClick={() => dispatch(fileTabChanged(name))}
                >
                  {name === 'defaults' ? 'Aselo defaults' : `${name}.json`}
                </button>
              ))}
          </div>
          {fileTab === 'defaults' ? (
            <>
              <p className="field-hint">
                Shared by every helpline (twilio-iac/helplines/configs/service-configuration/defaults.json). Read-only
                here: change it in the repo.
              </p>
              <FileJsonEditor name="defaults.json" config={defaults} readOnly />
            </>
          ) : (
            <FileJsonEditor
              name={`${fileTab}.json`}
              config={getServiceConfigFile(draftFiles, fileTab)}
              json={fileJson}
              onChange={(text) => dispatch(typeFileJson(text))}
            />
          )}
        </>
      )}
    </section>
  );
};
