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

import { HiddenText } from '../../styles/HrmStyles';
import { HeaderCloseButton } from '../../styles/buttons';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import WarningIcon from './WarningIcon';
import { BannerContainer, Text } from './styles';
import { closeRemovedFromCaseBannerAction } from '../../states/case/caseBanners';

type OwnProps = {
  taskId: string;
};

const mapStateToProps = (state, { taskId }: OwnProps) => {
  const contact = selectContactByTaskSid(state, taskId);

  return {
    contactId: contact.savedContact.id,
  };
};

const mapDispatchToProps = dispatch => ({
  close: (contactId: string) => dispatch(closeRemovedFromCaseBannerAction(contactId)),
});

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const ContactRemovedFromCaseBanner: React.FC<Props> = ({ contactId, close }) => (
  <BannerContainer color="orange">
    <WarningIcon />
    <Text>
      <Template code="CaseMerging-ContactRemovedFromCase" />
    </Text>
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
