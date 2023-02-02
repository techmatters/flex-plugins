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

/* eslint-disable dot-notation */
/* eslint-disable react/prop-types */
/* eslint-disable dot-notation */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';

import { getConfig } from '../../../HrmFormPlugin';
import styles from './styles';

type OwnProps = {
  summary?: string;
};

type Props = OwnProps;

const CasePrintSummary: React.FC<Props> = ({ summary }) => {
  const { strings } = getConfig();

  return (
    <View>
      <View style={styles['sectionHeader']}>
        <Text style={styles['whiteText']}>{strings['Case-CaseSummarySection']}</Text>
      </View>
      <View style={styles['sectionBody']}>
        <Text style={styles['caseSummaryText']}>{summary ? summary : strings['NoCaseSummary']}</Text>
      </View>
    </View>
  );
};

CasePrintSummary.displayName = 'CasePrintSummary';

export default CasePrintSummary;
