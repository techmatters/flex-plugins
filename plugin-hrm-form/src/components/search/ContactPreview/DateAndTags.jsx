import React from 'react';
import PropTypes from 'prop-types';

import { Row, Box } from '../../../styles/HrmStyles';
import { ContactTag, DateText, TagText } from '../../../styles/search';
import CategoryWithTooltip from '../../common/CategoryWithTooltip';
import { getContactTags } from '../../../utils/categories';

// eslint-disable-next-line react/display-name
const renderTag = tag => (
  <ContactTag>
    <TagText>{tag}</TagText>
  </ContactTag>
);

// eslint-disable-next-line react/no-multi-comp
const DateAndTags = ({ dateString, categories }) => {
  const [category1, category2, category3] = getContactTags(categories);

  return (
    <Box marginBottom="2px">
      <Row style={{ height: '23px' }}>
        <DateText>{dateString}</DateText>
        <Row style={{ marginLeft: 'auto' }}>
          {category1 && (
            <CategoryWithTooltip renderTag={renderTag} category={category1.label} color={category1.color} />
          )}
          {category2 && (
            <CategoryWithTooltip renderTag={renderTag} category={category2.label} color={category2.color} />
          )}
          {category3 && (
            <CategoryWithTooltip renderTag={renderTag} category={category3.label} color={category3.color} />
          )}
        </Row>
      </Row>
    </Box>
  );
};

DateAndTags.propTypes = {
  dateString: PropTypes.string.isRequired,
  categories: PropTypes.any.isRequired,
};

DateAndTags.displayName = 'ContactLabels';

export default DateAndTags;
