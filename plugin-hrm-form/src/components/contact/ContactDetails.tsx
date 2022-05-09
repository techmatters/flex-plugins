// TODO: complete this type
import React from 'react';

import ContactDetailsHome from './ContactDetailsHome';
import { DetailsContext } from '../../states/contacts/contactDetails';

type OwnProps = {
  contactId: string;
  context: DetailsContext;
  handleOpenConnectDialog?: (event: any) => void;
  showActionIcons?: boolean;
};

type Props = OwnProps;

const ContactDetails: React.FC<Props> = ({ context, contactId, handleOpenConnectDialog, showActionIcons }) => {
  return (
    <ContactDetailsHome
      context={context}
      showActionIcons={showActionIcons}
      contactId={contactId}
      handleOpenConnectDialog={handleOpenConnectDialog}
    />
  );
};

ContactDetails.displayName = 'ContactDetails';

export default ContactDetails;
