/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';

import SearchInput from './SearchInput';
import { Flex, Box, FormCheckbox, FormLabel } from '../../../styles/HrmStyles';
import {
  MultiSelectButton,
  DialogArrow,
  FiltersDialog,
  FiltersDialogTitle,
  MultiSelectUnorderedList,
  MultiSelectListItem,
  MultiSelectCheckboxLabel,
  FiltersBottomButtons,
  FiltersApplyButton,
  FiltersClearButton,
} from '../../../styles/caseList/filters';

export type Item = {
  value: string;
  label: string;
  checked: boolean;
};

type ReactHookFormValues = {
  [name: string]: boolean;
};

type OwnProps = {
  name: string;
  text: string;
  defaultValues: Item[];
  withSearch?: boolean;
  openedFilter: string;
  searchable?: boolean;
  searchDescription?: string;
  applyFilter: (values: Item[]) => void;
  setOpenedFilter: (name: string) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const MultiSelectFilter: React.FC<Props> = ({
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
  const transformToItems = (values: ReactHookFormValues): Item[] =>
    defaultValues.map(item => ({ ...item, checked: values[item.value] }));

  const transformToValues = (items: Item[]) =>
    items.reduce((acc, item) => ({ ...acc, [item.value]: item.checked }), {});

  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: transformToValues(defaultValues),
  });

  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const firstElement = useRef(null);
  const lastElement = useRef(null);

  // Force React Hook Forms to rerender whenever defaultValues changes
  useEffect(() => {
    const updateSelectedCount = () => {
      const count = defaultValues.reduce((acc, item) => (item.checked ? acc + 1 : acc), 0);
      setSelectedCount(count);
    };

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

    const items = transformToItems(values);
    applyFilter(items);
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
    const assignFalse = (acc: object, key: string) => ({ ...acc, [key]: false });
    const clearedValues = Object.keys(values).reduce(assignFalse, {});

    reset(clearedValues);
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

      if (firstElement.current) {
        firstElement.current.focus();
      }
    }
  };

  const handleShiftTabForFirstElement = event => {
    if (event.shiftKey && event.key === 'Tab') {
      event.preventDefault();

      if (lastElement.current) {
        lastElement.current.focus();
      }
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
      <MultiSelectButton isOpened={isOpened} type="button" onClick={handleClick}>
        {text}
        {drawCount()}
        <Flex marginLeft="15px">
          {isOpened && <ArrowDropUp />}
          {!isOpened && <ArrowDropDown />}
        </Flex>
      </MultiSelectButton>
      {isOpened && (
        <FiltersDialog role="dialog" aria-labelledby="dialog-title">
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
            <MultiSelectUnorderedList scrollable={searchable}>
              {defaultValues.map((item, i) => {
                const hidden = !item.label.toLowerCase().includes(searchTerm.toLowerCase());
                const isFirstFocusableElement = i === 0 && !searchable;

                return (
                  <MultiSelectListItem key={i} hidden={hidden}>
                    <FormLabel htmlFor={item.value} style={{ flexDirection: 'row' }}>
                      <FormCheckbox
                        id={item.value}
                        name={item.value}
                        type="checkbox"
                        defaultChecked={item.checked}
                        innerRef={innerRef => {
                          if (isFirstFocusableElement) {
                            firstElement.current = innerRef;
                          }
                          register(innerRef);
                        }}
                        onKeyDown={isFirstFocusableElement ? handleShiftTabForFirstElement : null}
                      />
                      <MultiSelectCheckboxLabel>{highlightLabel(item.label)}</MultiSelectCheckboxLabel>
                    </FormLabel>
                  </MultiSelectListItem>
                );
              })}
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

MultiSelectFilter.displayName = 'MultiSelectFilter';

export default MultiSelectFilter;
