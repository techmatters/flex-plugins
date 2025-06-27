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

import { Flex } from '../../styles';
import { TagsWrapper } from '../search/styles';
import CategoryWithTooltip from '../common/CategoryWithTooltip';
import { getContactTags } from '../../utils/categories';
import styles from './casePrint/styles';

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
  const contactCategories = getContactTags(definitionVersion, categories);

  if (printPDF) {
    return (
      <View style={styles['categoryContainer']}>
        {contactCategories.map(category => (
          <View
            key={category.fullyQualifiedName}
            style={{ ...styles['categoryView'], backgroundColor: category.color }}
          >
            <Text style={styles['categoryText']}>• {category.label}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Flex justifyContent="space-between" height="23px" marginTop="10px">
      <TagsWrapper>
        {contactCategories.map(({ fullyQualifiedName, label, color }) => (
          <CategoryWithTooltip
            key={fullyQualifiedName}
            fullyQualifiedName={fullyQualifiedName}
            category={label}
            color={color}
          />
        ))}
      </TagsWrapper>
    </Flex>
  );
};

CaseTags.displayName = 'CaseTags';

export default CaseTags;
