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

import React from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';

import { CSAMReportEntry } from '../../types/types';
import type { ResourceReferral } from '../../states/contacts/resourceReferral';
import { Box, Row } from '../../styles';
import { SectionValueText } from '../search/styles';

export const formatResourceReferral = (referral: ResourceReferral) => (
  <Box marginBottom="5px">
    <SectionValueText>
      {referral.resourceName}
      <br />
      <Row>ID #{referral.resourceId}</Row>
    </SectionValueText>
  </Box>
);

export const formatCsamReport = (report: CSAMReportEntry) => {
  const template =
    report.reportType === 'counsellor-generated' ? (
      <Template code="CSAMReportForm-Counsellor-Attachment" />
    ) : (
      <Template code="CSAMReportForm-Self-Attachment" />
    );

  const date = `${format(new Date(report.createdAt), 'yyyy MM dd h:mm aaaaa')}m`;

  return (
    <Box marginBottom="5px">
      <SectionValueText>
        {template}
        <br />
        {date}
        <br />
        {`#${report.csamReportId}`}
      </SectionValueText>
    </Box>
  );
};
