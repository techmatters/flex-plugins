import React from 'react';
import styled from 'react-emotion';
import { ButtonBase, Paper, Button, withStyles } from '@material-ui/core';
import ChevronLeft from '@material-ui/icons/ChevronLeft';

import { Flex, Row, FontOpenSans, Container, BottomButtonBar } from '../HrmStyles';

export const ConfirmContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  padding-top: 60px;
  padding-bottom: 60px;
`;

export const BackIcon = styled(ChevronLeft)`
  color: #000000;
  width: 50px;
  height: 50px;
`;

// ContactPreview styles
export const ContactWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 15px;
  margin-bottom: 15px;
  padding: 5px 20px 20px 20px;
  width: 550px;
  box-sizing: border-box;
  background-color: #ffffff;
`;

export const ContactButtonsWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  align-self: flex-start;
  margin-left: auto;
  align-items: center;
`;

export const StyledLink = styled(({ onClick, ...rest }) => <Button size="small" onClick={onClick} {...rest} />)`
  span {
    text-transform: none;
    color: #1874e1;
  }

  &&:hover {
    background-color: ${props => props.theme.colors.hyperlinkHoverBackgroundColor};
  }
`;

const Tag = styled('div')`
  border-radius: 6px;
  padding: 5px 15px;
`;

export const ContactTag = styled(Tag)`
  display: inline-flex;
  align-items: center;
  border-radius: 2px;
  white-space: nowrap;
  margin-right: 6px;
  padding: 5px 12px;
  background-color: ${props => (props.color ? `${props.color}1a` : '#d8d8d8')};
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

export const CancelButton = styled(Button)`
  &:focus {
    background-color: rgba(34, 34, 34, 0.08);
  }
`;

export const SilentText = styled('div')`
  background-color: #f0f1f4;
  color: #404c52;
  padding: 2px 10px;
  border-radius: 2px;
`;

export const PrevNameText = styled(FontOpenSans)`
  font-size: 12px;
  font-weight: 700;
  line-height: 14px;
  color: #182b33;
`;

export const SummaryText = styled(FontOpenSans)`
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  max-width: 390px;
`;

export const ShortSummaryText = styled(SummaryText)`
  white-space: nowrap;
  overflow: hidden;
`;

export const CounselorText = styled(SummaryText)`
  opacity: 0.74;
`;

export const DateText = styled(SummaryText)`
  opacity: 0.46;
`;

export const TagsWrapper = styled(Flex)`
  min-width: 0;
  margin-right: 5px;

  div:last-child {
    min-width: 0;

    p {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
`;

export const TagText = styled(FontOpenSans)`
  display: inline-block;
  font-size: 11px;
  font-weight: 400;
  line-height: 13px;
  opacity: 0.65;
  color: #192b33e8;
`;

export const TagMiddleDot = styled('div')`
  display: inline-block;
  width: 4px;
  min-width: 4px;
  height: 4px;
  border-radius: 100%;
  margin-right: 1ch;
  background-color: ${props => props.color};
`;

// ContactDetails styles
export const ContactDetailsIcon = icon => styled(icon)`
  color: #000000;
  width: 50px;
  height: 50px;
`;

const containerPadding = 40;
export const DetailsContainer = styled('div')`
  padding-left: ${containerPadding}px;
  padding-right: ${containerPadding}px;
`;

export const SectionTitleContainer = styled(Row)`
  background-color: #ecedf1;
  padding: 8px;
  padding-left: 18px;
  border-left: ${({ color }) => (color ? `6px solid ${color}` : 'none')};
`;

export const NameContainer = styled(SectionTitleContainer)`
  background-color: #000000;
  border-radius: 4px 4px 0 0;
  margin-top: 20px;
  margin-bottom: 3px;
`;

const BoldDetailFont = styled(FontOpenSans)`
  font-size: 12px;
  font-weight: 700;
  line-height: 14px;
`;

export const BackText = styled(BoldDetailFont)`
  letter-spacing: 2px;
  margin-left: 15px;
  text-transform: uppercase;
`;

export const DetNameText = styled(BoldDetailFont)`
  color: #ffffff;
  margin-right: auto;
`;

export const SectionTitleText = styled(FontOpenSans)`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.8px;
  line-height: 13px;
  margin-right: auto;
  text-transform: uppercase;
`;

const BodyText = styled(FontOpenSans)`
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
`;

export const SectionDescriptionText = styled(BodyText)`
  color: #9b9b9b;
  text-align: right;
  margin-right: 15px;
`;

export const SectionValueText = styled(BodyText)`
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  max-width: 40em;
`;

// SearchResults styles
export const ResultsHeader = styled(Container)`
  min-height: 75px;
  padding-bottom: 23px;
  justify-content: space-between;
  flex-basis: 0;
  flex-grow: 0;
`;

export const ListContainer = styled(BottomButtonBar)`
  flex-basis: 0;
  flex-grow: 1;
  padding: 0;
`;

export const ScrollableList = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

export const StyledButtonBase = withStyles({
  root: {
    margin: 10,
  },
  disabled: {
    color: 'rgba(0, 0, 0, 0.26)',
  },
})(ButtonBase);
