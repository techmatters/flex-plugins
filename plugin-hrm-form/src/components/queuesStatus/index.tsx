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
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { RootState } from '../../states';
import QueueCard from './QueueCard';
import { Container, QueuesContainer } from './styles';
import { Box, ErrorText, HeaderContainer } from '../../styles';
import { TLHPaddingLeft } from '../../styles/GlobalOverrides';
import type { CoreChannelTypes, ChannelColors } from '../../states/DomainConstants';
import { namespace, queuesStatusBase } from '../../states/storeNamespaces';

type OwnProps = {
  colors: ChannelColors;
  paddingRight: boolean;
  contactsWaitingChannels?: CoreChannelTypes[];
};

const mapStateToProps = (state: RootState) => {
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
