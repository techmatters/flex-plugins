/* eslint-disable react/prop-types */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { DefinitionVersionId } from 'hrm-form-definitions';

import { getConfig } from '../../../HrmFormPlugin';
import styles from './styles';
import CaseTags from '../CaseTags';

type OwnProps = {
  categories?: {
    [category: string]: {
      [subcategory: string]: boolean;
    };
  };
  version: DefinitionVersionId;
};

type Props = OwnProps;

const CasePrintCategories: React.FC<Props> = ({ categories, version }) => {
  const { strings } = getConfig();

  return (
    <View style={styles.flexColumn}>
      <Text style={{ marginBottom: '10px' }}>{strings['TabbedForms-CategoriesTab']}</Text>
      <CaseTags printPDF={true} categories={categories} definitionVersion={version} />
    </View>
  );
};

CasePrintCategories.displayName = 'CasePrintCategories';

export default CasePrintCategories;
