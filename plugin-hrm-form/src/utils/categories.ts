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

import { DefinitionVersion } from '@tech-matters/hrm-form-definitions';

import HrmTheme from '../styles/HrmTheme';
import { getHrmConfig } from '../hrmConfig';

const getCategoryColor = (definitionVersion: DefinitionVersion, category: string) => {
  const { helpline } = getHrmConfig();

  const categories = definitionVersion?.tabbedForms?.IssueCategorizationTab(helpline) ?? {};

  return categories[category] ? categories[category].color : HrmTheme.colors.defaultCategoryColor;
};

type ContactCategories = {
  [category: string]: string[];
};

const getCategoryLabel = (category, subcategory) =>
  subcategory === 'Unspecified/Other' ? `${subcategory} - ${category}` : subcategory;

export const getContactTags = (definitionVersion: DefinitionVersion, contactCategories: ContactCategories) =>
  Object.entries(contactCategories).flatMap(([category, subcategories]) =>
    subcategories.map(subcategory => ({
      label: getCategoryLabel(category, subcategory),
      color: getCategoryColor(definitionVersion, category),
    })),
  );
