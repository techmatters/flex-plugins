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
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { namespace, contactFormsBase, RootState } from '../../../states';
import { Container } from '../../../styles/HrmStyles';
import GeneralContactDetails from '../../contact/ContactDetails';
import ConnectDialog from '../ConnectDialog';
import BackToSearchResultsButton from '../SearchResults/SearchResultsBackButton';
import { SearchAPIContact } from '../../../types/types';
import { loadContact, releaseContact } from '../../../states/contacts/existingContacts';
import { DetailsContext } from '../../../states/contacts/contactDetails';

type OwnProps = {
  task: any;
  currentIsCaller: boolean;
  contact: SearchAPIContact;
  showActionIcons: boolean;
  handleBack: () => void;
  handleSelectSearchResult: (contact: SearchAPIContact) => void;
};
const mapStateToProps = (state: RootState) => {
  const editContactFormOpen = state[namespace][contactFormsBase].editingContact;
  const { isCallTypeCaller } = state[namespace][contactFormsBase];

  return { editContactFormOpen, isCallTypeCaller };
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
  handleBack,
  showActionIcons,
  task,
  handleSelectSearchResult,
  loadContactIntoState,
  releaseContactFromState,
  editContactFormOpen,
  isCallTypeCaller,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadContactIntoState(contact, task.taskSid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);
  const handleBackToResults = () => {
    releaseContactFromState(contact.contactId, task.taskSid);
    handleBack();
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
    <Container removePadding={editContactFormOpen} data-testid="ContactDetails">
      <ConnectDialog
        task={task}
        anchorEl={anchorEl}
        currentIsCaller={currentIsCaller}
        contact={contact}
        handleConfirm={handleConfirmDialog}
        handleClose={handleCloseDialog}
        isCallTypeCaller={isCallTypeCaller}
      />

      <div className={`${editContactFormOpen ? 'editingContact' : ''} hiddenWhenEditingContact`}>
        <BackToSearchResultsButton
          text={<Template code="SearchResultsIndex-BackToResults" />}
          handleBack={handleBackToResults}
        />
      </div>

      <GeneralContactDetails
        context={DetailsContext.CONTACT_SEARCH}
        showActionIcons={showActionIcons}
        contactId={contact.contactId}
        handleOpenConnectDialog={handleOpenConnectDialog}
      />
    </Container>
  );
};

ContactDetails.displayName = 'ContactDetails';

export default connector(ContactDetails);
