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

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';

import { FormLabel } from '../../../styles';
import {
  MultiSelectListItem,
  MultiSelectCheckboxLabel,
  FiltersCheckbox,
  CategoryContainer,
  CategoryHeader,
  CategoryTitle,
  ArrowButton,
  SubcategoryList,
} from '../../../styles/filters';
import type { Category } from './CategoriesFilter';

type OwnProps = {
  category: Category;
  getValues: any;
  setValue: any;
  watch: any;
  searchTerm: string;
  highlightLabel: (label: string) => JSX.Element;
  register: any;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const CategorySection: React.FC<Props> = ({
  category,
  searchTerm,
  highlightLabel,
  getValues,
  setValue,
  watch,
  register,
}) => {
  const { categoryName, subcategories } = category;
  const [expanded, setExpanded] = useState(true);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [categoryChecked, setCategoryChecked] = useState(false);
  const [categoryIndeterminate, setCategoryIndeterminate] = useState(false);

  const watchCategory = watch(categoryName);
  const categoryString = JSON.stringify(watchCategory);

  useEffect(() => setExpanded(false), []);

  const handleExpandCategory = () => {
    if (searchTerm) return;

    setExpanded(!expanded);
  };

  const handleClickCategory = e => {
    // Prevent expand/hide section
    e.stopPropagation();

    const { [categoryName]: subcategoryValues } = getValues();
    if (!subcategoryValues) return;

    /*
     * Here (and at other places) I needed to set the subcategories value one-by-one.
     * Ideally, I could just call setValue(categoryName, categoryValue) and it would update all subcategories at once.
     * But, for some reason, subcategories which name contains commas were not beign updated properly,
     * such as "Lost, unaccounted for or otherwise missing child". I believe this is a ReactHookForm issue or misuse.
     */
    const setSubcategoriesValue = value =>
      Object.keys(subcategoryValues).forEach(subcategoryName => setValue(`${categoryName}.${subcategoryName}`, value));

    if (categoryChecked) {
      setSubcategoriesValue(false); // Clear all values
    } else {
      setSubcategoriesValue(true); // Select all values
    }
  };

  /**
   * Every time the category value changes at ReactHookForm state,
   * it will update:
   *   - the checkbox state (checked, indeterminate, unchecked)
   *   - the category count
   */
  useEffect(() => {
    const { [categoryName]: subcategoryValues } = getValues();

    const someSelected = subcategoryValues && Object.values(subcategoryValues).some(subcategory => subcategory);
    const fullySelected = subcategoryValues && Object.values(subcategoryValues).every(subcategory => subcategory);
    const count = subcategoryValues && Object.values(subcategoryValues).filter(subcategory => subcategory).length;
    setSelectedCount(count);

    if (fullySelected) {
      setCategoryChecked(true);
      setCategoryIndeterminate(false);
    } else if (someSelected) {
      setCategoryChecked(false);
      setCategoryIndeterminate(true);
    } else {
      setCategoryChecked(false);
      setCategoryIndeterminate(false);
    }
  }, [categoryString, categoryName, getValues]);

  const drawCount = () => (selectedCount === 0 ? '' : ` (${selectedCount})`);

  const noMatch = !subcategories.find(subcategory =>
    subcategory.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <CategoryContainer searchTerm={searchTerm} noMatch={noMatch}>
      <CategoryHeader onClick={handleExpandCategory} data-testid={`Categories-${categoryName}`}>
        {!searchTerm && (
          <FiltersCheckbox
            type="checkbox"
            checked={categoryChecked}
            onClick={handleClickCategory}
            onChange={() => null}
            ref={ref => {
              if (ref) {
                ref.indeterminate = categoryIndeterminate;
              }
            }}
          />
        )}
        <CategoryTitle searchTerm={searchTerm}>
          {categoryName} {drawCount()}
        </CategoryTitle>
        {!searchTerm && (
          <ArrowButton type="button">
            {expanded && <ArrowDropUp />}
            {!expanded && <ArrowDropDown />}
          </ArrowButton>
        )}
      </CategoryHeader>

      <SubcategoryList expanded={expanded} searchTerm={searchTerm}>
        {subcategories.map((subcategory, j) => {
          const hidden = !subcategory.label.toLowerCase().includes(searchTerm.toLowerCase());
          const name = `${categoryName}.${subcategory.value}`;

          return (
            <MultiSelectListItem key={j} hidden={hidden} data-testid={`Categories-${subcategory.label}`}>
              <FormLabel htmlFor={name} style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <FiltersCheckbox
                  id={name}
                  name={name}
                  type="checkbox"
                  defaultChecked={subcategory.checked}
                  ref={register}
                />
                <MultiSelectCheckboxLabel>{highlightLabel(subcategory.label)}</MultiSelectCheckboxLabel>
              </FormLabel>
            </MultiSelectListItem>
          );
        })}
      </SubcategoryList>
    </CategoryContainer>
  );
};

CategorySection.displayName = 'CategorySection';

export default CategorySection;
