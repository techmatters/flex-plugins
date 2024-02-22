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
import { Text, View } from '@react-pdf/renderer';
import { FormDefinition } from 'hrm-form-definitions';

import styles from './styles';
import { presentValueFromStrings } from './presentValuesFromStrings';
import { getTemplateStrings } from '../../../hrmConfig';

type OwnProps = {
  sectionName: string;
  values: Record<string, string | boolean>;
  definitions: FormDefinition;
};

type Props = OwnProps;

const CasePrintSection: React.FC<Props> = ({ sectionName, values, definitions }) => {
  const strings = getTemplateStrings();

  return (
    <View>
      <View style={styles['sectionHeader']}>
        <Text style={styles['whiteText']}>{sectionName}</Text>
      </View>
      <View style={styles['sectionBody']}>
        {definitions.map((def, i) => {
          return (
            <View key={i} style={i % 2 === 0 ? styles['sectionItemRowOdd'] : styles['sectionItemRowEven']}>
              <View style={styles['sectionItemFirstColumn']}>
                <Text style={{ marginRight: '10px' }}>{def.label}</Text>
              </View>
              <View style={styles['sectionItemSecondColumn']}>
                <Text>{presentValueFromStrings(strings)(values[def.name])(def)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

CasePrintSection.displayName = 'CasePrintSection';

export default CasePrintSection;
