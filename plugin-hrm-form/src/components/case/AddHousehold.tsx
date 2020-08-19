/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Template, ITask } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { Box, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseActionContainer, CaseActionFormContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';
import CallerForm, { CallerFormInformation } from '../common/forms/CallerForm';
import { createBlankForm } from '../../states/ContactFormStateFactory';
import { editNestedField } from '../../states/ContactState';
import { namespace, connectedCaseBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { CaseState } from '../../states/case/reducer';
import { DefaultEventHandlers } from '../common/forms/types';
import { getFormValues } from '../common/forms/helpers';
import { isViewContact } from '../../states/case/types';

// @ts-ignore     TODO: fix this type error (createBlankForm must be typed or maybe create a separate function)
export const newFormEntry: CallerFormInformation = createBlankForm().callerInformation;

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
  updateTempInfo,
  updateCaseInfo,
  changeRoute,
}) => {
  useEffect(() => {
    // set temporaryCaseInfo as clean form on mount
    updateTempInfo(newFormEntry, task.taskSid);
  }, [task.taskSid, updateTempInfo]);

  const { temporaryCaseInfo } = connectedCaseState;
  if (!temporaryCaseInfo || typeof temporaryCaseInfo === 'string' || isViewContact(temporaryCaseInfo)) return null;

  const callerInformation = connectedCaseState.temporaryCaseInfo;
  const defaultEventHandlers: DefaultEventHandlers = (parents, name) => ({
    handleBlur: () => undefined,
    handleFocus: () => undefined,
    handleChange: event => {
      const newForm = editNestedField(callerInformation, parents, name, { value: event.target.value });
      updateTempInfo(newForm, task.taskSid);
    },
  });

  function saveHousehold() {
    if (!temporaryCaseInfo || typeof temporaryCaseInfo === 'string' || isViewContact(temporaryCaseInfo)) return;

    const { info } = connectedCaseState.connectedCase;
    const household = getFormValues(temporaryCaseInfo);
    const createdAt = new Date().toISOString();
    const newHousehold = { household, createdAt };
    const households = info && info.households ? [...info.households, newHousehold] : [newHousehold];
    const newInfo = info ? { ...info, households } : { households };
    updateCaseInfo(newInfo, task.taskSid);
  }

  function saveHouseholdAndStay() {
    saveHousehold();
    updateTempInfo(newFormEntry, task.taskSid);
  }

  function saveHouseholdAndLeave() {
    saveHousehold();
    changeRoute({ route: 'new-case' }, task.taskSid);
  }

  return (
    <CaseActionContainer>
      <CaseActionFormContainer>
        <ActionHeader titleTemplate="Case-AddHousehold" onClickClose={onClickClose} counselor={counselor} />
        <CallerForm callerInformation={temporaryCaseInfo} defaultEventHandlers={defaultEventHandlers} />
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
            disabled={!temporaryCaseInfo}
          >
            <Template code="BottomBar-SaveAndAddAnotherHousehold" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton
          data-testid="Case-AddHouseholdScreen-SaveHousehold"
          roundCorners
          onClick={saveHouseholdAndLeave}
          disabled={!temporaryCaseInfo}
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
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddHousehold);
