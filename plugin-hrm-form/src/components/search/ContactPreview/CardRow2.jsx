import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';

import { Row } from '../../../Styles/HrmStyles';
import { StyledRow, ContactCallType, LightFont, TagFont } from '../../../Styles/search';

const CardRow2 = ({ callType, counselor }) => (
  <StyledRow>
    <ContactCallType>
      <TagFont>{callType}</TagFont>
    </ContactCallType>
    <Row>
      <LightFont style={{ marginRight: 5 }}>Counselor: </LightFont>
      <Typography variant="subtitle2">{counselor}</Typography>
    </Row>
  </StyledRow>
);

CardRow2.propTypes = {
  callType: PropTypes.string.isRequired,
  counselor: PropTypes.string.isRequired,
};

CardRow2.displayName = 'CardRow2';

export default CardRow2;
