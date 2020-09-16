import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { namespace, queuesStatusBase } from '../../states';
import QueueCard from './QueueCard';
import { Container, QueuesContainer, BackgroundWrapper } from '../../styles/queuesStatus';
import { Box, ErrorText, HeaderContainer } from '../../styles/HrmStyles';
import { TLHPaddingLeft } from '../../styles/GlobalOverrides';

const QueuesStatus = ({ colors, queuesStatusState, noActiveTasks }) => {
  const { queuesStatus, error } = queuesStatusState;

  return (
    <Container role="complementary" tabIndex={0}>
      <BackgroundWrapper noActiveTasks={noActiveTasks}>
        <HeaderContainer>
          <Box marginTop="12px" marginRight="5px" marginBottom="12px" marginLeft={TLHPaddingLeft}>
            <Template code="QueueIndex-ContactsWaiting" />
          </Box>
        </HeaderContainer>
        <QueuesContainer>
          {error && <ErrorText>{error}</ErrorText>}
          {queuesStatus &&
            Object.entries(queuesStatus).map(([qName, qStatus]) => (
              <QueueCard key={qName} qName={qName} colors={colors} {...qStatus} />
            ))}
        </QueuesContainer>
      </BackgroundWrapper>
    </Container>
  );
};

QueuesStatus.displayName = 'QueuesStatus';

QueuesStatus.propTypes = {
  colors: PropTypes.shape({
    voiceColor: PropTypes.shape({ Accepted: PropTypes.string }),
    webColor: PropTypes.shape({ Accepted: PropTypes.string }),
    facebookColor: PropTypes.shape({ Accepted: PropTypes.string }),
    smsColor: PropTypes.shape({ Accepted: PropTypes.string }),
    whatsappColor: PropTypes.shape({ Accepted: PropTypes.string }),
  }).isRequired,
  queuesStatusState: PropTypes.shape({
    queuesStatus: PropTypes.shape({
      Admin: PropTypes.shape({}),
    }),
    error: PropTypes.string,
    loading: PropTypes.bool,
  }).isRequired,
  noActiveTasks: PropTypes.bool,
};

QueuesStatus.defaultProps = {
  noActiveTasks: false,
};

const mapStateToProps = (state, ownProps) => {
  const queuesStatusState = state[namespace][queuesStatusBase];

  return { queuesStatusState };
};

export default connect(mapStateToProps, null)(QueuesStatus);
