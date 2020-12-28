/* eslint-disable react/prop-types */
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../states';
import { updateForm } from '../../states/contacts/actions';
import CaseTabDefinition from '../../formDefinitions/tabbedForms/CaseInformationTab.json';
import { ColumnarBlock, Container, TwoColumnLayout } from '../../styles/HrmStyles';
import { createFormFromDefinition, disperseInputs, splitInHalf } from '../common/forms/formGenerators';
import type { FormDefinition } from '../common/forms/types';

type OwnProps = { task: ITask; display: boolean };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CaseInformationTab: React.FC<Props> = ({ dispatch, task, display }) => {
  const { getValues } = useFormContext();

  const [l, r] = React.useMemo(() => {
    const updateCallback = () => {
      const { caseInformation } = getValues();
      dispatch(updateForm(task.taskSid, 'caseInformation', caseInformation));
    };

    // TODO: fix this typecasting
    const caseFormDefinition = createFormFromDefinition(CaseTabDefinition as FormDefinition)(['caseInformation'])(
      updateCallback,
    );

    return splitInHalf(disperseInputs(7)(caseFormDefinition));
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

CaseInformationTab.displayName = 'CaseInformationTab';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({});

const connector = connect(mapStateToProps);
const connected = connector(CaseInformationTab);

export default withTaskContext<Props, typeof connected>(connected);
