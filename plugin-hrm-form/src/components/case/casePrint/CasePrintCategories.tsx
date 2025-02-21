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
import { Text, View } from '@react-pdf/renderer';
import { DefinitionVersion } from 'hrm-form-definitions';

import styles from './styles';
import CaseTags from '../CaseTags';
import { getTemplateStrings } from '../../../hrmConfig';

type OwnProps = {
  categories?: {
    [category: string]: string[];
  };
  definitionVersion: DefinitionVersion;
};

type Props = OwnProps;

const CasePrintCategories: React.FC<Props> = ({ categories, definitionVersion }) => {
  const strings = getTemplateStrings();

  return (
    <View style={styles.flexColumn}>
      <Text style={{ marginBottom: '10px' }}>{strings['TabbedForms-CategoriesTab']}</Text>
      <CaseTags printPDF={true} categories={categories} definitionVersion={definitionVersion} />
    </View>
  );
};

CasePrintCategories.displayName = 'CasePrintCategories';

export default CasePrintCategories;
