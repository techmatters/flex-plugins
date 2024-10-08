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

import { HiddenText } from '../../styles';
import { HeaderCloseButton } from '../../styles/buttons';
import { BannerContainer, CaseLink, BannerText } from '../../styles/banners';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import WarningIcon from './WarningIcon';
import { closeRemovedFromCaseBannerAction, selectCaseMergingBanners } from '../../states/case/caseBanners';
import { Contact } from '../../types/types';
import { connectToCaseAsyncAction } from '../../states/contacts/saveContact';
import asyncDispatch from '../../states/asyncDispatch';
import { RootState } from '../../states';
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';
import { getInitializedCan, PermissionActions } from '../../permissions';
import { selectCaseByCaseId } from '../../states/case/selectCaseStateByCaseId';

type OwnProps = {
  taskId: string;
  contactId?: string;
  showUndoButton?: boolean;
};

const mapStateToProps = (state: RootState, { taskId, contactId }: OwnProps) => {
  const contact = selectContactByTaskSid(state, taskId);
  const { caseId } = selectCaseMergingBanners(state, contactId);
  const savedContact = selectContactStateByContactId(state, contactId)?.savedContact;
  const connectedCase = selectCaseByCaseId(state, caseId)?.connectedCase;

  return {
    contactId: savedContact?.id ? savedContact?.id : contact?.savedContact.id,
    caseId,
    savedContact,
    connectedCase,
  };
};

const mapDispatchToProps = dispatch => ({
  close: (contactId: string) => dispatch(closeRemovedFromCaseBannerAction(contactId)),
  connectCaseToTaskContact: async (taskContact: Contact, caseId: string) => {
    await asyncDispatch(dispatch)(connectToCaseAsyncAction(taskContact.id, caseId));
  },
});

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const ContactRemovedFromCaseBanner: React.FC<Props> = ({
  contactId,
  close,
  showUndoButton,
  savedContact,
  connectCaseToTaskContact,
  caseId,
  connectedCase,
}) => {
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const canUndo =
    showUndoButton &&
    savedContact?.id &&
    connectedCase &&
    can(PermissionActions.ADD_CONTACT_TO_CASE, savedContact) &&
    can(PermissionActions.UPDATE_CASE_CONTACTS, connectedCase);

  return (
    <BannerContainer color="orange">
      <WarningIcon />
      <BannerText>
        <Template code="CaseMerging-ContactRemovedFromCase" />
      </BannerText>
      {canUndo && (
        <CaseLink
          onClick={() => {
            connectCaseToTaskContact(savedContact, caseId);
          }}
          color="#0263e0"
        >
          <Template code="CaseMerging-ContactUndoRemovedFromCase" />
        </CaseLink>
      )}
      <HeaderCloseButton onClick={() => close(contactId)} style={{ opacity: '.75' }}>
        <HiddenText>
          <Template code="NavigableContainer-CloseButton" />
        </HiddenText>
        <Close />
      </HeaderCloseButton>
    </BannerContainer>
  );
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(ContactRemovedFromCaseBanner);

export default connected;
