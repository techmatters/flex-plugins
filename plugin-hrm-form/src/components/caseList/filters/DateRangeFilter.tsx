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
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import { endOfDay, format, parse } from 'date-fns';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

import { Box, Flex, FormDateInput, FormLabel, FormRadioInput } from '../../../styles/HrmStyles';
import { DateFilterOption, DateFilterOptions, isDivider, isExistsDateFilter, isFixedDateRange } from './dateFilters';
import {
  DialogArrow,
  FiltersDialog,
  FiltersApplyButton,
  FiltersBottomButtons,
  FiltersClearButton,
  FiltersDialogTitle,
  MultiSelectButton,
  MultiSelectUnorderedList,
  DateErrorMessage,
} from '../../../styles/table/filters';
import { DateFilterValue, isExistsDateFilterValue } from '../../../states/caseList/dateFilters';

type ReactHookFormValues = {
  [name: string]: string;
};

const findCurrentOption = (options: DateFilterOption[], dateFilterValue: DateFilterValue | undefined) =>
  dateFilterValue ? options.find(([option]) => option === dateFilterValue.option) : undefined;

/**
 * Converts a date filter option from the current filter state to a map of values that can be used to populate the form
 * @param selectedOptionField - The key in the form map the selected option name is under (the DateRangeFilter's 'name' property in practice)
 * @param options - the name of the selected option
 * @param dateFilterValue - the additional settings for the selected option
 */
const dateFilterToForm = (
  selectedOptionField: string,
  options: DateFilterOption[],
  dateFilterValue: DateFilterValue | undefined,
): ReactHookFormValues => {
  if (!dateFilterValue) {
    return {};
  }
  const values = {
    [selectedOptionField]: dateFilterValue.option,
  };
  const dateFilterOption = findCurrentOption(options, dateFilterValue);
  if (dateFilterOption) {
    const [, filterParams] = dateFilterOption;
    if (isFixedDateRange(filterParams) && !isExistsDateFilterValue(dateFilterValue)) {
      values.customDateRangeFrom = dateFilterValue.from ? format(dateFilterValue.from, 'yyyy-MM-dd') : null;
      values.customDateRangeTo = dateFilterValue.to ? format(dateFilterValue.to, 'yyyy-MM-dd') : null;
    }
  }
  return values;
};

/**
 * Converts the React Hook Form value map into a DateFilterOption, that is used to represent a selected date filter option + additional parameters internally
 * @param selectedOptionField - The key in the form map the selected option name is under (the DateRangeFilter's 'name' property in practice)
 * @param filterOptions - the valid filter options for the DateFilter being set
 * @param values - the form values map
 */
const formToDateFilter = (
  selectedOptionField: string,
  filterOptions: DateFilterOption[],
  values: ReactHookFormValues,
): DateFilterValue | undefined => {
  const [, selected] = filterOptions?.find(([opt]) => opt === values[selectedOptionField]) ?? [];
  if (!selected) {
    return undefined;
  }
  if (isExistsDateFilter(selected)) {
    return { option: values[selectedOptionField], exists: selected.exists };
  } else if (isFixedDateRange(selected)) {
    return {
      option: values[selectedOptionField],
      from: values.customDateRangeFrom ? parse(values.customDateRangeFrom, 'yyyy-MM-dd', new Date()) : undefined,
      to: values.customDateRangeTo ? endOfDay(parse(values.customDateRangeTo, 'yyyy-MM-dd', new Date())) : undefined,
    };
  }
  return {
    option: values[selectedOptionField],
    from: selected.from(new Date()),
    to: selected.to(new Date()),
  };
};

type OwnProps = {
  name: string;
  allowFutureDates: boolean;
  labelKey: string;
  options: DateFilterOptions;
  current?: DateFilterValue;
  withSearch?: boolean;
  openedFilter: string;
  applyFilter: (filter: DateFilterValue) => void;
  setOpenedFilter: (name: string) => void;
};

type Props = OwnProps;

const DateRangeFilter: React.FC<Props> = ({
  name,
  allowFutureDates,
  labelKey,
  options,
  current, // represents the current filter applied to the list, as opposed to currentWorkingCopy, which is the one the user is currently changing in this component.
  openedFilter,
  applyFilter,
  setOpenedFilter,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const optionsWithoutDividers = options.filter(opt => !isDivider(opt)) as DateFilterOption[];

  const [currentWorkingCopy, setCurrentWorkingCopy] = useState<DateFilterValue>(current);
  const [dateValidations, setDateValidations] = useState({
    to: { invalid: false, error: '' },
    from: { invalid: false, error: '' },
  });

  const filterButtonElement = useRef(null);
  const firstOptionElement = useRef(null);
  const applyButtonElement = useRef(null);

  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: dateFilterToForm(name, optionsWithoutDividers, currentWorkingCopy),
  });

  const isOpened = name === openedFilter;

  /**
   * Need to update the UI & the working copy together
   * @param newWorkingCopy
   */
  const updateWorkingCopy = (newWorkingCopy: DateFilterValue | undefined) => {
    resetDateValidation();
    setCurrentWorkingCopy(newWorkingCopy);
    reset(dateFilterToForm(name, optionsWithoutDividers, newWorkingCopy));
  };

  // Force React Hook Forms to rerender whenever current value changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => updateWorkingCopy(current), [name, reset, current]);

  // Close dialog on ESC
  useEffect(() => {
    const closeDialog = event => {
      if (event.key === 'Escape') {
        // Always reset to defaultValues whenever you open/close the component
        reset(dateFilterToForm(name, optionsWithoutDividers, current));
        setOpenedFilter(null);
        filterButtonElement.current?.focus();
      }
    };

    if (isOpened) {
      window.addEventListener('keydown', closeDialog);
    }

    return () => window.removeEventListener('keydown', closeDialog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpened, reset, setOpenedFilter, name, current]);

  const onSubmit = () => {
    setOpenedFilter(null);
    applyFilter(currentWorkingCopy);
  };

  const handleClick = () => {
    // Always reset to defaultValues whenever you open/close the component
    updateWorkingCopy(current);

    if (isOpened) {
      setOpenedFilter(null);
    } else {
      setOpenedFilter(name);
    }
  };

  const handleTabForLastElement = event => {
    if (!event.shiftKey && event.key === 'Tab') {
      event.preventDefault();
      firstOptionElement.current?.focus();
    }
  };

  const handleShiftTabForFirstElement = event => {
    if (event.shiftKey && event.key === 'Tab') {
      event.preventDefault();
      applyButtonElement.current?.focus();
    }
  };

  const handleClear = () => {
    updateWorkingCopy(undefined);
    resetDateValidation();
  };

  const dividerStyle = { border: 'none', height: '1px', backgroundColor: 'rgb(216, 216, 216)' };
  const currentOption = findCurrentOption(optionsWithoutDividers, currentWorkingCopy);
  const showCustomDateFields = currentOption ? isFixedDateRange(currentOption[1]) : false;

  const resetDateValidation = () => {
    setDateValidations(prev => ({ ...prev, to: { invalid: false, error: '' }, from: { invalid: false, error: '' } }));
  };

  const handleOnClick = () => {
    updateWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()));
  };

  const handleDateValidation = () => {
    const today = new Date();

    if (!isExistsDateFilterValue(currentWorkingCopy)) {
      if (!allowFutureDates && (currentWorkingCopy.from > today || currentWorkingCopy.to > today)) {
        setDateValidations(prev => ({
          ...prev,
          to: { invalid: currentWorkingCopy.to > today, error: `Date can't be in the future` },
          from: { invalid: currentWorkingCopy.from > today, error: `Date can't be in the future` },
        }));
      }

      if (currentWorkingCopy.to < currentWorkingCopy.from) {
        setDateValidations(prev => ({
          ...prev,
          to: { invalid: true, error: `The end date selected cannot be before the start date` },
        }));
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <MultiSelectButton
        data-testid={`FilterBy-${name}-Button`}
        isOpened={isOpened}
        isActive={Boolean(current)}
        type="button"
        name={name}
        onClick={handleClick}
        ref={ref => {
          filterButtonElement.current = ref;
          register(ref);
        }}
      >
        <Template code={labelKey} />
        <Flex marginLeft="15px">
          {isOpened && <ArrowDropUp />}
          {!isOpened && <ArrowDropDown />}
        </Flex>
      </MultiSelectButton>
      {isOpened && (
        <FiltersDialog role="dialog" aria-labelledby="dialog-title" left={allowFutureDates ? '-200px' : '-95px'}>
          <DialogArrow left={allowFutureDates ? '250px' : '140px'} />
          <FiltersDialogTitle id="dialog-title">
            <Template code="CaseList-Filters-DialogTitlePrefix" /> <Template code={labelKey} />
          </FiltersDialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <MultiSelectUnorderedList>
              {options.map((item, i) => {
                if (!isDivider(item)) {
                  const [option, filter] = item;
                  return (
                    <li style={{ marginBottom: '10px' }} key={i}>
                      <FormLabel htmlFor={option} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FormRadioInput
                          onKeyDown={i === 0 ? handleShiftTabForFirstElement : null}
                          /*
                           * This is a work around to issue CHI-1661: CaseList Date Filter Error.
                           * We can only use onClick to perform event actions rather than onChange
                           */
                          onClick={handleOnClick}
                          id={option}
                          value={option}
                          name={name}
                          type="radio"
                          ref={ref => {
                            if (i === 0) {
                              firstOptionElement.current = ref;
                            }
                            register(ref);
                          }}
                        />
                        <Template code={filter.titleKey} {...(filter.titleParameters ?? {})} />
                      </FormLabel>
                    </li>
                  );
                }
                return (
                  <li key={i}>
                    <hr style={dividerStyle} />
                  </li>
                );
              })}
            </MultiSelectUnorderedList>
            <Box
              style={{
                display: showCustomDateFields ? 'inherit' : 'none',
              }}
            >
              <Box style={{ display: 'inline-block' }}>
                <p style={{ marginBottom: '5px' }}>
                  <Template code="CaseList-Filters-DateFilter-CustomDateFrom" />
                </p>
                <FormDateInput
                  placeholder="red"
                  style={{ width: '85pt', border: dateValidations.from.invalid ? '1px solid red' : '' }}
                  type="date"
                  id="customDateRangeFrom"
                  data-testid="customDateRangeFrom"
                  name="customDateRangeFrom"
                  onChange={() => updateWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))}
                  onBlur={() => handleDateValidation()}
                  onFocus={() => resetDateValidation()}
                  ref={register}
                />
              </Box>
              <span style={{ padding: '5px' }}>
                <Template code="CaseList-Filters-DateFilter-CustomRange" />{' '}
              </span>
              <Box style={{ display: 'inline-block' }}>
                <p style={{ marginBottom: '5px' }}>
                  <Template code="CaseList-Filters-DateFilter-CustomDateTo" />
                </p>

                <FormDateInput
                  style={{
                    width: '85pt',
                    display: 'inline-block',
                    border: dateValidations.to.invalid ? '1px solid red' : '',
                  }}
                  type="date"
                  id="customDateRangeTo"
                  data-testid="customDateRangeTo"
                  name="customDateRangeTo"
                  onChange={() => updateWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))}
                  onBlur={() => handleDateValidation()}
                  onFocus={() => resetDateValidation()}
                  ref={register}
                />
              </Box>
            </Box>
            <DateErrorMessage marginLeft="5px">
              {dateValidations.from.invalid ? dateValidations.from.error : ''}
            </DateErrorMessage>
            <DateErrorMessage marginLeft="25px">
              {dateValidations.to.invalid ? dateValidations.to.error : ''}
            </DateErrorMessage>

            <hr style={dividerStyle} />

            <FiltersBottomButtons>
              <Box marginRight="10px">
                <FiltersClearButton type="button" name="applyButton" onClick={handleClear}>
                  <Template code="CaseList-Filters-Clear" />
                </FiltersClearButton>
              </Box>
              <FiltersApplyButton
                type="submit"
                name="applyButton"
                ref={ref => {
                  applyButtonElement.current = ref;
                  register(ref);
                }}
                onKeyDown={handleTabForLastElement}
                disabled={dateValidations.to.invalid || dateValidations.from.invalid}
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

DateRangeFilter.displayName = 'DateRangeFilter';

export default DateRangeFilter;
