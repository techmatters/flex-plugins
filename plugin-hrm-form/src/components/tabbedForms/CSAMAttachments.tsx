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
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { Box, Column, Row } from '../../styles';
import { CSAMAttachmentIcon, CSAMAttachmentText } from '../CSAMReport/styles';
import { formatStringToDateAndTime } from '../../utils/formatters';
import type { CSAMReportEntry } from '../../types/types';

type Props = {
  csamReports: CSAMReportEntry[];
};

const CSAMAttachments: React.FC<Props> = ({ csamReports }) => {
  return (
    <Box marginTop="10px">
      <Column>
        {csamReports?.map(r => {
          const formattedCreatedAt = formatStringToDateAndTime(r.createdAt);

          return (
            <Row key={r.csamReportId}>
              <Box marginRight="5px" marginTop="5px" style={{ alignSelf: 'flex-start' }}>
                <CSAMAttachmentIcon />
                {/* <AttachFile fontSize="13px" opacity="0.6" /> */}
              </Box>
              <CSAMAttachmentText>
                {r.reportType === 'counsellor-generated' ? (
                  <Template code="CSAMReportForm-Counsellor-Attachment" />
                ) : (
                  <Template code="CSAMReportForm-Self-Attachment" />
                )}
                <br />
                {formattedCreatedAt}
                <br />
                {`#${r.csamReportId}`}
              </CSAMAttachmentText>
            </Row>
          );
        })}
      </Column>
    </Box>
  );
};

CSAMAttachments.displayName = 'CSAMAttachments';

export default CSAMAttachments;
