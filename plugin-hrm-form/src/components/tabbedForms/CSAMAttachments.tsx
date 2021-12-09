/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { format } from 'date-fns';

import { Box, Column, Row } from '../../styles/HrmStyles';
import { CSAMAttachmentText, CSAMAttachmentIcon } from '../../styles/CSAMReport';
import type { CSAMReportEntry } from '../../types/types';

type Props = {
  csamReports: CSAMReportEntry[];
};

const CSAMAttachments: React.FC<Props> = ({ csamReports }) => {
  return (
    <Box marginTop="10px">
      <Column>
        {csamReports.map(r => {
          const formattedCreatedAt = format(new Date(r.createdAt), 'yyyy MM dd h:mm aaaaa');

          return (
            <Row key={r.csamReportId}>
              <Box marginRight="5px" marginTop="5px" style={{ alignSelf: 'flex-start' }}>
                <CSAMAttachmentIcon />
                {/* <AttachFile fontSize="13px" opacity="0.6" /> */}
              </Box>
              <CSAMAttachmentText>
                <Template code="CSAMReportForm-Attachment" />
                <br />
                {`${formattedCreatedAt}m #${r.csamReportId}`}
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
