/* eslint-disable react/prop-types */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { FormDefinition } from 'hrm-form-definitions';

import styles from './styles';
import { unNestInformation } from '../../../services/ContactService';
import { presentValue } from '../../../utils';
import { getConfig } from '../../../HrmFormPlugin';

type OwnProps = {
  sectionName: string;
  values: any;
  definitions: FormDefinition;
  unNestInfo?: boolean;
};

type Props = OwnProps;

const CasePrintSection: React.FC<Props> = ({ sectionName, values, definitions, unNestInfo }) => {
  const { strings } = getConfig();
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.whiteText}>{sectionName}</Text>
      </View>
      <View style={styles.sectionBody}>
        {definitions.map((def, i) => {
          return (
            <View key={i} style={i % 2 === 0 ? styles.sectionItemRowOdd : styles.sectionItemRowEven}>
              <View style={styles.sectionItemFirstColumn}>
                <Text style={{ marginRight: '10px' }}>{def.label}</Text>
              </View>
              <View style={styles.sectionItemSecondColumn}>
                <Text>
                  {presentValue(unNestInfo ? unNestInformation(def, values) : values[def.name], strings)(def)}
                </Text>
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
