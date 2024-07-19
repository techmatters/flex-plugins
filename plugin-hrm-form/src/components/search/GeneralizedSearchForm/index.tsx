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

import React, { useMemo, useEffect } from 'react';
import { useForm, FormProvider, FieldError } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { FormDefinition } from 'hrm-form-definitions';
import { pick, get } from 'lodash';
import { Template } from '@twilio/flex-ui';
import { isFuture } from 'date-fns';

import type { RootState } from '../../../states';
import { useCreateFormFromDefinition } from '../../forms';
import { createSearchFormDefinition } from './SearchFormDefiniton';
import { configurationBase, namespace } from '../../../states/storeNamespaces';
import {
  Container,
  ColumnarBlock,
  TwoColumnLayout,
  ColumnarContent,
  BottomButtonBar,
  StyledNextStepButton,
  FontOpenSans,
  Bold,
  DateRangeSpacer,
  TwoColumnLayoutResponsive,
} from '../../../styles';
import { addMargin } from '../../common/forms/formGenerators';
import { CustomITask } from '../../../types/types';
import { SearchFormValues } from '../../../states/search/types';
import useFocus from '../../../utils/useFocus';
import { splitDate } from '../../../utils/helpers';

type OwnProps = {
  task: ITask | CustomITask;
  initialValues: SearchFormValues;
  autoFocus: boolean;
  handleSearchFormUpdate: (values: Partial<SearchFormValues>) => void;
  handleSearch: (searchParams: any) => void;
};

export const GeneralizedSearchForm: React.FC<OwnProps> = ({ initialValues, handleSearchFormUpdate, handleSearch }) => {
  const dispatch = useDispatch();
  const focusElementRef = useFocus();

  const methods = useForm<Pick<SearchFormValues, 'searchTerm' | 'dateFrom' | 'dateTo' | 'counselor'>>();
  const { register, getValues, watch, setError, errors } = methods;

  // Custom validation for date inputs in the search form to prevent future dates and invalid date ranges
  useEffect(() => {
    register('isFutureAux', {
      validate: () => {
        const { dateFrom, dateTo } = getValues();

        console.log('>>> dates to validate', { dateFrom, dateTo });

        if (dateFrom && dateTo) {
          const [yFrom, mFrom, dFrom] = splitDate(dateFrom);
          const [yTo, mTo, dTo] = splitDate(dateTo);

          const fromDate = new Date(yFrom, mFrom - 1, dFrom);
          const toDate = new Date(yTo, mTo - 1, dTo);

          if (fromDate.getTime() > toDate.getTime()) return 'DateFromCantBeGreaterThanDateTo';
        }

        return null;
      },
    });
  }, [register, getValues, watch, setError]);

  const isFutureError: FieldError = get(errors, 'search.isFutureAux');
  React.useEffect(() => {
    if (isFutureError) setError('search.dateFrom', { message: isFutureError.message, type: 'isFutureAux' });
  }, [isFutureError, setError]);

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
    parentsPath: 'search',
    updateCallback: () => {
      const values = getValues();
      dispatch(handleSearchFormUpdate(values));
    },
  });

  const arrangeSearchFormItems = (margin: number) => (formItems: JSX.Element[]) => {
    const itemsWithMargin = formItems.map(item => addMargin(margin)(item));

    return [
      <TwoColumnLayout
        key="searchTerm"
        ref={ref => {
          focusElementRef.current = ref;
        }}
        style={{ margin: '10px 0 20px 0' }}
      >
        {itemsWithMargin[0]}
      </TwoColumnLayout>,
      <FontOpenSans key="filter-subtitle " style={{ marginBottom: '20px' }}>
        <Bold>Optional Filters</Bold>
      </FontOpenSans>,
      <ColumnarContent key="counselor">{itemsWithMargin[1]}</ColumnarContent>,
      <TwoColumnLayoutResponsive key="dateRange">
        <ColumnarBlock>{itemsWithMargin[2]}</ColumnarBlock>
        <DateRangeSpacer>-</DateRangeSpacer>
        <ColumnarBlock>{itemsWithMargin[3]}</ColumnarBlock>
      </TwoColumnLayoutResponsive>,
    ];
  };

  const searchForm = arrangeSearchFormItems(5)(form);

  console.log('>>> searchForm', initialValues, watch('searchTerm'), watch('dateFrom'), watch('dateTo'));

  return (
    <>
      <Container data-testid="SearchForm" data-fs-id="SearchForm" formContainer={true}>
        <FormProvider {...methods}>
          <ColumnarContent>{searchForm}</ColumnarContent>
        </FormProvider>
      </Container>
      <BottomButtonBar>
        <StyledNextStepButton
          type="button"
          roundCorners={true}
          onClick={handleSearch}
          disabled={watch('searchTerm') === ''}
        >
          <Template code="SearchForm-Button" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </>
  );
};
