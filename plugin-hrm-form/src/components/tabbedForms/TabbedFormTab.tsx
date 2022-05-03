/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import type { FormDefinition, LayoutDefinition } from 'hrm-form-definitions';

import * as actions from '../../states/contacts/actions';
import { ColumnarBlock, Container, TwoColumnLayout, Box, BottomButtonBarHeight } from '../../styles/HrmStyles';
import { createFormFromDefinition, disperseInputs, splitAt, splitInHalf } from '../common/forms/formGenerators';
import type { TaskEntry } from '../../states/contacts/reducer';
import useFocus from '../../utils/useFocus';

type OwnProps = {
  entityIdentifier: string;
  display: boolean;
  definition: FormDefinition;
  layoutDefinition?: LayoutDefinition;
  tabPath: keyof TaskEntry;
  initialValues: TaskEntry['callerInformation'] | TaskEntry['childInformation'] | TaskEntry['caseInformation'];
  autoFocus: boolean;
  extraChildrenRight?: React.ReactNode;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedFormTab: React.FC<Props> = ({
  entityIdentifier,
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

  const [l, r] = React.useMemo(() => {
    const updateCallback = () => {
      const values = getValues()[tabPath];
      updateForm(entityIdentifier, tabPath, values);
    };

    const generatedForm = createFormFromDefinition(definition)([tabPath])(initialForm, firstElementRef)(updateCallback);

    const margin = 12;

    if (layoutDefinition && layoutDefinition.splitFormAt)
      return splitAt(layoutDefinition.splitFormAt)(disperseInputs(7)(generatedForm));

    return splitInHalf(disperseInputs(margin)(generatedForm));
  }, [definition, getValues, initialForm, firstElementRef, layoutDefinition, tabPath, entityIdentifier, updateForm]);

  return (
    <Container>
      <Box paddingBottom={`${BottomButtonBarHeight}px`}>
        <TwoColumnLayout>
          <ColumnarBlock>{l}</ColumnarBlock>
          <ColumnarBlock>
            {r}
            {extraChildrenRight}
          </ColumnarBlock>
        </TwoColumnLayout>
      </Box>
    </Container>
  );
};

TabbedFormTab.displayName = 'TabbedFormTab';

const mapDispatchToProps = {
  updateForm: actions.updateForm,
};

const connector = connect(null, mapDispatchToProps);
const connected = connector(TabbedFormTab);

export default connected;
