/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
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
import { CaseActionLayout, CaseActionFormContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { namespace, connectedCaseBase, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import { getConfig } from '../../HrmFormPlugin';
import { updateCase } from '../../services/CaseService';
import { createFormFromDefinition, disperseInputs, splitInHalf, splitAt } from '../common/forms/formGenerators';
import type { DefinitionVersion } from '../common/forms/types';
import { transformValues } from '../../services/ContactService';
import type { CustomITask, StandaloneITask } from '../../types/types';
import useFocus from '../../utils/useFocus';

type OwnProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  onClickClose: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddIncident: React.FC<Props> = ({
  task,
  counselor,
  onClickClose,
  connectedCaseState,
  definitionVersion,
  setConnectedCase,
  updateTempInfo,
}) => {
  const firstElementRef = useFocus();

  const { temporaryCaseInfo } = connectedCaseState;
  const { IncidentForm } = definitionVersion.caseForms;
  const { layoutVersion } = definitionVersion;

  const init = temporaryCaseInfo && temporaryCaseInfo.screen === 'add-incident' ? temporaryCaseInfo.info : {};
  const [initialForm] = React.useState(init); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const methods = useForm();

  const [l, r] = React.useMemo(() => {
    const updateCallBack = () => {
      const incident = methods.getValues();
      updateTempInfo({ screen: 'add-incident', info: incident }, task.taskSid);
    };

    const generatedForm = createFormFromDefinition(IncidentForm)([])(initialForm, firstElementRef)(updateCallBack);

    if (layoutVersion.case.incidents.splitFormAt)
      return splitAt(layoutVersion.case.incidents.splitFormAt)(disperseInputs(7)(generatedForm));

    return splitInHalf(disperseInputs(7)(generatedForm));
  }, [
    IncidentForm,
    initialForm,
    firstElementRef,
    layoutVersion.case.incidents.splitFormAt,
    methods,
    task.taskSid,
    updateTempInfo,
  ]);

  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-incident') return null;

  const saveIncident = async () => {
    if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-incident') return;

    const { info, id } = connectedCaseState.connectedCase;
    const incident = transformValues(IncidentForm)(temporaryCaseInfo.info);
    const createdAt = new Date().toISOString();
    const { workerSid } = getConfig();
    const newIncident = { incident, createdAt, twilioWorkerId: workerSid };
    const incidents = info && info.incidents ? [...info.incidents, newIncident] : [newIncident];
    const newInfo = info ? { ...info, incidents } : { incidents };
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid, true);
  };

  async function saveIncidentAndLeave() {
    await saveIncident();
    onClickClose();
  }

  const { strings } = getConfig();
  function onError() {
    window.alert(strings['Error-Form']);
  }

  return (
    <FormProvider {...methods}>
      <CaseActionLayout>
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
            onClick={methods.handleSubmit(saveIncidentAndLeave, onError)}
          >
            <Template code="BottomBar-SaveIncident" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionLayout>
    </FormProvider>
  );
};

AddIncident.displayName = 'AddIncident';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const caseState = state[namespace][connectedCaseBase];
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];

  return { connectedCaseState };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  updateCaseInfo: CaseActions.updateCaseInfo,
  setConnectedCase: CaseActions.setConnectedCase,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddIncident);
