/* eslint-disable react/prop-types */
import React, { Dispatch, useState } from 'react';
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
import type { TaskEntry } from '../../states/contacts/reducer';
import { useCreateFormFromDefinition } from '../common/forms/formGenerator';

type OwnProps = {
  display: boolean;
  definition: FormDefinition;
  layoutDefinition?: LayoutDefinition;
  tabPath: keyof TaskEntry;
  initialValues: TaskEntry['callerInformation'] | TaskEntry['childInformation'] | TaskEntry['caseInformation'];
  autoFocus?: boolean;
  extraChildrenRight?: React.ReactNode;
  updateFormActionDispatcher?: (dispatch: Dispatch<any>) => (values: any) => void;
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
