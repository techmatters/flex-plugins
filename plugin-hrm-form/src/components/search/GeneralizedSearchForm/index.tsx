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

import React, { useEffect, useMemo, Fragment, useRef, useState } from 'react';
import { FieldError, useFormContext, useForm, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { FormDefinition } from 'hrm-form-definitions';
import { pick } from 'lodash';
import { Template } from '@twilio/flex-ui';

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
import { disperseInputs } from '../../common/forms/formGenerators';
import { addMargin } from '../../common/forms/formGenerators';
import { CustomITask } from '../../../types/types';
import { SearchFormValues } from '../../../states/search/types';

type OwnProps = {
  task: ITask | CustomITask;
  initialValues: SearchFormValues;
  autoFocus: boolean;
  handleSearchFormUpdate: (values: Partial<SearchFormValues>) => void;
  handleSearch: (searchParams: any) => void;
};

// eslint-disable-next-line import/no-unused-modules
export const GeneralizedSearchForm: React.FC<OwnProps> = ({
  task,
  initialValues,
  autoFocus,
  handleSearchFormUpdate,
  handleSearch,
}) => {
  const layoutRef = useRef(null); // Step 1: Create a ref
  const [layoutWidth, setLayoutWidth] = useState(0); // State to store the width

  const isNarrow = layoutWidth < 1000;
  useEffect(() => {
    const updateWidth = () => {
      if (layoutRef.current) {
        setLayoutWidth(layoutRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', updateWidth);
    updateWidth(); // Initial measurement

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const dispatch = useDispatch();

  const methods = useForm<Pick<SearchFormValues, 'searchInput' | 'dateFrom' | 'dateTo' | 'counselor'>>();

  const { getValues } = methods;

  const counselor =
    typeof initialValues.counselor === 'string' ? initialValues.counselor : initialValues.counselor.value;
  const sanitizedInitialValues = { ...pick(initialValues, ['searchInput', 'dateFrom', 'dateTo']), counselor };

  const counselorsList = useSelector((state: RootState) => state[namespace][configurationBase].counselors.list);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (counselorsList && counselorsList.length > 0) {
      setIsLoaded(true);
    }
  }, [counselorsList]);

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
      <TwoColumnLayout key="searchInput" style={{ margin: '10px 0 20px 0' }}>
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

  return (
    <>
      <Container data-testid="SearchForm" data-fs-id="SearchForm" formContainer={true}>
        <FormProvider {...methods}>
          <ColumnarContent>{searchForm}</ColumnarContent>
        </FormProvider>
      </Container>
      <BottomButtonBar>
        {/* disabled={!isTouched}s */}
        <StyledNextStepButton type="button" roundCorners={true} onClick={handleSearch}>
          <Template code="SearchForm-Button" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </>
  );
};
