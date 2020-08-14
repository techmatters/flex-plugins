/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template, ITask } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { Container, Row, HiddenText, StyledNextStepButton, BottomButtonBar } from '../../styles/HrmStyles';
import { CaseContainer, CaseActionTitle, CaseActionDetailFont } from '../../styles/case';
import { namespace, connectedCaseBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { CaseState } from '../../states/case/reducer';

type OwnProps = {
  task: ITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewContact: React.FC<Props> = ({ task, changeRoute }) => {
  const handleClose = () => changeRoute({ route: 'new-case' }, task.taskSid);

  return (
    <CaseContainer>
      <Container>
      <Row>
        <CaseActionTitle style={{ marginTop: 'auto' }}>
          View Contact
        </CaseActionTitle>
        <ButtonBase onClick={handleClose} style={{ marginLeft: 'auto' }}>
          <HiddenText>
            <Template code="Case-CloseButton" />
          </HiddenText>
          <Close />
        </ButtonBase>
      </Row>
      <Row>
        <CaseActionDetailFont style={{ marginRight: 20 }}>
          <Template code="Case-AddNoteAdded" /> 01/01/01
        </CaseActionDetailFont>
        <CaseActionDetailFont style={{ marginRight: 20 }}>
          <Template code="Case-AddNoteCounselor" /> counselor-name
        </CaseActionDetailFont>
      </Row>
      </Container>
      <BottomButtonBar>
        <StyledNextStepButton roundCorners onClick={handleClose}>
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseContainer>
  );
};

ViewContact.displayName = 'ViewContact';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];

  return { connectedCaseState };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewContact);
