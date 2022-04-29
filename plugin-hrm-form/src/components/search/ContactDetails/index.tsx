/* eslint-disable no-empty-function */
import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';

import { Container } from '../../../styles/HrmStyles';
import { contactType } from '../../../types';
import GeneralContactDetails from '../../contact/ContactDetails';
import ConnectDialog from '../ConnectDialog';
import BackToSearchResultsButton from '../SearchResults/SearchResultsBackButton';
import { SearchContact } from '../../../types/types';
import { ContactDetailsSections } from '../../common/ContactDetails';

type OwnProps = {
  task: any;
  currentIsCaller: boolean;
  contact: SearchContact;
  showActionIcons: boolean;
  detailsExpanded: Record<string, boolean>;
  handleBack: () => void;
  handleSelectSearchResult: (contact: SearchContact) => void;
  handleMockedMessage: () => void;
  handleExpandDetailsSection: (section: typeof ContactDetailsSections[keyof typeof ContactDetailsSections]) => void;
};

type Props = OwnProps;

const ContactDetails: React.FC<Props> = ({
  contact,
  detailsExpanded,
  currentIsCaller,
  handleBack,
  showActionIcons,
  task,
  handleSelectSearchResult,
  handleExpandDetailsSection,
  handleMockedMessage,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState(null);

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
        showActionIcons={showActionIcons}
        contactId={contact.contactId}
        detailsExpanded={detailsExpanded}
        handleOpenConnectDialog={handleOpenConnectDialog}
        handleMockedMessage={handleMockedMessage}
        handleExpandDetailsSection={handleExpandDetailsSection}
      />
    </Container>
  );
};

ContactDetails.displayName = 'ContactDetails';

export default ContactDetails;
