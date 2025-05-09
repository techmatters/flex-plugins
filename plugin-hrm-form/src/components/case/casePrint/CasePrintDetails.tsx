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

/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable react/prop-types */
/* eslint-disable dot-notation */
import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import { DefinitionVersion } from '@tech-matters/hrm-form-definitions';

import styles from './styles';
import CasePrintCategories from './CasePrintCategories';
import { getTemplateStrings } from '../../../hrmConfig';

type OwnProps = {
  status: string;
  openedDate: string;
  lastUpdatedDate: string;
  followUpDate: string;
  childIsAtRisk: boolean;
  counselor: string;
  caseManager?: {
    name: string;
    phone: string;
    email: string;
  };
  categories?: {
    [category: string]: string[];
  };
  chkOnBlob?: string;
  chkOffBlob?: string;
  definitionVersion: DefinitionVersion;
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
  chkOnBlob,
  chkOffBlob,
  definitionVersion,
}) => {
  const strings = getTemplateStrings();

  const { hideCounselorDetails } = definitionVersion.layoutVersion.case;

  return (
    <View style={styles['caseDetailsContainer']}>
      <Text style={styles['caseDetailsLabel']}>{strings['Case-CaseDetails']}</Text>
      <View style={styles['caseDetailsSection']}>
        <View style={styles['flexColumn']}>
          <Text>{strings['Case-CaseStatus']}</Text>
          <Text style={styles['caseDetailsBoldText']}>{status.toUpperCase()}</Text>
        </View>
        <View style={styles['flexColumn']}>
          <Text>{strings['Case-CaseDetailsDateOpened']}</Text>
          <Text style={styles['caseDetailsBoldText']}>{openedDate}</Text>
        </View>
        <View style={styles['flexColumn']}>
          <Text>{strings['Case-CaseDetailsLastUpdated']}</Text>
          <Text style={styles['caseDetailsBoldText']}>{lastUpdatedDate}</Text>
        </View>
        <View style={styles['flexColumn']}>
          <Text>{strings['Case-CaseDetailsFollowUpDate']}</Text>
          <Text style={styles['caseDetailsBoldText']}>{followUpDate ? followUpDate : '-'}</Text>
        </View>
        <View style={styles['flexColumn']}>
          <Text />
          <View style={{ ...styles['flexRow'], justifyContent: 'space-between' }}>
            <Image style={styles['imgCheckbox']} src={childIsAtRisk ? chkOnBlob : chkOffBlob} />
            <Text> {strings['Case-ChildIsAtRisk']}</Text>
          </View>
        </View>
      </View>
      {hideCounselorDetails ? null : (
        <View style={styles['caseDetailsSubSection']}>
          <View style={styles['caseCounsellorSection']}>
            <View style={styles['flexColumn']}>
              <Text>{strings['Case-Counsellor']}</Text>
              <Text style={styles['caseDetailsBoldText']}>{counselor}</Text>
            </View>
            <View style={{ marginTop: 15, ...styles['flexColumn'] }}>
              <Text>{strings['Case-CaseManager']}</Text>
              <Text style={styles['caseDetailsBoldText']}>{caseManager?.name}</Text>
              <Text style={styles['caseDetailsBoldText']}>{caseManager?.phone}</Text>
              <Text style={styles['caseDetailsBoldText']}>{caseManager?.email}</Text>
            </View>
          </View>
          <View>
            <CasePrintCategories categories={categories} definitionVersion={definitionVersion} />
          </View>
        </View>
      )}
    </View>
  );
};

CasePrintDetails.displayName = 'CasePrintDetails';

export default CasePrintDetails;
