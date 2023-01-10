/* eslint-disable react/prop-types */
/* eslint-disable dot-notation */
import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';

import { getConfig } from '../../../HrmFormPlugin';
import styles from './styles';

type OwnProps = {
  id: number;
  contactIdentifier: string;
  officeName?: string;
  logoBlob?: string;
};

type Props = OwnProps;

const CasePrintHeader: React.FC<Props> = ({ contactIdentifier, id, officeName, logoBlob }) => {
  const { strings, multipleOfficeSupport } = getConfig();

  return (
    <View fixed>
      <View style={styles['headerContainer']}>
        <View style={styles.flexColumn}>
          <Text style={styles['childName']}>{contactIdentifier}</Text>
          <View style={styles.flexRow}>
            <Text style={styles['caseId']}>{`${strings['Case-CaseNumber']}: ${id}`}</Text>
            {multipleOfficeSupport && officeName && <Text style={styles['officeName']}>({officeName})</Text>}
          </View>
        </View>
        {logoBlob && <Image style={styles['logo']} src={logoBlob} />}
      </View>
    </View>
  );
};

CasePrintHeader.displayName = 'CasePrintHeader';

export default CasePrintHeader;
