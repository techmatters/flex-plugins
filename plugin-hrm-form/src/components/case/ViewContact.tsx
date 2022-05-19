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
import { loadContact, loadRawContact, releaseContact } from '../../states/contacts/existingContacts';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { taskFormToSearchContact } from '../../states/contacts/contactDetailsAdapter';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const form = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo, connectedCase } = caseState.tasks[ownProps.task.taskSid];

  return { form, counselorsHash, tempInfo: temporaryCaseInfo, connectedCase };
};

const mapDispatchToProps = {
  setConnectedCase: CaseActions.setConnectedCase,
  loadRawContactIntoState: loadRawContact,
  loadContactIntoState: loadContact,
  releaseContactFromState: releaseContact,
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  onClickClose: () => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewContact: React.FC<Props> = ({
  form,
  task,
  counselorsHash,
  tempInfo,
  onClickClose,
  loadContactIntoState,
  loadRawContactIntoState,
  releaseContactFromState,
  connectedCase,
}) => {
  useEffect(() => {
    if (tempInfo && tempInfo.screen === 'view-contact') {
      const { contact: contactFromInfo, timeOfContact, counselor } = tempInfo.info;
      if (contactFromInfo) {
        loadRawContactIntoState(contactFromInfo);
        return () => releaseContactFromState(contactFromInfo.id);
      }
      const temporaryId = `__unsavedFromCase:${connectedCase.id}`;
      loadContactIntoState(taskFormToSearchContact(task, form, timeOfContact, counselor, temporaryId));
      return () => releaseContactFromState(temporaryId);
    }
    return () => {
      /* no cleanup to do. */
    };
  }, [
    counselorsHash,
    loadContactIntoState,
    releaseContactFromState,
    connectedCase.id,
    task,
    form,
    loadRawContactIntoState,
  ]);

  if (!tempInfo || tempInfo.screen !== 'view-contact') return null;
  const { contact: contactFromInfo, createdAt, counselor } = tempInfo.info;
  const createdByName = counselorsHash[contactFromInfo?.createdBy ?? counselor] || 'Unknown';

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
        <ContactDetails
          contactId={contactFromInfo?.id ?? `__unsavedFromCase:${connectedCase.id}`}
          context={DetailsContext.CASE_DETAILS}
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewContact);
