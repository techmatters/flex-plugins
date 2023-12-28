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

/* eslint-disable react/jsx-max-depth */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import Close from '@material-ui/icons/Close';

import { BottomButtonBar, Box, HiddenText, Row } from '../../styles';
import { StyledNextStepButton, HeaderCloseButton } from '../../styles/buttons';
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
} from './styles';
import { CSAMReportStatus, CSAMReportType, CSAMReportTypes } from '../../states/csam-report/types';
import useFocus from '../../utils/useFocus';

type Props = {
  reportStatus: CSAMReportStatus;
  onClickClose: () => void;
  onSendAnotherReport: () => void;
  csamType: CSAMReportType;
};

const CSAMReportStatusScreen: React.FC<Props> = ({ reportStatus, onClickClose, onSendAnotherReport, csamType }) => {
  const [copied, setCopied] = React.useState(false);
  const focusElementRef = useFocus();

  const onCopyCode = async () => {
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
        <HeaderCloseButton
          onClick={onClickClose}
          data-testid="Case-CloseCross"
          ref={ref => {
            focusElementRef.current = ref;
          }}
        >
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
              <Box marginRight="10px">
                <ReportCodeText>
                  {csamType === CSAMReportTypes.COUNSELLOR && '#'}
                  {reportStatus.responseData}
                </ReportCodeText>
              </Box>
              <CopyCodeButton
                style={{ padding: '5px 17px 5px 12px' }}
                secondary="true"
                roundCorners
                onClick={onCopyCode}
                data-testid="CSAMReport-CopyCodeButton"
              >
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
          <StyledNextStepButton secondary="true" roundCorners onClick={onSendAnotherReport}>
            <Template
              code={csamType === CSAMReportTypes.CHILD ? 'BottomBar-SendAnotherLink' : 'BottomBar-SendAnotherReport'}
            />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton roundCorners onClick={onClickClose}>
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CSAMReportContainer>
  );
};

CSAMReportStatusScreen.displayName = 'CSAMReportStatusScreen';

export default CSAMReportStatusScreen;
