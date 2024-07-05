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

import React, { useEffect, useMemo, useState } from 'react';
import { FieldError, useFormContext, useForm, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { DefinitionVersion, FormDefinition } from 'hrm-form-definitions';
import { pick } from 'lodash';
import { Template } from '@twilio/flex-ui';

import { useCreateFormFromDefinition } from '../../forms';
// eslint-disable-next-line prettier/prettier
import { createSearchFormDefinition} from './SearchFormDefiniton';
import { configurationBase, namespace } from '../../../states/storeNamespaces';
import { selectWorkerSid } from '../../../states/selectors/flexSelectors';
import {
  Container,
  ColumnarBlock,
  TwoColumnLayout,
  ColumnarContent,
  BottomButtonBar,
  StyledNextStepButton,
} from '../../../styles';
import { disperseInputs } from '../../common/forms/formGenerators';
import { CustomITask } from '../../../types/types';
import { SearchFormValues } from '../../../states/search/types';
import { CounselorsList } from '../../../states/configuration/types';

type OwnProps = {
  task: ITask | CustomITask;
  // definition: { counselorsList: CounselorsList };
  // // definition: any;
  initialValues: SearchFormValues;
  autoFocus: boolean;
  handleSearchFormChange: (fieldName: string, value: string) => void;
  handleSearch: (searchParams: any) => void;
};

// eslint-disable-next-line import/no-unused-modules
export const SearchFormV2: React.FC<OwnProps> = ({
  task,
  initialValues,
  autoFocus,
  handleSearchFormChange,
  handleSearch,
}) => {
  const dispatch = useDispatch();

  const methods = useForm();

  const { getValues, register, setError } = methods;

  const counselor =
    typeof initialValues.counselor === 'string' ? initialValues.counselor : initialValues.counselor.value;
  const sanitizedInitialValues = { ...pick(initialValues, ['searchInput', 'dateFrom', 'dateTo']), counselor };

  const counselorsList = useSelector(state => state[namespace][configurationBase].counselors.list);
  console.log('>>> SearchForm counselorsList', counselorsList);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (counselorsList && counselorsList.length > 0) {
      setIsLoaded(true);
    }
  }, [counselorsList]);

  const formDefinition: FormDefinition = useMemo(() => {
    if (isLoaded) {
      return createSearchFormDefinition(counselorsList);
    }
    // wait and do the same in 2 seconds
    setTimeout(() => {
      if (counselorsList && counselorsList.length > 0) {
        console.log('>>> SearchForm counselorsList', counselorsList);
        setIsLoaded(true);
      }
    }, 2000);
    return null; // Add a return statement at the end of the arrow function
  }, [isLoaded, counselorsList]);

  const form = useCreateFormFromDefinition({
    definition: formDefinition,
    initialValues: sanitizedInitialValues,
    parentsPath: '',
    updateCallback: () => {
      const values = getValues();
      console.log('>>> updateCallback values', { values, formDefinition, sanitizedInitialValues });
      Object.entries(values).forEach(([fieldName, fieldValue]) => {
        dispatch(handleSearchFormChange(fieldName, fieldValue.toString()));
      });
    },
  });

  const searchV2Form = isLoaded ? disperseInputs(5)(form) : null;

  return (
    <>
      <Container data-testid="SearchForm" data-fs-id="SearchForm" formContainer={true}>
        <FormProvider {...methods}>
          <TwoColumnLayout>
            <ColumnarBlock>
              <ColumnarContent>{searchV2Form}</ColumnarContent>
            </ColumnarBlock>
            <ColumnarBlock />
          </TwoColumnLayout>
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
