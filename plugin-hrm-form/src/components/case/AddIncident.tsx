/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template, ITask } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import {
  Box,
  BottomButtonBar,
  StyledNextStepButton,
  TwoColumnLayout,
  ColumnarBlock,
  Container,
  BottomButtonBarHeight,
} from '../../styles/HrmStyles';
import { CaseActionContainer, CaseActionFormContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { namespace, connectedCaseBase, routingBase, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { getConfig } from '../../HrmFormPlugin';
import { updateCase } from '../../services/CaseService';
import { createFormFromDefinition, disperseInputs, splitInHalf } from '../common/forms/formGenerators';
import type { FormDefinition } from '../common/forms/types';
import ChildTabDefinition from '../../formDefinitions/tabbedForms/ChildInformationTab.json';

type OwnProps = {
  task: ITask;
  counselor: string;
  onClickClose: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddIncident: React.FC<Props> = ({
  task,
  counselor,
  onClickClose,
  connectedCaseState,
  route,
  setConnectedCase,
  updateTempInfo,
  changeRoute,
}) => {
  const { temporaryCaseInfo } = connectedCaseState;
  const [initialForm] = React.useState(temporaryCaseInfo.info); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const methods = useForm();
  console.log(methods.getValues());
  const [l, r] = React.useMemo(() => {
    const updateCallBack = () => {
      const incident = methods.getValues();
      updateTempInfo({ screen: 'add-incident', info: incident }, task.taskSid);
    };

    const generatedForm = createFormFromDefinition(ChildTabDefinition as FormDefinition)([])(initialForm)(
      updateCallBack,
    );

    return splitInHalf(disperseInputs(7)(generatedForm));
  }, [initialForm, methods, task.taskSid, updateTempInfo]);

  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-incident') return null;

  const saveIncident = async () => {
    if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-incident') return;

    const { info, id } = connectedCaseState.connectedCase;
    const incident = temporaryCaseInfo.info;
    const createdAt = new Date().toISOString();
    const { workerSid } = getConfig();
    const newIncident = { incident, createdAt, twilioWorkerId: workerSid };
    const incidents = info && info.incidents ? [...info.incidents, newIncident] : [newIncident];
    const newInfo = info ? { ...info, incidents } : { incidents };
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid);
    updateTempInfo(null, task.taskSid);
  };

  function saveIncidentAndLeave() {
    saveIncident();
    onClickClose();
  }

  return (
    <FormProvider {...methods}>
      <CaseActionContainer>
        <CaseActionFormContainer>
          <ActionHeader titleTemplate="Case-AddIncident" onClickClose={onClickClose} counselor={counselor} />
          <Container>
            <Box paddingBottom={`${BottomButtonBarHeight}px`}>
              <TwoColumnLayout>
                <ColumnarBlock>{l}</ColumnarBlock>
                <ColumnarBlock>{r}</ColumnarBlock>
              </TwoColumnLayout>
            </Box>
          </Container>{' '}
        </CaseActionFormContainer>
        <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
        <BottomButtonBar>
          <Box marginRight="15px">
            <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={onClickClose}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
          </Box>
          <StyledNextStepButton
            data-testid="Case-AddIncidentScreen-SaveIncident"
            roundCorners
            onClick={saveIncidentAndLeave}
          >
            <Template code="BottomBar-SaveIncident" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionContainer>
    </FormProvider>
  );
};

AddIncident.displayName = 'AddIncident';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const caseState = state[namespace][connectedCaseBase];
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];
  const { route } = state[namespace][routingBase].tasks[ownProps.task.taskSid];

  return { connectedCaseState, route };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  updateCaseInfo: CaseActions.updateCaseInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddIncident);
