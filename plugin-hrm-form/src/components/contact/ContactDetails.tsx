// TODO: complete this type
import React from 'react';

import ContactDetailsHome from './ContactDetailsHome';
import { ContactDetailsSectionsType } from '../common/ContactDetails';

export enum ContactDetailsRoute {
  HOME = 'home',
  EDIT_CALLER_INFO = 'editCallerInformation',
  EDIT_CHILD_INFORMATION = 'editChildInformation',
  EDIT_CATEGORIES = 'editCaseInformation',
}

type OwnProps = {
  contactId: string;
  contactDetailsRoute: ContactDetailsRoute;
  detailsExpanded: any;
  handleExpandDetailsSection: (section: ContactDetailsSectionsType) => void;
  handleOpenConnectDialog: (event: any) => void;
  showActionIcons: boolean;
};

type Props = OwnProps;

const ContactDetails: React.FC<Props> = ({ contactId, detailsExpanded, handleExpandDetailsSection, handleOpenConnectDialog, showActionIcons }) => {
  return (
    <ContactDetailsHome
      showActionIcons={showActionIcons}
      contactId={contactId}
      detailsExpanded={detailsExpanded}
      handleExpandDetailsSection={handleExpandDetailsSection}
      handleOpenConnectDialog={handleOpenConnectDialog}
    />
  );
};

ContactDetails.displayName = 'ContactDetails';

export default ContactDetails;
