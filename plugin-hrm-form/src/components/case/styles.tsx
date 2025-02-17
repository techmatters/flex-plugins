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

import React from 'react';
import { Button, IconButton, styled } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';

import { Column, FontOpenSans, FormInput, Row } from '../../styles';
import HrmTheme from '../../styles/HrmTheme';

export const CaseLayout = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;
CaseLayout.displayName = 'CaseLayout';

export const CaseContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e1e3ea;
  padding-right: 5px;
  overflow-y: scroll;
`;
CaseContainer.displayName = 'CaseContainer';

export const CaseActionFormContainer = styled('div')`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow-y: auto;
`;

export const CenteredContainer = styled(CaseContainer)`
  align-items: center;
  justify-content: center;
  max-width: 1280px;
`;
CenteredContainer.displayName = 'CenteredContainer';

export const CaseSectionFont = styled(FontOpenSans)`
  color: ${HrmTheme.colors.categoryTextColor};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.67px;
  line-height: 12px;
  text-transform: uppercase;
`;
CaseSectionFont.displayName = 'CaseSectionFont';

export const DetailsContainer = styled(Column)`
  padding-top: 15px;
  margin-top: 10px;
`;
DetailsContainer.displayName = 'DetailsContainer';

const DetailEntryText = styled(FontOpenSans)`
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
`;

export const DetailDescription = styled(DetailEntryText)`
  color: #9b9b9b;
`;
DetailDescription.displayName = 'DetailDescription';

type ViewButtonProps = {
  onClick: () => void;
};

export const ViewButton = styled(props => <Button roundCorners={false} {...props} />)<ViewButtonProps>`
  color: ${HrmTheme.colors.categoryTextColor};
  background-color: #ecedf1;
  height: 28px;
  border-radius: 4px;
  letter-spacing: normal;
  font-size: 13px;
  box-shadow: none;
  border: none;

  :focus {
    outline: auto;
  }
`;
ViewButton.displayName = 'ViewButton';

type CaseAddButtonProps = {
  withDivider: boolean;
};

export const CaseAddButton = styled(ButtonBase)<CaseAddButtonProps>`
  && {
    margin-left: auto;
    padding-left: ${props => (props.withDivider ? '12px' : '0px')};
    border-left: ${props => (props.withDivider ? '1px solid rgba(25, 43, 51, 0.3)' : 'none')};
  }

  :focus {
    outline: auto;
  }
`;
CaseAddButton.displayName = 'CaseAddButton';

type CaseAddButtonFontProps = {
  disabled: boolean;
};

export const CaseAddButtonFont = styled(({ disabled, ...rest }: CaseAddButtonFontProps) => <FontOpenSans {...rest} />)<
  CaseAddButtonFontProps
>`
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  color: ${({ disabled }) => (disabled ? `lightgray` : `#1976d2`)};
`;
CaseAddButtonFont.displayName = 'CaseAddButtonFont';

export const CaseActionTitle = styled(FontOpenSans)`
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #22333b;
`;
CaseActionTitle.displayName = 'CaseActionTitle';

export const CaseActionDetailFont = styled(FontOpenSans)`
  font-style: italic;
  font-size: 12px;
  line-height: 30px;
  opacity: 67%;
`;
CaseActionDetailFont.displayName = 'CaseActionDetailFont';

const placeHolderTextStyle = `
  font-family: Open Sans;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
`;

const BaseTextArea = styled('textarea')`
  resize: none;
  background-color: ${HrmTheme.colors.base2};
  ${placeHolderTextStyle}
  padding: 5px;
  border-style: none;
  border-radius: 2px;

  :focus {
    outline: none;
  }
`;

export const TimelineRow = styled('div')`
  display: flex;
  align-items: center;
  background-color: #f6f6f67d;
  height: 40px;
  margin-bottom: 3px;
  padding: 0 10px;
`;
TimelineRow.displayName = 'TimelineRow';

export const TimelineDate = styled(FontOpenSans)`
  font-size: 12px;
  min-width: 65px;
  flex-shrink: 0;
`;
TimelineDate.displayName = 'TimelineDate';

export const TimelineText = styled(FontOpenSans)`
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
  margin-right: 10px;
`;
TimelineText.displayName = 'TimelineText';

export const TimelineLabel = styled(TimelineText)`
  color: #9b9b9b;
`;
TimelineLabel.displayName = 'TimelineLabel';

export const TimelineCallTypeIcon = styled('div')`
  margin-right: 10px;
  display: flex;
  flex-direction: row;
`;
TimelineCallTypeIcon.displayName = 'TimelineCallTypeIcon';

export const PlaceHolderText = styled(TimelineText)`
  ${placeHolderTextStyle}
  opacity: 0.5;
`;
PlaceHolderText.displayName = 'PlaceHolderText';

export const TimelineIconContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
`;
TimelineIconContainer.displayName = 'TimelineIconContainer';

export const CaseSummaryTextArea = styled(BaseTextArea)`
  background-color: #f6f6f67d;
  height: 100%;
  width: 100%;
  margin: 10px 0px;
  padding-left: 15px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
`;
CaseSummaryTextArea.displayName = 'CaseSummaryTextArea';

export const RowItemContainer = styled(Row)`
  white-space: nowrap;
  overflow: hidden;
`;
RowItemContainer.displayName = 'RowItemContainer';

export const FullWidthFormTextContainer = styled('div')`
  white-space: break-spaces;
  font-family: 'Open Sans', sans-serif;
  line-height: 30px;
  font-size: 17px;
  width: 85%;
  margin: 10px auto 0px;
  text-align: justify;
`;
FullWidthFormTextContainer.displayName = 'FullWidthFormTextContainer';

export const DetailsHeaderContainer = styled('div')`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
`;
DetailsHeaderContainer.displayName = 'DetailsHeaderContainer';

export const DetailsHeaderCaseContainer = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: baseline;
`;

DetailsHeaderCaseContainer.displayName = 'DetailsHeaderCaseContainer';

export const DetailsHeaderCounselor = styled(FontOpenSans)`
  font-size: 12px;
  font-style: italic;
  margin-top: 5px;
`;

DetailsHeaderCounselor.displayName = 'DetailsHeaderCounselor';

export const DetailsHeaderCaseId = styled(FontOpenSans)`
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 15px;
`;

DetailsHeaderCaseId.displayName = 'DetailsHeaderCaseId';

export const DetailsHeaderOfficeName = styled(FontOpenSans)`
  padding-left: 10px;
  font-size: 0.7rem;
  font-weight: 300;
`;

DetailsHeaderOfficeName.displayName = 'DetailsHeaderOfficeName';

export const StyledPrintButton = styled(IconButton)`
  color: #a7a7a7;

  :focus {
    outline: auto;
  }

  :hover {
    background-color: rgba(0, 0, 0, 0.2);
    background-blend-mode: color;
  }
`;

StyledPrintButton.displayName = 'StyledPrintButton';

type StyledInputField = {
  color?: string;
};

export const StyledInputField = styled(FormInput)<StyledInputField>`
  width: 130px !important;
  height: 36px;
  color: ${props => (props.color ? props.color : '#000000')} !important;
  background-color: ${HrmTheme.colors.inputBackgroundColor};
  font-weight: 600;
  padding-left: 10px !important;
  margin-top: 7px;

  ::-webkit-calendar-picker-indicator {
    margin-left: 0;
  }
`;

StyledInputField.displayName = 'StyledInputField';

export const CloseDialogText = styled('p')`
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 20px;
  align-self: center;
  text-align: center;
`;

CloseDialogText.displayName = 'CloseDialogText';

export const EditContactContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: hidden;
`;
EditContactContainer.displayName = 'EditContactContainer';

type CaseDetailsBorderProps = {
  paddingBottom?: string;
  sectionTypeId?: boolean;
  marginBottom?: string;
};

export const CaseDetailsBorder = styled('div')<CaseDetailsBorderProps>`
  border-bottom: ${props => (props.sectionTypeId ? 'none' : '1px solid #e5e6e7')};
  margin-bottom: ${props => (props.marginBottom ? props.marginBottom : '')};
  padding-bottom: ${props => (props.paddingBottom ? props.paddingBottom : '25px')};
`;
