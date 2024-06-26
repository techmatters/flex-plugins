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

import React, { useMemo } from 'react';
import { FieldError, useFormContext } from 'react-hook-form';
import { connect, ConnectedProps, useSelector } from 'react-redux';
import type { DefinitionVersion } from 'hrm-form-definitions';

import { useCreateFormFromDefinition } from '../../forms';
import { createSearchFormDefinition } from './SearchFormDefiniton';
import { configurationBase, namespace } from '../../../states/storeNamespaces';
import { selectWorkerSid } from '../../../states/selectors/flexSelectors';
import { Container, ColumnarBlock, TwoColumnLayout, ColumnarContent } from '../../../styles';
import { disperseInputs } from '../../common/forms/formGenerators';

type OwnProps = {
  // task: StandaloneITask;
  // display: boolean;
  // definition: DefinitionVersion['tabbedForms']['ContactlessTaskTab'];
  initialValues: any;
  autoFocus: boolean;
};

// eslint-disable-next-line import/no-unused-modules
export const SearchFormV2: React.FC<OwnProps> = ({ initialValues, autoFocus }) => {
  const { getValues, register, setError, setValue, watch, errors } = useFormContext();

  const counselorsList = useSelector(state => state[namespace][configurationBase].counselors.list);

  const formDefinition = useMemo(
    () =>
      createSearchFormDefinition({
        counselorsList,
        // definition
      }),
    [
      counselorsList,
      // definition,
    ],
  );
  const workerSid = useSelector(selectWorkerSid);

  const form = useCreateFormFromDefinition({
    definition: formDefinition,
    initialValues: {
      ...initialValues,
      createdOnBehalfOf: initialValues.createdOnBehalfOf || workerSid, // If no createdOnBehalfOf comming from state, we want the current counselor to be the default
    },
    // parentsPath: 'contactlessTask',
    parentsPath: 'search',
    updateCallback: () => {
      // const { isFutureAux, ...contactlessTaskFields } = getValues().contactlessTask;
      // updateContactlessTaskDraft(unsavedContact.id, contactlessTaskFields, helpline);
      console.log('updateCallback');
    },
    // shouldFocusFirstElement: display && autoFocus,
  });
  const searchV2Form = disperseInputs(5)(form);

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
