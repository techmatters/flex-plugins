/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import { endOfDay, format } from 'date-fns';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

import { Box, Flex, FormDateInput, FormLabel, FormRadioInput } from '../../../styles/HrmStyles';
import { DateFilterOption, DateFilterOptions, isDivider, isFixedDateRange } from './dateFilters';
import {
  DialogArrow,
  FiltersDialog,
  FiltersApplyButton,
  FiltersBottomButtons,
  FiltersClearButton,
  FiltersDialogTitle,
  MultiSelectButton,
  MultiSelectUnorderedList,
} from '../../../styles/caseList/filters';

type ReactHookFormValues = {
  [name: string]: string;
};

/**
 * Converts a date filter option from the current filter state to a map of values that can be used to populate the form
 * @param selectedOptionField - The key in the form map the selected option name is under (the DateRangeFilter's 'name' property in practice)
 * @param option - the name of the selected option
 * @param dateFilter - the additional settings for the selected option
 */
const dateFilterToForm = (
  selectedOptionField: string,
  [option, dateFilter]: DateFilterOption | undefined = [undefined, undefined],
): ReactHookFormValues => {
  const values = {
    [selectedOptionField]: option,
  };
  if (isFixedDateRange(dateFilter)) {
    values.customDateRangeFrom = dateFilter.from ? format(dateFilter.from, 'yyyy-MM-dd') : null;
    values.customDateRangeTo = dateFilter.to ? format(dateFilter.to, 'yyyy-MM-dd') : null;
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
): DateFilterOption | undefined => {
  const [, selected] = filterOptions.find(([opt]) => opt === values[selectedOptionField]);
  if (!selected) {
    return undefined;
  }
  const copy = { ...selected };
  if (isFixedDateRange(copy)) {
    copy.from = values.customDateRangeFrom ? new Date(values.customDateRangeFrom) : undefined;
    copy.to = values.customDateRangeTo ? endOfDay(new Date(values.customDateRangeTo)) : undefined;
  }
  return [values[selectedOptionField], copy];
};

type OwnProps = {
  name: string;
  labelKey: string;
  options: DateFilterOptions;
  current?: DateFilterOption;
  withSearch?: boolean;
  openedFilter: string;
  applyFilter: (filter: DateFilterOption) => void;
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

  const [currentWorkingCopy, setCurrentWorkingCopy] = useState<DateFilterOption>(current);

  const filterButtonElement = useRef(null);
  const firstOptionElement = useRef(null);
  const applyButtonElement = useRef(null);

  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: dateFilterToForm(name, current),
  });

  const isOpened = name === openedFilter;

  // Force React Hook Forms to rerender whenever current value changes
  useEffect(() => {
    setCurrentWorkingCopy(current);
    reset(dateFilterToForm(name, current));
  }, [name, reset, current]);

  // Close dialog on ESC
  useEffect(() => {
    const closeDialog = event => {
      if (event.key === 'Escape') {
        // Always reset to defaultValues whenever you open/close the component
        reset(dateFilterToForm(name, current));
        setOpenedFilter(null);
        filterButtonElement.current?.focus();
      }
    };

    if (isOpened) {
      window.addEventListener('keydown', closeDialog);
    }

    return () => window.removeEventListener('keydown', closeDialog);
  }, [isOpened, reset, setOpenedFilter, name, current]);

  const onSubmit = () => {
    setOpenedFilter(null);
    applyFilter(currentWorkingCopy);
  };

  const handleClick = () => {
    // Always reset to defaultValues whenever you open/close the component
    setCurrentWorkingCopy(current);
    reset(dateFilterToForm(name, current));

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
    setCurrentWorkingCopy(undefined);
    reset(dateFilterToForm(undefined));
  };

  const [, currentWorkingFilter] = currentWorkingCopy ?? [];
  const dividerStyle = { border: 'none', height: '1px', backgroundColor: 'rgb(216, 216, 216)' };
  return (
    <div style={{ position: 'relative' }}>
      <MultiSelectButton
        name={name}
        isOpened={isOpened}
        isActive={Boolean(current)}
        type="button"
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
        <FiltersDialog role="dialog" aria-labelledby="dialog-title">
          <DialogArrow />
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
                      <FormLabel htmlFor={option} style={{ flexDirection: 'row' }}>
                        <FormRadioInput
                          onKeyDown={i === 0 ? handleShiftTabForFirstElement : null}
                          onChange={() =>
                            setCurrentWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))
                          }
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
            <Box
              style={{
                visibility: isFixedDateRange(currentWorkingFilter) ? 'inherit' : 'hidden',
                alignContent: 'bottom',
                marginLeft: '20px',
              }}
            >
              <Box style={{ display: 'inline-block' }}>
                <p style={{ marginBottom: '5px' }}>
                  <Template code="CaseList-Filters-DateFilter-CustomDateFrom" />
                </p>
                <FormDateInput
                  style={{ width: '80pt' }}
                  type="date"
                  id="customDateRangeFrom"
                  data-testid="customDateRangeFrom"
                  name="customDateRangeFrom"
                  onChange={() => setCurrentWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))}
                  innerRef={register}
                />
              </Box>
              <span style={{ padding: '5px' }}>
                {' '}
                <Template code="CaseList-Filters-DateFilter-CustomRange" />{' '}
              </span>
              <Box style={{ display: 'inline-block' }}>
                <p style={{ marginBottom: '5px' }}>
                  <Template code="CaseList-Filters-DateFilter-CustomDateTo" />
                </p>
                <FormDateInput
                  style={{ width: '80pt', display: 'inline-block' }}
                  type="date"
                  id="customDateRangeTo"
                  data-testid="customDateRangeTo"
                  name="customDateRangeTo"
                  onChange={() => setCurrentWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))}
                  innerRef={register}
                />
              </Box>
            </Box>
            <hr style={dividerStyle} />

            <FiltersBottomButtons>
              <Box marginRight="10px">
                <FiltersClearButton type="button" onClick={handleClear}>
                  <Template code="CaseList-Filters-Clear" />
                </FiltersClearButton>
              </Box>
              <FiltersApplyButton
                type="submit"
                innerRef={innerRef => {
                  applyButtonElement.current = innerRef;
                  register(innerRef);
                }}
                onKeyDown={handleTabForLastElement}
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
