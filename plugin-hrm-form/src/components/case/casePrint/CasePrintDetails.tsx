/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable react/prop-types */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';

import styles from './CasePrintStyles';

type OwnProps = {
  status: string;
  openedDate: string;
  lastUpdatedDate: string;
  followUpDate: string;
  childIsAtRisk: boolean;
  counselor: string;
  caseManager: {
    name: string;
    phone: string;
    email: string;
  };
};

type Props = OwnProps;

const CasePrintDetails: React.FC<Props> = ({
  status,
  openedDate,
  lastUpdatedDate,
  followUpDate,
  childIsAtRisk,
  counselor,
  caseManager,
}) => {
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
          <Text style={styles.caseDetailsBoldText}>{openedDate}</Text>
        </View>
        <View style={styles.flexColumn}>
          <Text>Last Updated/Closed</Text>
          <Text style={styles.caseDetailsBoldText}>{lastUpdatedDate}</Text>
        </View>
        <View style={styles.flexColumn}>
          <Text>Follow Up Date</Text>
          <Text style={styles.caseDetailsBoldText}>{followUpDate ? followUpDate : '-'}</Text>
        </View>
        <View style={styles.flexColumn}>
          <Text />
          <View style={{ ...styles.flexRow, justifyContent: 'space-between' }}>
            {childIsAtRisk ? <Text>☑️</Text> : <Text>⏹️</Text>}
            <Text> Child is at risk</Text>
          </View>
        </View>
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
