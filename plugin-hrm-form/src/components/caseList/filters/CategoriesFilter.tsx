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

/* eslint-disable no-unused-expressions */
/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';

import SearchInput from './SearchInput';
import { Flex, Box } from '../../../styles/HrmStyles';
import {
  MultiSelectButton,
  DialogArrow,
  FiltersDialog,
  FiltersDialogTitle,
  FiltersBottomButtons,
  FiltersApplyButton,
  FiltersClearButton,
  MultiSelectUnorderedList,
} from '../../../styles/table/filters';
import type { Item } from './MultiSelectFilter';
import CategorySection from './CategorySection';

/**
 * Due to an issue of ReactHookForms transforming names with double quotes or single quotes,
 * we're explicitally replacing these chars with placeholders and vice-versa when needed.
 * ex: There's a subcategory named '"Thank you for your assistance"',
 * (the double quotes should be part of its name).
 *
 * TODO: Open an issue on ReactHookForms GitHub, so they can fix or tell us the appropiate way
 * to handle this scenario.
 */
const SINGLE_QUOTE_PLACEHOLDER = 'SINGLE_QUOTE_PLACEHOLDER';
const DOUBLE_QUOTES_PLACEHOLDER = 'DOUBLE_QUOTES_PLACEHOLDER';

const addPlaceholdersToDefaultValues = (categories: Category[]): Category[] => {
  const addPlaceholders = text => text.replace(/'/g, SINGLE_QUOTE_PLACEHOLDER).replace(/"/g, DOUBLE_QUOTES_PLACEHOLDER);

  return categories.map(({ categoryName, subcategories }) => ({
    categoryName,
    subcategories: subcategories.map(subcategory => ({
      ...subcategory,
      value: addPlaceholders(subcategory.value),
    })),
  }));
};

const transformToCategories = (values: ReactHookFormValues): Category[] => {
  const removePlaceholders = text =>
    text
      .replace(new RegExp(SINGLE_QUOTE_PLACEHOLDER, 'g'), "'")
      .replace(new RegExp(DOUBLE_QUOTES_PLACEHOLDER, 'g'), '"');

  const getSubcategories = category =>
    Object.keys(category).map(subcategoryName => ({
      value: removePlaceholders(subcategoryName),
      label: removePlaceholders(subcategoryName),
      checked: category[subcategoryName],
    }));

  return Object.keys(values).map(categoryName => ({
    categoryName,
    subcategories: getSubcategories(values[categoryName]),
  }));
};

const transformToValues = (categories: Category[]) => {
  const getSubcategories = (category: Category) =>
    category.subcategories.reduce((acc, subcategory) => ({ ...acc, [subcategory.label]: subcategory.checked }), {});
  return categories.reduce((acc, category) => ({ ...acc, [category.categoryName]: getSubcategories(category) }), {});
};

type Subcategory = {
  value: string;
  label: string;
  checked: boolean;
};
export type Category = {
  categoryName: string;
  subcategories: Subcategory[];
};

type ReactHookFormValues = {
  [name: string]: boolean;
};

type OwnProps = {
  name: string;
  text: string;
  defaultValues: Category[];
  withSearch?: boolean;
  openedFilter: string;
  searchable?: boolean;
  searchDescription?: string;
  applyFilter: (values: Category[]) => void;
  setOpenedFilter: (name: string) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const CategoriesFilter: React.FC<Props> = ({
  name,
  text,
  defaultValues: defaultValuesRaw,
  openedFilter,
  searchable,
  searchDescription,
  applyFilter,
  setOpenedFilter,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const [defaultValues, setDefaultValues] = useState(addPlaceholdersToDefaultValues(defaultValuesRaw));
  useEffect(() => setDefaultValues(addPlaceholdersToDefaultValues(defaultValuesRaw)), [defaultValuesRaw]);

  const { register, handleSubmit, reset, getValues, setValue, watch } = useForm<any>({
    defaultValues: transformToValues(defaultValues),
  });

  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categories, setCategories] = useState(defaultValues);

  const filterButtonElement = useRef(null);
  const firstElement = useRef(null);
  const lastElement = useRef(null);

  // Force React Hook Forms to rerender whenever defaultValues changes
  useEffect(() => {
    const updateSelectedCount = () => {
      const count = defaultValues
        .flatMap(category => category.subcategories)
        .reduce((acc, item) => (item.checked ? acc + 1 : acc), 0);
      setSelectedCount(count);
    };

    setCategories(defaultValues);
    reset(defaultValues);
    updateSelectedCount();
  }, [reset, defaultValues]);

  const isOpened = name === openedFilter;

  // Close dialog on ESC
  useEffect(() => {
    const closeDialog = event => {
      if (event.key === 'Escape') {
        // Always reset to defaultValues whenever you open/close the component
        reset(defaultValues);
        setSearchTerm('');
        setOpenedFilter(null);

        filterButtonElement.current?.focus();
      }
    };

    if (isOpened) {
      window.addEventListener('keydown', closeDialog);
    }

    return () => window.removeEventListener('keydown', closeDialog);
  }, [isOpened, defaultValues, reset, setSearchTerm, setOpenedFilter]);

  const onSubmit = (values: ReactHookFormValues) => {
    setOpenedFilter(null);
    setSearchTerm('');

    const categories = transformToCategories(values);
    applyFilter(categories);
  };

  const handleClick = () => {
    // Always reset to defaultValues whenever you open/close the component
    reset(defaultValues);
    setSearchTerm('');

    if (isOpened) {
      setOpenedFilter(null);
    } else {
      setOpenedFilter(name);
    }
  };

  const handleClear = () => {
    const values = getValues();
    const getSubcategoriesFullName = (category, categoryName) =>
      Object.keys(category).map(subcategoryName => `${categoryName}.${subcategoryName}`);

    // Mark all values as false
    Object.keys(values)
      .flatMap(categoryName => getSubcategoriesFullName(values[categoryName], categoryName))
      .forEach(subcategoryFullName => setValue(`${subcategoryFullName}`, false));

    setSearchTerm('');
  };

  const handleChangeSearch = event => {
    const { value } = event.target;

    setSearchTerm(value);
  };

  const clearSearchTerm = () => setSearchTerm('');

  const handleTabForLastElement = event => {
    if (!event.shiftKey && event.key === 'Tab') {
      event.preventDefault();

      firstElement.current?.focus();
    }
  };

  const handleShiftTabForFirstElement = event => {
    if (event.shiftKey && event.key === 'Tab') {
      event.preventDefault();

      lastElement.current?.focus();
    }
  };

  const drawCount = () => (selectedCount === 0 ? '' : ` (${selectedCount})`);

  const highlightLabel = (label: string) => {
    if (!searchable || searchTerm.length === 0) {
      return <span>{label}</span>;
    }

    const startIndex = label.toLowerCase().indexOf(searchTerm.toLowerCase());
    const endIndex = startIndex + searchTerm.length;

    const preffix = label.substring(0, startIndex);
    const highlighted = label.substring(startIndex, endIndex);
    const suffix = label.substring(endIndex);

    return (
      <>
        {preffix}
        <strong>{highlighted}</strong>
        {suffix}
      </>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      <MultiSelectButton
        name={name}
        isOpened={isOpened}
        isActive={Boolean(selectedCount > 0)}
        type="button"
        onClick={handleClick}
        ref={ref => {
          filterButtonElement.current = ref;
        }}
        data-testid="FilterBy-Categories-Button"
      >
        {text}
        {drawCount()}
        <Flex marginLeft="15px">
          {isOpened && <ArrowDropUp />}
          {!isOpened && <ArrowDropDown />}
        </Flex>
      </MultiSelectButton>
      {isOpened && (
        <FiltersDialog width="450px" role="dialog" aria-labelledby="dialog-title">
          <DialogArrow />
          <FiltersDialogTitle id="dialog-title">Filter by: {text}</FiltersDialogTitle>
          {searchable && (
            <SearchInput
              label={searchDescription}
              innerRef={firstElement}
              searchTerm={searchTerm}
              onChangeSearch={handleChangeSearch}
              clearSearchTerm={clearSearchTerm}
              onShiftTab={handleShiftTabForFirstElement}
            />
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <MultiSelectUnorderedList scrollable={true} height="300px">
              {categories.map((category, i) => (
                <li key={i}>
                  <CategorySection
                    category={category}
                    searchTerm={searchTerm.length < 3 ? '' : searchTerm}
                    getValues={getValues}
                    setValue={setValue}
                    watch={watch}
                    highlightLabel={highlightLabel}
                    register={register}
                  />
                </li>
              ))}
            </MultiSelectUnorderedList>
            <FiltersBottomButtons>
              <Box marginRight="10px">
                <FiltersClearButton type="button" onClick={handleClear}>
                  <Template code="CaseList-Filters-Clear" />
                </FiltersClearButton>
              </Box>
              <FiltersApplyButton
                type="submit"
                onKeyDown={handleTabForLastElement}
                ref={lastElement}
                data-testid="Filter-Apply-Button"
              >
                <Template code="CaseList-Filters-Apply" />
              </FiltersApplyButton>
            </FiltersBottomButtons>
          </form>
        </FiltersDialog>
      )}
    </div>
  );
};

CategoriesFilter.displayName = 'CategoriesFilter';

export default CategoriesFilter;
