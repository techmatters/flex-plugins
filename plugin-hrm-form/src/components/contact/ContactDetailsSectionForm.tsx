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

/* eslint-disable react/prop-types */
import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import type { FormDefinition, LayoutDefinition } from 'hrm-form-definitions';
import { useFormContext } from 'react-hook-form';

import {
  ColumnarBlock,
  Container,
  TwoColumnLayout,
  Box,
  BottomButtonBarHeight,
  ColumnarContent,
} from '../../styles/HrmStyles';
import { disperseInputs, splitAt, splitInHalf } from '../common/forms/formGenerators';
import { useCreateFormFromDefinition } from '../forms';
import { TaskEntry } from '../../states/contacts/types';

type OwnProps = {
  display: boolean;
  definition: FormDefinition;
  layoutDefinition?: LayoutDefinition;
  tabPath: keyof TaskEntry;
  initialValues: TaskEntry['callerInformation'] | TaskEntry['childInformation'] | TaskEntry['caseInformation'];
  autoFocus?: boolean;
  extraChildrenRight?: React.ReactNode;
  updateFormActionDispatcher?: (dispatch: Dispatch<any>) => (values: any) => void;
  contactId?: string;
  taskSid?: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactDetailsSectionForm: React.FC<Props> = ({
  display,
  definition,
  layoutDefinition,
  tabPath,
  initialValues,
  autoFocus,
  updateForm,
  extraChildrenRight,
  contactId,
  taskSid,
}) => {
  const { getValues } = useFormContext();

  const form = useCreateFormFromDefinition({
    definition,
    initialValues,
    parentsPath: tabPath,
    updateCallback: () => {
      updateForm(getValues());
    },
    shouldFocusFirstElement: display && autoFocus,
    context: { taskSid, contactId },
  });

  const [l, r] = React.useMemo(() => {
    const margin = 12;

    if (layoutDefinition && layoutDefinition.splitFormAt)
      return splitAt(layoutDefinition.splitFormAt)(disperseInputs(7)(form));

    return splitInHalf(disperseInputs(margin)(form));
  }, [layoutDefinition, form]);

  return (
    <Container>
      <Box paddingBottom={`${BottomButtonBarHeight}px`}>
        <TwoColumnLayout>
          <ColumnarBlock>
            <ColumnarContent>{l}</ColumnarContent>
          </ColumnarBlock>
          <ColumnarBlock>
            <ColumnarContent>
              {r}
              {extraChildrenRight}
            </ColumnarContent>
          </ColumnarBlock>
        </TwoColumnLayout>
      </Box>
    </Container>
  );
};

ContactDetailsSectionForm.displayName = 'TabbedFormTab';

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  updateForm: ownProps.updateFormActionDispatcher(dispatch),
});

const connector = connect(null, mapDispatchToProps);
const connected = connector(ContactDetailsSectionForm);

export default connected;
