/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import Close from '@material-ui/icons/Close';

import { BottomButtonBar, Box, HeaderCloseButton, HiddenText, Row, StyledNextStepButton } from '../../styles/HrmStyles';
import {
  BoldDescriptionText,
  ButtonText,
  CenterContent,
  CopyCodeButton,
  CSAMReportContainer,
  CSAMReportLayout,
  RegularText,
  ReportCodeText,
  StyledCheckCircle,
  StyledFileCopyOutlined,
  SuccessReportIcon,
} from '../../styles/CSAMReport';
import { CSAMReportStatus, CSAMReportType, CSAMReportTypes } from '../../states/csam-report/types';

type Props = {
  reportStatus: CSAMReportStatus;
  onClickClose: () => void;
  onSendAnotherReport: () => void;
  csamType: CSAMReportType;
};

const CSAMReportStatusScreen: React.FC<Props> = ({ reportStatus, onClickClose, onSendAnotherReport, csamType }) => {
  const [copied, setCopied] = React.useState(false);

  const onCopyCode = async () => {
    // eslint-disable-next-line no-unused-expressions
    await navigator.clipboard.writeText(reportStatus.responseData);
    setCopied(true);
  };

  const CopyCodeButtonIcon = copied ? StyledCheckCircle : StyledFileCopyOutlined;
  const copy = csamType === CSAMReportTypes.CHILD ? 'CopyLink' : 'CopyCode';
  const CopyCodeButtonText = copied ? 'Copied' : copy;

  return (
    // how should we handle possible IWF API error here? Show a screen, an alert & go back to form?
    <CSAMReportContainer
      style={{ padding: csamType === CSAMReportTypes.CHILD && '5px' }}
      data-testid="CSAMReport-StatusScreen"
    >
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
                  code={
                    csamType === CSAMReportTypes.CHILD ? 'CSAMCLCReportForm-LinkReady' : 'CSAMReportForm-ReportSent'
                  }
                />
              </BoldDescriptionText>
            </Row>
            <Box marginTop="8%" marginBottom="3%">
              <RegularText>
                <Template
                  code={csamType === CSAMReportTypes.CHILD ? 'CSAMCLCReportForm-CopyLink' : 'CSAMReportForm-CopyCode'}
                />
              </RegularText>
            </Box>
            <Row>
              {csamType === CSAMReportTypes.CHILD && (
                <Box marginRight="10px">
                  <ReportCodeText
                    style={{
                      paddingLeft: '50px',
                    }}
                  >
                    {reportStatus.responseData}
                  </ReportCodeText>
                </Box>
              )}
              {csamType === CSAMReportTypes.COUNSELLOR && (
                <Box marginRight="5%">
                  <ReportCodeText>#{reportStatus.responseData}</ReportCodeText>
                </Box>
              )}
              <CopyCodeButton
                style={{ padding: csamType === CSAMReportTypes.CHILD && '5px 17px 5px 12px' }}
                secondary
                roundCorners
                onClick={onCopyCode}
                data-testid="CSAMReport-CopyCodeButton"
              >
                <CopyCodeButtonIcon />
                <div style={{ width: 50 }} />
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
              code={csamType === CSAMReportTypes.CHILD ? 'BottomBar-SendAnotherLink' : 'BottomBar-SendAnotherReport'}
            />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton roundCorners onClick={onClickClose}>
          <Template code={csamType === CSAMReportTypes.CHILD ? 'CloseButton' : 'BottomBar-CloseView'} />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CSAMReportContainer>
  );
};

CSAMReportStatusScreen.displayName = 'CSAMReportStatusScreen';

export default CSAMReportStatusScreen;
