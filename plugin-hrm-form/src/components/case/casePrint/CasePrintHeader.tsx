/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/prop-types */
/* eslint-disable dot-notation */
import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';

import styles from './styles';
import { getHrmConfig, getTemplateStrings } from '../../../hrmConfig';
import type { Case } from '../../../types/types';

type OwnProps = {
  id: Case['id'];
  contactIdentifier: string;
  officeName?: string;
  logoBlob?: string;
};

type Props = OwnProps;

const CasePrintHeader: React.FC<Props> = ({ contactIdentifier, id, officeName, logoBlob }) => {
  const strings = getTemplateStrings();
  const { multipleOfficeSupport } = getHrmConfig();

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
