/* eslint-disable react/prop-types */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';

import styles from './styles';

type SectionField = {
  label: string;
  value?: string;
};

type OwnProps = {
  sectionName: string;
  fieldValues: SectionField[];
};

type Props = OwnProps;

const CasePrintSection: React.FC<Props> = ({ sectionName, fieldValues }) => {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.whiteText}>{sectionName}</Text>
      </View>
      <View style={styles.sectionBody}>
        {fieldValues.map((field, i) => {
          return (
            <View key={i} style={i % 2 === 0 ? styles.sectionItemRowOdd : styles.sectionItemRowEven}>
              <Text style={styles.sectionItemFirstColumn}>{field.label}</Text>
              <Text style={styles.sectionItemSecondColumn}>{field.value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

CasePrintSection.displayName = 'CasePrintSection';

export default CasePrintSection;
