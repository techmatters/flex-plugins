import styled from 'react-emotion';

import { FontOpenSans, Row } from '../HrmStyles';

export const CaseContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CenteredContainer = styled(CaseContainer)`
  align-items: center;
  justify-content: center;
`;

export const CaseNumberFont = styled(FontOpenSans)`
  font-size: 14px;
  font-weight: 600;
  line-height: 14px;
  color: #0d2a38;
`;

export const CaseSectionFont = styled(FontOpenSans)`
  color: #192b33;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.67px;
  line-height: 12px;
  text-transform: uppercase;
`;

export const DetailsContainer = styled(Row)`
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  border-color: #a0a8bd52;
  padding: 15px;
  margin-top: 10px;
`;

const DetailEntryText = styled(FontOpenSans)`
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
`;

export const DetailDescription = styled(DetailEntryText)`
  color: #9b9b9b;
`;

export const DetailValue = DetailEntryText;

export const OpenStatusFont = styled(DetailEntryText)`
  color: #2bb826;
  font-size: 13px;
  text-transform: uppercase;
`;

export const DefaultStatusFont = styled(DetailEntryText)`
  font-size: 13px;
  text-transform: uppercase;
`;

export const CaseAddButtonFont = styled(FontOpenSans)`
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  color: #1976d2;
`;

export const CaseActionTitle = styled(FontOpenSans)`
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #22333b;
`;

export const CaseActionDetailFont = styled(FontOpenSans)`
  font-style: italic;
  font-size: 12px;
  line-height: 30px;
  opacity: 67%;
`;

export const CaseActionTextArea = styled('textarea')`
  resize: none;
  width: 65%;
  background-color: #ffffff;
  font-family: Open Sans;
  font-size: 12px;
  line-height: 15px;
  margin-top: 10px;
  padding: 5px;
  border-style: none;
  border-radius: 4px;
`;

export const CaseActionButtonBar = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  height: 55px;
  flex-shrink: 0;
  background-color: ${props => props.theme.base2};
`;
