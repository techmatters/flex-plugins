/* eslint-disable react/prop-types */
import React from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import { CallTypes } from 'hrm-form-definitions';

import { Flex, Row } from '../../../styles/HrmStyles';
import { PrevNameText, ContactButtonsWrapper, DateText, ViewContactButton } from '../../../styles/search';
import { ViewButton } from '../../../styles/case';
import { isNonDataCallType } from '../../../states/ValidationRules';
import CallTypeIcon from '../../common/icons/CallTypeIcon';
import { channelTypes, ChannelTypes } from '../../../states/DomainConstants';
import { getPermissionsForViewingIdentifiers, PermissionActions } from '../../../permissions';

type OwnProps = {
  channel: ChannelTypes;
  callType: CallTypes;
  name?: string;
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

const ChildNameAndDate: React.FC<Props> = ({ channel, callType, name, number, date, onClickFull }) => {
  const dateString = `${format(new Date(date), 'MMM d, yyyy h:mm aaaaa')}m`;
  const showNumber = isNonDataCallType(callType) && Boolean(number);
  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  return (
    <Row>
      <Flex marginRight="10px">
        <CallTypeIcon callType={callType} fontSize="18px" />
      </Flex>
      {showNumber && maskIdentifiers && (
        <PrevNameText>
          <Template code="MaskIdentifiers" />{' '}
        </PrevNameText>
      )}
      <PrevNameText>{showNumber && !maskIdentifiers ? getNumber(channel, number) : name}</PrevNameText>

      <ContactButtonsWrapper>
        <Flex marginRight="20px">
          <DateText>{dateString}</DateText>
        </Flex>
        <ViewButton onClick={onClickFull}>
          <Template code="Contact-ViewButton" />
        </ViewButton>
      </ContactButtonsWrapper>
    </Row>
  );
};

ChildNameAndDate.displayName = 'ChildNameAndDate';

export default ChildNameAndDate;
