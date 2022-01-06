import React from 'react';
import styled from 'react-emotion';
import { withStyles } from '@material-ui/core';
import AttachFile from '@material-ui/icons/AttachFile';

import { FontOpenSans, StyledNextStepButton } from '../HrmStyles';

export const CSAMReportContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #192b334d;
  padding: 5px 10px;
`;
CSAMReportContainer.displayName = 'CSAMReportContainer';

export const CSAMReportLayout = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: stretch;
  overflow-y: scroll;
  background-color: #ffffff;
  border-radius: 4px 4px 0 0;
  padding: 3% 4%;

  /* Remove scrollbar */
  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;
CSAMReportLayout.displayName = 'CSAMReportLayout';

export const CenterContent = styled('div')`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
`;
CenterContent.displayName = 'CenterContent';

export const CopyCodeButton = styled(StyledNextStepButton)`
  padding: 7px;
`;
CopyCodeButton.displayName = 'CopyCodeButton';

export const BoldDescriptionText = styled(FontOpenSans)<{ fontSize?: string }>`
  color: #14171a;
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  font-weight: 700;
`;
BoldDescriptionText.displayName = 'BoldDescriptionText';

export const RegularText = styled(FontOpenSans)`
  font-size: 13px;
`;
RegularText.displayName = 'RegularText';

export const ReportCodeText = styled(FontOpenSans)`
  color: #009dff;
  font-size: 12px;
  line-height: 14px;
`;
ReportCodeText.displayName = 'ReportCodeText';

export const ButtonText = styled(FontOpenSans)`
  color: ${props => props.theme.colors.defaultButtonColor};
  font-size: 13px;
  font-weight: 700;
  line-height: 24px;
`;

export const CSAMAttachmentText = styled(FontOpenSans)`
  font-style: italic;
  font-size: 13px;
  color: ${props => props.theme.colors.defaultButtonColor};
`;
CSAMAttachmentText.displayName = 'CSAMAttachmentText';

export const CSAMAttachmentIcon = withStyles({
  root: {
    width: 14,
    height: 14,
    color: '#080808',
    opacity: 0.5,
  },
})(AttachFile);
CSAMAttachmentIcon.displayName = 'CSAMAttachmentIcon';
