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
import type { CSAMReportStatus } from '../../states/csam-report/types';

type Props = {
  reportStatus?: CSAMReportStatus;
  onClickClose?: () => void;
  onSendAnotherReport?: () => void;
  clcReportStatus?: CSAMReportStatus;
  csamType?: 'child-status' | 'counsellor-status';
};

const CSAMReportStatusScreen: React.FC<Props> = ({
  reportStatus,
  clcReportStatus,
  onClickClose,
  onSendAnotherReport,
  csamType,
}) => {
  const [copied, setCopied] = React.useState(false);

  const onCopyCode = async () => {
    // eslint-disable-next-line no-unused-expressions
    csamType === 'child-status'
      ? await navigator.clipboard.writeText(clcReportStatus.responseData)
      : await navigator.clipboard.writeText(reportStatus.responseData);
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
                <Template
                  code={csamType === 'child-status' ? 'CSAMCLCReportForm-LinkReady' : 'CSAMReportForm-ReportSent'}
                />
              </BoldDescriptionText>
            </Row>
            <Box marginTop="8%" marginBottom="3%">
              <RegularText>
                <Template
                  code={csamType === 'child-status' ? 'CSAMCLCReportForm-CopyLink' : 'CSAMReportForm-CopyCode'}
                />
              </RegularText>
            </Box>
            <Row>
              {csamType === 'child-status' && (
                <Box marginRight="10px">
                  <ReportCodeText>{clcReportStatus.responseData}</ReportCodeText>
                </Box>
              )}
              {csamType === 'counsellor-status' && (
                <Box marginRight="5%">
                  <ReportCodeText>#{reportStatus.responseData}</ReportCodeText>
                </Box>
              )}
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
            <Template
              code={csamType === 'child-status' ? 'BottomBar-SendAnotherLink' : 'BottomBar-SendAnotherReport'}
            />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton roundCorners onClick={onClickClose}>
          <Template code={csamType === 'child-status' ? 'CloseButton' : 'BottomBar-CloseView'} />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CSAMReportContainer>
  );
};

CSAMReportStatusScreen.displayName = 'CSAMReportStatusScreen';

export default CSAMReportStatusScreen;
