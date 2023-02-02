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
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import { CallTypes } from 'hrm-form-definitions';

import { Flex } from '../../../styles/HrmStyles';
import {
  PreviewHeaderText,
  ContactButtonsWrapper,
  SubtitleLabel,
  SubtitleValue,
  StyledLink,
  PreviewRow,
} from '../../../styles/search';
import { isNonDataCallType } from '../../../states/ValidationRules';
import CallTypeIcon from '../../common/icons/CallTypeIcon';
import { channelTypes, ChannelTypes } from '../../../states/DomainConstants';
import { getPermissionsForViewingIdentifiers, PermissionActions } from '../../../permissions';

type OwnProps = {
  channel: ChannelTypes | 'default';
  callType: CallTypes;
  id: string;
  name?: string;
  callerName?: string;
  number?: string;
  date: string;
  onClickFull: () => void;
};

type Props = OwnProps;

const getNumber = (channel, number) => {
  switch (channel) {
    case channelTypes.facebook:
      return `FB: ${number}`;
    case channelTypes.web:
      return 'Web';
    default:
      return number;
  }
};

const ContactHeader: React.FC<Props> = ({ channel, callType, id, name, callerName, number, date, onClickFull }) => {
  const dateObj = new Date(date);
  const dateString = `${format(dateObj, 'MMM d, yyyy')}, ${dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  const showNumber = isNonDataCallType(callType) && Boolean(number);
  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  return (
    <>
      <PreviewRow>
        {!isNonDataCallType(callType) && (
          <Flex marginRight="10px">
            <CallTypeIcon callType={callType} fontSize="18px" />
          </Flex>
        )}
        <StyledLink underline={true} style={{ minWidth: 'inherit', marginInlineEnd: 10 }} onClick={onClickFull}>
          <PreviewHeaderText style={{ textDecoration: 'underline' }}>#{id}</PreviewHeaderText>
        </StyledLink>
        {showNumber && maskIdentifiers && (
          <PreviewHeaderText>
            <Template code="MaskIdentifiers" />{' '}
          </PreviewHeaderText>
        )}
        <PreviewHeaderText>{showNumber && !maskIdentifiers ? getNumber(channel, number) : name}</PreviewHeaderText>
        <ContactButtonsWrapper>
          <Flex marginRight="20px" />
        </ContactButtonsWrapper>
      </PreviewRow>
      <PreviewRow>
        {callerName && (
          <>
            <SubtitleLabel>
              <Template code="CallSummary-CallerName" />:
            </SubtitleLabel>{' '}
            <SubtitleValue>{callerName}</SubtitleValue>
          </>
        )}
        <SubtitleLabel>
          <Template code="CallSummary-ContactDate" />:
        </SubtitleLabel>{' '}
        <SubtitleValue>{dateString}</SubtitleValue>
      </PreviewRow>
    </>
  );
};

ContactHeader.displayName = 'ContactHeader';

export default ContactHeader;
