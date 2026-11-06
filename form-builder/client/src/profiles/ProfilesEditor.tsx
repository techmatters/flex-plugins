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
 * profile details are personal data, next to a sketch of the profile page. What's edited and
 * how lives in profilesSlice.ts; see profiles.ts for the files.
 */
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { selectDraftFiles } from '../drafts/draftSlice';
import { selectSectionIssues, selectWorkspace } from '../workspace/workspaceSlice';
import { approximateDuration, DURATION_UNITS, DurationUnit, getProfileOverview } from './profiles';
import {
  addDuration,
  addSection,
  durationAmount,
  openProfiles,
  removeDuration,
  removeSection,
  selectOriginalSectionNames,
  selectProfiles,
  selectProfilesEnabled,
  setDurationAmount,
  setDurationUnit,
  setOverviewIsPII,
  updateDuration,
  updateSection,
  writeDurations,
  writeSections,
} from './profilesSlice';
import { SortableRows } from '../common/SortableRows';

const DurationInput = ({
  hours,
  unit,
  label,
  onChangeAmount,
  onChangeUnit,
}: {
  hours: number;
  unit: DurationUnit;
  label: string;
  onChangeAmount: (amount: number) => void;
  onChangeUnit: (unit: DurationUnit) => void;
}) => {
  const amount = durationAmount(hours, unit);
  const approximation = approximateDuration(hours);
  return (
    <span className="duration-input">
      <input
        type="number"
        min={1}
        aria-label={`How long “${label}” lasts`}
        value={Number.isInteger(amount) ? amount : Math.round(amount * 100) / 100}
        onChange={e => onChangeAmount(Number(e.target.value))}
      />
      <select
        aria-label={`Unit for “${label}”`}
        value={unit}
        onChange={e => onChangeUnit(e.target.value as DurationUnit)}
      >
        {DURATION_UNITS.map(candidate => (
          <option key={candidate.unit} value={candidate.unit}>
            {candidate.unit}
          </option>
        ))}
      </select>
      {approximation && <span className="field-hint">{approximation}</span>}
    </span>
  );
};

export const ProfilesEditor = () => {
  const dispatch = useAppDispatch();
  const draftFiles = useAppSelector(selectDraftFiles);
  const staffMode = useAppSelector(selectActingAsStaff);
  const profilesEnabled = useAppSelector(selectProfilesEnabled);
  const originalNames = useAppSelector(selectOriginalSectionNames);
  const { editorRevision } = useAppSelector(selectWorkspace);
  const issues = useAppSelector(selectSectionIssues).filter(issue => issue.message.startsWith('Client profiles'));
  const { sections, durations, durationUnits } = useAppSelector(selectProfiles);
  const overview = getProfileOverview(draftFiles);

  // Starts from the draft when it opens, and when the draft's files are replaced (discarded, reloaded)
  useEffect(() => {
    dispatch(openProfiles());
  }, [dispatch, editorRevision]);

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>Client profiles</h2>
          <p className="muted">
            A profile brings together everything about one person who gets in touch: their contacts, cases, and notes
            counselors keep about them.
          </p>
          {!profilesEnabled && (
            <p className="issue issue-warning">
              Client profiles are switched off for this helpline (see Features), so counselors don&apos;t see these yet.
            </p>
          )}
          {issues.length > 0 && (
            <ul className="issue-list">
              {issues.map(issue => (
                <li key={issue.message} className={`issue issue-${issue.severity}`}>
                  {issue.message}
                </li>
              ))}
            </ul>
          )}

          <h3 className="section-heading">Profile sections</h3>
          <p className="field-hint">Notes counselors keep on a profile, each in its own box.</p>
          <SortableRows
            rows={sections}
            labelOf={section => section.label}
            onReorder={next => dispatch(writeSections(next))}
            renderRow={row => {
              const section = row.value;
              const isNew = !originalNames.has(section.name);
              return (
                <div className="profile-section-row">
                  <div className="row-inline">
                    <input
                      type="text"
                      aria-label="Section title"
                      value={section.label}
                      onChange={e => dispatch(updateSection(row.id, { label: e.target.value }))}
                    />
                    {(isNew || staffMode) && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remove ${section.label}`}
                        onClick={() => {
                          if (
                            !originalNames.has(section.name) ||
                            window.confirm(
                              `Remove “${section.label}”? Counselors will no longer see what was written in it on profiles.`,
                            )
                          ) {
                            dispatch(removeSection(row.id));
                          }
                        }}
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
                        onChange={e => dispatch(updateSection(row.id, { editLabel: e.target.value }))}
                      />
                    </label>
                    <label className="field">
                      <span className="field-label">Hint in the empty box</span>
                      <input
                        type="text"
                        value={section.placeholder ?? ''}
                        onChange={e => dispatch(updateSection(row.id, { placeholder: e.target.value }))}
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
                          onChange={e => dispatch(updateSection(row.id, { rows: Number(e.target.value) }))}
                        />
                      </label>
                    )}
                  </div>
                  <label className="field field-checkbox">
                    <input
                      type="checkbox"
                      checked={Boolean(section.isPII)}
                      disabled={!isNew && !staffMode}
                      onChange={e => dispatch(updateSection(row.id, { isPII: e.target.checked }))}
                    />
                    <span>Could it identify someone? (protects what&apos;s written in it)</span>
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
            <button type="button" className="secondary-button" onClick={() => dispatch(addSection())}>
              + Add a section
            </button>
          </div>
          {!staffMode && (
            <p className="field-hint">
              Sections that already exist can only be removed by Aselo staff, because counselors would stop seeing what
              was written in them.
            </p>
          )}

          <h3 className="section-heading">Blocking options</h3>
          <p className="field-hint">
            What counselors can choose when they block someone. Each option needs a different length.
          </p>
          <SortableRows
            rows={durations}
            labelOf={duration => duration.label}
            onReorder={next => dispatch(writeDurations(next))}
            renderRow={row => (
              <div className="row-inline flag-duration-row">
                {row.value.flag !== 'blocked' && <span className="badge">{row.value.flag}</span>}
                <input
                  type="text"
                  aria-label="Option name"
                  value={row.value.label}
                  onChange={e => dispatch(updateDuration(row.id, { label: e.target.value }))}
                />
                <DurationInput
                  hours={Number(row.value.durationInHours)}
                  unit={durationUnits[row.id] ?? 'hours'}
                  label={row.value.label}
                  onChangeAmount={amount => dispatch(setDurationAmount(row.id, amount))}
                  onChangeUnit={unit => dispatch(setDurationUnit(row.id, unit))}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove ${row.value.label}`}
                  onClick={() => dispatch(removeDuration(row.id))}
                >
                  ×
                </button>
              </div>
            )}
          />
          <div className="option-actions">
            <button type="button" className="secondary-button" onClick={() => dispatch(addDuration())}>
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
                    onChange={e => dispatch(setOverviewIsPII(key, e.target.checked))}
                  />
                  <span>
                    The profile&apos;s <code>{key}</code> is personal data
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
              {durations.map(row => (
                <li key={row.id}>{row.value.label}</li>
              ))}
            </ul>
          </div>
          {sections.map(row => (
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
