/* eslint-disable no-empty-function */
import React, { useEffect, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { Container } from '../../../styles/HrmStyles';
import GeneralContactDetails from '../../contact/ContactDetails';
import ConnectDialog from '../ConnectDialog';
import BackToSearchResultsButton from '../SearchResults/SearchResultsBackButton';
import { SearchContact, standaloneTaskSid } from '../../../types/types';
import { loadContact, releaseContact } from '../../../states/contacts/existingContacts';
import { DetailsContext } from '../../../states/contacts/contactDetails';

type OwnProps = {
  task: any;
  currentIsCaller: boolean;
  contact: SearchContact;
  handleBack: () => void;
  handleSelectSearchResult: (contact: SearchContact) => void;
};

const mapDispatchToProps = {
  loadContactIntoState: loadContact,
  releaseContactFromState: releaseContact,
};

type Props = OwnProps & typeof mapDispatchToProps;

const ContactDetails: React.FC<Props> = ({
  contact,
  currentIsCaller,
  handleBack,
  task,
  handleSelectSearchResult,
  loadContactIntoState,
  releaseContactFromState,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadContactIntoState(contact);
    return () => {
      releaseContactFromState(contact.contactId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

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

  const showActionIcons = task.taskSid !== standaloneTaskSid;

  return (
    <Container>
      <ConnectDialog
        task={task}
        anchorEl={anchorEl}
        currentIsCaller={currentIsCaller}
        contact={contact}
        handleConfirm={handleConfirmDialog}
        handleClose={handleCloseDialog}
      />
      <BackToSearchResultsButton text={<Template code="SearchResultsIndex-BackToResults" />} handleBack={handleBack} />
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

export default connect(null, mapDispatchToProps)(ContactDetails);
