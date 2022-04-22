/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import { endOfDay, format } from 'date-fns';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

import { Box, Flex, FormDateInput, FormLabel, FormRadioInput } from '../../../styles/HrmStyles';
import {
  DateFilterOption,
  DateFilterOptions,
  dateFilterOptionsAreEqual,
  isDivider,
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
} from '../../../styles/caseList/filters';

type ReactHookFormValues = {
  [name: string]: string;
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

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

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

const DateRangeFilter: React.FC<Props> = ({
  name,
  labelKey,
  options,
  current,
  openedFilter,
  applyFilter,
  setOpenedFilter,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const optionsWithoutDividers = options.filter(opt => !isDivider(opt)) as DateFilterOption[];

  const [currentWorkingCopy, setCurrentWorkingCopy] = useState<DateFilterOption>(current);

  const firstElement = useRef(null);
  const lastElement = useRef(null);

  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: dateFilterToForm(name, current),
  });

  // Force React Hook Forms to rerender whenever current value changes
  useEffect(() => {
    setCurrentWorkingCopy(current);
    reset(dateFilterToForm(name, current));
  }, [name, reset, current]);

  const onSubmit = () => {
    setOpenedFilter(null);
    applyFilter(currentWorkingCopy);
  };

  const isOpened = name === openedFilter;

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

  const handleClear = () => {
    setCurrentWorkingCopy(undefined);
    reset(dateFilterToForm(undefined));
  };

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

  const [, currentWorkingFilter] = currentWorkingCopy ?? [];

  return (
    <div style={{ position: 'relative' }}>
      <MultiSelectButton isOpened={isOpened} isActive={Boolean(current)} type="button" onClick={handleClick}>
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
                const isFirstFocusableElement = i === 0;
                if (!isDivider(item)) {
                  const [option, filter] = item;
                  return (
                    <li style={{ marginBottom: '10px' }} key={i}>
                      <FormLabel htmlFor={option} style={{ flexDirection: 'row' }}>
                        <FormRadioInput
                          onChange={() =>
                            setCurrentWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))
                          }
                          id={option}
                          value={option}
                          name={name}
                          type="radio"
                          innerRef={register}
                          onKeyDown={isFirstFocusableElement ? handleShiftTabForFirstElement : null}
                        />
                        <Template code={filter.titleKey} {...(filter.titleParameters ?? {})} />
                      </FormLabel>
                    </li>
                  );
                }
                return (
                  <li key={i}>
                    <hr />
                  </li>
                );
              })}
            </MultiSelectUnorderedList>
            <Box style={{ visibility: isFixedDateRange(currentWorkingFilter) ? 'inherit' : 'hidden' }}>
              <FormDateInput
                style={{ width: '80pt', display: 'inline' }}
                type="date"
                id="customDateRangeFrom"
                data-testid="customDateRangeFrom"
                name="customDateRangeFrom"
                onChange={() => setCurrentWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))}
                innerRef={register}
              />{' '}
              <Template code="CaseList-Filters-DateFilter-CustomRange" />{' '}
              <FormDateInput
                style={{ width: '80pt', display: 'inline' }}
                type="date"
                id="customDateRangeTo"
                data-testid="customDateRangeTo"
                name="customDateRangeTo"
                onChange={() => setCurrentWorkingCopy(formToDateFilter(name, optionsWithoutDividers, getValues()))}
                innerRef={register}
              />
            </Box>

            <FiltersBottomButtons>
              <Box marginRight="10px">
                <FiltersClearButton type="button" onClick={handleClear} disabled={!currentWorkingCopy}>
                  <Template code="CaseList-Filters-Clear" />
                </FiltersClearButton>
              </Box>
              <FiltersApplyButton
                type="submit"
                onKeyDown={handleTabForLastElement}
                innerRef={lastElement}
                disabled={dateFilterOptionsAreEqual(current, currentWorkingCopy)}
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
