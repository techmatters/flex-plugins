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

/* eslint-disable no-empty-function */
/* eslint-disable react/require-default-props */

import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../states';
import GeneralContactDetails from '../../contact/ContactDetails';
import ConnectDialog from '../ConnectDialog';
import { Contact, CustomITask } from '../../../types/types';
import { loadContact, releaseContact } from '../../../states/contacts/existingContacts';
import { DetailsContext } from '../../../states/contacts/contactDetails';
import { namespace } from '../../../states/storeNamespaces';

type OwnProps = {
  task: CustomITask;
  currentIsCaller: boolean;
  contact: Contact;
  showActionIcons: boolean;
  handleBack: () => void;
  handleSelectSearchResult: (contact: Contact) => void;
};

const mapStateToProps = ({ [namespace]: { activeContacts, configuration } }: RootState, { contact }: OwnProps) => {
  const { isCallTypeCaller, editingContact: editContactFormOpen } = activeContacts;
  const definitionVersion = configuration.definitionVersions[contact.rawJson.definitionVersion];
  return { editContactFormOpen, isCallTypeCaller, definitionVersion };
};
const mapDispatchToProps = {
  loadContactIntoState: loadContact,
  releaseContactFromState: releaseContact,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactDetails: React.FC<Props> = ({
  contact,
  currentIsCaller,
  showActionIcons,
  task,
  handleSelectSearchResult,
  loadContactIntoState,
  releaseContactFromState,
  isCallTypeCaller,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadContactIntoState(contact, task.taskSid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

  const handleBackToResults = () => {
    releaseContactFromState(contact.id, task.taskSid);
  };

  const handleCloseDialog = () => {
    setAnchorEl(null);
  };

  const handleConfirmDialog = () => {
    if (handleSelectSearchResult) {
      handleSelectSearchResult(contact);
    }
  };

  const handleOpenConnectDialog = e => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  return (
    <>
      <ConnectDialog
        task={task}
        anchorEl={anchorEl}
        currentIsCaller={currentIsCaller}
        contact={contact}
        handleConfirm={handleConfirmDialog}
        handleClose={handleCloseDialog}
        isCallTypeCaller={isCallTypeCaller}
      />

      <GeneralContactDetails
        context={DetailsContext.CONTACT_SEARCH}
        showActionIcons={showActionIcons}
        contactId={contact.id}
        handleOpenConnectDialog={handleOpenConnectDialog}
        task={task}
        onClose={handleBackToResults}
      />
    </>
  );
};

ContactDetails.displayName = 'ContactDetails';

export default connector(ContactDetails);
