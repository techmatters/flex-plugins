/* eslint-disable react/prop-types */
import React from 'react';
import { differenceInMinutes } from 'date-fns';
import { Template } from '@twilio/flex-ui';

import { Box, Row, HiddenText } from '../../styles/HrmStyles';
import {
  QueueName,
  ChannelColumn,
  ChannelBox,
  ChannelLabel,
  WaitTimeLabel,
  WaitTimeValue,
} from '../../styles/queuesStatus';
import { channelTypes, ChannelTypes, ChannelColors } from '../../states/DomainConstants';

const getChannelUI = (
  shortChannel: string,
  color: ChannelColors[ChannelTypes],
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
}): ((channel: ChannelTypes) => JSX.Element) => channel => {
  const channelColor = colors[channel];

  switch (channel) {
    case channelTypes.voice:
      return getChannelUI('Calls', channelColor, contactsWaiting, false);
    case channelTypes.sms:
      return getChannelUI('SMS', channelColor, contactsWaiting, true);
    case channelTypes.facebook:
      return getChannelUI('FB', channelColor, contactsWaiting, true, 'Facebook');
    case channelTypes.whatsapp:
      return getChannelUI('WA', channelColor, contactsWaiting, true, 'Whatsapp');
    case channelTypes.web:
      return getChannelUI('Chat', channelColor, contactsWaiting, true);
    case channelTypes.twitter:
      return getChannelUI('Twtr', channelColor, contactsWaiting, true);
    case channelTypes.instagram:
      return getChannelUI('IG', channelColor, contactsWaiting, true);
    default:
      return null;
  }
};

type Props = {
  qName: string;
  facebook: number;
  sms: number;
  voice: number;
  web: number;
  whatsapp: number;
  twitter: number;
  instagram: number;
  longestWaitingDate: string | null;
  colors: ChannelColors;
  contactsWaitingChannels?: ChannelTypes[];
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
        <HiddenText aria-labelledby={`name-${qName}`} />
        <QueueName>{qName}</QueueName>
        <Box marginTop="7px" marginBottom="14px">
          <Row>
            {contactsWaitingChannels && Array.isArray(contactsWaitingChannels)
              ? Object.values(channelTypes)
                  .filter(c => contactsWaitingChannels.includes(c))
                  .map(renderFun)
              : Object.values(channelTypes).map(renderFun)}
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
