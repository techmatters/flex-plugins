import React from 'react';
import PropTypes from 'prop-types';

import { Row, Box } from '../../../styles/HrmStyles';
import { ContactTag, DateText, TagText } from '../../../styles/search';

const DateAndTags = ({ dateString, tag1, tag2, tag3 }) => (
  <Box marginBottom="2px">
    <Row style={{ height: '23px' }}>
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
    </Row>
  </Box>
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
