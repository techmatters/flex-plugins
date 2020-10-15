import React from 'react';
import PropTypes from 'prop-types';

import { Row, Box } from '../../../styles/HrmStyles';
import { ContactTag, DateText, TagText } from '../../../styles/search';
import CategoryWithTooltip from '../../common/CategoryWithTooltip';

// eslint-disable-next-line react/display-name
const renderTag = tag => (
  <ContactTag>
    <TagText>{tag}</TagText>
  </ContactTag>
);

// eslint-disable-next-line react/no-multi-comp
const DateAndTags = ({ dateString, category1, category2, category3 }) => (
  <Box marginBottom="2px">
    <Row style={{ height: '23px' }}>
      <DateText>{dateString}</DateText>
      <Row style={{ marginLeft: 'auto' }}>
        {category1 && <CategoryWithTooltip renderTag={renderTag} category={category1} />}
        {category2 && <CategoryWithTooltip renderTag={renderTag} category={category2} />}
        {category3 && <CategoryWithTooltip renderTag={renderTag} category={category3} />}
      </Row>
    </Row>
  </Box>
);

DateAndTags.propTypes = {
  dateString: PropTypes.string.isRequired,
  category1: PropTypes.string,
  category2: PropTypes.string,
  category3: PropTypes.string,
};

DateAndTags.defaultProps = {
  category1: '',
  category2: '',
  category3: '',
};

DateAndTags.displayName = 'ContactLabels';

export default DateAndTags;
