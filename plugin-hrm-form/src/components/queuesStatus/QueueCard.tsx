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
import { differenceInMinutes } from 'date-fns';
import { Template } from '@twilio/flex-ui';

import { Box, Row, HiddenText } from '../../styles';
import { QueueName, ChannelColumn, ChannelBox, ChannelLabel, WaitTimeLabel, WaitTimeValue } from './styles';
import { coreChannelTypes, CoreChannelTypes, ChannelColors } from '../../states/DomainConstants';

const getChannelUI = (
  shortChannel: string,
  color: ChannelColors[CoreChannelTypes],
  value: number,
  marginLeft: boolean,
  channelAria: string = undefined,
) => (
  <ChannelColumn marginLeft={marginLeft} aria-label={`${value} ${channelAria || shortChannel},`}>
    <ChannelBox
      isZero={value === 0}
      backgroundColor={color}
      className="channel-box-inner-value"
      data-testid="channel-box-inner-value"
    >
      {value === 0 ? <span>&mdash;</span> : value}
    </ChannelBox>
    <ChannelLabel>{shortChannel}</ChannelLabel>
  </ChannelColumn>
);

const renderChannel = ({
  colors,
  contactsWaiting,
}: {
  colors: ChannelColors;
  contactsWaiting: number;
}): ((channel: CoreChannelTypes) => JSX.Element) => channel => {
  const channelColor = colors[channel];

  switch (channel) {
    case coreChannelTypes.voice:
      return getChannelUI('Calls', channelColor, contactsWaiting, false);
    case coreChannelTypes.sms:
      return getChannelUI('SMS', channelColor, contactsWaiting, true);
    case coreChannelTypes.messenger:
      return getChannelUI('FB', channelColor, contactsWaiting, true, 'Facebook');
    case coreChannelTypes.whatsapp:
      return getChannelUI('WA', channelColor, contactsWaiting, true, 'Whatsapp');
    case coreChannelTypes.web:
      return getChannelUI('Chat', channelColor, contactsWaiting, true);
    case coreChannelTypes.telegram:
      return getChannelUI('TG', channelColor, contactsWaiting, true);
    case coreChannelTypes.instagram:
      return getChannelUI('IG', channelColor, contactsWaiting, true);
    case coreChannelTypes.line:
      return getChannelUI('LN', channelColor, contactsWaiting, true);
    default:
      return null;
  }
};

type Props = {
  qName: string;
  messenger: number;
  sms: number;
  voice: number;
  web: number;
  whatsapp: number;
  telegram: number;
  instagram: number;
  line: number;
  longestWaitingDate: string | null;
  colors: ChannelColors;
  contactsWaitingChannels?: CoreChannelTypes[];
};

const QueuesCard: React.FC<Props> = props => {
  const [state, setState] = React.useState({ waitingMinutes: 0, intervalId: null });

  const setNewInterval = () => {
    if (state.intervalId) clearTimeout(state.intervalId);

    const intervalId = setInterval(
      () => setState(prev => ({ ...prev, waitingMinutes: prev.waitingMinutes + 1 })),
      60 * 1000,
    );

    const waitingMinutes = differenceInMinutes(new Date(), new Date(props.longestWaitingDate));
    setState({ intervalId, waitingMinutes });
  };

  // Runs on mount and on longestWaitingDate changes. If the effect is run we want to clear intervalId and recompute waitingMinutes
  React.useEffect(() => {
    if (props.longestWaitingDate) setNewInterval();

    // Cleanup
    return () => {
      if (state.intervalId) clearTimeout(state.intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.longestWaitingDate]);

  const getWaitingMessage = () => {
    if (props.longestWaitingDate === null) return <Template code="QueueCard-None" />;
    if (state.waitingMinutes === 0) return <Template code="QueueCard-LessThanMinute" />;
    if (state.waitingMinutes === 1) return <Template code="QueueCard-OneMinute" />;
    return (
      <>
        {state.waitingMinutes}
        <Template code="QueueCard-Minutes" component="span" />
      </>
    );
  };

  const { qName, contactsWaitingChannels } = props;
  const renderFun = channel => (
    <div key={`${qName}-${channel}`} data-testid={`${qName}-${channel}`}>
      {renderChannel({ colors: props.colors, contactsWaiting: props[channel] })(channel)}
    </div>
  );

  return (
    <>
      <Box paddingLeft="10px" paddingTop="10px" data-testid={`Queue-Status${qName}`}>
        <HiddenText id={`name-${qName}`}>
          <Template code="QueueCard-Name" />
        </HiddenText>
        <HiddenText role="region" aria-labelledby={`name-${qName}`} />
        <QueueName>{qName}</QueueName>
        <Box marginTop="7px" marginBottom="14px">
          <Row>
            {contactsWaitingChannels && Array.isArray(contactsWaitingChannels)
              ? Object.values(coreChannelTypes)
                  .filter(c => contactsWaitingChannels.includes(c))
                  .map(renderFun)
              : Object.values(coreChannelTypes).map(renderFun)}
          </Row>
        </Box>
        <Row>
          <WaitTimeLabel>
            <Template code="QueueCard-WaitLabel" />
          </WaitTimeLabel>
          <WaitTimeValue>{getWaitingMessage()}</WaitTimeValue>
        </Row>
      </Box>
    </>
  );
};

QueuesCard.defaultProps = {
  longestWaitingDate: null,
  contactsWaitingChannels: null,
};

QueuesCard.displayName = 'QueuesCard';

export default QueuesCard;
