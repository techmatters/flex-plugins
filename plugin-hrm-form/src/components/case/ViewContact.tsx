/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { BottomButtonBar, Container, StyledNextStepButton, Flex } from '../../styles/HrmStyles';
import { CaseLayout } from '../../styles/case';
import { configurationBase, connectedCaseBase, contactFormsBase, namespace, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import ContactDetails from '../contact/ContactDetails';
import { CaseState } from '../../states/case/reducer';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { loadContact, loadRawContact, releaseContact } from '../../states/contacts/existingContacts';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { taskFormToSearchContact } from '../../states/contacts/contactDetailsAdapter';
import { TemporaryCaseInfo, ViewContactInfo } from '../../states/case/types';

function isViewContactCaseInfo(temporaryCaseInfo: TemporaryCaseInfo): temporaryCaseInfo is ViewContactInfo {
  return temporaryCaseInfo && temporaryCaseInfo.screen === 'view-contact';
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const form = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const editContactFormOpen = state[namespace][contactFormsBase].editingContact;
  const { temporaryCaseInfo, connectedCase } = caseState.tasks[ownProps.task.taskSid];
  if (isViewContactCaseInfo(temporaryCaseInfo)) {
    const { contact: contactFromInfo } = temporaryCaseInfo.info;
    const isSavedContact = Boolean(contactFromInfo);
    const contactId = contactFromInfo?.id ?? `__unsavedFromCase:${connectedCase.id}`;
    const contact = state[namespace][contactFormsBase].existingContacts[contactId]?.contact;
    return {
      form,
      counselorsHash,
      tempInfo: temporaryCaseInfo,
      connectedCase,
      editContactFormOpen,
      contactId,
      contact,
      isSavedContact,
    };
  }
  return { form, connectedCase, counselorsHash, editContactFormOpen };
};

const mapDispatchToProps = {
  updateCaseContactsWithSearchContact: CaseActions.updateCaseContactsWithSearchContact,
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
  contactId,
  contact,
  isSavedContact,
  updateCaseContactsWithSearchContact,
}) => {
  const handleClose = () => {
    releaseContactFromState(contactId, task.taskSid);
    onClickClose();
  };

  useEffect(() => {
    if (isViewContactCaseInfo(tempInfo)) {
      const { contact: contactFromInfo, timeOfContact, counselor } = tempInfo.info;
      if (isSavedContact) {
        loadRawContactIntoState(contactFromInfo, task.taskSid);
      } else {
        const temporaryId = `__unsavedFromCase:${connectedCase.id}`;
        loadContactIntoState(taskFormToSearchContact(task, form, timeOfContact, counselor, temporaryId), task.taskSid);
      }
    }
  }, [
    counselorsHash,
    loadContactIntoState,
    releaseContactFromState,
    connectedCase?.id,
    task,
    form,
    loadRawContactIntoState,
    tempInfo,
    isSavedContact,
  ]);

  useEffect(() => {
    if (contact) {
      updateCaseContactsWithSearchContact(task.taskSid, contact);
    }
  }, [updateCaseContactsWithSearchContact, task, contact]);

  if (!isViewContactCaseInfo(tempInfo)) {
    return null;
  }

  const { contact: contactFromInfo } = tempInfo.info;

  return (
    <CaseLayout className={editContactFormOpen ? 'editingContact' : ''}>
      <Container removePadding={editContactFormOpen}>
        <ContactDetails
          contactId={contactId}
          enableEditing={Boolean(contactFromInfo)}
          context={DetailsContext.CASE_DETAILS}
        />
        <BottomButtonBar className="hiddenWhenEditingContact" style={{ marginBlockStart: 'auto' }}>
          <StyledNextStepButton roundCorners onClick={handleClose} data-testid="Case-ViewContactScreen-CloseButton">
            <Template code="CloseButton" />
          </StyledNextStepButton>
        </BottomButtonBar>
      </Container>
    </CaseLayout>
  );
};

ViewContact.displayName = 'ViewContact';

export default connect(mapStateToProps, mapDispatchToProps)(ViewContact);
