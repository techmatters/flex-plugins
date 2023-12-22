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
import { Actions, Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../states';
import { TLHPaddingLeft } from '../../styles/GlobalOverrides';
import { Box, HeaderContainer } from '../../styles';
import {
  OfflineContactTaskContent,
  OfflineContactTaskFirstLine,
  OfflineContactTaskSecondLine,
  OfflineContactTaskIconContainer,
  OfflineContactTaskIcon,
  OfflineContactTaskButton,
} from './styles';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import getOfflineContactTaskSid from '../../states/contacts/offlineContactTaskSid';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';
import { namespace, routingBase } from '../../states/storeNamespaces';

type OwnProps = { selectedTaskSid?: string };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const OfflineContactTask: React.FC<Props> = ({ isAddingOfflineContact, selectedTaskSid, offlineContact }) => {
  if (!isAddingOfflineContact) return null;
  const offlineContactForms = offlineContact?.rawJson;

  const onClick = async () => {
    await Actions.invokeAction('SelectTask', { task: undefined });
  };

  const selected = !selectedTaskSid && isAddingOfflineContact;
  const name =
    offlineContactForms &&
    (offlineContactForms.childInformation.firstName || offlineContactForms.childInformation.lastName) &&
    `${offlineContactForms.childInformation.firstName} ${offlineContactForms.childInformation.lastName}`;
  const formattedName = name && name.trim() !== '' ? name : <Template code="Anonymous" />;

  return (
    <>
      <HeaderContainer>
        <Box marginTop="12px" marginRight="5px" marginBottom="12px" marginLeft={TLHPaddingLeft}>
          <Template code="OfflineContacts-Header" />
        </Box>
      </HeaderContainer>
      <OfflineContactTaskButton onClick={onClick} selected={selected}>
        <OfflineContactTaskIconContainer>
          <OfflineContactTaskIcon />
        </OfflineContactTaskIconContainer>
        <OfflineContactTaskContent>
          <OfflineContactTaskFirstLine>{formattedName}</OfflineContactTaskFirstLine>
          <OfflineContactTaskSecondLine>
            <Template code="OfflineContactSecondLine" />
          </OfflineContactTaskSecondLine>
        </OfflineContactTaskContent>
      </OfflineContactTaskButton>
    </>
  );
};

OfflineContactTask.displayName = 'OfflineContactTask';

const mapStateToProps = (state: RootState) => {
  const { savedContact, draftContact } = selectContactByTaskSid(state, getOfflineContactTaskSid()) || {};
  return {
    isAddingOfflineContact: state[namespace][routingBase].isAddingOfflineContact,
    offlineContact: savedContact ? getUnsavedContact(savedContact, draftContact) : undefined,
  };
};

const connector = connect(mapStateToProps);

export default connector(OfflineContactTask);
