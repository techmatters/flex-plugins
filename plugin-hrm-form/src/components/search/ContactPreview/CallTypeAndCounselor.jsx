import React from 'react';
import PropTypes from 'prop-types';

import { Row, Box } from '../../../styles/HrmStyles';
import { CalltypeTag, CounselorText, TagText, SummaryText } from '../../../styles/search';

const CallTypeAndCounselor = ({ callType, counselor }) => (
  <Box marginBottom="8px">
    <Row>
      <CalltypeTag>
        <TagText>{callType}</TagText>
      </CalltypeTag>
      <Row>
        <CounselorText style={{ marginRight: 5 }}>Counselor: </CounselorText>
        <SummaryText>{counselor}</SummaryText>
      </Row>
    </Row>
  </Box>
);

CallTypeAndCounselor.propTypes = {
  callType: PropTypes.string.isRequired,
  counselor: PropTypes.string.isRequired,
};

CallTypeAndCounselor.displayName = 'CallTypeAndCounselor';

export default CallTypeAndCounselor;
