/* eslint-disable react/prop-types */
import React from 'react';
import { Template, ITask } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { Box, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseActionContainer, CaseActionFormContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { CallerForm, newCallerFormInformation } from '../common/forms';
import { editNestedField } from './helpers';
import { namespace, connectedCaseBase, routingBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { CaseState } from '../../states/case/reducer';
import { DefaultEventHandlers } from '../common/forms/types';
import { getFormValues } from '../common/forms/helpers';
import { getConfig } from '../../HrmFormPlugin';
import { updateCase } from '../../services/CaseService';

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

  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-perpetrator') return null;

  const defaultEventHandlers: DefaultEventHandlers = (parents, name) => ({
    handleBlur: () => undefined,
    handleFocus: () => undefined,
    handleChange: event => {
      const newForm = editNestedField(temporaryCaseInfo.info, parents, name, { value: event.target.value });
      updateTempInfo({ screen: 'add-perpetrator', info: newForm }, task.taskSid);
    },
  });

  const savePerpetrator = async shouldStayInForm => {
    if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-perpetrator') return;

    const { info, id } = connectedCaseState.connectedCase;
    const perpetrator = getFormValues(temporaryCaseInfo.info);
    const createdAt = new Date().toISOString();
    const { workerSid } = getConfig();
    const newPerpetrator = { perpetrator, createdAt, twilioWorkerId: workerSid };
    const perpetrators = info && info.perpetrators ? [...info.perpetrators, newPerpetrator] : [newPerpetrator];
    const newInfo = info ? { ...info, perpetrators } : { perpetrators };
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid);
    if (shouldStayInForm) {
      updateTempInfo({ screen: 'add-perpetrator', info: newCallerFormInformation }, task.taskSid);
      changeRoute({ route, subroute: 'add-perpetrator' }, task.taskSid);
    }
  };

  function savePerpetratorAndStay() {
    savePerpetrator(true);
  }

  function savePerpetratorAndLeave() {
    savePerpetrator(false);
    onClickClose();
  }

  return (
    <CaseActionContainer>
      <CaseActionFormContainer>
        <ActionHeader titleTemplate="Case-AddPerpetrator" onClickClose={onClickClose} counselor={counselor} />
        <CallerForm callerInformation={temporaryCaseInfo.info} defaultEventHandlers={defaultEventHandlers} />
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
            onClick={savePerpetratorAndStay}
          >
            <Template code="BottomBar-SaveAndAddAnotherPerpetrator" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton
          data-testid="Case-AddPerpetratorScreen-SavePerpetrator"
          roundCorners
          onClick={savePerpetratorAndLeave}
        >
          <Template code="BottomBar-SavePerpetrator" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseActionContainer>
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
