/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template, ITask } from '@twilio/flex-ui';

import { Container, StyledNextStepButton, BottomButtonBar } from '../../styles/HrmStyles';
import { CaseContainer } from '../../styles/case';
import { namespace, connectedCaseBase, contactFormsBase, configurationBase, routingBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import ContactDetails from '../ContactDetails';
import ActionHeader from './ActionHeader';
import { adaptFormToContactDetails, adaptContactToDetailsScreen } from './ContactDetailsAdapter';
import { CaseState } from '../../states/case/reducer';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const form = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];
  const { route } = state[namespace][routingBase].tasks[ownProps.task.taskSid];

  return { form, counselorsHash, tempInfo: temporaryCaseInfo, route };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

type OwnProps = {
  task: ITask;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewContact: React.FC<Props> = ({ task, form, counselorsHash, tempInfo, route, updateTempInfo, changeRoute }) => {
  if (!tempInfo || tempInfo.screen !== 'view-contact') return null;

  const { detailsExpanded, contact: contactFromInfo, date, counselor } = tempInfo.info;
  const counselorName = counselorsHash[counselor] || 'Unknown';

  let contact;
  if (contactFromInfo) {
    contact = adaptContactToDetailsScreen(contactFromInfo, counselorName);
  } else {
    contact = adaptFormToContactDetails(task, form, date, counselorName);
  }

  if (!contact) return null;

  const handleClose = () => changeRoute({ route }, task.taskSid);

  const handleExpandDetailsSection = section => {
    const updatedDetailsExpanded = {
      ...detailsExpanded,
      [section]: !detailsExpanded[section],
    };
    const updatedTempInfo = {
      detailsExpanded: updatedDetailsExpanded,
      contact: contactFromInfo,
      date,
      counselor,
    };
    updateTempInfo({ screen: 'view-contact', info: updatedTempInfo }, task.taskSid);
  };

  const added = new Date(date);

  return (
    <CaseContainer>
      <Container>
        <ActionHeader titleTemplate="Case-Contact" onClickClose={handleClose} counselor={counselorName} added={added} />
        <ContactDetails
          contact={contact}
          detailsExpanded={detailsExpanded}
          handleExpandDetailsSection={handleExpandDetailsSection}
        />
      </Container>
      <BottomButtonBar>
        <StyledNextStepButton roundCorners onClick={handleClose} data-testid="Case-ViewContactScreen-CloseButton">
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseContainer>
  );
};

ViewContact.displayName = 'ViewContact';

export const UnconnectedViewContact = ViewContact;
export default connect(mapStateToProps, mapDispatchToProps)(ViewContact);
