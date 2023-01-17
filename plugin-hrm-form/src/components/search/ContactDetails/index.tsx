/* eslint-disable no-empty-function */
/* eslint-disable react/require-default-props */

import React, { useEffect, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';

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

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

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

export default connect(mapStateToProps, mapDispatchToProps)(ContactDetails);
