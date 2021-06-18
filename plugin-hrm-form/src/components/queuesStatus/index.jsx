import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { namespace, queuesStatusBase } from '../../states';
import QueueCard from './QueueCard';
import { Container, QueuesContainer } from '../../styles/queuesStatus';
import { Box, ErrorText, HeaderContainer } from '../../styles/HrmStyles';
import { TLHPaddingLeft } from '../../styles/GlobalOverrides';

const QueuesStatus = ({ colors, queuesStatusState, paddingRight }) => {
  const { queuesStatus, error } = queuesStatusState;
  return (
    <Container role="complementary" tabIndex={0}>
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
              <QueueCard key={qName} qName={qName} colors={colors} {...qStatus} />
            ))}
        </QueuesContainer>
      </Box>
    </Container>
  );
};

QueuesStatus.displayName = 'QueuesStatus';

QueuesStatus.propTypes = {
  colors: PropTypes.shape({
    voiceColor: PropTypes.string,
    webColor: PropTypes.string,
    facebookColor: PropTypes.string,
    smsColor: PropTypes.string,
    whatsappColor: PropTypes.string,
    twitterColor: PropTypes.string,
  }).isRequired,
  queuesStatusState: PropTypes.shape({
    queuesStatus: PropTypes.shape({
      Admin: PropTypes.shape({}),
    }),
    error: PropTypes.string,
    loading: PropTypes.bool,
  }).isRequired,
  paddingRight: PropTypes.bool,
};

QueuesStatus.defaultProps = {
  paddingRight: false,
};

const mapStateToProps = (state, ownProps) => {
  const queuesStatusState = state[namespace][queuesStatusBase];

  return { queuesStatusState };
};

export default connect(mapStateToProps, null)(QueuesStatus);
