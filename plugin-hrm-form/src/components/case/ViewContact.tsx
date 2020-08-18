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
import { ViewContact as ViewContactType } from '../../states/case/types';
import { transformForm, getNumberFromTask } from '../../services/ContactService';
import { fillEndMillis, getConversationDuration } from '../../utils/conversationDuration';
import ActionHeader from './ActionHeader';

type OwnProps = {
  task: ITask;
};

const adaptFormToContactDetails = (task, form, date, counselor) => {
  const details = transformForm(form);
  const dateTime = date;
  const name = `${details.childInformation.name.firstName} ${details.childInformation.name.lastName}`;
  const customerNumber = getNumberFromTask(task);
  const { callType, caseInformation } = details;
  // const categories = retrieveCategories(caseInformation.categories);
  const categories = {
    category1: ['sub1'],
    category2: ['sub2'],
    category3: ['sub3'],
  };
  const notes = caseInformation.callSummary;
  const { channelType } = task;
  const metadata = fillEndMillis(form.metadata);
  const conversationDuration = getConversationDuration(metadata);

  return {
    overview: {
      dateTime,
      name,
      customerNumber,
      callType,
      categories,
      counselor,
      notes,
      channel: channelType,
      conversationDuration,
    },
    counselor,
    details,
  };
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewContact: React.FC<Props> = ({ task, form, counselorsHash, tempInfo, updateTempInfo, changeRoute }) => {
  const { detailsExpanded, contactId, date, counselor } = tempInfo;
  const counselorName = counselorsHash[counselor] || 'Unknown';

  const [contact, setContact] = useState(null);
  useEffect(() => {
    if (!contactId) {
      const result = adaptFormToContactDetails(task, form, date, counselorName);
      console.log({ result });
      setContact(result);
    }
  }, [contactId, task, form, date, counselorName]);

  if (!contact) {
    return null;
  }

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
        <StyledNextStepButton roundCorners onClick={handleClose}>
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseContainer>
  );
};

ViewContact.displayName = 'ViewContact';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const form = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const tempInfo = state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid]
    .temporaryCaseInfo as ViewContactType;

  return { form, counselorsHash, tempInfo };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewContact);
