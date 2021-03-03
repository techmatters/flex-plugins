/* eslint-disable react/prop-types */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';

import { getConfig } from '../../../HrmFormPlugin';
import styles from './styles';
import CaseTags from '../../search/CasePreview/CaseTags';

type OwnProps = {
  categories: any; // ToDO: improve this
  definitionVersion: string;
};

type Props = OwnProps;

const CasePrintCategories: React.FC<Props> = ({ categories, definitionVersion }) => {
  const { strings } = getConfig();

  console.log({ categories });
  return (
    <View style={styles.flexColumn}>
      <Text style={{ marginBottom: '10px' }}>{strings['TabbedForms-CategoriesTab']}</Text>
      <CaseTags printPDF={true} categories={categories} definitionVersion={definitionVersion} />
    </View>
  );
};

CasePrintCategories.displayName = 'CasePrintCategories';

export default CasePrintCategories;
