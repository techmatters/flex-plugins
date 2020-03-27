import styled from 'react-emotion';
import { Paper } from '@material-ui/core';

import { Row, FontOpenSans } from '../HrmStyles';

export const AlertContainer = styled(Row)`
  background-color: #000000;
  opacity: 0.5;
  padding: 20px;
  padding-left: 50px;
  padding-right: 50px;
  justify-content: center;
`;

export const ConfirmContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  padding-top: 60px;
  padding-bottom: 60px;
`;

// ContactPreview styles
export const RowWithMargin = margin => styled(Row)`
  margin-bottom: ${margin}px;
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

export const StyledIcon = icon => styled(icon)`
  opacity: 0.34;
`;

export const NoneTransform = styled('p')`
  text-transform: none;
`;

const Tag = styled('div')`
  border-radius: 6px;
  padding: 5px;
  padding-left: 15px;
  padding-right: 15px;
`;

export const ContactTag = styled(Tag)`
  margin-left: 10px;
  background-color: #d8d8d8;
`;

export const CalltypeTag = styled(Tag)`
  margin-right: 10px;
  background-color: #9b9b9b;
`;

const PopoverText = styled(FontOpenSans)`
  font-size: 20px;
  font-weight: 600;
  line-height: 16px;
`;

export const ConfirmText = styled(PopoverText)`
  margin-bottom: 20px;
`;

export const AlertText = styled(PopoverText)`
  color: #ffffff;
  margin-left: 20px;
`;

export const NameText = styled(FontOpenSans)`
  font-size: 12px;
  font-weight: 700;
  line-height: 14px;
`;

export const SummaryText = styled(FontOpenSans)`
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
`;

export const CounselorText = styled(SummaryText)`
  opacity: 0.74;
`;

export const DateText = styled(SummaryText)`
  opacity: 0.46;
`;

export const TagText = styled(FontOpenSans)`
  font-size: 11px;
  font-weight: 400;
  line-height: 13px;
  opacity: 0.65;
`;
