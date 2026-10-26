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
 * Client profiles: their sections, the options for flagging (blocking) a profile, and which
 * profile details are personal data, next to a sketch of the profile page. See profiles.ts.
 */
import { useMemo, useState } from 'react';
import type {
  ProfileFlagDurationDefinition,
  ProfileSectionDefinition,
} from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap } from '../../definitions';
import { toFieldName, uniqueFieldName } from '../../formEditing';
import {
  approximateDuration,
  DURATION_UNITS,
  DurationUnit,
  FLAG_DURATIONS_FILE,
  getFlagDurations,
  getProfileOverview,
  getProfileSections,
  newProfileSection,
  PROFILE_OVERVIEW_FILE,
  PROFILE_SECTIONS_FILE,
  splitDuration,
  toHours,
} from '../../profiles';
import type { ValidationIssue } from '../../validation';
import { SortableRows, toRows, useRows } from './SortableRows';

type Props = {
  draftFiles: DefinitionFileMap;
  originalFiles: DefinitionFileMap;
  staffMode: boolean;
  // From the Features page: profiles may be switched off for this helpline
  profilesEnabled: boolean;
  issues: ValidationIssue[];
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
};

const DurationInput = ({
  hours,
  label,
  onChange,
}: {
  hours: number;
  label: string;
  onChange: (hours: number) => void;
}) => {
  const [unit, setUnit] = useState<DurationUnit>(() => splitDuration(hours).unit);
  const unitHours = DURATION_UNITS.find((candidate) => candidate.unit === unit)!.hours;
  const amount = hours / unitHours;
  const approximation = approximateDuration(hours);
  return (
    <span className="duration-input">
      <input
        type="number"
        min={1}
        aria-label={`How long “${label}” lasts`}
        value={Number.isInteger(amount) ? amount : Math.round(amount * 100) / 100}
        onChange={(e) => onChange(Math.round(toHours(Number(e.target.value), unit)))}
      />
      <select
        aria-label={`Unit for “${label}”`}
        value={unit}
        onChange={(e) => {
          const next = e.target.value as DurationUnit;
          setUnit(next);
          // Keep the amount, change what it counts
          onChange(Math.round(toHours(Number.isInteger(amount) ? amount : 1, next)));
        }}
      >
        {DURATION_UNITS.map((candidate) => (
          <option key={candidate.unit} value={candidate.unit}>
            {candidate.unit}
          </option>
        ))}
      </select>
      {approximation && <span className="field-hint">{approximation}</span>}
    </span>
  );
};

export const ProfilesEditor = ({
  draftFiles,
  originalFiles,
  staffMode,
  profilesEnabled,
  issues,
  onChangeFiles,
}: Props) => {
  const originalNames = useMemo(
    () => new Set(getProfileSections(originalFiles).map((section) => section.name)),
    [originalFiles],
  );

  const sections = useRows(getProfileSections(draftFiles), (values) =>
    onChangeFiles((files) => ({ ...files, [PROFILE_SECTIONS_FILE]: values })),
  );
  const durations = useRows(getFlagDurations(draftFiles), (values) =>
    onChangeFiles((files) => ({ ...files, [FLAG_DURATIONS_FILE]: values })),
  );
  const overview = getProfileOverview(draftFiles);

  const updateSection = (id: string, change: Partial<ProfileSectionDefinition>) =>
    sections.commit(
      sections.rows.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row.value, ...change };
        // A new section's saved name follows its title
        if (change.label !== undefined && !originalNames.has(row.value.name)) {
          next.name = uniqueFieldName(
            toFieldName(change.label) || 'section',
            sections.rows.filter((other) => other.id !== id).map((other) => other.value.name),
          );
        }
        return { ...row, value: next };
      }),
    );

  const addSection = () => {
    const name = uniqueFieldName('newSection', sections.rows.map((row) => row.value.name));
    sections.commit([...sections.rows, ...toRows([newProfileSection('New section', name)])]);
  };

  const removeSection = (id: string, section: ProfileSectionDefinition) => {
    if (
      originalNames.has(section.name) &&
      !window.confirm(`Remove “${section.label}”? Counselors will no longer see what was written in it on profiles.`)
    ) {
      return;
    }
    sections.commit(sections.rows.filter((row) => row.id !== id));
  };

  const updateDuration = (id: string, change: Partial<ProfileFlagDurationDefinition>) =>
    durations.commit(durations.rows.map((row) => (row.id === id ? { ...row, value: { ...row.value, ...change } } : row)));

  const addDuration = () => {
    const taken = new Set(durations.rows.map((row) => Number(row.value.durationInHours)));
    let hours = 24;
    while (taken.has(hours)) hours += 24;
    durations.commit([
      ...durations.rows,
      ...toRows([{ flag: 'blocked', label: `Block (${hours / 24} days)`, durationInHours: String(hours) }]),
    ]);
  };

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>Client profiles</h2>
          <p className="muted">
            A profile brings together everything about one person who gets in touch: their
            contacts, cases, and notes counselors keep about them.
          </p>
          {!profilesEnabled && (
            <p className="issue issue-warning">
              Client profiles are switched off for this helpline (see Features), so counselors
              don't see these yet.
            </p>
          )}
          {issues.length > 0 && (
            <ul className="issue-list">
              {issues.map((issue) => (
                <li key={issue.message} className={`issue issue-${issue.severity}`}>
                  {issue.message}
                </li>
              ))}
            </ul>
          )}

          <h3 className="section-heading">Profile sections</h3>
          <p className="field-hint">Notes counselors keep on a profile, each in its own box.</p>
          <SortableRows
            rows={sections.rows}
            labelOf={(section) => section.label}
            onReorder={sections.commit}
            renderRow={(row) => {
              const section = row.value;
              const isNew = !originalNames.has(section.name);
              return (
                <div className="profile-section-row">
                  <div className="row-inline">
                    <input
                      type="text"
                      aria-label="Section title"
                      value={section.label}
                      onChange={(e) => updateSection(row.id, { label: e.target.value })}
                    />
                    {(isNew || staffMode) && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remove ${section.label}`}
                        onClick={() => removeSection(row.id, section)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="case-section-settings">
                    <label className="field">
                      <span className="field-label">Edit button</span>
                      <input
                        type="text"
                        value={section.editLabel ?? ''}
                        onChange={(e) => updateSection(row.id, { editLabel: e.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span className="field-label">Hint in the empty box</span>
                      <input
                        type="text"
                        value={section.placeholder ?? ''}
                        onChange={(e) => updateSection(row.id, { placeholder: e.target.value })}
                      />
                    </label>
                    {section.type === 'textarea' && (
                      <label className="field">
                        <span className="field-label">Height (lines)</span>
                        <input
                          type="number"
                          min={2}
                          max={40}
                          value={section.rows ?? 20}
                          onChange={(e) => updateSection(row.id, { rows: Number(e.target.value) })}
                        />
                      </label>
                    )}
                  </div>
                  <label className="field field-checkbox">
                    <input
                      type="checkbox"
                      checked={Boolean(section.isPII)}
                      disabled={!isNew && !staffMode}
                      onChange={(e) => updateSection(row.id, { isPII: e.target.checked })}
                    />
                    <span>Could it identify someone? (protects what's written in it)</span>
                  </label>
                  {staffMode && (
                    <span className="field-hint">
                      Saved as <code>{section.name}</code>
                      {isNew ? ' (from its title)' : ' (locked: profiles use it)'}
                    </span>
                  )}
                </div>
              );
            }}
          />
          <div className="option-actions">
            <button type="button" className="secondary-button" onClick={addSection}>
              + Add a section
            </button>
          </div>
          {!staffMode && (
            <p className="field-hint">
              Sections that already exist can only be removed by Aselo staff, because counselors
              would stop seeing what was written in them.
            </p>
          )}

          <h3 className="section-heading">Blocking options</h3>
          <p className="field-hint">
            What counselors can choose when they block someone. Each option needs a different
            length.
          </p>
          <SortableRows
            rows={durations.rows}
            labelOf={(duration) => duration.label}
            onReorder={durations.commit}
            renderRow={(row) => (
              <div className="row-inline flag-duration-row">
                {row.value.flag !== 'blocked' && <span className="badge">{row.value.flag}</span>}
                <input
                  type="text"
                  aria-label="Option name"
                  value={row.value.label}
                  onChange={(e) => updateDuration(row.id, { label: e.target.value })}
                />
                <DurationInput
                  hours={Number(row.value.durationInHours)}
                  label={row.value.label}
                  onChange={(hours) => updateDuration(row.id, { durationInHours: String(hours) })}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove ${row.value.label}`}
                  onClick={() => durations.commit(durations.rows.filter((candidate) => candidate.id !== row.id))}
                >
                  ×
                </button>
              </div>
            )}
          />
          <div className="option-actions">
            <button type="button" className="secondary-button" onClick={addDuration}>
              + Add a blocking option
            </button>
          </div>

          {staffMode && overview && (
            <details className="staff-section">
              <summary>Aselo staff settings</summary>
              {Object.entries(overview).map(([key, settings]) => (
                <label key={key} className="field field-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(settings?.isPII)}
                    onChange={(e) =>
                      onChangeFiles((files) => ({
                        ...files,
                        [PROFILE_OVERVIEW_FILE]: {
                          ...getProfileOverview(files),
                          [key]: { ...getProfileOverview(files)?.[key], isPII: e.target.checked },
                        },
                      }))
                    }
                  />
                  <span>
                    The profile's <code>{key}</code> is personal data
                  </span>
                </label>
              ))}
            </details>
          )}
        </section>
      </div>

      <aside className="section-preview">
        <div className="section-preview-header">
          <span className="field-label">On a client profile</span>
        </div>
        <div className="aselo section-preview-frame profile-preview">
          <div className="profile-preview-flags">
            <span className="field-label">Edit statuses</span>
            <ul aria-label="Status options">
              {durations.rows.map((row) => (
                <li key={row.id}>{row.value.label}</li>
              ))}
            </ul>
          </div>
          {sections.rows.map((row) => (
            <div key={row.id} className="profile-preview-section">
              <div className="profile-preview-section-header">
                <strong>{row.value.label}</strong>
                <span className="case-page-add">{row.value.editLabel}</span>
              </div>
              <div className="profile-preview-box">{row.value.placeholder || ' '}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
