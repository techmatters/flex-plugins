/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { isNonDataCallType } from '../../../states/ValidationRules';
import { StyledButtonBase, ConnectIcon } from '../../../styles/search';
import { Flex, Box, HiddenText } from '../../../styles/HrmStyles';
import { CallTypes } from '../../../states/DomainConstants';

type OwnProps = {
  callType: CallTypes;
  onOpenConnectDialog: () => void;
  showConnectIcon: Boolean;
};

type Props = OwnProps;

const ConnectContact: React.FC<Props> = ({ callType, onOpenConnectDialog, showConnectIcon }) => {
  const isNonDataContact = isNonDataCallType(callType);

  if (isNonDataContact) {
    return <Box width="44px" marginRight="10px" />;
  }

  return (
    <Flex alignItems="flex-start" marginTop="10px" marginRight="10px">
      <StyledButtonBase onClick={onOpenConnectDialog} disabled={isNonDataContact}>
        <HiddenText>
          <Template code="ContactPreview-CopyButton" />
        </HiddenText>
        {showConnectIcon && <ConnectIcon />}
      </StyledButtonBase>
    </Flex>
  );
};
ConnectContact.displayName = 'ConnectContact';

export default ConnectContact;
