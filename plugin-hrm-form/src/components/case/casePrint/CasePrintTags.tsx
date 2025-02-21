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
/* eslint-disable dot-notation */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { DefinitionVersion } from 'hrm-form-definitions';

import { Flex } from '../../../styles';
import { TagsWrapper } from '../../search/styles';
import CategoryWithTooltip from '../../common/CategoryWithTooltip';
import { getContactTags } from '../../../utils/categories';
import styles from './styles';

type OwnProps = {
  categories?: {
    [category: string]: string[];
  };
  definitionVersion: DefinitionVersion;
  printPDF?: boolean;
};

type Props = OwnProps;

// eslint-disable-next-line react/no-multi-comp
const CaseTags: React.FC<Props> = ({ categories, definitionVersion, printPDF }) => {
  const [category1, category2, category3] = getContactTags(definitionVersion, categories);

  if (printPDF) {
    return (
      <View style={styles['categoryContainer']}>
        {category1 && (
          <View style={{ ...styles['categoryView'], backgroundColor: category1.color }}>
            <Text style={styles['categoryText']}>• {category1.label}</Text>
          </View>
        )}
        {category2 && (
          <View style={{ ...styles['categoryView'], backgroundColor: category2.color }}>
            <Text style={styles['categoryText']}>• {category2.label}</Text>
          </View>
        )}
        {category3 && (
          <View style={{ ...styles['categoryView'], backgroundColor: category3.color }}>
            <Text style={styles['categoryText']}>• {category3.label}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <Flex justifyContent="space-between" height="23px" marginTop="10px">
      <TagsWrapper>
        {category1 && <CategoryWithTooltip category={category1.label} color={category1.color} />}
        {category2 && <CategoryWithTooltip category={category2.label} color={category2.color} />}
        {category3 && <CategoryWithTooltip category={category3.label} color={category3.color} />}
      </TagsWrapper>
    </Flex>
  );
};

CaseTags.displayName = 'CaseTags';

export default CaseTags;
