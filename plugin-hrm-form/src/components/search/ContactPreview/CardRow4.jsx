import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '../../../Styles/HrmStyles';
import { StyledRow, ContactTag, LightFont, TagFont } from '../../../Styles/search';

const CardRow4 = ({ dateString, tag1, tag2, tag3 }) => (
  <StyledRow>
    <LightFont>{dateString}</LightFont>
    <Row style={{ marginLeft: 'auto' }}>
      {tag1 && (
        <ContactTag>
          <TagFont>{tag1}</TagFont>
        </ContactTag>
      )}
      {tag2 && (
        <ContactTag>
          <TagFont>{tag2}</TagFont>
        </ContactTag>
      )}
      {tag3 && (
        <ContactTag>
          <TagFont>{tag3}</TagFont>
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
