/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { BottomButtonBar, Container, StyledNextStepButton, Flex } from '../../styles/HrmStyles';
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
  const editContactFormOpen = state[namespace][contactFormsBase].editingContact;
  const { temporaryCaseInfo, connectedCase } = caseState.tasks[ownProps.task.taskSid];
  return { form, counselorsHash, tempInfo: temporaryCaseInfo, connectedCase, editContactFormOpen };
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
  editContactFormOpen,
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
    tempInfo,
  ]);

  if (!tempInfo || tempInfo.screen !== 'view-contact') return null;
  const { contact: contactFromInfo } = tempInfo.info;

  return (
    <CaseLayout className={editContactFormOpen ? 'editingContact' : ''}>
      <Container removePadding={editContactFormOpen}>
        <ContactDetails
          contactId={contactFromInfo?.id ?? `__unsavedFromCase:${connectedCase.id}`}
          enableEditing={Boolean(contactFromInfo)}
          context={DetailsContext.CASE_DETAILS}
        />
        <BottomButtonBar className="hiddenWhenEditingContact" style={{ marginBlockStart: 'auto' }}>
          <StyledNextStepButton roundCorners onClick={onClickClose} data-testid="Case-ViewContactScreen-CloseButton">
            <Template code="CloseButton" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </Container>
    </CaseLayout>
  );
};

ViewContact.displayName = 'ViewContact';

export default connect(mapStateToProps, mapDispatchToProps)(ViewContact);
