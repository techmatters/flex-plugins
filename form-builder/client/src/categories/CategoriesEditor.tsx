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
 * categories tab. What's edited and how lives in categoriesSlice.ts; see categories.ts for what
 * can change freely and what needs Aselo staff.
 */
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { getCategoriesByHelpline } from '../common/definitions';
import { selectDraftFiles, selectOriginalFiles } from '../drafts/draftSlice';
import { selectDefinitions, selectSectionIssues, selectWorkspace, tryItOutOpened } from '../workspace/workspaceSlice';
import { DEFAULT_MAX_SELECTIONS, getHelplineCategories } from './categories';
import {
  addCategory,
  addPastedSubcategories,
  addSubcategory,
  bulkChanged,
  categoryToggled,
  openCategories,
  previewSelectedChanged,
  removeCategory,
  removeSubcategory,
  renameCategory,
  reorderCategories,
  reorderSubcategories,
  selectCategories,
  setCategoryColor,
  setMaxSelections,
  setSubcategory,
} from './categoriesSlice';
import { AseloCategories } from '../aseloPreview/AseloCategories';
import { translate, useStrings } from '../aseloPreview/translations';
import { SortableRows } from '../common/SortableRows';
import '../aseloPreview/aselo.css';

const HelplineCategories = ({ strings }: { strings: Record<string, string> }) => {
  const dispatch = useAppDispatch();
  const staffMode = useAppSelector(selectActingAsStaff);
  const draftFiles = useAppSelector(selectDraftFiles);
  const { helpline, rows, existingSubIds, openId, bulk } = useAppSelector(selectCategories);
  const maxSelections =
    (helpline && getHelplineCategories(draftFiles, helpline)?.maxSelections) || DEFAULT_MAX_SELECTIONS;

  return (
    <>
      <label className="field">
        <span className="field-label">How many can counselors choose for one contact?</span>
        <input
          type="number"
          min={1}
          max={20}
          value={maxSelections}
          onChange={(e) => dispatch(setMaxSelections(Number(e.target.value)))}
          className="narrow-input"
        />
      </label>

      <SortableRows
        rows={rows}
        labelOf={(value) => value.name}
        onReorder={(next) => dispatch(reorderCategories(next))}
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
                  onChange={(e) => dispatch(setCategoryColor(row.id, e.target.value))}
                />
                <input
                  type="text"
                  aria-label="Category name"
                  value={value.name}
                  disabled={nameLocked}
                  title={nameLocked ? 'Contacts and reports use this name, so only Aselo staff can rename it.' : undefined}
                  onChange={(e) => dispatch(renameCategory(row.id, e.target.value))}
                />
                <button
                  type="button"
                  className="secondary-button"
                  aria-expanded={open}
                  onClick={() => dispatch(categoryToggled(row.id))}
                >
                  {value.subcategories.length} subcategories
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove ${value.name}`}
                  onClick={() => {
                    if (
                      value.originalName === undefined ||
                      window.confirm(
                        `Remove the category “${value.name}”? Contacts already saved with it keep it; counselors just can't choose it anymore.`,
                      )
                    ) {
                      dispatch(removeCategory(row.id));
                    }
                  }}
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
                    onReorder={(subcategories) => dispatch(reorderSubcategories(row.id, subcategories))}
                    renderRow={(subRow) => {
                      const subExists = existingSubIds.includes(subRow.id);
                      const subLocked = !staffMode && subExists;
                      return (
                        <div className="subcategory-row">
                          <div className="row-inline">
                            <input
                              type="text"
                              aria-label="Subcategory name"
                              value={subRow.value.label}
                              disabled={subLocked}
                              title={subLocked ? 'Contacts and reports use this name, so only Aselo staff can rename it.' : undefined}
                              onChange={(e) =>
                                dispatch(setSubcategory(row.id, subRow.id, { ...subRow.value, label: e.target.value }))
                              }
                            />
                            <button
                              type="button"
                              className="icon-button"
                              aria-label={`Remove ${subRow.value.label}`}
                              onClick={() => {
                                if (
                                  !subExists ||
                                  window.confirm(
                                    `Remove “${subRow.value.label}” from “${value.name}”? Contacts already saved with it keep it.`,
                                  )
                                ) {
                                  dispatch(removeSubcategory(row.id, subRow.id));
                                }
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
                              dispatch(
                                setSubcategory(row.id, subRow.id, e.target.value ? { ...rest, toolkitUrl: e.target.value } : rest),
                              );
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
                        onChange={(e) => dispatch(bulkChanged({ id: row.id, text: e.target.value }))}
                      />
                      <div className="option-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => dispatch(addPastedSubcategories())}
                        >
                          Add these
                        </button>
                        <button type="button" className="link-button" onClick={() => dispatch(bulkChanged(undefined))}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="option-actions">
                      <button type="button" className="secondary-button" onClick={() => dispatch(addSubcategory(row.id))}>
                        + Add a subcategory
                      </button>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => dispatch(bulkChanged({ id: row.id, text: '' }))}
                      >
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
        <button type="button" className="secondary-button" onClick={() => dispatch(addCategory())}>
          + Add a category
        </button>
      </div>
    </>
  );
};

export const CategoriesEditor = () => {
  const dispatch = useAppDispatch();
  const draftFiles = useAppSelector(selectDraftFiles);
  const originalFiles = useAppSelector(selectOriginalFiles);
  const helplineLanguage = useAppSelector(selectDefinitions)?.helplineLanguage;
  const { editorRevision } = useAppSelector(selectWorkspace);
  const sectionIssues = useAppSelector(selectSectionIssues);
  const { helpline, previewSelected } = useAppSelector(selectCategories);
  const strings = useStrings(helplineLanguage ?? 'en-US', draftFiles);
  const helplines = useMemo(() => Object.keys(getCategoriesByHelpline(originalFiles)), [originalFiles]);
  const issues = sectionIssues.filter((issue) => issue.message.startsWith('Issue categories'));

  // Starts from the draft when it opens, and when the draft's files are replaced (discarded, reloaded)
  useEffect(() => {
    dispatch(openCategories(helplines[0]));
  }, [dispatch, helplines, editorRevision]);

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
                  onClick={() => dispatch(openCategories(name))}
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
          {helplines.length > 0 ? (
            helpline && <HelplineCategories strings={strings} />
          ) : (
            <p className="muted">This helpline has no issue categories.</p>
          )}
        </section>
      </div>

      <aside className="section-preview">
        <div className="section-preview-header">
          <span className="field-label">How it looks in Aselo</span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => dispatch(tryItOutOpened({ focus: 'form', tab: 'categories' }))}
          >
            Try it out in Aselo
          </button>
        </div>
        <div className="aselo section-preview-frame">
          <div className="aselo-tab-content">
            <AseloCategories
              definition={helpline ? getHelplineCategories(draftFiles, helpline) : undefined}
              selected={previewSelected}
              hasError={false}
              strings={strings}
              onChange={(selected) => dispatch(previewSelectedChanged(selected))}
            />
          </div>
        </div>
      </aside>
    </div>
  );
};
