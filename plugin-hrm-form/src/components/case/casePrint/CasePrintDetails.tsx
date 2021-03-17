/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable react/prop-types */
import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';

import { getConfig } from '../../../HrmFormPlugin';
import styles from './styles';
import CasePrintCategories from './CasePrintCategories';

type OwnProps = {
  status: string;
  openedDate: string;
  lastUpdatedDate: string;
  followUpDate: string;
  childIsAtRisk: boolean;
  counselor: string;
  caseManager?: {
    office: string;
    name: string;
    phone: string;
    email: string;
  };
  categories?: {
    [category: string]: {
      [subcategory: string]: boolean;
    };
  };
  version: string;
  chkOnBlob?: string;
  chkOffBlob?: string;
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
  categories,
  version,
  chkOnBlob,
  chkOffBlob,
}) => {
  const { strings } = getConfig();

  return (
    <View style={styles.caseDetailsContainer}>
      <Text style={styles.caseDetailsLabel}>{strings['Case-CaseDetails']}</Text>
      <View style={styles.caseDetailsSection}>
        <View style={styles.flexColumn}>
          <Text>{strings['Case-CaseStatus']}</Text>
          <Text style={styles.caseDetailsBoldText}>{status.toUpperCase()}</Text>
        </View>
        <View style={styles.flexColumn}>
          <Text>{strings['Case-CaseDetailsDateOpened']}</Text>
          <Text style={styles.caseDetailsBoldText}>{openedDate}</Text>
        </View>
        <View style={styles.flexColumn}>
          <Text>{strings['Case-CaseDetailsLastUpdated']}</Text>
          <Text style={styles.caseDetailsBoldText}>{lastUpdatedDate}</Text>
        </View>
        <View style={styles.flexColumn}>
          <Text>{strings['Case-CaseDetailsFollowUpDate']}</Text>
          <Text style={styles.caseDetailsBoldText}>{followUpDate ? followUpDate : '-'}</Text>
        </View>
        <View style={styles.flexColumn}>
          <Text />
          <View style={{ ...styles.flexRow, justifyContent: 'space-between' }}>
            <Image style={styles.imgCheckbox} src={childIsAtRisk ? chkOnBlob : chkOffBlob} />
            <Text> {strings['Case-ChildIsAtRisk']}</Text>
          </View>
        </View>
      </View>
      <View style={styles.caseDetailsSubSection}>
        <View style={styles.caseCounsellorSection}>
          <View style={styles.flexColumn}>
            <Text>{strings['Case-Counsellor']}</Text>
            <Text style={styles.caseDetailsBoldText}>{counselor}</Text>
          </View>
          <View style={{ marginTop: 15, ...styles.flexColumn }}>
            <Text>{strings['Case-CaseManager']}</Text>
            <Text style={styles.caseDetailsBoldText}>{caseManager?.name}</Text>
            <Text style={styles.caseDetailsBoldText}>{caseManager?.phone}</Text>
            <Text style={styles.caseDetailsBoldText}>{caseManager?.email}</Text>
          </View>
        </View>
        <View>
          <CasePrintCategories categories={categories} version={version} />
        </View>
      </View>
    </View>
  );
};

CasePrintDetails.displayName = 'CasePrintDetails';

export default CasePrintDetails;
