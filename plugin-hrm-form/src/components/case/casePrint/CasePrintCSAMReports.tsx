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

/* eslint-disable dot-notation */
/* eslint-disable react/prop-types */
/* eslint-disable dot-notation */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

import styles from './styles';
import { getTemplateStrings } from '../../../hrmConfig';

type OwnProps = {
  csamReports?: Array<any>;
};

type Props = OwnProps;

const CasePrintCSAMReports: React.FC<Props> = ({ csamReports }) => {
  const strings = getTemplateStrings();

  return (
    <View>
      <View style={styles['sectionHeader']}>
        <Text style={styles['whiteText']}>{strings['TabbedForms-ExternalReports']}</Text>
      </View>
      {csamReports.map((csamReport, index) => {
        const template =
          csamReport.reportType === 'counsellor-generated' ? (
            <Text>{strings['CSAMReportForm-Counsellor-Attachment']}</Text>
          ) : (
            <Text>{strings['CSAMReportForm-Self-Attachment']}</Text>
          );

        const date = `${format(new Date(csamReport.createdAt), 'yyyy-MM dd h:mm aaaaa')}m`;
        return (
          <View style={styles['sectionBody']} key={index}>
            <Text style={styles['csamReportText']}>{template}</Text>
            <Text style={styles['csamReportText']}>{date}</Text>
            <Text style={styles['csamReportText']}>{`#${csamReport.csamReportId}`}</Text>
          </View>
        );
      })}
    </View>
  );
};

CasePrintCSAMReports.displayName = 'CasePrintCSAMReports';

export default CasePrintCSAMReports;
