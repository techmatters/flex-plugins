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
 * The categories tab as counselors see it (IssueCategorizationSectionForm in the plugin):
 * a collapsible section per category, with coloured answer chips shown as a grid or a list,
 * and a limit on how many can be ticked.
 */
import { useState } from 'react';
import type { CategoriesDefinition } from '@hrm-form-definitions/formDefinition/types';
import { ArrowDropDownIcon, ArrowDropUpIcon, GridIcon, ListIcon } from './flexIcons';
import { Strings, translate } from './translations';

// plugin-hrm-form/src/components/contact/IssueCategorizationSectionForm.tsx
export const DEFAULT_MAXIMUM_SELECTIONS = 3;

export type SelectedCategories = Record<string, string[]>;

type Props = {
  definition?: CategoriesDefinition;
  selected: SelectedCategories;
  hasError: boolean;
  strings: Strings;
  onChange: (selected: SelectedCategories) => void;
};

export const countSelected = (selected: SelectedCategories) =>
  Object.values(selected).reduce((total, list) => total + list.length, 0);

export const AseloCategories = ({ definition, selected, hasError, strings, onChange }: Props) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [gridView, setGridView] = useState(false);
  const maxSelections = definition?.maxSelections ?? DEFAULT_MAXIMUM_SELECTIONS;
  const selectedCount = countSelected(selected);

  const toggle = (category: string, subcategory: string) => {
    const current = selected[category] ?? [];
    onChange({
      ...selected,
      [category]: current.includes(subcategory)
        ? current.filter((label) => label !== subcategory)
        : [...current, subcategory],
    });
  };

  return (
    <div className="aselo-categories">
      <h3 className="aselo-category-title">{translate(strings, 'Categories-Title')}</h3>
      <div className="aselo-category-subtitle">
        <span className={hasError ? 'aselo-category-required has-error' : 'aselo-category-required'}>
          {translate(strings, 'Error-CategoryRequired', { minSelections: 1, maxSelections })}
        </span>
        <button
          type="button"
          className={gridView ? 'aselo-toggle-view active' : 'aselo-toggle-view'}
          aria-label="Grid view"
          onClick={() => setGridView(true)}
        >
          <GridIcon size={18} />
        </button>
        <button
          type="button"
          className={!gridView ? 'aselo-toggle-view active' : 'aselo-toggle-view'}
          aria-label="List view"
          onClick={() => setGridView(false)}
        >
          <ListIcon size={18} />
        </button>
      </div>

      {Object.entries(definition?.categories ?? {}).map(([category, { color, subcategories }]) => {
        const isExpanded = Boolean(expanded[category]);
        const lighterColor = `${color}99`;
        return (
          <div key={category} className="aselo-category">
            <div className="aselo-section-title" style={{ borderLeft: `6px solid ${color}` }}>
              <button
                type="button"
                className="aselo-section-button"
                aria-expanded={isExpanded}
                onClick={() => setExpanded({ ...expanded, [category]: !isExpanded })}
              >
                <span>{translate(strings, category)}</span>
                {isExpanded ? <ArrowDropUpIcon size={20} /> : <ArrowDropDownIcon size={20} />}
              </button>
            </div>
            {isExpanded && (
              <div className={gridView ? 'aselo-subcategories grid' : 'aselo-subcategories'}>
                {subcategories.map(({ label }) => {
                  const isSelected = (selected[category] ?? []).includes(label);
                  const disabled = selectedCount >= maxSelections && !isSelected;
                  return (
                    <label
                      key={label}
                      className={`aselo-category-chip ${disabled ? 'disabled' : ''}`}
                      style={{
                        borderColor: disabled ? undefined : lighterColor,
                        backgroundColor: isSelected ? lighterColor : undefined,
                      }}
                    >
                      <input
                        type="checkbox"
                        className="aselo-visually-hidden"
                        checked={isSelected}
                        disabled={disabled}
                        onChange={() => toggle(category, label)}
                      />
                      <span className="aselo-chip-check" aria-hidden="true">
                        {isSelected ? '✓' : ''}
                      </span>
                      {translate(strings, label)}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
