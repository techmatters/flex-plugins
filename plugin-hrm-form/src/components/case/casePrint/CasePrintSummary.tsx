import React from 'react';
import PropTypes from 'prop-types';
import { Text, View } from '@react-pdf/renderer';

import { getConfig } from '../../../HrmFormPlugin';
import styles from './styles';

type OwnProps = {
  summary: string;
};

type Props = OwnProps;

const CasePrintSummary: React.FC<Props> = ({ summary }) => {
  const { strings } = getConfig();

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.whiteText}>{strings['Case-CaseSummarySection']}</Text>
      </View>
      <View style={styles.sectionBody}>
        <Text style={styles.caseSummaryText}>{summary}</Text>
      </View>
    </View>
  );
};

CasePrintSummary.displayName = 'CasePrintSummary';

CasePrintSummary.propTypes = {
  summary: PropTypes.string.isRequired,
};

export default CasePrintSummary;
