import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '../../../Styles/HrmStyles';
import { RowWithMargin, ContactTag, DateText, TagText } from '../../../Styles/search';

const StyledRow = RowWithMargin(2);

const CardRow4 = ({ dateString, tag1, tag2, tag3 }) => (
  <StyledRow>
    <DateText>{dateString}</DateText>
    <Row style={{ marginLeft: 'auto' }}>
      {tag1 && (
        <ContactTag>
          <TagText>{tag1}</TagText>
        </ContactTag>
      )}
      {tag2 && (
        <ContactTag>
          <TagText>{tag2}</TagText>
        </ContactTag>
      )}
      {tag3 && (
        <ContactTag>
          <TagText>{tag3}</TagText>
        </ContactTag>
      )}
    </Row>
  </StyledRow>
);

CardRow4.propTypes = {
  dateString: PropTypes.string.isRequired,
  tag1: PropTypes.string,
  tag2: PropTypes.string,
  tag3: PropTypes.string,
};

CardRow4.defaultProps = {
  tag1: '',
  tag2: '',
  tag3: '',
};

CardRow4.displayName = 'ContactLabels';

export default CardRow4;
