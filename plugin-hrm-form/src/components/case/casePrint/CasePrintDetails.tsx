/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable react/prop-types */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';

import styles from './CasePrintStyles';

type OwnProps = {
  status: string;
  openedAt: string;
  childAtRisk: boolean;
  counselor: string;
  caseManager: {
    name: string;
    phone: string;
    email: string;
  };
};

type Props = OwnProps;

const CasePrintDetails: React.FC<Props> = ({ status, openedAt, childAtRisk, counselor, caseManager }) => {
  return (
    <View style={styles.caseDetailsContainer}>
      <Text style={styles.caseDetailsLabel}>Case Details</Text>
      <View style={styles.caseDetailsSection}>
        <View style={styles.flexColumn}>
          <Text>Case Status</Text>
          <Text style={styles.caseDetailsBoldText}>{status.toUpperCase()}</Text>
        </View>
        <View style={styles.flexColumn}>
          <Text>Opened</Text>
          <Text style={styles.caseDetailsBoldText}>{openedAt}</Text>
        </View>
        <View>{childAtRisk ? <Text>✔️ CHILD IS AT RISK</Text> : <Text>❌ CHILD IS AT RISK</Text>}</View>
      </View>
      <View style={styles.caseCounsellorSection}>
        <View style={styles.flexColumn}>
          <Text>Counsellor</Text>
          <Text style={styles.caseDetailsBoldText}>{counselor}</Text>
        </View>
        <View style={{ marginTop: 15, ...styles.flexColumn }}>
          <Text>Case Manager</Text>
          <Text style={styles.caseDetailsBoldText}>{caseManager.name}</Text>
          <Text style={styles.caseDetailsBoldText}>{caseManager.phone}</Text>
          <Text style={styles.caseDetailsBoldText}>{caseManager.email}</Text>
        </View>
      </View>
    </View>
  );
};

CasePrintDetails.displayName = 'CasePrintDetails';

export default CasePrintDetails;
