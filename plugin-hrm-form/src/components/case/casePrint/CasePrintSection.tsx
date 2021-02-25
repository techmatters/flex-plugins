import React from 'react';
import PropTypes from 'prop-types';
import { Text, View } from '@react-pdf/renderer';

import styles from './CasePrintStyles';

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

CasePrintSection.propTypes = {
  sectionName: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  fieldValues: PropTypes.array.isRequired, // ToDo: put a better typing here
};

export default CasePrintSection;
