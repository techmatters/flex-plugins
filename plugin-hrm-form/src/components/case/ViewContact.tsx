/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { BottomButtonBar, Container, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseLayout } from '../../styles/case';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import ContactDetails from '../contact/ContactDetails';
import ActionHeader from './ActionHeader';
import { CaseState } from '../../states/case/reducer';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { loadRawContact, releaseContact } from '../../states/contacts/existingContacts';
import { DetailsContext } from '../../states/contacts/contactDetails';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const form = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];

  return { form, counselorsHash, tempInfo: temporaryCaseInfo };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  loadContactIntoState: loadRawContact,
  releaseContactFromState: releaseContact,
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  onClickClose: () => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewContact: React.FC<Props> = ({
  task,
  counselorsHash,
  tempInfo,
  onClickClose,
  updateTempInfo,
  loadContactIntoState,
  releaseContactFromState,
}) => {
  useEffect(() => {
    if (tempInfo && tempInfo.screen === 'view-contact') {
      const { contact: contactFromInfo } = tempInfo.info;
      if (contactFromInfo) {
        loadContactIntoState(contactFromInfo);
        return () => releaseContactFromState(contactFromInfo.id);
      }
    }
    return () => {
      /* no cleanup to do. */
    };
  }, [tempInfo, counselorsHash, loadContactIntoState, releaseContactFromState]);

  if (!tempInfo || tempInfo.screen !== 'view-contact') return null;
  const { contact: contactFromInfo, createdAt } = tempInfo.info;
  const createdByName = counselorsHash[contactFromInfo.createdBy] || 'Unknown';

  const added = new Date(createdAt);

  return (
    <CaseLayout>
      <Container>
        <ActionHeader
          titleTemplate="Case-Contact"
          onClickClose={onClickClose}
          addingCounsellor={createdByName}
          added={added}
        />
        <ContactDetails contactId={contactFromInfo.id} context={DetailsContext.CASE_DETAILS} />
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewContact);
