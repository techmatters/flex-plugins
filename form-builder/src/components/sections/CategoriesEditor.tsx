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
 * Edits the issue categories (tabbedForms/IssueCategorizationTab.json) next to the Aselo
 * categories tab. See categories.ts for what can change freely and what needs Aselo staff.
 */
import { useMemo, useState } from 'react';
import type { CategoriesDefinition } from '@hrm-form-definitions/formDefinition/types';
import type { DefinitionFileMap } from '../../definitions';
import { getCategoriesByHelpline } from '../../definitions';
import {
  CATEGORY_COLORS,
  DEFAULT_MAX_SELECTIONS,
  getHelplineCategories,
  setHelplineCategories,
  Subcategory,
} from '../../categories';
import type { ValidationIssue } from '../../validation';
import { AseloCategories, SelectedCategories } from '../../aselo/AseloCategories';
import { translate, useStrings } from '../../aselo/translations';
import { Row, SortableRows, toRows } from './SortableRows';
import '../../aselo/aselo.css';

type Props = {
  draftFiles: DefinitionFileMap;
  originalFiles: DefinitionFileMap;
  staffMode: boolean;
  helplineLanguage?: string;
  issues: ValidationIssue[];
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
  onTryItOut: () => void;
};

// Editor rows: names can change while editing, so rows carry ids
type CategoryValue = {
  name: string;
  // The name it was loaded with, for categories that existed before this draft
  originalName?: string;
  // Everything else on the category (color, and anything the editor doesn't know about)
  entry: Omit<CategoriesDefinition['categories'][string], 'subcategories'>;
  subcategories: Row<Subcategory>[];
};

const toCategoryRows = (
  definition: CategoriesDefinition | undefined,
  original: CategoriesDefinition | undefined,
): Row<CategoryValue>[] =>
  toRows(
    Object.entries(definition?.categories ?? {}).map(([name, { subcategories, ...entry }]) => ({
      name,
      originalName: original?.categories[name] ? name : undefined,
      entry,
      subcategories: toRows(subcategories ?? []),
    })),
  );

const HelplineCategories = ({
  helpline,
  draftFiles,
  originalFiles,
  staffMode,
  strings,
  onChangeFiles,
}: {
  helpline: string;
  draftFiles: DefinitionFileMap;
  originalFiles: DefinitionFileMap;
  staffMode: boolean;
  strings: Record<string, string>;
  onChangeFiles: Props['onChangeFiles'];
}) => {
  const original = useMemo(() => getHelplineCategories(originalFiles, helpline), [originalFiles, helpline]);
  const [rows, setRows] = useState(() => toCategoryRows(getHelplineCategories(draftFiles, helpline), original));
  // Subcategories that existed before this draft, by row id (their names are locked)
  const [existingSubIds] = useState(
    () =>
      new Set(
        rows.flatMap(({ value }) =>
          value.subcategories
            .filter((sub) =>
              original?.categories[value.originalName ?? '']?.subcategories.some((old) => old.label === sub.value.label),
            )
            .map((sub) => sub.id),
        ),
      ),
  );
  const [openId, setOpenId] = useState<string>();
  const [bulk, setBulk] = useState<{ id: string; text: string }>();
  const definition = getHelplineCategories(draftFiles, helpline);
  const maxSelections = definition?.maxSelections ?? DEFAULT_MAX_SELECTIONS;

  // Names are keys in the file, so nothing is saved while two categories share one
  const hasDuplicateNames = (candidates: Row<CategoryValue>[]) =>
    new Set(candidates.map((row) => row.value.name)).size < candidates.length;

  const write = (next: Row<CategoryValue>[], changes: Partial<CategoriesDefinition> = {}) => {
    setRows(next);
    if (hasDuplicateNames(next)) return;
    onChangeFiles((files) => {
      const current = getHelplineCategories(files, helpline);
      return setHelplineCategories(files, helpline, {
        ...current,
        ...changes,
        categories: Object.fromEntries(
          next.map(({ value }) => [
            value.name,
            { ...value.entry, subcategories: value.subcategories.map((sub) => sub.value) },
          ]),
        ) as CategoriesDefinition['categories'],
      });
    });
  };

  const updateCategory = (id: string, update: (value: CategoryValue) => CategoryValue) =>
    write(rows.map((row) => (row.id === id ? { ...row, value: update(row.value) } : row)));


  const uniqueName = (base: string, taken: string[]) => {
    let name = base;
    for (let n = 2; taken.includes(name); n += 1) name = `${base} ${n}`;
    return name;
  };

  const addCategory = () => {
    const name = uniqueName('New category', rows.map((row) => row.value.name));
    const [row] = toRows([
      {
        name,
        entry: { color: CATEGORY_COLORS[rows.length % CATEGORY_COLORS.length] },
        subcategories: toRows([{ label: 'Other' }]),
      },
    ]);
    write([...rows, row]);
    setOpenId(row.id);
  };

  const removeCategory = (row: Row<CategoryValue>) => {
    if (
      row.value.originalName !== undefined &&
      !window.confirm(
        `Remove the category “${row.value.name}”? Contacts already saved with it keep it; counselors just can't choose it anymore.`,
      )
    ) {
      return;
    }
    write(rows.filter((candidate) => candidate.id !== row.id));
  };

  const addSubcategories = (id: string, labels: string[]) =>
    updateCategory(id, (value) => {
      const taken = value.subcategories.map((sub) => sub.value.label);
      const added = labels
        .map((label) => label.trim())
        .filter((label) => label && !taken.includes(label))
        .filter((label, index, all) => all.indexOf(label) === index);
      return { ...value, subcategories: [...value.subcategories, ...toRows(added.map((label) => ({ label })))] };
    });

  return (
    <>
      <label className="field">
        <span className="field-label">How many can counselors choose for one contact?</span>
        <input
          type="number"
          min={1}
          max={20}
          value={maxSelections}
          onChange={(e) => write(rows, { maxSelections: Number(e.target.value) })}
          className="narrow-input"
        />
      </label>

      <SortableRows
        rows={rows}
        labelOf={(value) => value.name}
        onReorder={(next) => write(next)}
        renderRow={(row) => {
          const { value } = row;
          const nameLocked = !staffMode && value.originalName !== undefined;
          const shownAs = translate(strings, value.name);
          const open = row.id === openId;
          return (
            <div className={`category-row${open ? ' selected' : ''}`}>
              <div className="row-inline">
                <input
                  type="color"
                  aria-label={`Colour of ${value.name}`}
                  value={/^#[0-9a-f]{6}$/i.test(String(value.entry.color)) ? String(value.entry.color) : '#bbe3ff'}
                  onChange={(e) =>
                    updateCategory(row.id, (current) => ({ ...current, entry: { ...current.entry, color: e.target.value } }))
                  }
                />
                <input
                  type="text"
                  aria-label="Category name"
                  value={value.name}
                  disabled={nameLocked}
                  title={nameLocked ? 'Contacts and reports use this name, so only Aselo staff can rename it.' : undefined}
                  onChange={(e) => updateCategory(row.id, (current) => ({ ...current, name: e.target.value }))}
                />
                <button
                  type="button"
                  className="secondary-button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? undefined : row.id)}
                >
                  {value.subcategories.length} subcategories
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove ${value.name}`}
                  onClick={() => removeCategory(row)}
                >
                  ×
                </button>
              </div>
              {rows.some((other) => other.id !== row.id && other.value.name === value.name) && (
                <span className="field-hint issue-error-text">
                  Another category is already called “{value.name}”. Choose a different name; changes
                  aren't saved until then.
                </span>
              )}
              {shownAs !== value.name && (
                <span className="field-hint">Counselors see “{shownAs}” (from the helpline's translations).</span>
              )}
              {open && (
                <div className="subcategories-editor">
                  <SortableRows
                    rows={value.subcategories}
                    labelOf={(sub) => sub.label}
                    onReorder={(subcategories) => updateCategory(row.id, (current) => ({ ...current, subcategories }))}
                    renderRow={(subRow) => {
                      const subExists = existingSubIds.has(subRow.id);
                      const subLocked = !staffMode && subExists;
                      const setSub = (sub: Subcategory) =>
                        updateCategory(row.id, (current) => ({
                          ...current,
                          subcategories: current.subcategories.map((candidate) =>
                            candidate.id === subRow.id ? { ...candidate, value: sub } : candidate,
                          ),
                        }));
                      return (
                        <div className="subcategory-row">
                          <div className="row-inline">
                            <input
                              type="text"
                              aria-label="Subcategory name"
                              value={subRow.value.label}
                              disabled={subLocked}
                              title={subLocked ? 'Contacts and reports use this name, so only Aselo staff can rename it.' : undefined}
                              onChange={(e) => setSub({ ...subRow.value, label: e.target.value })}
                            />
                            <button
                              type="button"
                              className="icon-button"
                              aria-label={`Remove ${subRow.value.label}`}
                              onClick={() => {
                                if (
                                  subExists &&
                                  !window.confirm(
                                    `Remove “${subRow.value.label}” from “${value.name}”? Contacts already saved with it keep it.`,
                                  )
                                ) {
                                  return;
                                }
                                updateCategory(row.id, (current) => ({
                                  ...current,
                                  subcategories: current.subcategories.filter((candidate) => candidate.id !== subRow.id),
                                }));
                              }}
                            >
                              ×
                            </button>
                          </div>
                          <input
                            type="url"
                            className="toolkit-url"
                            aria-label={`Help link for ${subRow.value.label}`}
                            placeholder="Help link for counselors (optional)"
                            value={subRow.value.toolkitUrl ?? ''}
                            onChange={(e) => {
                              const { toolkitUrl, ...rest } = subRow.value;
                              setSub(e.target.value ? { ...rest, toolkitUrl: e.target.value } : rest);
                            }}
                          />
                        </div>
                      );
                    }}
                  />
                  {bulk?.id === row.id ? (
                    <div className="bulk-add">
                      <textarea
                        rows={5}
                        autoFocus
                        value={bulk.text}
                        aria-label="Subcategories, one per line"
                        placeholder="One subcategory per line"
                        onChange={(e) => setBulk({ id: row.id, text: e.target.value })}
                      />
                      <div className="option-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            addSubcategories(row.id, bulk.text.split('\n'));
                            setBulk(undefined);
                          }}
                        >
                          Add these
                        </button>
                        <button type="button" className="link-button" onClick={() => setBulk(undefined)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="option-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          addSubcategories(row.id, [
                            uniqueName('New subcategory', value.subcategories.map((sub) => sub.value.label)),
                          ])
                        }
                      >
                        + Add a subcategory
                      </button>
                      <button type="button" className="link-button" onClick={() => setBulk({ id: row.id, text: '' })}>
                        Paste several at once
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      />
      <div className="option-actions">
        <button type="button" className="secondary-button" onClick={addCategory}>
          + Add a category
        </button>
      </div>
    </>
  );
};

export const CategoriesEditor = ({
  draftFiles,
  originalFiles,
  staffMode,
  helplineLanguage,
  issues,
  onChangeFiles,
  onTryItOut,
}: Props) => {
  const strings = useStrings(helplineLanguage ?? 'en-US', draftFiles);
  const helplines = useMemo(() => Object.keys(getCategoriesByHelpline(originalFiles)), [originalFiles]);
  const [helpline, setHelpline] = useState(helplines[0]);
  const [selected, setSelected] = useState<SelectedCategories>({});

  return (
    <div className="section-editor">
      <div className="section-editor-main">
        <section className="panel">
          <h2>Issue categories</h2>
          <p className="muted">
            What the contact was about. Counselors tick these on the Categories tab, and reports
            count them.
          </p>
          <p className="field-hint">
            Contacts are saved with the category and subcategory names, so existing names can only
            be changed by Aselo staff. Order, colours and help links can change any time.
          </p>
          {helplines.length > 1 && (
            <div className="language-tabs" role="tablist" aria-label="Helpline">
              {helplines.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={name === helpline}
                  className={name === helpline ? 'active' : ''}
                  onClick={() => setHelpline(name)}
                >
                  {name}
                </button>
              ))}
            </div>
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
          {helpline ? (
            <HelplineCategories
              key={helpline}
              helpline={helpline}
              draftFiles={draftFiles}
              originalFiles={originalFiles}
              staffMode={staffMode}
              strings={strings}
              onChangeFiles={onChangeFiles}
            />
          ) : (
            <p className="muted">This helpline has no issue categories.</p>
          )}
        </section>
      </div>

      <aside className="section-preview">
        <div className="section-preview-header">
          <span className="field-label">How it looks in Aselo</span>
          <button type="button" className="secondary-button" onClick={onTryItOut}>
            Try it out in Aselo
          </button>
        </div>
        <div className="aselo section-preview-frame">
          <div className="aselo-tab-content">
            <AseloCategories
              definition={helpline ? getHelplineCategories(draftFiles, helpline) : undefined}
              selected={selected}
              hasError={false}
              strings={strings}
              onChange={setSelected}
            />
          </div>
        </div>
      </aside>
    </div>
  );
};
