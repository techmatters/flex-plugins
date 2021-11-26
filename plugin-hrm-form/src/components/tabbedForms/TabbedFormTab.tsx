/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import * as actions from '../../states/contacts/actions';
import {
  ColumnarBlock,
  Container,
  TwoColumnLayout,
  TabbedFormTabContainer,
  Box,
  BottomButtonBarHeight,
} from '../../styles/HrmStyles';
import { createFormFromDefinition, disperseInputs, splitAt, splitInHalf } from '../common/forms/formGenerators';
import type { FormDefinition, LayoutDefinition } from '../common/forms/types';
import type { TaskEntry } from '../../states/contacts/reducer';
import type { CustomITask } from '../../types/types';
import useFocus from '../../utils/useFocus';

type OwnProps = {
  task: CustomITask;
  display: boolean;
  definition: FormDefinition;
  layoutDefinition?: LayoutDefinition;
  tabPath: keyof TaskEntry;
  initialValues: TaskEntry['callerInformation'] | TaskEntry['childInformation'] | TaskEntry['caseInformation'];
  autoFocus: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedFormTab: React.FC<Props> = ({
  task,
  display,
  definition,
  layoutDefinition,
  tabPath,
  initialValues,
  autoFocus,
  updateForm,
}) => {
  const shouldFocusFirstElement = display && autoFocus;
  const firstElementRef = useFocus(shouldFocusFirstElement);

  const [initialForm] = React.useState(initialValues); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const { getValues } = useFormContext();

  const [l, r] = React.useMemo(() => {
    const updateCallback = () => {
      const values = getValues()[tabPath];
      updateForm(task.taskSid, tabPath, values);
    };

    const generatedForm = createFormFromDefinition(definition)([tabPath])(initialForm, firstElementRef)(updateCallback);

    const margin = 12;

    if (layoutDefinition && layoutDefinition.splitFormAt)
      return splitAt(layoutDefinition.splitFormAt)(disperseInputs(7)(generatedForm));

    return splitInHalf(disperseInputs(margin)(generatedForm));
  }, [definition, getValues, initialForm, firstElementRef, layoutDefinition, tabPath, task.taskSid, updateForm]);

  return (
    <TabbedFormTabContainer display={display}>
      <Container>
        <Box paddingBottom={`${BottomButtonBarHeight}px`}>
          <TwoColumnLayout>
            <ColumnarBlock>{l}</ColumnarBlock>
            <ColumnarBlock>{r}</ColumnarBlock>
          </TwoColumnLayout>
        </Box>
      </Container>
    </TabbedFormTabContainer>
  );
};

TabbedFormTab.displayName = 'TabbedFormTab';

const mapDispatchToProps = {
  updateForm: actions.updateForm,
};

const connector = connect(null, mapDispatchToProps);
const connected = connector(TabbedFormTab);

export default connected;
