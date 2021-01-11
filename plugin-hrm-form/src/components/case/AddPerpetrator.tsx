/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template, ITask } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import {
  Box,
  BottomButtonBar,
  BottomButtonBarHeight,
  Container,
  TwoColumnLayout,
  ColumnarBlock,
  StyledNextStepButton,
} from '../../styles/HrmStyles';
import { CaseActionLayout, CaseActionFormContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { namespace, connectedCaseBase, routingBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { CaseState } from '../../states/case/reducer';
import type { FormDefinition } from '../common/forms/types';
import { transformValues } from '../../services/ContactService';
import { getConfig } from '../../HrmFormPlugin';
import { updateCase } from '../../services/CaseService';
import PerpetratorForm from '../../formDefinitions/caseForms/PerpetratorForm.json';
import {
  createFormFromDefinition,
  createStateItem,
  disperseInputs,
  splitInHalf,
  splitAt,
} from '../common/forms/formGenerators';
import LayoutDefinitions from '../../formDefinitions/LayoutDefinitions.json';

type OwnProps = {
  task: ITask;
  counselor: string;
  onClickClose: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddPerpetrator: React.FC<Props> = ({
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

  const init = temporaryCaseInfo && temporaryCaseInfo.screen === 'add-perpetrator' ? temporaryCaseInfo.info : {};
  const [initialForm] = React.useState(init); // grab initial values in first render only. This value should never change or will ruin the memoization below
  const methods = useForm();

  const [l, r] = React.useMemo(() => {
    const updateCallBack = () => {
      const perpetrator = methods.getValues();
      updateTempInfo({ screen: 'add-perpetrator', info: perpetrator }, task.taskSid);
    };

    const generatedForm = createFormFromDefinition(PerpetratorForm as FormDefinition)([])(initialForm)(updateCallBack);

    if (LayoutDefinitions.case.perpetrators.splitFormAt)
      return splitAt(LayoutDefinitions.case.perpetrators.splitFormAt)(disperseInputs(7)(generatedForm));

    return splitInHalf(disperseInputs(7)(generatedForm));
  }, [initialForm, methods, task.taskSid, updateTempInfo]);

  const savePerpetrator = async shouldStayInForm => {
    if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-perpetrator') return;

    const { info, id } = connectedCaseState.connectedCase;
    const perpetrator = transformValues(PerpetratorForm as FormDefinition)(temporaryCaseInfo.info);
    const createdAt = new Date().toISOString();
    const { workerSid } = getConfig();
    const newPerpetrator = { perpetrator, createdAt, twilioWorkerId: workerSid };
    const perpetrators = info && info.perpetrators ? [...info.perpetrators, newPerpetrator] : [newPerpetrator];
    const newInfo = info ? { ...info, perpetrators } : { perpetrators };
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid, true);

    if (shouldStayInForm) {
      const blankForm = (PerpetratorForm as FormDefinition).reduce(createStateItem, {});
      methods.reset(blankForm); // Resets the form.
      updateTempInfo({ screen: 'add-perpetrator', info: null }, task.taskSid);
      changeRoute({ route, subroute: 'add-perpetrator' }, task.taskSid);
    }
  };

  async function savePerpetratorAndStay() {
    await savePerpetrator(true);
  }

  async function savePerpetratorAndLeave() {
    await savePerpetrator(false);
    onClickClose();
  }

  function onError() {
    window.alert('You must fill in required fields.');
  }

  return (
    <FormProvider {...methods}>
      <CaseActionLayout>
        <CaseActionFormContainer>
          <ActionHeader titleTemplate="Case-AddPerpetrator" onClickClose={onClickClose} counselor={counselor} />
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
          <Box marginRight="15px">
            <StyledNextStepButton
              data-testid="Case-AddPerpetratorScreen-SaveAndAddAnotherPerpetrator"
              secondary
              roundCorners
              onClick={methods.handleSubmit(savePerpetratorAndStay, onError)}
            >
              <Template code="BottomBar-SaveAndAddAnotherPerpetrator" />
            </StyledNextStepButton>
          </Box>
          <StyledNextStepButton
            data-testid="Case-AddPerpetratorScreen-SavePerpetrator"
            roundCorners
            onClick={methods.handleSubmit(savePerpetratorAndLeave, onError)}
          >
            <Template code="BottomBar-SavePerpetrator" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionLayout>
    </FormProvider>
  );
};

AddPerpetrator.displayName = 'AddPerpetrator';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
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

export default connect(mapStateToProps, mapDispatchToProps)(AddPerpetrator);
