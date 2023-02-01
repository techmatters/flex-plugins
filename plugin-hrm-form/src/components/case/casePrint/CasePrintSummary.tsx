/* eslint-disable dot-notation */
/* eslint-disable react/prop-types */
/* eslint-disable dot-notation */
import React from 'react';
let View, Text;

import('@react-pdf/renderer').then((pdf) => {
  View = pdf.View;
  Text = pdf.Text;
});

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
