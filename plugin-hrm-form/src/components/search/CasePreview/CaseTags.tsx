/* eslint-disable react/prop-types */
import React from 'react';

import { Flex } from '../../../styles/HrmStyles';
import { TagsWrapper } from '../../../styles/search';
import CategoryWithTooltip from '../../common/CategoryWithTooltip';
import { retrieveCategories } from '../../case/ContactDetailsAdapter';
import { getContactTags, renderTag } from '../../../utils/categories';

type OwnProps = {
  categories?: {
    [category: string]: {
      [subcategory: string]: boolean;
    };
  };
  definitionVersion: string;
};

type Props = OwnProps;

// eslint-disable-next-line react/no-multi-comp
const CaseTags: React.FC<Props> = ({ categories, definitionVersion }) => {
  const [category1, category2, category3] = getContactTags(definitionVersion, retrieveCategories(categories));

  return (
    <Flex justifyContent="space-between" height="23px" marginTop="10px">
      <TagsWrapper>
        {category1 && <CategoryWithTooltip renderTag={renderTag} category={category1.label} color={category1.color} />}
        {category2 && <CategoryWithTooltip renderTag={renderTag} category={category2.label} color={category2.color} />}
        {category3 && <CategoryWithTooltip renderTag={renderTag} category={category3.label} color={category3.color} />}
      </TagsWrapper>
    </Flex>
  );
};

CaseTags.displayName = 'CaseTags';

export default CaseTags;
