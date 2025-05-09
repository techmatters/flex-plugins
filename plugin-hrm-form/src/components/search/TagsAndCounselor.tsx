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
import { DefinitionVersion } from '@tech-matters/hrm-form-definitions';

import { Flex, ChipText } from '../../styles';
import { SilentText, SubtitleLabel, SummaryText, TagsWrapper } from './styles';
import CategoryWithTooltip from '../common/CategoryWithTooltip';
import { getContactTags } from '../../utils/categories';

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
        height: '23px',
        marginTop: '10px',
        padding: '0 20px 0px 20px',
        display: 'flex', // Not sure why but display is set to 'block' without this
      }}
    >
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
