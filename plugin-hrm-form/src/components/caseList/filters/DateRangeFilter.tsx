/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import { endOfDay, format, parse } from 'date-fns';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

import { Box, Flex, FormDateInput, FormLabel, FormRadioInput } from '../../../styles/HrmStyles';
import {
  DateFilterOption,
  DateFilterOptions,
  DateFilterValue,
  isDivider,
  isExistsDateFilter,
  isExistsDateFilterValue,
  isFixedDateRange,
} from './dateFilters';
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
} from '../../../styles/caseList/filters';

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
  const [, selected] = filterOptions.find(([opt]) => opt === values[selectedOptionField]);
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
  const [dateValidations, setDateValidations] = useState({ to: false, from: false, error: '', errorColor: '' });

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

  const resetDateValidation = () => {
    setDateValidations(prev => ({ ...prev, to: false, from: false, error: '', errorColor: '' }));
  };

  const handleDateValidation = () => {
    const today = new Date();

    if (currentWorkingCopy.to < currentWorkingCopy.from) {
      setDateValidations(prev => ({
        ...prev,
        to: true,
        from: false,
        error: `The end date selected cannot be before the start date`,
        errorColor: '1px solid red',
      }));
      return;
    }

    if (name !== 'followUpDateFilter' && (currentWorkingCopy?.from > today || currentWorkingCopy?.to > today)) {
      setDateValidations(prev => ({
        ...prev,
        // eslint-disable-next-line no-unneeded-ternary
        to: currentWorkingCopy?.to > today ? true : false,
        // eslint-disable-next-line no-unneeded-ternary
        from: currentWorkingCopy?.from > today ? true : false,
        error: `Date can't be in the future`,
        errorColor: '1px solid red',
      }));
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <MultiSelectButton
        isOpened={isOpened}
        isActive={Boolean(current)}
        type="button"
        name={name}
        onClick={handleClick}
        innerRef={innerRef => {
          filterButtonElement.current = innerRef;
          register(innerRef);
        }}
      >
        <Template code={labelKey} />
        <Flex marginLeft="15px">
          {isOpened && <ArrowDropUp />}
          {!isOpened && <ArrowDropDown />}
        </Flex>
      </MultiSelectButton>
      {isOpened && (
        <FiltersDialog
          role="dialog"
          aria-labelledby="dialog-title"
          left={name === 'followUpDateFilter' ? '-200px' : '-95px'}
        >
          <DialogArrow left={name === 'followUpDateFilter' ? '250px' : '140px'} />
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
                          onChange={() =>
                            updateWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))
                          }
                          // This is a work around to issue CHI-1200: Custom Date Filters
                          onClick={() => updateWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))}
                          id={option}
                          value={option}
                          name={name}
                          type="radio"
                          innerRef={innerRef => {
                            if (i === 0) {
                              firstOptionElement.current = innerRef;
                            }
                            register(innerRef);
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
            <Box style={{ display: 'inline-block' }}>
              <p style={{ marginBottom: '5px' }}>
                <Template code="CaseList-Filters-DateFilter-CustomDateFrom" />
              </p>
              <FormDateInput
                placeholder="red"
                style={{ width: '85pt', border: dateValidations.from ? dateValidations.errorColor : '' }}
                type="date"
                id="customDateRangeFrom"
                data-testid="customDateRangeFrom"
                name="customDateRangeFrom"
                onChange={() => updateWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))}
                onBlur={() => handleDateValidation()}
                onFocus={() => resetDateValidation()}
                innerRef={register}
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
                  border: dateValidations.to ? dateValidations.errorColor : '',
                }}
                type="date"
                id="customDateRangeTo"
                data-testid="customDateRangeTo"
                name="customDateRangeTo"
                onChange={() => updateWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))}
                onBlur={() => handleDateValidation()}
                onFocus={() => resetDateValidation()}
                innerRef={register}
              />
            </Box>
            <DateErrorMessage marginLeft="5px">{dateValidations.from ? dateValidations.error : ''}</DateErrorMessage>
            <DateErrorMessage marginLeft="25px">{dateValidations.to ? dateValidations.error : ''}</DateErrorMessage>

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
                innerRef={innerRef => {
                  applyButtonElement.current = innerRef;
                  register(innerRef);
                }}
                onKeyDown={handleTabForLastElement}
                // eslint-disable-next-line no-unneeded-ternary
                disabled={dateValidations.to || dateValidations.from ? true : false}
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
