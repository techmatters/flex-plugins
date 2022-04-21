/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import { endOfDay, format } from 'date-fns';

import { Box, FormDateInput, FormLabel, FormRadioInput } from '../../../styles/HrmStyles';
import { DateFilterOption, DateFilterOptions, isDivider, isFixedDateRange } from './dateFilters';

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

const defaultEventHandlers = () => ({
  handleChange: () => {
    /* fu eslint */
  },
  handleBlur: () => {
    /* fu eslint */
  },
  handleFocus: () => {
    /* fu eslint */
  },
});

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

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
  type ReactHookFormValues = {
    [name: string]: string;
  };

  const optionsWithoutDividers = options.filter(opt => !isDivider(opt)) as DateFilterOption[];

  const [currentWorkingCopy, setCurrentWorkingCopy] = useState<DateFilterOption>(current);

  const formToDateFilter = (values: ReactHookFormValues): DateFilterOption | undefined => {
    const [, selected] = optionsWithoutDividers.find(([opt]) => opt === values[name]);
    if (!selected) {
      return undefined;
    }
    const copy = { ...selected };
    if (isFixedDateRange(copy)) {
      copy.from = values.customDateRangeFrom ? new Date(values.customDateRangeFrom) : undefined;
      copy.to = values.customDateRangeTo ? endOfDay(new Date(values.customDateRangeTo)) : undefined;
    }
    return [values[name], copy];
  };

  const dateFilterToForm = (
    [option, dateFilter]: DateFilterOption | undefined = [undefined, undefined],
  ): ReactHookFormValues => {
    const values = {
      [name]: option,
    };
    if (isFixedDateRange(dateFilter)) {
      values.customDateRangeFrom = dateFilter.from ? format(dateFilter.from, 'yyyy-MM-dd') : null;
      values.customDateRangeTo = dateFilter.to ? format(dateFilter.to, 'yyyy-MM-dd') : null;
    }
    return values;
  };

  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: dateFilterToForm(current),
  });

  // Force React Hook Forms to rerender whenever current value changes
  useEffect(() => {
    setCurrentWorkingCopy(current);
    reset(dateFilterToForm(current));
  }, [reset, current]);

  const onSubmit = () => {
    setOpenedFilter(null);
    applyFilter(currentWorkingCopy);
  };

  const isOpened = name === openedFilter;

  const handleClick = () => {
    // Always reset to defaultValues whenever you open/close the component
    setCurrentWorkingCopy(current);
    reset(dateFilterToForm(current));

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

  const [, currentWorkingFilter] = currentWorkingCopy ?? [];

  return (
    <div style={{ position: 'relative' }}>
      <div
        role="button"
        tabIndex={0}
        style={{
          display: 'inline-block',
          background: isOpened || current ? 'lightgray' : 'white',
          cursor: 'pointer',
          margin: '0 15px',
        }}
        onClick={handleClick}
      >
        <Template code={labelKey} />
      </div>
      {isOpened && (
        <div
          style={{
            position: 'absolute',
            background: 'white',
            top: 30,
            left: -20,
            minWidth: 200,
            padding: '15px 5px',
            border: '1px solid lightgray',
            zIndex: 100,
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <ul>
              {options.map((item, i) => {
                if (!isDivider(item)) {
                  const [option, filter] = item;
                  return (
                    <li key={i}>
                      <FormLabel htmlFor={option} style={{ flexDirection: 'row' }}>
                        <FormRadioInput
                          onChange={() => setCurrentWorkingCopy(formToDateFilter(getValues()))}
                          id={option}
                          value={option}
                          name={name}
                          type="radio"
                          innerRef={register}
                        />
                        <Template code={filter.titleKey} />
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
            </ul>
            <Box style={{ visibility: isFixedDateRange(currentWorkingFilter) ? 'inherit' : 'hidden' }}>
              <Template code="CaseList-DateFilter-CustomRange" />
              <FormDateInput
                type="date"
                id="customDateRangeFrom"
                data-testid="customDateRangeFrom"
                name="customDateRangeFrom"
                onChange={() => setCurrentWorkingCopy(formToDateFilter(getValues()))}
                innerRef={register}
              />

              <FormDateInput
                type="date"
                id="customDateRangeTo"
                data-testid="customDateRangeTo"
                name="customDateRangeTo"
                onChange={() => setCurrentWorkingCopy(formToDateFilter(getValues()))}
                innerRef={register}
              />
            </Box>
            <br />
            <button type="button" onClick={handleClear}>
              <Template code="CaseList-Filters-Clear" />
            </button>
            <button type="submit">
              <Template code="CaseList-Filters-Apply" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

DateRangeFilter.displayName = 'DateRangeFilter';

export default DateRangeFilter;
