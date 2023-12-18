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

import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { Close } from '@material-ui/icons';

import { HeaderCloseButton, HiddenText } from '../../styles/HrmStyles';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import WarningIcon from './WarningIcon';
import { BannerActionLink, BannerContainer, Text } from './styles';
import { closeRemovedFromCaseBannerAction } from '../../states/case/caseBanners';
import { contactFormsBase, namespace } from '../../states/storeNamespaces';
import { Contact } from '../../types/types';
import { connectToCaseAsyncAction } from '../../states/contacts/saveContact';
import { newCloseModalAction } from '../../states/routing/actions';
import asyncDispatch from '../../states/asyncDispatch';
import { RootState } from '../../states';

type OwnProps = {
  taskId: string;
  savedContact?: Contact;
  showRemovedFromCaseBanner?: boolean;
};

const mapStateToProps = (state: RootState, { taskId, savedContact }: OwnProps) => {
  const contact = selectContactByTaskSid(state, taskId);
  const caseId = state[namespace][contactFormsBase].removedCaseId[savedContact?.id];

  return {
    contactId: contact?.savedContact.id ? contact?.savedContact.id : savedContact?.id,
    caseId,
  };
};

const mapDispatchToProps = (dispatch, { taskId }: OwnProps) => ({
  close: (contactId: string) => dispatch(closeRemovedFromCaseBannerAction(contactId)),
  connectCaseToTaskContact: async (taskContact: Contact, caseId: string) => {
    await asyncDispatch(dispatch)(connectToCaseAsyncAction(taskContact.id, caseId));
  },
  closeModal: () => dispatch(newCloseModalAction(taskId)),
});

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const ContactRemovedFromCaseBanner: React.FC<Props> = ({
  contactId,
  close,
  showRemovedFromCaseBanner,
  savedContact,
  connectCaseToTaskContact,
  closeModal,
  caseId,
}) => (
  <BannerContainer color="orange">
    <WarningIcon />
    <Text>
      <Template code="CaseMerging-ContactRemovedFromCase" />
    </Text>
    {showRemovedFromCaseBanner && savedContact?.id && (
      <HeaderCloseButton
        onClick={() => {
          connectCaseToTaskContact(savedContact, caseId);
        }}
        color="#fffeef"
      >
        <Template code="CaseMerging-ContactUndoRemovedFromCase" />
      </HeaderCloseButton>
     )}
    <HeaderCloseButton onClick={() => close(contactId)} style={{ opacity: '.75' }}>
      <HiddenText>
        <Template code="NavigableContainer-CloseButton" />
      </HiddenText>
      <Close />
    </HeaderCloseButton>
  </BannerContainer>
);

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(ContactRemovedFromCaseBanner);

export default connected;
