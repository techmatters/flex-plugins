import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '../../../Styles/HrmStyles';
import { RowWithMargin, ContactTag, DateText, TagText } from '../../../Styles/search';

const StyledRow = RowWithMargin(2);

const DateAndTags = ({ dateString, tag1, tag2, tag3 }) => (
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

DateAndTags.propTypes = {
  dateString: PropTypes.string.isRequired,
  tag1: PropTypes.string,
  tag2: PropTypes.string,
  tag3: PropTypes.string,
};

DateAndTags.defaultProps = {
  tag1: '',
  tag2: '',
  tag3: '',
};

DateAndTags.displayName = 'ContactLabels';

export default DateAndTags;
