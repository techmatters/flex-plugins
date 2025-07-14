/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { DefinitionVersion } from 'hrm-form-definitions';

import { Flex, ChipText } from '../../styles';
import { SilentText, SubtitleLabel, SummaryText, TagsWrapper } from './styles';
import CategoryWithTooltip from '../common/CategoryWithTooltip';
import { getContactTags } from '../../utils/categories';
import ExpandableTextBlock from './ExpandableTextBlock';

type DataCallProps = {
  counselor: string;
  categories: { [category: string]: string[] };
  definitionVersion: DefinitionVersion;
};

type NonDataCallProps = {
  counselor: string;
  nonDataCallType: string;
  definitionVersion: DefinitionVersion;
};

type Props = DataCallProps | NonDataCallProps;

const isDataCallProps = (props: Props): props is DataCallProps => Boolean((props as DataCallProps).categories);

// eslint-disable-next-line react/no-multi-comp
const TagsAndCounselor: React.FC<Props> = props => {
  const { counselor, definitionVersion } = props;
  const leftTags = () => {
    if (isDataCallProps(props)) {
      const categories = getContactTags(definitionVersion, props.categories);
      return (
        <ExpandableTextBlock
          collapseLinkText="ReadLess"
          expandLinkText="ReadMore"
          style={{ maxWidth: '500px', textOverflow: 'clip' }}
        >
          {categories.map(({ label, color, fullyQualifiedName }) => (
            <CategoryWithTooltip
              key={fullyQualifiedName}
              fullyQualifiedName={fullyQualifiedName}
              category={label}
              color={color}
            />
          ))}
        </ExpandableTextBlock>
      );
    }

    return (
      <TagsWrapper>
        {props.nonDataCallType && (
          <SilentText>
            <ChipText>{props.nonDataCallType}</ChipText>
          </SilentText>
        )}
      </TagsWrapper>
    );
  };

  return (
    <Flex
      style={{
        justifyContent: 'space-between',
        minHeight: '30px',
        marginTop: '10px',
        padding: '0 20px 0px 20px',
        display: 'flex', // Not sure why but display is set to 'block' without this
        maxWidth: '',
      }}
    >
      {leftTags()}
      <Flex style={{ minWidth: 'fit-content', marginTop: '2px' }}>
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
