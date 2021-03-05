/* eslint-disable react/prop-types */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';

import { Flex } from '../../../styles/HrmStyles';
import { TagsWrapper } from '../../../styles/search';
import CategoryWithTooltip from '../../common/CategoryWithTooltip';
import { retrieveCategories } from '../../case/ContactDetailsAdapter';
import { getContactTags, renderTag } from '../../../utils/categories';
import styles from '../../case/casePrint/styles';

type OwnProps = {
  categories?: {
    [category: string]: {
      [subcategory: string]: boolean;
    };
  };
  definitionVersion: string;
  printPDF?: boolean;
};

type Props = OwnProps;

// eslint-disable-next-line react/no-multi-comp
const CaseTags: React.FC<Props> = ({ categories, definitionVersion, printPDF }) => {
  const [category1, category2, category3] = getContactTags(definitionVersion, retrieveCategories(categories));

  if (printPDF) {
    return (
      <View style={styles.categoryContainer}>
        {category1 && (
          <View style={styles.categoryView}>
            <Text style={{ ...styles.categoryText, backgroundColor: category1.color }}>• {category1.label}</Text>
          </View>
        )}
        {category2 && (
          <View style={styles.categoryView}>
            <Text style={{ ...styles.categoryText, backgroundColor: category2.color }}>• {category2.label}</Text>
          </View>
        )}
        {category3 && (
          <View style={styles.categoryView}>
            <Text style={{ ...styles.categoryText, backgroundColor: category3.color }}>• {category3.label}</Text>
          </View>
        )}
      </View>
    );
  }

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
