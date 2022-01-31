/* eslint-disable react/prop-types */
/* eslint-disable react/require-default-props */
import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';

import { getConfig } from '../../../HrmFormPlugin';
import styles from './styles';

type OwnProps = {
  id: number;
  firstName: string;
  lastName: string;
  officeName?: string;
  logoBlob?: string;
};

type Props = OwnProps;

const CasePrintHeader: React.FC<Props> = ({ firstName, lastName, id, officeName, logoBlob }) => {
  const { strings, multipleOfficeSupport } = getConfig();

  return (
    <View fixed>
      <View style={styles.headerContainer}>
        <View style={styles.flexColumn}>
          <Text style={styles.childName}>{`${firstName} ${lastName}`}</Text>
          <View style={styles.flexRow}>
            <Text style={styles.caseId}>{`${strings['Case-CaseNumber']}: ${id}`}</Text>
            {multipleOfficeSupport && officeName && <Text style={styles.officeName}>({officeName})</Text>}
          </View>
        </View>
        {logoBlob && <Image src={logoBlob} />}
      </View>
    </View>
  );
};

CasePrintHeader.displayName = 'CasePrintHeader';

export default CasePrintHeader;
