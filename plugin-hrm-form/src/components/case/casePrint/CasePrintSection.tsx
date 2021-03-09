/* eslint-disable react/prop-types */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';

import styles from './styles';
import { FormDefinition } from '../../common/forms/types';
import { unNestInformation } from '../../../services/ContactService';
import { formatCheckboxValue, formatInputValue } from '../../../utils';

type OwnProps = {
  sectionName: string;
  values: any;
  definitions: FormDefinition;
  unNestInfo?: boolean;
};

type Props = OwnProps;

const CasePrintSection: React.FC<Props> = ({ sectionName, values, definitions, unNestInfo }) => {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.whiteText}>{sectionName}</Text>
      </View>
      <View style={styles.sectionBody}>
        {definitions.map((def, i) => {
          return (
            <View key={i} style={i % 2 === 0 ? styles.sectionItemRowOdd : styles.sectionItemRowEven}>
              <Text style={styles.sectionItemFirstColumn}>{def.label}</Text>
              <Text style={styles.sectionItemSecondColumn}>
                {def.type === 'checkbox'
                  ? formatCheckboxValue(values[def.name])
                  : formatInputValue(unNestInfo ? unNestInformation(def, values) : values[def.name])}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

CasePrintSection.displayName = 'CasePrintSection';

export default CasePrintSection;
