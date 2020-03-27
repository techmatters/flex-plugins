import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '../../../Styles/HrmStyles';
import { RowWithMargin, CalltypeTag, LightText, TagText, SummaryText } from '../../../Styles/search';

const StyledRow = RowWithMargin(8);

const CardRow2 = ({ callType, counselor }) => (
  <StyledRow>
    <CalltypeTag>
      <TagText>{callType}</TagText>
    </CalltypeTag>
    <Row>
      <LightText style={{ marginRight: 5 }}>Counselor: </LightText>
      <SummaryText>{counselor}</SummaryText>
    </Row>
  </StyledRow>
);

CardRow2.propTypes = {
  callType: PropTypes.string.isRequired,
  counselor: PropTypes.string.isRequired,
};

CardRow2.displayName = 'CardRow2';

export default CardRow2;
