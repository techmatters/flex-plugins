/* eslint-disable react/prop-types */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { namespace, queuesStatusBase, RootState } from '../../states';
import QueueCard from './QueueCard';
import { Container, QueuesContainer } from '../../styles/queuesStatus';
import { Box, ErrorText, HeaderContainer } from '../../styles/HrmStyles';
import { TLHPaddingLeft } from '../../styles/GlobalOverrides';
import type { ChannelTypes, ChannelColors } from '../../states/DomainConstants';

type OwnProps = {
  colors: ChannelColors;
  paddingRight: boolean;
  contactsWaitingChannels?: ChannelTypes[];
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const queuesStatusState = state[namespace][queuesStatusBase];

  return { queuesStatusState };
};

const connector = connect(mapStateToProps, null);

type Props = OwnProps & ConnectedProps<typeof connector>;

const QueuesStatus: React.FC<Props> = ({ colors, queuesStatusState, paddingRight, contactsWaitingChannels }) => {
  const { queuesStatus, error } = queuesStatusState;
  return (
    <Container role="complementary" tabIndex={0} className=".fullstory-unmask">
      <Box paddingBottom="14px">
        <HeaderContainer>
          <Box marginTop="12px" marginRight="5px" marginBottom="12px" marginLeft={TLHPaddingLeft}>
            <Template code="QueueIndex-ContactsWaiting" />
          </Box>
        </HeaderContainer>
        <QueuesContainer paddingRight={paddingRight}>
          {error && <ErrorText>{error}</ErrorText>}
          {queuesStatus &&
            Object.entries(queuesStatus).map(([qName, qStatus]) => (
              <QueueCard
                key={qName}
                qName={qName}
                colors={colors}
                contactsWaitingChannels={contactsWaitingChannels}
                {...qStatus}
              />
            ))}
        </QueuesContainer>
      </Box>
    </Container>
  );
};

QueuesStatus.displayName = 'QueuesStatus';

QueuesStatus.defaultProps = {
  paddingRight: false,
};

export default connector(QueuesStatus);
