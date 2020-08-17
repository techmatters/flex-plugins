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
import { DefaultEventHandlers, FormValues } from '../common/forms/types';
import { getFormValues } from '../common/forms/helpers';

// @ts-ignore     TODO: fix this type error (createBlankForm must be typed or maybe create a separate function)
export const newFormEntry: CallerFormInformation = createBlankForm().callerInformation;

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
  updateTempInfo,
  updateCaseInfo,
  changeRoute,
}) => {
  useEffect(() => {
    // set temporaryCaseInfo as clean form on mount
    updateTempInfo(newFormEntry, task.taskSid);
  }, [task.taskSid, updateTempInfo]);

  const { temporaryCaseInfo } = connectedCaseState;
  if (!temporaryCaseInfo || typeof temporaryCaseInfo === 'string') return null;

  const callerInformation = connectedCaseState.temporaryCaseInfo;
  const defaultEventHandlers: DefaultEventHandlers = (parents, name) => ({
    handleBlur: () => undefined,
    handleFocus: () => undefined,
    handleChange: event => {
      const newForm = editNestedField(callerInformation, parents, name, { value: event.target.value });
      updateTempInfo(newForm, task.taskSid);
    },
  });

  function savePerpetrator() {
    if (!temporaryCaseInfo || typeof temporaryCaseInfo === 'string') return;

    const { info } = connectedCaseState.connectedCase;
    const perpetrator = getFormValues(temporaryCaseInfo) as FormValues<CallerFormInformation>;
    const createdAt = new Date().toISOString();
    const newPerpetrator = { perpetrator, createdAt };
    const perpetrators = info && info.perpetrators ? [...info.perpetrators, newPerpetrator] : [newPerpetrator];
    const newInfo = info ? { ...info, perpetrators } : { perpetrators };
    updateCaseInfo(newInfo, task.taskSid);
  }

  function savePerpetratorAndStay() {
    savePerpetrator();
    updateTempInfo(newFormEntry, task.taskSid);
  }

  function savePerpetratorAndLeave() {
    savePerpetrator();
    changeRoute({ route: 'new-case' }, task.taskSid);
  }

  return (
    <CaseActionContainer>
      <CaseActionFormContainer>
        <ActionHeader titleTemplate="Case-AddPerpetrator" onClickClose={onClickClose} counselor={counselor} />
        <CallerForm
          callerInformation={temporaryCaseInfo as CallerFormInformation}
          defaultEventHandlers={defaultEventHandlers}
        />
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
            disabled={!temporaryCaseInfo}
          >
            <Template code="BottomBar-SaveAndAddAnotherPerpetrator" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton
          data-testid="Case-AddPerpetratorScreen-SavePerpetrator"
          roundCorners
          onClick={savePerpetratorAndLeave}
          disabled={!temporaryCaseInfo}
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

  return { connectedCaseState };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  updateCaseInfo: CaseActions.updateCaseInfo,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddPerpetrator);
