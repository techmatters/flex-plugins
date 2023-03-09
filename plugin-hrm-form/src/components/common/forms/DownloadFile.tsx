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
import DownloadIcon from '@material-ui/icons/GetApp';
import { Template } from '@twilio/flex-ui';

import { Flex, Box, StyledNextStepButton, HiddenText } from '../../../styles/HrmStyles';
import { formatFileNameAtAws } from '../../../utils';
import { getFileDownloadUrl } from '../../../services/ServerlessService';

type Props = {
  fileNameAtAws: string;
};

const DownloadFile: React.FC<Props> = ({ fileNameAtAws }) => {
  const fileName = formatFileNameAtAws(fileNameAtAws);

  const downloadFile = async (filename: string) => {
    const encodedFilename = encodeURIComponent(filename);
    const fileUrl = await getFileDownloadUrl(fileNameAtAws, encodedFilename);
    const response = await fetch(fileUrl.downloadUrl);

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Flex flexDirection="column" alignItems="flex-start">
      <Box marginBottom="5px">
        <StyledNextStepButton secondary onClick={() => downloadFile(fileName)}>
          <DownloadIcon style={{ fontSize: '20px', marginRight: 5 }} />
          <Template code="DownloadFile-ButtonText" />
        </StyledNextStepButton>
      </Box>
      {fileName}
    </Flex>
  );
};
DownloadFile.displayName = 'DownloadFile';

export default DownloadFile;
