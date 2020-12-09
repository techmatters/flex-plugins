/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../states';
import { updateForm } from '../../states/contacts/actions';
import ChildTabDefinition from '../../formDefinitions/tabbedForms/ChildInformationTab.json';
import { ColumnarBlock, Container, TwoColumnLayout } from '../../styles/HrmStyles';
import { createFormFromDefinition, disperseInputs, splitInHalf } from '../common/forms/formGenerators';
import type { FormDefinition } from '../common/forms/types';

type OwnProps = { task: ITask; display: boolean };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ChildInformationTab: React.FC<Props> = ({ dispatch, task, display }) => {
  const { getValues } = useFormContext();

  const [l, r] = React.useMemo(() => {
    const updateCallback = () => {
      const { childInformation } = getValues();
      dispatch(updateForm(task.taskSid, 'childInformation', childInformation));
    };

    // TODO: fix this typecasting
    const childFormDefinition = createFormFromDefinition(ChildTabDefinition as FormDefinition)(['childInformation'])(
      updateCallback,
    );

    return splitInHalf(disperseInputs(7)(childFormDefinition));
  }, [dispatch, getValues, task.taskSid]);

  return (
    <div style={{ display: display ? 'block' : 'none' }}>
      <Container>
        <TwoColumnLayout>
          <ColumnarBlock>{l}</ColumnarBlock>
          <ColumnarBlock>{r}</ColumnarBlock>
        </TwoColumnLayout>
      </Container>
    </div>
  );
};

ChildInformationTab.displayName = 'ChildInformationTab';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({});

const connector = connect(mapStateToProps);
const connected = connector(ChildInformationTab);

export default withTaskContext<Props, typeof connected>(connected);
