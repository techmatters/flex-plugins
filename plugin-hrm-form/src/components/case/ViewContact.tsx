/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { Container, StyledNextStepButton, BottomButtonBar } from '../../styles/HrmStyles';
import { CaseLayout } from '../../styles/case';
import { namespace, connectedCaseBase, contactFormsBase, configurationBase, routingBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import ContactDetails from '../ContactDetails';
import ActionHeader from './ActionHeader';
import { adaptFormToContactDetails, adaptContactToDetailsScreen } from './ContactDetailsAdapter';
import { CaseState } from '../../states/case/reducer';
import { StandaloneITask } from '../StandaloneSearch';
import type { CustomITask } from '../../types/types';
import { getHelplineToSave } from '../../services/formSubmissionHelpers';
import { isStandaloneITask } from './Case';

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
  task: CustomITask | StandaloneITask;
  onClickClose: () => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewContact: React.FC<Props> = ({ task, form, counselorsHash, tempInfo, onClickClose, updateTempInfo }) => {
  const [helpline, setHelpline] = useState(null);

  useEffect(() => {
    const fetchHelpline = async () => {
      if (!isStandaloneITask(task)) {
        const helplineToSave = await getHelplineToSave(task, form);
        setHelpline(helplineToSave);
      }
    };

    fetchHelpline();
  }, [task, form]);
  if (!tempInfo || tempInfo.screen !== 'view-contact') return null;

  const { detailsExpanded, contact: contactFromInfo, createdAt, timeOfContact, counselor } = tempInfo.info;
  const counselorName = counselorsHash[counselor] || 'Unknown';

  let contact;

  if (contactFromInfo) {
    contact = adaptContactToDetailsScreen(contactFromInfo, counselorName);
  } else if (helpline) {
    contact = adaptFormToContactDetails(task, helpline, form, timeOfContact, counselorName);
  }

  if (!contact) return null;

  const handleExpandDetailsSection = section => {
    const updatedDetailsExpanded = {
      ...detailsExpanded,
      [section]: !detailsExpanded[section],
    };
    const updatedTempInfo = {
      detailsExpanded: updatedDetailsExpanded,
      contact: contactFromInfo,
      createdAt,
      timeOfContact,
      counselor,
    };
    updateTempInfo({ screen: 'view-contact', info: updatedTempInfo }, task.taskSid);
  };

  const added = new Date(createdAt);

  return (
    <CaseLayout>
      <Container>
        <ActionHeader
          titleTemplate="Case-Contact"
          onClickClose={onClickClose}
          counselor={counselorName}
          added={added}
        />
        <ContactDetails
          contact={contact}
          detailsExpanded={detailsExpanded}
          handleExpandDetailsSection={handleExpandDetailsSection}
        />
      </Container>
      <BottomButtonBar>
        <StyledNextStepButton roundCorners onClick={onClickClose} data-testid="Case-ViewContactScreen-CloseButton">
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseLayout>
  );
};

ViewContact.displayName = 'ViewContact';

export const UnconnectedViewContact = ViewContact;
export default connect(mapStateToProps, mapDispatchToProps)(ViewContact);
