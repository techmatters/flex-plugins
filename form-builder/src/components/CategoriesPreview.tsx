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

import type { CategoriesDefinition } from '@hrm-form-definitions/formDefinition/types';

type Props = {
  categoriesByHelpline: Record<string, CategoriesDefinition>;
};

export const CategoriesPreview = ({ categoriesByHelpline }: Props) => {
  const entries = Object.entries(categoriesByHelpline);
  if (entries.length === 0) {
    return (
      <section className="panel">
        <h2>Issue categories</h2>
        <p className="muted">No categories are configured.</p>
      </section>
    );
  }

  return (
    <>
      {entries.map(([helplineName, { categories, maxSelections }]) => (
        <section className="panel" key={helplineName}>
          <h2>
            Issue categories <span className="muted count">for “{helplineName}”</span>
          </h2>
          {maxSelections !== undefined && (
            <p className="muted">Counselors can select up to {maxSelections} subcategories.</p>
          )}
          <div className="categories">
            {Object.entries(categories).map(([categoryName, { color, subcategories }]) => (
              <div className="category" key={categoryName} style={{ borderTopColor: color }}>
                <h3>
                  <span className="swatch" style={{ background: color }} />
                  {categoryName}
                </h3>
                <ul>
                  {subcategories.map((subcategory) => (
                    <li key={subcategory.label}>
                      <label className="inline-option">
                        <input type="checkbox" />
                        {subcategory.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
};
