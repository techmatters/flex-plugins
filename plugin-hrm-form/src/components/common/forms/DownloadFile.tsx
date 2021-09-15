/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from 'react';
import DownloadIcon from '@material-ui/icons/GetApp';
import { Template } from '@twilio/flex-ui';

import { Flex, Box, StyledNextStepButton, HiddenText } from '../../../styles/HrmStyles';
import { formatFileNameAtAws } from '../../../utils';
import { getFileDownloadUrl } from '../../../services/ServerlessService';

type Props = {
  fileNameAtAws: string;
};

const DownloadFile: React.FC<Props> = ({ fileNameAtAws }) => {
  const [preSignedUrl, setPreSignedUrl] = useState('');
  const downloadLink = useRef<HTMLAnchorElement>();

  useEffect(() => {
    if (preSignedUrl) {
      downloadLink.current.click();
    }
  }, [preSignedUrl, downloadLink]);

  const fileName = formatFileNameAtAws(fileNameAtAws);

  const handleClick = async () => {
    const response = await getFileDownloadUrl(fileNameAtAws, fileName);
    setPreSignedUrl(response.downloadUrl);
  };
  return (
    <Flex flexDirection="column" alignItems="flex-start">
      <Box marginBottom="5px">
        <StyledNextStepButton secondary onClick={handleClick}>
          <DownloadIcon style={{ fontSize: '20px', marginRight: 5 }} />
          <Template code="DownloadFile-ButtonText" />
        </StyledNextStepButton>
      </Box>
      {fileName}
      <HiddenText>
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
        <a aria-hidden="true" href={preSignedUrl} ref={downloadLink} download={fileName} />
      </HiddenText>
    </Flex>
  );
};
DownloadFile.displayName = 'DownloadFile';

export default DownloadFile;
