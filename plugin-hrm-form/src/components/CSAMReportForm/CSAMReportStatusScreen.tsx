/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import CheckCircleTwoToneIcon from '@material-ui/icons/CheckCircleTwoTone';
import FileCopyOutlined from '@material-ui/icons/FileCopyOutlined';
import Close from '@material-ui/icons/Close';
import CheckCircle from '@material-ui/icons/CheckCircle';

import { BottomButtonBar, Box, HiddenText, Row, StyledNextStepButton } from '../../styles/HrmStyles';
import {
  CSAMReportContainer,
  CSAMReportLayout,
  BoldDescriptionText,
  RegularText,
  CenterContent,
  ReportCodeText,
  ButtonText,
  CopyCodeButton,
} from '../../styles/CSAMReportForm';
import type { CSAMReportStatus } from '../../states/csam-report/types';

type Props = {
  reportStatus: CSAMReportStatus;
  onClickClose: () => void;
  onSendAnotherReport: () => void;
};

const CSAMReportStatusScreen: React.FC<Props> = ({ reportStatus, onClickClose, onSendAnotherReport }) => {
  const [copied, setCopied] = React.useState(false);

  const onCopyCode = async () => {
    await navigator.clipboard.writeText(reportStatus.responseData);
    setCopied(true);
  };

  const CopyCodeButtonIcon = copied ? CheckCircle : FileCopyOutlined;
  const CopyCodeButtonText = copied ? 'Copied' : 'CopyCode';

  return (
    // how should we handle possible IWF API error here? Show a screen, an alert & go back to form?
    <CSAMReportContainer>
      <CSAMReportLayout>
        <ButtonBase onClick={onClickClose} style={{ marginLeft: 'auto' }} data-testid="Case-CloseCross">
          <HiddenText>
            <Template code="Case-CloseButton" />
          </HiddenText>
          <Close />
        </ButtonBase>
        <Box marginTop="15%" marginBottom="auto">
          <CenterContent>
            <Row>
              <Box marginRight="10px">
                <CheckCircleTwoToneIcon nativeColor="#00884C" width="24px" height="24px" />
              </Box>
              <BoldDescriptionText fontSize="16px">
                <Template code="CSAMReportForm-ReportSent" />
              </BoldDescriptionText>
            </Row>
            <Box marginTop="8%" marginBottom="3%">
              <RegularText>
                <Template code="CSAMReportForm-CopyCode" />
              </RegularText>
            </Box>
            <Row>
              <Box marginRight="5%">
                <ReportCodeText>#{reportStatus.responseData}</ReportCodeText>
              </Box>
              <CopyCodeButton secondary roundCorners onClick={onCopyCode}>
                <Box marginRight="5px">
                  <CopyCodeButtonIcon width="20px" height="20px" />
                </Box>
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
            <Template code="BottomBar-SendAnotherReport" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton roundCorners onClick={onClickClose}>
          <Template code="BottomBar-CloseView" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CSAMReportContainer>
  );
};

CSAMReportStatusScreen.displayName = 'CSAMReportStatusScreen';

export default CSAMReportStatusScreen;
