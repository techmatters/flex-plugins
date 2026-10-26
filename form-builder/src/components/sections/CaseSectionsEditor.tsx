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
 * The sections of a case (CaseSections.json and their settings), next to a sketch of the
 * case page. Each section's form is edited from its own item in the navigation.
 */
import { useMemo, useState } from 'react';
import type { DefinitionFileMap } from '../../definitions';
import { getCaseSections, getForm } from '../../definitions';
import {
  addCaseSection,
  addKey,
  baseLanguageOf,
  CASE_SECTIONS_FILE,
  getSectionLayout,
  removeCaseSection,
  SectionLayout,
  setSectionLayout,
  setSubstitution,
  titleKey,
} from '../../caseSections';
import type { ValidationIssue } from '../../validation';
import { translate, useStrings } from '../../aselo/translations';
import { SortableRows, toRows } from './SortableRows';

type Props = {
  draftFiles: DefinitionFileMap;
  originalFiles: DefinitionFileMap;
  staffMode: boolean;
  helplineLanguage?: string;
  issues: ValidationIssue[];
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
  onOpenForm: (sectionKey: string) => void;
};

// The plugin shows up to this many fields side by side in a section's list
const MAX_PREVIEW_FIELDS = 4;

export const CaseSectionsEditor = ({
  draftFiles,
  originalFiles,
  staffMode,
  helplineLanguage,
  issues,
  onChangeFiles,
  onOpenForm,
}: Props) => {
  const language = baseLanguageOf(helplineLanguage);
  const strings = useStrings(helplineLanguage ?? 'en-US', draftFiles);
  const originalKeys = useMemo(() => new Set(getCaseSections(originalFiles).map((section) => section.key)), [originalFiles]);
  const sections = getCaseSections(draftFiles);
  const [rows, setRows] = useState(() => toRows(sections.map((section) => section.key)));
  const [newLabel, setNewLabel] = useState('');

  const sectionsFile = (files: DefinitionFileMap) =>
    (files[CASE_SECTIONS_FILE] ?? {}) as Record<string, { label: string; formPath: string }>;

  const updateLayout = (key: string, change: (layout: SectionLayout) => SectionLayout) =>
    onChangeFiles((files) => setSectionLayout(files, key, change(getSectionLayout(files, key))));

  const reorder = (next: typeof rows) => {
    setRows(next);
    onChangeFiles((files) => {
      const current = sectionsFile(files);
      let updated: DefinitionFileMap = {
        ...files,
        [CASE_SECTIONS_FILE]: Object.fromEntries(next.map((row) => [row.value, current[row.value]])),
      };
      // The case page sorts by caseHomeOrder, so number them in the new order
      next.forEach((row, index) => {
        updated = setSectionLayout(updated, row.value, { ...getSectionLayout(updated, row.value), caseHomeOrder: index + 1 });
      });
      return updated;
    });
  };

  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    // The key only depends on the sections that exist, so it's the same in the updater
    const { key } = addCaseSection(draftFiles, label, language);
    onChangeFiles((files) => addCaseSection(files, label, language).files);
    setRows((current) => [...current, ...toRows([key])]);
    setNewLabel('');
  };

  const remove = (key: string, label: string) => {
    const lines = originalKeys.has(key)
      ? [
          `Remove the section “${label}”?`,
          '',
          'Cases keep what was already saved in it, but counselors will no longer see or add it.',
        ]
      : [`Remove the new section “${label}”?`];
    if (!window.confirm(lines.join('\n'))) return;
    onChangeFiles((files) => removeCaseSection(files, key));
    setRows((current) => current.filter((row) => row.value !== key));
  };

  const listSections = rows
    .map((row) => sections.find((section) => section.key === row.value))
    .filter((section): section is NonNullable<typeof section> => Boolean(section));
  const placed = (location: 'list' | 'timeline') =>
    listSections.filter(
      (section) => (getSectionLayout(draftFiles, section.key).caseHomeLocation ?? 'list') === location,
    );

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>Case sections</h2>
          <p className="muted">
            What counselors can add to a case, like notes or referrals. Each section has its own
            form: open it from the menu on the left, or with “Edit the form”.
          </p>
          {issues.length > 0 && (
            <ul className="issue-list">
              {issues.map((issue) => (
                <li key={issue.message} className={`issue issue-${issue.severity}`}>
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
          <SortableRows
            rows={rows}
            labelOf={(key) => sections.find((section) => section.key === key)?.label ?? key}
            onReorder={reorder}
            renderRow={(row) => {
              const section = sections.find((candidate) => candidate.key === row.value);
              if (!section) return null;
              const layout = getSectionLayout(draftFiles, section.key);
              const form = getForm(draftFiles, section.formPath) ?? [];
              const previewFields = layout.previewFields ?? [];
              const isExisting = originalKeys.has(section.key);
              return (
                <div className="case-section-row">
                  <div className="row-inline">
                    <input
                      type="text"
                      aria-label="Section name"
                      value={section.label}
                      onChange={(e) => {
                        const label = e.target.value;
                        onChangeFiles((files) => ({
                          ...files,
                          [CASE_SECTIONS_FILE]: {
                            ...sectionsFile(files),
                            [section.key]: { ...sectionsFile(files)[section.key], label },
                          },
                        }));
                      }}
                    />
                    <button type="button" className="secondary-button" onClick={() => onOpenForm(section.key)}>
                      Edit the form ({form.length} fields)
                    </button>
                    {(!isExisting || staffMode) && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remove ${section.label}`}
                        onClick={() => remove(section.key, section.label)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="case-section-settings">
                    <label className="field">
                      <span className="field-label">Heading on the case</span>
                      <input
                        type="text"
                        value={translate(strings, titleKey(section.key))}
                        onChange={(e) =>
                          onChangeFiles((files) => setSubstitution(files, language, titleKey(section.key), e.target.value))
                        }
                      />
                    </label>
                    <label className="field">
                      <span className="field-label">Add button</span>
                      <input
                        type="text"
                        value={translate(strings, addKey(section.key))}
                        onChange={(e) =>
                          onChangeFiles((files) => setSubstitution(files, language, addKey(section.key), e.target.value))
                        }
                      />
                    </label>
                    <label className="field">
                      <span className="field-label">Shown</span>
                      <select
                        value={layout.caseHomeLocation ?? 'list'}
                        onChange={(e) =>
                          updateLayout(section.key, (current) => ({
                            ...current,
                            caseHomeLocation: e.target.value as 'list' | 'timeline',
                          }))
                        }
                      >
                        <option value="list">As its own list on the case</option>
                        <option value="timeline">On the case timeline</option>
                      </select>
                    </label>
                  </div>
                  <fieldset className="status-transitions">
                    <legend>Fields shown in the list</legend>
                    {form.map((item) => {
                      const checked = previewFields.includes(item.name);
                      return (
                        <label key={item.name} className="field-checkbox">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!checked && previewFields.length >= MAX_PREVIEW_FIELDS}
                            onChange={() =>
                              updateLayout(section.key, (current) => ({
                                ...current,
                                previewFields: checked
                                  ? (current.previewFields ?? []).filter((name) => name !== item.name)
                                  : // Keep the form's order
                                    form
                                      .map((field) => field.name)
                                      .filter((name) => name === item.name || (current.previewFields ?? []).includes(name)),
                              }))
                            }
                          />
                          <span>{item.label || item.name}</span>
                        </label>
                      );
                    })}
                  </fieldset>
                </div>
              );
            }}
          />
          <div className="option-actions">
            <input
              type="text"
              aria-label="New section name"
              placeholder="New section, e.g. Safety plan"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <button type="button" className="secondary-button" disabled={!newLabel.trim()} onClick={add}>
              + Add a section
            </button>
          </div>
          {!staffMode && (
            <p className="field-hint">
              Sections that already exist can only be removed by Aselo staff, because counselors would
              stop seeing what was saved in them.
            </p>
          )}
        </section>
      </div>

      <aside className="section-preview">
        <div className="section-preview-header">
          <span className="field-label">On the case page</span>
        </div>
        <div className="aselo section-preview-frame case-page-preview">
          <div className="case-page-timeline">
            <strong>{translate(strings, 'Case-Timeline-Title')}</strong>
            {placed('timeline').length > 0 && (
              <span className="muted"> · also shows {placed('timeline').map((section) => section.label).join(', ')}</span>
            )}
          </div>
          {placed('list').map((section) => (
            <div key={section.key} className="case-page-section">
              <span className="case-page-section-title">{translate(strings, titleKey(section.key))}</span>
              <button type="button" className="case-page-add" tabIndex={-1}>
                + {translate(strings, addKey(section.key))}
              </button>
              <div className="case-page-preview-row">
                {(getSectionLayout(draftFiles, section.key).previewFields ?? []).map((name) => (
                  <span key={name}>
                    {getForm(draftFiles, section.formPath)?.find((item) => item.name === name)?.label ?? name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
