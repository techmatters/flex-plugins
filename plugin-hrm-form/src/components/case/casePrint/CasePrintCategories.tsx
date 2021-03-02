/* eslint-disable react/prop-types */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';

import { getConfig } from '../../../HrmFormPlugin';
import styles from './styles';

type OwnProps = {};

type Props = OwnProps;

const CasePrintCategories: React.FC<Props> = props => {
  const { strings } = getConfig();

  return (
    <View style={styles.categoriesContainer}>
      <Text>Categories</Text>
    </View>
  );
};

CasePrintCategories.displayName = 'CasePrintCategories';

export default CasePrintCategories;
