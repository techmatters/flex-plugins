import React from 'react';
import styled from 'react-emotion';
import { Button, IconButton } from '@twilio/flex-ui';
import { Typography } from '@material-ui/core';

import { FontOpenSans, FormInput, FormSelect, FormSelectWrapper, Row, Column } from '../HrmStyles';

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
  overflow-y: scroll;
  height: 100%;
  background-color: #ffffff;
`;
CaseContainer.displayName = 'CaseContainer';

export const CaseActionLayout = styled(CaseLayout)`
  background-color: #ffffff;
`;
CaseActionLayout.displayName = 'CaseActionLayout';

export const CaseActionFormContainer = styled('div')`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow-y: auto;
  padding: 20px 10px 0 30px;
`;

export const CenteredContainer = styled(CaseContainer)`
  align-items: center;
  justify-content: center;
`;
CenteredContainer.displayName = 'CenteredContainer';

export const CaseSectionFont = styled(FontOpenSans)`
  color: ${({ theme }) => theme.colors.categoryTextColor};
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

export const ViewButton = styled<ViewButtonProps>(props => <Button roundCorners={false} {...props} />)`
  color: ${({ theme }) => theme.colors.categoryTextColor};
  background-color: #ecedf1;
  border-radius: 4px;
  font-weight: normal;
  letter-spacing: normal;
  font-size: 12px;
  box-shadow: none;
`;
ViewButton.displayName = 'ViewButton';

type CaseAddButtonFontProps = {
  disabled: boolean;
};

export const CaseAddButtonFont = styled(({ disabled, ...rest }: CaseAddButtonFontProps) => (
  <FontOpenSans {...rest} />
))<CaseAddButtonFontProps>`
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

const BaseTextArea = styled('textarea')`
  resize: none;
  background-color: ${props => props.theme.colors.base2};
  font-family: Open Sans;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  padding: 5px;
  border-style: none;
  border-radius: 4px;
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
  padding: 0 15px;
`;
TimelineRow.displayName = 'TimelineRow';

export const TimelineDate = styled('div')`
  min-width: 65px;
`;
TimelineDate.displayName = 'TimelineDate';

export const TimelineText = styled('span')`
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

export const InformationBoldText = styled(TimelineDate)`
  text-align: left;
`;
InformationBoldText.displayName = 'InformationBoldText';

export const PlaceHolderText = styled(TimelineText)`
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

export const DetailsHeaderContainer = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-right: 10px;
`;
DetailsHeaderContainer.displayName = 'DetailsHeaderContainer';

export const DetailsHeaderTextContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 70%;
`;

DetailsHeaderTextContainer.displayName = 'DetailsHeaderTextContainer';

export const DetailsHeaderChildAtRiskContainer = styled('div')`
  width: 136px;
  align-self: flex-end;
`;

DetailsHeaderChildAtRiskContainer.displayName = 'DetailsHeaderChildAtRiskContainer';

export const DetailsHeaderChildName = styled(Typography)`
  font-weight: 600 !important;
`;

DetailsHeaderChildName.displayName = 'DetailsHeaderChildName';

export const DetailsHeaderCaseContainer = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: baseline;
`;

DetailsHeaderCaseContainer.displayName = 'DetailsHeaderCaseContainer';

export const DetailsHeaderCounselor = styled('div')`
  font-style: italic;
  margin-top: 5px;
`;

DetailsHeaderCounselor.displayName = 'DetailsHeaderCounselor';

export const DetailsHeaderCaseId = styled(Typography)`
  font-weight: 600 !important;
`;

DetailsHeaderCaseId.displayName = 'DetailsHeaderCaseId';

export const DetailsHeaderOfficeName = styled(Typography)`
  padding-left: 10px;
  font-size: 0.7rem !important;
  font-weight: 300 !important;
`;

DetailsHeaderOfficeName.displayName = 'DetailsHeaderOfficeName';

export const StyledPrintButton = styled(IconButton)`
  color: #a7a7a7;
`;

StyledPrintButton.displayName = 'StyledPrintButton';

export const ChildIsAtRiskWrapper = styled(Row)`
  align-items: flex-start;
  box-sizing: border-box;
  border-radius: 4px;
  border: 'none';
  boxshadow: 'none';
`;
ChildIsAtRiskWrapper.displayName = 'ChildIsAtRiskWrapper';

export const StyledInputField = styled(FormInput)`
  width: 130px !important;
  height: 36px;
  color: #000000;
  background-color: ${props => props.theme.colors.inputBackgroundColor};
  font-weight: 600;
  padding-left: 10px !important;
  margin-top: 7px;

  ::-webkit-calendar-picker-indicator {
    margin-left: 0;
  }
`;

StyledInputField.displayName = 'StyledInputField';

type FormSelectWrapperProps = {
  disabled?: boolean;
};

export const StyledSelectWrapper = styled(FormSelectWrapper)<FormSelectWrapperProps>`
  width: 130px !important;
  height: 36px;
  margin-top: 7px;

  &::after {
    display: ${({ disabled }) => (disabled ? 'none' : 'initial')};
  }
`;

StyledSelectWrapper.displayName = 'StyledSelectWrapper';

type StyledSelectFieldProps = {
  color: string;
};

export const StyledSelectField = styled(({ color, ...rest }: StyledSelectFieldProps) => (
  <FormSelect {...rest} />
))<StyledSelectFieldProps>`
  width: 130px !important;
  height: 36px;
  font-weight: 600;
  color: ${({ color }) => (color ? `${color}` : '#000000')};
`;

StyledSelectField.displayName = 'StyledSelectField';
