import React from 'react';
import styled from 'react-emotion';

import { FontOpenSans } from '../HrmStyles';

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
  align-items: stretch;
  height: 100%;
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

export const BoldDescriptionText = styled(FontOpenSans)`
  color: #14171a;
  font-size: 14px;
  font-weight: 700;
`;
BoldDescriptionText.displayName = 'BoldDescriptionText';

export const RegularText = styled(FontOpenSans)`
  font-size: 13px;
`;
RegularText.displayName = 'RegularText';
