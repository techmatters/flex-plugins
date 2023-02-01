/* eslint-disable react/prop-types */
/* eslint-disable dot-notation */
import React from 'react';
let View, Text;

import('@react-pdf/renderer').then((pdf) => {
  View = pdf.View;
  Text = pdf.Text;
});
import { FormDefinition } from 'hrm-form-definitions';

import styles from './styles';
import { getConfig } from '../../../HrmFormPlugin';
import { presentValueFromStrings } from './presentValuesFromStrings';

type OwnProps = {
  sectionName: string;
  values: any;
  definitions: FormDefinition;
};

type Props = OwnProps;

const CasePrintSection: React.FC<Props> = ({ sectionName, values, definitions }) => {
  const { strings } = getConfig();

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
