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
 */
import { Fragment, useMemo, useState } from 'react';
import type { DefinitionFileMap } from '../../definitions';
import {
  applyNoteFor,
  ConfigLayer,
  ConfigObject,
  describeSetting,
  describeValue,
  differsBetweenEnvironments,
  getServiceConfigFile,
  getSettingRows,
  hasPlaceholder,
  isConfigObject,
  isSetByHelpline,
  knownSettingPaths,
  parseSettingPath,
  serviceConfigEnvironments,
  setServiceConfigFile,
  setServiceConfigValue,
  SETTING_GROUPS,
  SettingRow,
} from '../../serviceConfig';
import { isServiceConfigPath, repoServiceConfigDir, ServiceConfigFileName } from '../../../server/filePaths';

type Props = {
  code: string;
  draftFiles: DefinitionFileMap;
  originalFiles: DefinitionFileMap;
  defaults?: ConfigObject;
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
};

type Filter = 'helpline' | 'all' | 'differs' | 'changed';

const FILTERS: { key: Filter; label: string }[] = [
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

const parseLoose = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
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
  onChange,
}: {
  label: string;
  value: unknown;
  // A value of the right type, from the other files, for when this file doesn't set it
  hint: unknown;
  onChange: (value: unknown) => void;
}) => {
  const kind = kindOf(value === undefined ? hint : value);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(value, null, 2) ?? '');
  const [jsonError, setJsonError] = useState<string>();

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
          onClick={() => {
            const initial = hint === undefined || hint === null ? emptyValueOf(kind) : hint;
            setJsonText(JSON.stringify(initial, null, 2));
            onChange(initial);
          }}
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
  return (
    <span className="config-json">
      <textarea
        aria-label={label}
        rows={Math.min(12, Math.max(2, jsonText.split('\n').length))}
        value={jsonText}
        spellCheck={false}
        onChange={(e) => {
          setJsonText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setJsonError(undefined);
          } catch (err) {
            setJsonError((err as Error).message);
          }
        }}
      />
      {jsonError && <span className="issue-error-text">Not valid JSON, not saved: {jsonError}</span>}
      {remove}
    </span>
  );
};

const SettingEditor = ({
  row,
  fileNames,
  onSet,
}: {
  row: SettingRow;
  fileNames: ServiceConfigFileName[];
  onSet: (name: ServiceConfigFileName, value: unknown) => void;
}) => {
  const hint = [...fileNames].reverse().map((name) => row.byLayer[name]).find((value) => value !== undefined) ?? row.byLayer.defaults;
  const note = applyNoteFor(row.keys);
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
                    <button type="button" className="link-button" onClick={() => onSet(name, undefined)}>
                      Undo
                    </button>
                  </span>
                ) : (
                  <FileValueInput
                    key={`${row.path}:${name}:${row.byLayer[name] === undefined}`}
                    label={`${row.path} in ${name}.json`}
                    value={row.byLayer[name]}
                    hint={hint}
                    onChange={(value) => onSet(name, value)}
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

const AddSetting = ({
  rows,
  fileNames,
  onAdd,
}: {
  rows: SettingRow[];
  fileNames: ServiceConfigFileName[];
  onAdd: (keys: string[], name: ServiceConfigFileName, value: unknown) => void;
}) => {
  const [pathText, setPathText] = useState('');
  const [fileName, setFileName] = useState<ServiceConfigFileName>('common');
  const [valueText, setValueText] = useState('');
  const [error, setError] = useState<string>();
  const suggestions = useMemo(() => {
    const present = new Set(rows.map((row) => row.path));
    return knownSettingPaths().filter((path) => !present.has(path));
  }, [rows]);

  const add = () => {
    const keys = parseSettingPath(pathText);
    if (!keys) {
      setError('Write the setting as a dotted path, e.g. attributes.feature_flags.enable_lex');
      return;
    }
    const existing = rows.find((row) => row.path === keys.join('.'));
    if (existing && existing.byLayer[fileName] !== undefined) {
      setError(`${fileName}.json already sets ${keys.join('.')}: change it in the list above.`);
      return;
    }
    if (valueText.trim() === '') {
      setError('Give it a value.');
      return;
    }
    onAdd(keys, fileName, parseLoose(valueText.trim()));
    setPathText('');
    setValueText('');
    setError(undefined);
  };

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
            onChange={(e) => setPathText(e.target.value)}
          />
          <datalist id="service-config-suggestions">
            {suggestions.map((path) => (
              <option key={path} value={path} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span className="field-label">File</span>
          <select value={fileName} onChange={(e) => setFileName(e.target.value as ServiceConfigFileName)}>
            {fileNames.map((name) => (
              <option key={name} value={name}>
                {name}.json ({FILE_DESCRIPTIONS[name].toLowerCase()})
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Value</span>
          <input type="text" placeholder="true" value={valueText} onChange={(e) => setValueText(e.target.value)} />
        </label>
        <button type="button" className="secondary-button" onClick={add}>
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
  readOnly,
  onChange,
}: {
  name: string;
  config: ConfigObject | undefined;
  readOnly?: boolean;
  onChange?: (config: ConfigObject) => void;
}) => {
  const [text, setText] = useState(() => (config ? JSON.stringify(config, null, 2) : '{}'));
  const [error, setError] = useState<string>();
  return (
    <div className="config-file-json">
      {!config && !readOnly && (
        <p className="muted">There’s no {name} yet. Anything written here creates it.</p>
      )}
      <textarea
        aria-label={name}
        value={text}
        readOnly={readOnly}
        spellCheck={false}
        rows={Math.min(40, Math.max(8, text.split('\n').length + 1))}
        onChange={(e) => {
          setText(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            if (!isConfigObject(parsed)) throw new Error('The file must be a JSON object ({ … }).');
            onChange?.(parsed);
            setError(undefined);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      />
      {error && <p className="issue-error-text">Not valid, not saved: {error}</p>}
    </div>
  );
};

export const ServiceConfigEditor = ({ code, draftFiles, originalFiles, defaults, onChangeFiles }: Props) => {
  const [mode, setMode] = useState<'settings' | 'files'>('settings');
  const [filter, setFilter] = useState<Filter>('helpline');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<string>();
  const [fileTab, setFileTab] = useState<ServiceConfigFileName | 'defaults'>('common');

  const environments = serviceConfigEnvironments(draftFiles);
  const fileNames: ServiceConfigFileName[] = ['common', ...environments];
  const rows = useMemo(() => getSettingRows(draftFiles, defaults), [draftFiles, defaults]);
  const originalRows = useMemo(
    () => new Map(getSettingRows(originalFiles, defaults).map((row) => [row.path, JSON.stringify(row.byLayer)])),
    [originalFiles, defaults],
  );
  const isChanged = (row: SettingRow) => originalRows.get(row.path) !== JSON.stringify(row.byLayer);

  // A file the helpline didn't have, emptied again, isn't created
  const isNewEmptyFile = (filePath: string, value: unknown) =>
    isServiceConfigPath(filePath) && !(filePath in originalFiles) && isConfigObject(value) && Object.keys(value).length === 0;
  const change = (updater: (files: DefinitionFileMap) => DefinitionFileMap) =>
    onChangeFiles((files) =>
      Object.fromEntries(Object.entries(updater(files)).filter(([filePath, value]) => !isNewEmptyFile(filePath, value))),
    );

  const query = search.trim().toLowerCase();
  const visible = rows.filter((row) => {
    if (filter === 'helpline' && !isSetByHelpline(row)) return false;
    if (filter === 'differs' && !differsBetweenEnvironments(row)) return false;
    if (filter === 'changed' && !isChanged(row)) return false;
    if (!query) return true;
    return `${row.path} ${describeSetting(row) ?? ''}`.toLowerCase().includes(query);
  });

  return (
    <section className="panel service-config-panel">
      <h2>Service configuration</h2>
      <p className="muted">
        How Flex is set up for {code.toUpperCase()}, as written in the repo ({repoServiceConfigDir(code)}). The repo is the
        source of truth: each environment gets Aselo’s defaults, then common.json, then its own file. After the PR is
        merged, Aselo staff apply it with make service-config-plan and make service-config-apply.
      </p>

      <div className="mode-switch" role="group" aria-label="Show">
        <button type="button" className={mode === 'settings' ? 'active' : ''} onClick={() => setMode('settings')}>
          Settings
        </button>
        <button type="button" className={mode === 'files' ? 'active' : ''} onClick={() => setMode('files')}>
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
              onChange={(e) => setSearch(e.target.value)}
            />
            <select aria-label="Which settings" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
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
                      const isOpen = open === row.path;
                      return (
                        <Fragment key={row.path}>
                          <tr className={isOpen ? 'config-row-open' : undefined}>
                            <td>
                              <button
                                type="button"
                                className="config-setting-name"
                                aria-expanded={isOpen}
                                onClick={() => setOpen(isOpen ? undefined : row.path)}
                              >
                                <code>{row.keys[row.keys.length - 1]}</code>
                              </button>
                              {isChanged(row) && <span className="badge badge-edited">Changed</span>}
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
                                <SettingEditor
                                  row={row}
                                  fileNames={fileNames}
                                  onSet={(name, value) =>
                                    change((files) => setServiceConfigValue(files, name, row.keys, value))
                                  }
                                />
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

          <AddSetting
            rows={rows}
            fileNames={fileNames}
            onAdd={(keys, name, value) => {
              change((files) => setServiceConfigValue(files, name, keys, value));
              setFilter('helpline');
              setSearch('');
              setOpen(keys.join('.'));
            }}
          />
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
                  onClick={() => setFileTab(name)}
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
              <FileJsonEditor key="defaults" name="defaults.json" config={defaults} readOnly />
            </>
          ) : (
            <FileJsonEditor
              key={fileTab}
              name={`${fileTab}.json`}
              config={getServiceConfigFile(draftFiles, fileTab)}
              onChange={(config) => change((files) => setServiceConfigFile(files, fileTab, config))}
            />
          )}
        </>
      )}
    </section>
  );
};
