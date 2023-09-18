/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { BottomButtonBar, Container, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseLayout } from '../../styles/case';
import { connectedCaseBase, contactFormsBase, namespace, RootState } from '../../states';
import ContactDetails from '../contact/ContactDetails';
import type { CustomITask, StandaloneITask } from '../../types/types';
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

type OwnProps = {
  task: CustomITask | StandaloneITask;
  contactId: string;
  onClickClose: () => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

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

export default connect(mapStateToProps)(ViewContact);
