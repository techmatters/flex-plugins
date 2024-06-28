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

import React, { useEffect, useMemo } from 'react';
import { FieldError, useFormContext, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { DefinitionVersion, FormDefinition } from 'hrm-form-definitions';

import { useCreateFormFromDefinition } from '../../forms';
// eslint-disable-next-line prettier/prettier
import { createSearchFormDefinition} from './SearchFormDefiniton';
import { configurationBase, namespace } from '../../../states/storeNamespaces';
import { selectWorkerSid } from '../../../states/selectors/flexSelectors';
import { Container, ColumnarBlock, TwoColumnLayout, ColumnarContent } from '../../../styles';
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

  const emptyForm = {
    searchInput: '',
    createdOnBehalfOf: '',
    dateTo: '2024-06-27',
    dateFrom: '2024-06-26',
  };
  // dispatch(handleSearchFormChange('searchInput', '2024-06-26'));

  // const { getValues, register, setError, setValue, watch, errors } = useForm({ defaultValues: initialValues });
  const { getValues, register, setError, setValue, watch, errors } = useForm({});

  // console.log('>>> SearchFormV2 getValues()', getValues());

  const counselorsList = useSelector(state => state[namespace][configurationBase].counselors.list);
  // const workerSid = useSelector(selectWorkerSid);
  // console.log('>>>counselorsList', counselorsList);

  const formDefinition: FormDefinition = useMemo(() => createSearchFormDefinition(counselorsList), [counselorsList]);

  const form = useCreateFormFromDefinition({
    definition: formDefinition,
    initialValues: {
      ...initialValues,
      // TODO: remove this
      counselor: '',
      helpline: '',
    },
    parentsPath: '',
    updateCallback: () => {
      const values = getValues();
      // console.log('>>>values', values);
      // const { isFutureAux, ...contactlessTaskFields } = getValues().contactlessTask;
      console.log('>>>updateCallback');
      Object.entries(values).forEach(([fieldName, fieldValue]) => {
        dispatch(handleSearchFormChange(fieldName, fieldValue.toString()));
      });
    },
    // shouldFocusFirstElement: display && autoFocus,
  });
  const searchV2Form = disperseInputs(5)(form);

  // useEffect(() => {
  //   console.log('>>>useEffect', getValues());
  // }, [getValues]);

  React.useEffect(() => {
    console.log('>>> ContactlessTaskTab useEffect', getValues());
    register('searchInput', {
      validate: () => {
        // const { contactlessTask } = getValues();
        // const { date, time } = contactlessTask;
        // if (date && time) {
        //   const [y, m, d] = splitDate(date);
        //   const [mm, hh] = splitTime(time);
        //   if (isFuture(new Date(y, m - 1, d, mm, hh))) {
        //     return 'TimeCantBeGreaterThanNow'; // return non-null to generate an error, using the localized error key
        //   }
        // }
        console.log('>>> searchInput validate');
        return ''; // null
      },
    });
  }, [getValues, register, setError]);

  return (
    <Container formContainer={true}>
      <TwoColumnLayout>
        <ColumnarBlock>
          <ColumnarContent>SearchFormV2</ColumnarContent>
          <ColumnarContent>{searchV2Form}</ColumnarContent>
        </ColumnarBlock>
        <ColumnarBlock />
      </TwoColumnLayout>
    </Container>
  );
};
