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
import React from 'react';
import { CategoryEntry } from 'hrm-form-definitions';

import {
  SubcategoriesWrapper,
  CategoryCheckboxField,
  CategoryCheckbox,
  CategoryCheckboxLabel,
  InformationIconButton,
  HtmlTooltip,
  CategoryCheckboxWrapper,
} from '../../../styles';

type Subcategory = {
  label: string;
  toolkitUrl?: string;
};

const createSubcategoryCheckbox = (
  subcategory: Subcategory,
  category: string,
  color: string,
  toggleCallback: (category: string, subcategory: string) => void,
  selected: boolean,
  counselorToolkitsEnabled: boolean,
  selectedCount: number,
) => {
  const { label, toolkitUrl } = subcategory;
  const lighterColor = `${color}99`; // Hex with alpha 0.6
  const disabled = selectedCount >= 3 && !selected;

  return (
    <CategoryCheckboxWrapper key={`${category}-${label}`}>
      <CategoryCheckboxLabel>
        <CategoryCheckboxField color={lighterColor} selected={selected} disabled={disabled}>
          <CategoryCheckbox
            type="checkbox"
            name="categories"
            onChange={() => toggleCallback(category, label)}
            disabled={disabled}
            checked={selected}
            data-testid={`categories.${category}.${label}`}
          />
          {label}
        </CategoryCheckboxField>
      </CategoryCheckboxLabel>
      {counselorToolkitsEnabled && toolkitUrl && (
        <HtmlTooltip title={`${label} - Tipsheet`} placement="bottom">
          <a href={toolkitUrl} target="_blank" rel="noreferrer">
            <InformationIconButton />
          </a>
        </HtmlTooltip>
      )}
    </CategoryCheckboxWrapper>
  );
};

type Props = {
  category: string;
  categoryDefinition: CategoryEntry;
  toggleSubcategory: (category: string, subcategory: string) => void;
  counselorToolkitsEnabled: boolean;
  selectedSubcategories: string[];
  gridView: boolean;
  selectedCount: number;
};

const CategoryCheckboxes: React.FC<Props> = ({
  category,
  categoryDefinition: { subcategories, color },
  toggleSubcategory,
  counselorToolkitsEnabled,
  selectedSubcategories,
  gridView,
  selectedCount,
}) => {
  return (
    <SubcategoriesWrapper gridView={gridView}>
      {subcategories.map(subcategory =>
        createSubcategoryCheckbox(
          subcategory,
          category,
          color,
          toggleSubcategory,
          selectedSubcategories.includes(subcategory.label),
          counselorToolkitsEnabled,
          selectedCount,
        ),
      )}
    </SubcategoriesWrapper>
  );
};

CategoryCheckboxes.displayName = 'CategoryCheckboxes';

export default CategoryCheckboxes;
