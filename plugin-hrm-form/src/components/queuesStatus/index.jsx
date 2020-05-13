import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { namespace, queuesStatusBase } from '../../states';
import QueueCard from './QueueCard';
import { Container, HeaderContainer, QueuesContainer } from '../../styles/queuesStatus';
import { Box, ErrorText } from '../../styles/HrmStyles';
import { TLHPaddingLeft } from '../../styles/GlobalOverrides';

const QueuesStatus = ({ colors, queuesStatusState }) => {
  const { queuesStatus, error } = queuesStatusState;

  return (
    <Container role="complementary" tabIndex={0}>
      <HeaderContainer>
        <Box marginTop="12px" marginRight="5px" marginBottom="12px" marginLeft={TLHPaddingLeft}>
          Contacts waiting
        </Box>
      </HeaderContainer>
      <QueuesContainer>
        {error && <ErrorText>{error}</ErrorText>}
        {queuesStatus &&
          Object.entries(queuesStatus).map(([qName, qStatus]) => (
            <QueueCard key={qName} qName={qName} colors={colors} {...qStatus} />
          ))}
      </QueuesContainer>
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
};

const mapStateToProps = (state, ownProps) => {
  const queuesStatusState = state[namespace][queuesStatusBase];

  return { queuesStatusState };
};

export default connect(mapStateToProps, null)(QueuesStatus);
