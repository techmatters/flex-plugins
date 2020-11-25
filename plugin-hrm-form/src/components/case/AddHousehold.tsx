/* eslint-disable react/prop-types */
import React from 'react';
import { Template, ITask } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { Box, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseActionContainer, CaseActionFormContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { CallerForm, newCallerFormInformation as newFormEntry } from '../common/forms';
import { editNestedField } from '../../states/ContactState';
import { namespace, connectedCaseBase } from '../../states';
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

const AddHousehold: React.FC<Props> = ({
  task,
  counselor,
  onClickClose,
  connectedCaseState,
  setConnectedCase,
  updateTempInfo,
  updateCaseInfo,
  changeRoute,
}) => {
  const { temporaryCaseInfo } = connectedCaseState;

  if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-household') return null;

  const defaultEventHandlers: DefaultEventHandlers = (parents, name) => ({
    handleBlur: () => undefined,
    handleFocus: () => undefined,
    handleChange: event => {
      const newForm = editNestedField(temporaryCaseInfo.info, parents, name, { value: event.target.value });
      updateTempInfo({ screen: 'add-household', info: newForm }, task.taskSid);
    },
  });

  const saveHousehold = async () => {
    if (!temporaryCaseInfo || temporaryCaseInfo.screen !== 'add-household') return;

    const { info, id } = connectedCaseState.connectedCase;
    const household = getFormValues(temporaryCaseInfo.info);
    const createdAt = new Date().toISOString();
    const { workerSid } = getConfig();
    const newHousehold = { household, createdAt, twilioWorkerId: workerSid };
    const households = info && info.households ? [...info.households, newHousehold] : [newHousehold];
    const newInfo = info ? { ...info, households } : { households };
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid);
  };

  function saveHouseholdAndStay() {
    saveHousehold();
    updateTempInfo({ screen: 'add-household', info: newFormEntry }, task.taskSid);
  }

  function saveHouseholdAndLeave() {
    saveHousehold();
    onClickClose();
  }

  return (
    <CaseActionContainer>
      <CaseActionFormContainer>
        <ActionHeader titleTemplate="Case-AddHousehold" onClickClose={onClickClose} counselor={counselor} />
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
            data-testid="Case-AddHouseholdScreen-SaveAndAddAnotherHousehold"
            secondary
            roundCorners
            onClick={saveHouseholdAndStay}
          >
            <Template code="BottomBar-SaveAndAddAnotherHousehold" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton
          data-testid="Case-AddHouseholdScreen-SaveHousehold"
          roundCorners
          onClick={saveHouseholdAndLeave}
        >
          <Template code="BottomBar-SaveHousehold" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseActionContainer>
  );
};

AddHousehold.displayName = 'AddHousehold';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];

  return { connectedCaseState };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  updateCaseInfo: CaseActions.updateCaseInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddHousehold);
