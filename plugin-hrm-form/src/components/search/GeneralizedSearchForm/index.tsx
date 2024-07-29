/* eslint-disable jsx-a11y/no-autofocus */
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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { FormDefinition } from 'hrm-form-definitions';
import { pick } from 'lodash';
import { Template } from '@twilio/flex-ui';

import { SearchFormClearButton } from '../../resources/styles';
import type { RootState } from '../../../states';
import { useCreateFormFromDefinition } from '../../forms';
import { createSearchFormDefinition } from './SearchFormDefiniton';
import { configurationBase, namespace } from '../../../states/storeNamespaces';
import {
  Container,
  ColumnarBlock,
  BottomButtonBar,
  StyledNextStepButton,
  FontOpenSans,
  Bold,
  DateRangeSpacer,
  TwoColumnLayoutResponsive,
  SearchFormTopRule,
} from '../../../styles';
import { addMargin } from '../../common/forms/formGenerators';
import { CustomITask } from '../../../types/types';
import { SearchFormValues } from '../../../states/search/types';
import { splitDate } from '../../../utils/helpers';

type OwnProps = {
  task: ITask | CustomITask;
  initialValues: SearchFormValues;
  handleSearchFormUpdate: (values: Partial<SearchFormValues>) => void;
  handleSearch: (searchParams: any) => void;
};

export const GeneralizedSearchForm: React.FC<OwnProps> = ({ initialValues, handleSearchFormUpdate, handleSearch }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const updateWidth = () => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  };
  useEffect(() => {
    window.addEventListener('resize', updateWidth);
    updateWidth();

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const dispatch = useDispatch();

  const methods = useForm<Pick<SearchFormValues, 'searchTerm' | 'dateFrom' | 'dateTo' | 'counselor'>>();
  const { getValues, watch, setError, clearErrors, reset, handleSubmit } = methods;

  const validateEmptyForm =
    watch().searchTerm === '' && watch().counselor === '' && watch().dateFrom === '' && watch().dateTo === '';

  const onSubmit = handleSubmit(values => {
    if (!validateEmptyForm) {
      handleSearch(values);
    }
  });

  const counselor =
    typeof initialValues.counselor === 'string' ? initialValues.counselor : initialValues.counselor.value;
  const sanitizedInitialValues = { ...pick(initialValues, ['searchTerm', 'dateFrom', 'dateTo']), counselor };

  const counselorsList = useSelector((state: RootState) => state[namespace][configurationBase].counselors.list);

  const formDefinition: FormDefinition = useMemo(() => createSearchFormDefinition({ counselorsList }), [
    counselorsList,
  ]);

  const form = useCreateFormFromDefinition({
    definition: formDefinition,
    initialValues: sanitizedInitialValues,
    parentsPath: '',
    updateCallback: () => {
      const values = getValues();
      dispatch(handleSearchFormUpdate(values));
    },
  });

  const arrangeSearchFormItems = (margin: number) => (formItems: JSX.Element[]) => {
    const itemsWithMargin = formItems.map(item => addMargin(margin)(item));

    return [
      <div key="searchTerm">{itemsWithMargin[0]}</div>,
      <FontOpenSans key="filter-subtitle " style={{ margin: '10px' }}>
        <Bold>Optional Filters</Bold>
      </FontOpenSans>,
      <div key="counselor">{itemsWithMargin[1]}</div>,
      <TwoColumnLayoutResponsive key="dateRange" width={containerWidth}>
        <ColumnarBlock>{itemsWithMargin[2]}</ColumnarBlock>
        <DateRangeSpacer width={containerWidth}>-</DateRangeSpacer>
        <ColumnarBlock>{itemsWithMargin[3]}</ColumnarBlock>
      </TwoColumnLayoutResponsive>,
    ];
  };

  const searchForm = arrangeSearchFormItems(5)(form);

  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  useEffect(() => {
    const dateFromValue = watch('dateFrom');
    const dateToValue = watch('dateTo');

    setDateFrom(dateFromValue);
    setDateTo(dateToValue);
  }, [watch]);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    const validateDate = (date: string, errorKey: string) => {
      if (date) {
        const [y, m, d] = splitDate(date);
        const dateValue = new Date(y, m - 1, d);

        if (dateValue > new Date()) {
          setError(errorKey, { type: 'manual', message: 'DateCantBeGreaterThanToday' });
        } else {
          clearErrors(errorKey);
        }
      }
    };

    const validateDateRange = (dateFrom: string, dateTo: string) => {
      if (dateFrom && dateTo) {
        const [yFrom, mFrom, dFrom] = splitDate(dateFrom);
        const [yTo, mTo, dTo] = splitDate(dateTo);
        const dateFromValue = new Date(yFrom, mFrom - 1, dFrom);
        const dateToValue = new Date(yTo, mTo - 1, dTo);

        if (dateFromValue > dateToValue) {
          setError('dateTo', { type: 'manual', message: 'DateToCantBeGreaterThanFrom' });
        }
        if (dateFromValue > new Date()) {
          setError('dateFrom', { type: 'manual', message: 'DateCantBeGreaterThanToday' });
        }
        if (dateToValue > new Date()) {
          setError('dateTo', { type: 'manual', message: 'DateCantBeGreaterThanToday' });
        }
        if (!(dateFromValue > dateToValue) && !(dateFromValue > new Date()) && !(dateToValue > new Date())) {
          clearErrors('dateTo');
        }
      }
    };

    validateDate(dateFrom, 'dateFrom');
    validateDate(dateTo, 'dateTo');
    validateDateRange(dateFrom, dateTo);
  }, [dateFrom, dateTo, setError, clearErrors]);

  const clearForm = () => reset({ searchTerm: '', counselor: '', dateFrom: '', dateTo: '' });

  return (
    <FormProvider {...methods}>
      <SearchFormTopRule />
      <form onSubmit={onSubmit}>
        <Container
          data-testid="GeneralizedSearchForm"
          data-fs-id="SearchForm"
          formContainer={true}
          ref={containerRef}
          autoFocus={false}
          style={{ border: 'none' }}
        >
          {searchForm}
        </Container>
        <BottomButtonBar
          style={{ position: 'fixed', bottom: '0', width: containerWidth + 40, borderTop: '1px solid #e1e3ea' }}
        >
          <SearchFormClearButton
            type="button"
            secondary="true"
            roundCorners={true}
            onClick={clearForm}
            disabled={validateEmptyForm}
          >
            <Template code="Search-ClearFormButton" />
          </SearchFormClearButton>
          <StyledNextStepButton type="submit" roundCorners={true} disabled={validateEmptyForm}>
            <Template code="SearchForm-Button" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </form>
    </FormProvider>
  );
};
