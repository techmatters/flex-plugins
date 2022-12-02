/* eslint-disable react/prop-types */
import React from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import { CallTypes } from 'hrm-form-definitions';

import { Flex, Row } from '../../../styles/HrmStyles';
import {
  PrevNameText,
  ContactButtonsWrapper,
  SubtitleLabel,
  ViewContactButton,
  SubtitleValue,
  StyledLink, PreviewRow,
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

const ChildNameAndDate: React.FC<Props> = ({ channel, callType, id, name, callerName, number, date, onClickFull }) => {
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
        <Flex marginRight="10px">
          <CallTypeIcon callType={callType} fontSize="18px" />
        </Flex>
        <StyledLink underline={true} style={{ minWidth: 'inherit', marginInlineEnd: 10 }} onClick={onClickFull}>
          <PrevNameText style={{ textDecoration: 'underline' }}>#{id}</PrevNameText>
        </StyledLink>
        {showNumber && maskIdentifiers && (
          <PrevNameText>
            <Template code="MaskIdentifiers" />{' '}
          </PrevNameText>
        )}
        <PrevNameText>{showNumber && !maskIdentifiers ? getNumber(channel, number) : name}</PrevNameText>

        <ContactButtonsWrapper>
          <Flex marginRight="20px" />
        </ContactButtonsWrapper>
      </PreviewRow>
      <PreviewRow>
        {callerName && (
          <>
            <SubtitleLabel>
              <Template code="Caller Name" />:
            </SubtitleLabel>{' '}
            <SubtitleValue>{callerName}</SubtitleValue>{' '}
          </>
        )}
        <SubtitleLabel>
          <Template code="Contact Date" />:
        </SubtitleLabel>{' '}
        <SubtitleValue>{dateString}</SubtitleValue>{' '}
      </PreviewRow>
    </>
  );
};

ChildNameAndDate.displayName = 'ChildNameAndDate';

export default ChildNameAndDate;
