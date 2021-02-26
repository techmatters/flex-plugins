/* eslint-disable react/prop-types */
import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';

import styles from './CasePrintStyles';

type OwnProps = {
  id: number;
  firstName: string;
  lastName: string;
  officeName?: string;
  logoSource?: string;
};

type Props = OwnProps;

const CasePrintHeader: React.FC<Props> = ({ firstName, lastName, id, officeName, logoSource }) => {
  return (
    <View fixed>
      <View style={styles.caseHeader}>
        <View style={styles.flexColumn}>
          <Text style={styles.childName}>{`${firstName} ${lastName}`}</Text>
          <View style={styles.flexRow}>
            <Text style={styles.caseId}>Case#: {id}</Text>
            {officeName && <Text style={styles.officeName}>({officeName})</Text>}
          </View>
        </View>
        {logoSource && <Image src={logoSource} />}
      </View>
    </View>
  );
};

CasePrintHeader.displayName = 'CasePrintHeader';

export default CasePrintHeader;
