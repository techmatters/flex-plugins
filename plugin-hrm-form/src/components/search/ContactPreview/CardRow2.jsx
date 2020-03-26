import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';

import { Row } from '../../../Styles/HrmStyles';
import { RowWithMargin, ContactCallType, LightText, TagText } from '../../../Styles/search';

const StyledRow = RowWithMargin(8);

const CardRow2 = ({ callType, counselor }) => (
  <StyledRow>
    <ContactCallType>
      <TagText>{callType}</TagText>
    </ContactCallType>
    <Row>
      <LightText style={{ marginRight: 5 }}>Counselor: </LightText>
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
