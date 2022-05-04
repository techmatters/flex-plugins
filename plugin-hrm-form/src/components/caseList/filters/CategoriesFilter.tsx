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
} from '../../../styles/caseList/filters';
import type { Item } from './MultiSelectFilter';
import CategorySection from './CategorySection';

type Subcategory = Item;
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
  defaultValues,
  openedFilter,
  searchable,
  searchDescription,
  applyFilter,
  setOpenedFilter,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const transformToCategories = (values: ReactHookFormValues): Category[] => {
    const getSubcategories = category =>
      Object.keys(category).map(subcategoryName => ({
        value: subcategoryName,
        label: subcategoryName,
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
    console.log('>> Categories filter defaultValues change');
    console.log({ defaultValues });
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
        innerRef={innerRef => {
          filterButtonElement.current = innerRef;
        }}
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
                    searchTerm={searchTerm}
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
              <FiltersApplyButton type="submit" onKeyDown={handleTabForLastElement} innerRef={lastElement}>
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
