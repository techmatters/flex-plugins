import styled from 'react-emotion';

import { Row } from '../HrmStyles';

export const StyledRow = styled(Row)`
  margin-bottom: 2px;
`;

export const ContactWrapper = styled('div')`
  margin-top: 5px;
  margin-bottom: 5px;

  &:hover{
    box-shadow: -1px 7px 29px 0px rgba(0,0,0,0.3);
`;

export const ContactButtonsWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  align-self: flex-start;
  margin-left: auto;
`;

const Tag = styled('div')`
  border-radius: 5%;
  padding: 5px;
  padding-left: 10px;
  padding-right: 10px;
`;

export const ContactTag = styled(Tag)`
  margin-left: 10px;
  background-color: #d8d8d8;
`;

export const ContactCallType = styled(Tag)`
  margin-right: 10px;
  background-color: #9b9b9b;
`;

export const TagFont = styled('p')`
  color: #000000;
  font-family: OpenSans;
  font-size: 11px;
  font-weight: 400;
  line-height: 13px;
  opacity: 0.6570405505952381;
  text-align: left;
`;

export const ContactDate = styled('p')`
  color: #000000;
  font-family: OpenSans;
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  opacity: 0.4611467633928572;
  text-align: left;
`;
