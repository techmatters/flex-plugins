import React from 'react';
import styled from 'react-emotion';
import { Button } from '@twilio/flex-ui';

import { FontOpenSans, Row } from '../HrmStyles';

export const CaseContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
CaseContainer.displayName = 'CaseContainer';

export const CaseActionContainer = styled(CaseContainer)`
  background-color: #ffffff;
`;
CaseActionContainer.displayName = 'CaseActionContainer';

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

export const CaseNumberFont = styled(FontOpenSans)`
  font-size: 14px;
  font-weight: 600;
  line-height: 14px;
  color: #0d2a38;
`;
CaseNumberFont.displayName = 'CaseNumberFont';

export const CaseSectionFont = styled(FontOpenSans)`
  color: ${({ theme }) => theme.colors.categoryTextColor};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.67px;
  line-height: 12px;
  text-transform: uppercase;
`;
CaseSectionFont.displayName = 'CaseSectionFont';

export const DetailsContainer = styled(Row)`
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  border-color: #a0a8bd52;
  padding: 15px;
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

export const DetailValue = DetailEntryText;
DetailValue.displayName = 'DetailValue';

export const OpenStatusFont = styled(DetailEntryText)`
  color: #2bb826;
  font-size: 13px;
  text-transform: uppercase;
`;
OpenStatusFont.displayName = 'OpenStatusFont';

export const DefaultStatusFont = styled(DetailEntryText)`
  font-size: 13px;
  text-transform: uppercase;
`;
DefaultStatusFont.displayName = 'DefaultStatusFont';

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

export const CaseAddButtonFont = styled(FontOpenSans)`
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  color: #1976d2;
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

export const CaseActionTextArea = styled(BaseTextArea)`
  width: 65%;
  margin-top: 10px;
`;
CaseActionTextArea.displayName = 'CaseActionTextArea';

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
  font-weight: bold;
  min-width: 65px;
  text-align: center;
`;
TimelineDate.displayName = 'TimelineDate';

export const TimelineText = styled('span')`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
`;
TimelineText.displayName = 'TimelineText';

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
