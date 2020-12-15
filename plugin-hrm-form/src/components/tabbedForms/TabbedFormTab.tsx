/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
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
import { createFormFromDefinition, disperseInputs, splitInHalf } from '../common/forms/formGenerators';
import type { FormDefinition } from '../common/forms/types';
import type { TaskEntry } from '../../states/contacts/reducer';

type OwnProps = { task: ITask; display: boolean; definition: FormDefinition; tabPath: keyof TaskEntry };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedFormTab: React.FC<Props> = ({ task, display, definition, tabPath, updateForm }) => {
  const { getValues } = useFormContext();

  const [l, r] = React.useMemo(() => {
    const updateCallback = () => {
      const values = getValues()[tabPath];
      updateForm(task.taskSid, tabPath, values);
    };

    // TODO: fix this typecasting
    const generatedForm = createFormFromDefinition(definition)([tabPath])(updateCallback);

    const margin = 12;
    return splitInHalf(disperseInputs(margin)(generatedForm));
  }, [definition, getValues, tabPath, task.taskSid, updateForm]);

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

export default withTaskContext<Props, typeof connected>(connected);
