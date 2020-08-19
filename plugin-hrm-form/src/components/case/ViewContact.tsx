/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Template, ITask } from '@twilio/flex-ui';

import { Container, StyledNextStepButton, BottomButtonBar } from '../../styles/HrmStyles';
import { CaseContainer } from '../../styles/case';
import { namespace, connectedCaseBase, contactFormsBase, configurationBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import ContactDetails from '../ContactDetails';
import ActionHeader from './ActionHeader';
import { adaptFormToContactDetails } from './ContactDetailsAdapter';
import { isViewContact } from '../../states/case/types';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const form = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const tempInfo = state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid].temporaryCaseInfo;

  return { form, counselorsHash, tempInfo };
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

const ViewContact: React.FC<Props> = ({ task, form, counselorsHash, tempInfo, updateTempInfo, changeRoute }) => {
  const [contact, setContact] = useState(null);
  const { detailsExpanded, contactId, date, counselor } = tempInfo;
  const counselorName = counselorsHash[counselor] || 'Unknown';

  useEffect(() => {
    if (!contactId) {
      const adaptedForm = adaptFormToContactDetails(task, form, date, counselorName);
      setContact(adaptedForm);
    }
  }, [contactId, task, form, date, counselorName]);

  if (!isViewContact(tempInfo) || !contact) return null;

  const handleClose = () => changeRoute({ route: 'new-case' }, task.taskSid);

  const handleExpandDetailsSection = section => {
    const updatedDetailsExpanded = {
      ...detailsExpanded,
      [section]: !detailsExpanded[section],
    };
    const updatedTempInfo = { detailsExpanded: updatedDetailsExpanded, date, counselor };
    updateTempInfo(updatedTempInfo, task.taskSid);
  };

  return (
    <CaseContainer>
      <Container>
        <ActionHeader titleTemplate="Case-Contact" onClickClose={handleClose} counselor={counselorName} added={date} />
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
