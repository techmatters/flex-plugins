import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';

import { Flex } from '../../../styles/HrmStyles';
import { ContactTag, CounselorText, TagText, TagMiddleDot, SummaryText, TagsWrapper } from '../../../styles/search';
import CategoryWithTooltip from '../../common/CategoryWithTooltip';
import { getContactTags } from '../../../utils/categories';

// eslint-disable-next-line react/display-name
const renderTag = (tag, color) => (
  <ContactTag color={color}>
    <TagMiddleDot color={color} />
    <TagText color={color}>{tag}</TagText>
  </ContactTag>
);

// eslint-disable-next-line react/no-multi-comp
const TagsAndCounselor = ({ counselor, categories }) => {
  const [category1, category2, category3] = getContactTags(categories);

  return (
    <Flex justifyContent="space-between" height="23px" marginTop="10px">
      <TagsWrapper>
        {category1 && <CategoryWithTooltip renderTag={renderTag} category={category1.label} color={category1.color} />}
        {category2 && <CategoryWithTooltip renderTag={renderTag} category={category2.label} color={category2.color} />}
        {category3 && <CategoryWithTooltip renderTag={renderTag} category={category3.label} color={category3.color} />}
      </TagsWrapper>
      <Flex style={{ minWidth: 'fit-content' }}>
        <CounselorText style={{ marginRight: 5 }}>
          <Template code="CallTypeAndCounselor-Label" />
        </CounselorText>
        <SummaryText>{counselor}</SummaryText>
      </Flex>
    </Flex>
  );
};

TagsAndCounselor.propTypes = {
  counselor: PropTypes.string.isRequired,
  categories: PropTypes.any.isRequired,
};

TagsAndCounselor.displayName = 'TagsAndCounselor';

export default TagsAndCounselor;
