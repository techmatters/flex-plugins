/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { DefinitionVersionId } from 'hrm-form-definitions';

import { Flex } from '../../styles/HrmStyles';
import { TagText, SummaryText, TagsWrapper, SilentText, SubtitleLabel } from '../../styles/search';
import CategoryWithTooltip from '../common/CategoryWithTooltip';
import { getContactTags } from '../../utils/categories';

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
          {category1 && <CategoryWithTooltip category={category1.label} color={category1.color} />}
          {category2 && <CategoryWithTooltip category={category2.label} color={category2.color} />}
          {category3 && <CategoryWithTooltip category={category3.label} color={category3.color} />}
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
        <SubtitleLabel>
          <Template code="CallSummary-Counselor" />
        </SubtitleLabel>
        <SummaryText>{counselor}</SummaryText>
      </Flex>
    </Flex>
  );
};

TagsAndCounselor.displayName = 'TagsAndCounselor';

export default TagsAndCounselor;
