/* eslint-disable react/prop-types */
/* eslint-disable react/require-default-props */
import React from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import { Fullscreen } from '@material-ui/icons';
import { CallTypes } from 'hrm-form-definitions';

import { Flex, Row, StyledIcon, HiddenText, addHover } from '../../../styles/HrmStyles';
import { PrevNameText, ContactButtonsWrapper, StyledButtonBase, DateText } from '../../../styles/search';
import { isNonDataCallType } from '../../../states/ValidationRules';
import CallTypeIcon from '../../common/icons/CallTypeIcon';
import { channelTypes, ChannelTypes } from '../../../states/DomainConstants';

const FullscreenIcon = addHover(StyledIcon(Fullscreen));

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

  return (
    <Row>
      <Flex marginRight="10px">
        <CallTypeIcon callType={callType} fontSize="18px" />
      </Flex>
      <PrevNameText>{showNumber ? getNumber(channel, number) : name}</PrevNameText>
      <ContactButtonsWrapper>
        <Flex marginRight="20px">
          <DateText>{dateString}</DateText>
        </Flex>
        <StyledButtonBase onClick={onClickFull}>
          <HiddenText>
            <Template code="ContactPreview-ExpandButton" />
          </HiddenText>
          <FullscreenIcon />
        </StyledButtonBase>
      </ContactButtonsWrapper>
    </Row>
  );
};

ChildNameAndDate.displayName = 'ChildNameAndDate';

export default ChildNameAndDate;
