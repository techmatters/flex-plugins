/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { BottomButtonBar, Container, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseLayout } from '../../styles/case';
import { connectedCaseBase, contactFormsBase, namespace, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import ContactDetails from '../contact/ContactDetails';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { loadContact, loadRawContact, releaseContact } from '../../states/contacts/existingContacts';
import { DetailsContext } from '../../states/contacts/contactDetails';

const mapStateToProps = (state: RootState, { task, contactId }: OwnProps) => {
  const editContactFormOpen = state[namespace][contactFormsBase].editingContact;
  const { connectedCase } = state[namespace][connectedCaseBase].tasks[task.taskSid];
  if (connectedCase) {
    const contact = state[namespace][contactFormsBase].existingContacts[contactId]?.savedContact;
    const enableEditing = Boolean(connectedCase.connectedContacts?.find(cc => cc.id?.toString() === contactId));
    return {
      connectedCase,
      editContactFormOpen,
      contact,
      enableEditing,
    };
  }
  return { editContactFormOpen };
};

const mapDispatchToProps = {
  updateCaseContactsWithSearchContact: CaseActions.updateCaseContactsWithSearchContact,
  loadRawContactIntoState: loadRawContact,
  loadContactIntoState: loadContact,
  releaseContactFromState: releaseContact,
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  contactId: string;
  onClickClose: () => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewContact: React.FC<Props> = ({ onClickClose, editContactFormOpen, contactId, enableEditing }) => {
  const handleClose = () => {
    onClickClose();
  };

  return (
    <CaseLayout className={editContactFormOpen ? 'editingContact' : ''}>
      <Container removePadding={editContactFormOpen}>
        <ContactDetails contactId={contactId} enableEditing={enableEditing} context={DetailsContext.CASE_DETAILS} />
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
