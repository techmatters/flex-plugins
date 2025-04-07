/**
 * Copyright (C) 2021-2023 Technology Matters
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

import type { DefinitionVersion } from 'hrm-form-definitions';

import { CategoryFilter } from '../../../../types/types';
import { Category } from '../CategoriesFilter';

/**
 * Reads the definition version and returns and array of categories (type Category[])
 * to be used as the options for the categories filter
 */
export const getCategoriesInitialValue = (definitionVersion: DefinitionVersion, helpline: string) =>
  definitionVersion
    ? Object.entries(definitionVersion.tabbedForms.IssueCategorizationTab(helpline)).map(
        ([categoryName, { subcategories }]) => ({
          categoryName,
          subcategories: subcategories.map(subcategory => ({
            value: subcategory.label,
            label: subcategory.label,
            checked: false,
          })),
        }),
      )
    : [];

/**
 * Convert an array of categories (type Category[]) into an array of CategoryFilter.
 * This array will contain only the categories that are checked.
 * @param categories Category[]
 * @returns CategoryFilter[]
 */
export const filterCheckedCategories = (categories: Category[]): CategoryFilter[] =>
  categories.flatMap(category =>
    category.subcategories
      .filter(subcategory => subcategory.checked)
      .map(subcategory => ({
        category: category.categoryName,
        subcategory: subcategory.label,
      })),
  );

/**
 * Given the selected categories from redux and the previous categoriesValues,
 * it returns the updated values for categoriesValues, whith the correct checked values.
 *
 * @param categories Selected categories from redux (type CategoryFilter[])
 * @param categoriesValues Previous categoriesValues (type Category[])
 * @returns
 */
export const getUpdatedCategoriesValues = (categories: CategoryFilter[], categoriesValues: Category[]): Category[] => {
  const isChecked = (categoryName: string, subcategoryName: string) =>
    categories.some(c => c.category === categoryName && c.subcategory === subcategoryName);

  return categoriesValues.map(categoryValue => ({
    ...categoryValue,
    subcategories: categoryValue.subcategories.map(subcategory => ({
      ...subcategory,
      checked: isChecked(categoryValue.categoryName, subcategory.label),
    })),
  }));
};
