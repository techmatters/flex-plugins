/* eslint-disable react/prop-types */
import React, { Dispatch } from 'react';
import { useFormContext } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import type { FormDefinition, LayoutDefinition } from 'hrm-form-definitions';

import {
  ColumnarBlock,
  Container,
  TwoColumnLayout,
  Box,
  BottomButtonBarHeight,
  ColumnarContent,
} from '../../styles/HrmStyles';
import { createFormFromDefinition, disperseInputs, splitAt, splitInHalf } from '../common/forms/formGenerators';
import type { TaskEntry } from '../../states/contacts/reducer';
import useFocus from '../../utils/useFocus';

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
  const shouldFocusFirstElement = display && autoFocus;
  const firstElementRef = useFocus(shouldFocusFirstElement);

  const [initialForm] = React.useState(initialValues); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const { getValues } = useFormContext();
  const updateCallback = () => {
    updateForm(getValues());
  };

  const generatedForm = createFormFromDefinition(definition)([tabPath])(initialForm, firstElementRef)(updateCallback);

  const margin = 12;

  const [l, r] =
    layoutDefinition && layoutDefinition.splitFormAt
      ? splitAt(layoutDefinition.splitFormAt)(disperseInputs(7)(generatedForm))
      : splitInHalf(disperseInputs(margin)(generatedForm));

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
