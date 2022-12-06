/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { DefinitionVersionId } from 'hrm-form-definitions';

import { Flex } from '../../../styles/HrmStyles';
import {
  ContactTag,
  CounselorText,
  TagText,
  TagMiddleDot,
  SummaryText,
  TagsWrapper,
  SilentText,
} from '../../../styles/search';
import CategoryWithTooltip from '../../common/CategoryWithTooltip';
import { getContactTags } from '../../../utils/categories';

// eslint-disable-next-line react/display-name
const renderTag = (tag, color) => (
  <ContactTag color={color}>
    <TagMiddleDot color={color} />
    <TagText color={color}>{tag}</TagText>
  </ContactTag>
);

type DataCallProps = {
  counselor: string;
  categories: { [category: string]: string[] };
  definitionVersion: DefinitionVersionId;
};

type NonDataCallProps = {
  counselor: string;
  nonDataCallType: string;
  definitionVersion: DefinitionVersionId;
};

type Props = DataCallProps | NonDataCallProps;

const isDataCallProps = (props: Props): props is DataCallProps => Boolean((props as DataCallProps).categories);

// eslint-disable-next-line react/no-multi-comp
const TagsAndCounselor: React.FC<Props> = props => {
  const { counselor, definitionVersion } = props;
  const leftTags = () => {
    if (isDataCallProps(props)) {
      const [category1, category2, category3] = getContactTags(definitionVersion, props.categories);
      return (
        <TagsWrapper>
          {category1 && (
            <CategoryWithTooltip renderTag={renderTag} category={category1.label} color={category1.color} />
          )}
          {category2 && (
            <CategoryWithTooltip renderTag={renderTag} category={category2.label} color={category2.color} />
          )}
          {category3 && (
            <CategoryWithTooltip renderTag={renderTag} category={category3.label} color={category3.color} />
          )}
        </TagsWrapper>
      );
    }

    return (
      <TagsWrapper>
        <SilentText>
          <TagText>{props.nonDataCallType}</TagText>
        </SilentText>
      </TagsWrapper>
    );
  };

  return (
    <Flex justifyContent="space-between" height="23px" marginTop="10px">
      {leftTags()}
      <Flex style={{ minWidth: 'fit-content' }}>
        <CounselorText style={{ marginRight: 5 }}>
          <Template code="SearchResultsIndex-Counselor" />
        </CounselorText>
        <SummaryText>{counselor}</SummaryText>
      </Flex>
    </Flex>
  );
};

TagsAndCounselor.displayName = 'TagsAndCounselor';

export default TagsAndCounselor;
