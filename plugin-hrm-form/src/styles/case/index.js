import styled from 'react-emotion';

import { FontOpenSans, Row } from '../HrmStyles';

export const CaseContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  margin-left: 5px;
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

export const DetailEntry = styled('div')`
  margin-right: 25px;
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

export const ActiveStatusFont = styled(DetailEntryText)`
  color: #2BB826;
  font-size: 13px;
`;