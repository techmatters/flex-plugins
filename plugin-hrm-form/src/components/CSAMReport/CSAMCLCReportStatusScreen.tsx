/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import Close from '@material-ui/icons/Close';

import { BottomButtonBar, Box, HiddenText, Row, StyledNextStepButton, HeaderCloseButton } from '../../styles/HrmStyles';
import {
  CSAMReportContainer,
  CSAMReportLayout,
  SuccessReportIcon,
  BoldDescriptionText,
  RegularText,
  CenterContent,
  ReportCodeText,
  ButtonText,
  CopyCodeButton,
  StyledCheckCircle,
  StyledFileCopyOutlined,
} from '../../styles/CSAMReport';
// import type { CSAMCLCReportStatus } from '../../states/csam-clc-report/types';

type Props = {
  reportStatus: string;
  onClickClose: () => void;
  onSendAnotherReport: () => void;
};

const CSAMCLCReportStatusScreen: React.FC<Props> = ({ reportStatus, onClickClose, onSendAnotherReport }) => {
  const [copied, setCopied] = React.useState(false);

  const onCopyCode = async () => {
    await navigator.clipboard.writeText(reportStatus);
    setCopied(true);
  };

  const CopyCodeButtonIcon = copied ? StyledCheckCircle : StyledFileCopyOutlined;
  const CopyCodeButtonText = copied ? 'Copied' : 'CopyCode';

  return (
    // how should we handle possible IWF API error here? Show a screen, an alert & go back to form?
    <CSAMReportContainer data-testid="CSAMReport-StatusScreen">
      <CSAMReportLayout>
        <HeaderCloseButton onClick={onClickClose} data-testid="Case-CloseCross">
          <HiddenText>
            <Template code="Case-CloseButton" />
          </HiddenText>
          <Close />
        </HeaderCloseButton>
        <Box marginTop="15%" marginBottom="auto">
          <CenterContent>
            <Row>
              <Box marginRight="10px">
                <SuccessReportIcon />
              </Box>
              <BoldDescriptionText fontSize="16px">
                <Template code="CSAMCLCReportForm-LinkReady" />
              </BoldDescriptionText>
            </Row>
            <Box marginTop="8%" marginBottom="3%">
              <RegularText>
                <Template code="CSAMCLCReportForm-CopyLink" />
              </RegularText>
            </Box>
            <Row>
              <Box marginRight="10px">
                <ReportCodeText>{reportStatus}</ReportCodeText>
              </Box>
              <CopyCodeButton secondary roundCorners onClick={onCopyCode} data-testid="CSAMReport-CopyCodeButton">
                <CopyCodeButtonIcon />
                <div style={{ width: 10 }} />
                <ButtonText>
                  <Template code={CopyCodeButtonText} />
                </ButtonText>
              </CopyCodeButton>
            </Row>
          </CenterContent>
        </Box>
      </CSAMReportLayout>

      <BottomButtonBar>
        <Box marginRight="15px">
          <StyledNextStepButton secondary roundCorners onClick={onSendAnotherReport}>
            <Template code="BottomBar-SendAnotherLink" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton roundCorners onClick={onClickClose}>
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CSAMReportContainer>
  );
};

CSAMCLCReportStatusScreen.displayName = 'CSAMCLCReportStatusScreen';

export default CSAMCLCReportStatusScreen;
