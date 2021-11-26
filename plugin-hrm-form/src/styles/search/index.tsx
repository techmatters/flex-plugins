import React from 'react';
import styled from 'react-emotion';
import { ButtonBase, Paper, Button, FormControlLabel, Switch, Collapse, withStyles } from '@material-ui/core';
import { Tabs, TabsProps } from '@twilio/flex-ui';
import Folder from '@material-ui/icons/Folder';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import Link from '@material-ui/icons/Link';
import { ButtonProps } from '@material-ui/core/Button';

import { Flex, Row, FontOpenSans, BottomButtonBar, TabbedFormsContainer } from '../HrmStyles';

// CaseViewer Styles
export const CaseWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 10px;
  padding: 5px 20px 10px 20px;
  width: 600px;
  box-sizing: border-box;
  background-color: #ffffff;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);
  border-radius: 4px;
`;

CaseWrapper.displayName = 'CaseWrapper';

export const CaseHeaderContainer = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
`;

CaseHeaderContainer.displayName = 'CaseHeaderContainer';

type CaseIdProps = {
  closed: boolean;
};

export const CaseHeaderCaseId = styled('div')<CaseIdProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: ${props => (props.closed ? 'none' : 'solid')};
  color: ${props => (props.closed ? 'lightgray' : 'black')};
  border-width: thin;
  width: 50px;
  font-weight: 600;
`;

CaseHeaderCaseId.displayName = 'CaseHeaderCaseId';

export const CaseHeaderChildName = styled('p')`
  font-weight: 700;
  width: 150px;
`;

CaseHeaderChildName.displayName = 'CaseHeaderChildName';

export const CaseSummaryContainer = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  margin-top: 10px;
`;

CaseSummaryContainer.displayName = 'CaseSummaryContainer';

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
  margin-top: 10px;
  padding: 5px 20px 10px 20px;
  width: 550px;
  box-sizing: border-box;
  background-color: #ffffff;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);
  border-radius: 4px;
`;

export const ConnectIcon = withStyles({
  root: {
    borderRadius: '50%',
    backgroundColor: '#a0a8bd66',
    opacity: 0.34,
    padding: '5px',
    '&:hover': {
      opacity: 0.2,
    },
  },
})(Link);

export const ContactButtonsWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  align-self: flex-start;
  margin-left: auto;
  align-items: center;
`;

type StyledLinkProps = ButtonProps & { underline?: boolean };

export const StyledLink = styled(({ onClick, ...rest }: StyledLinkProps) => (
  <Button size="small" onClick={onClick} {...rest} />
))<StyledLinkProps>`
  span {
    text-transform: none;
    color: #1874e1;
  }

  &&:hover {
    text-decoration: ${props => (props.underline ? 'underline' : 'none')};
    text-decoration-color: ${props => (props.underline ? '#1874e1' : 'transparent')};
    background-color: ${props => (props.underline ? 'transparent' : props.theme.colors.hyperlinkHoverBackgroundColor)};
  }

  &&:focus {
    outline: auto;
  }
`;

const Tag = styled('div')`
  border-radius: 6px;
  padding: 5px 15px;
`;

type ColorProps = {
  color?: string;
};

export const ContactTag = styled(Tag)<ColorProps>`
  display: inline-flex;
  align-items: center;
  border-radius: 2px;
  white-space: nowrap;
  margin-right: 6px;
  padding: 5px 12px;
  background-color: ${props => (props.color ? `${props.color}1a` : '#d8d8d8')};
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

export const StyledTabs = styled((props: TabsProps) => <Tabs {...props} />)`
  .Twilio-TabHeader-StateIndicator-Active {
    background-color: black;
  }
`;
StyledTabs.displayName = 'StyledTabs';

export const StyledResultsContainer = styled('div')`
  display: flex;
  align-items: center;
  width: 565px;
  margin-top: 10px;
`;
StyledResultsContainer.displayName = 'StyledResultsContainer';

export const StyledTabLabel = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-around;
`;
StyledTabLabel.displayName = 'StyledTabLabel';

export const StyledResultsText = styled('div')`
  display: flex;
`;
StyledResultsText.displayName = 'StyledResultsText';

export const StyledFolderIcon = styled(Folder)`
  font-size: medium !important;
  padding-right: 10px;
`;

StyledFolderIcon.displayName = 'StyledFolderIcon';

export const BoldText = styled('div')`
  font-weight: bold;
  color: #000000;
  font-family: Open Sans;
  text-align: left;
`;
BoldText.displayName = 'BoldText';

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

export const CaseFooter = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

CaseFooter.displayName = 'CaseFooter';

export const CaseFooterText = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

CaseFooterText.displayName = 'CaseFooterText';

export const CounselorText = styled(SummaryText)`
  opacity: 0.46;
`;

export const DateText = styled(SummaryText)`
  opacity: 0.46;
  font-size: 12px;
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

export const TagMiddleDot = styled('div')<ColorProps>`
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

export const SectionTitleContainer = styled(Row)<ColorProps>`
  background-color: #ecedf1;
  padding: 8px;
  padding-left: 18px;
  border-left: ${({ color }) => (color ? `6px solid ${color}` : 'none')};
`;
SectionTitleContainer.displayName = 'SectionTitleContainer';

export const SectionTitleButton = styled(ButtonBase)`
  width: 100%;
  padding: 0;
  &:focus {
    outline: auto;
  }
`;
SectionTitleButton.displayName = 'SectionTitleButton';

type CollapseProps = {
  expanded: boolean;
};

export const SectionCollapse = styled(({ expanded, ...rest }: CollapseProps) => (
  <Collapse in={expanded} {...rest} />
))<CollapseProps>`
  visibility: ${props => (props.expanded ? 'visible' : 'collapse')};
`;
SectionCollapse.displayName = 'SectionCollapse';

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
  margin-left: 15px;
  font-weight: 600;
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

type SectionValueTextProps = {
  notBold?: boolean;
};

export const SectionValueText = styled(BodyText)<SectionValueTextProps>`
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  max-width: 40em;
  ${props => props.notBold && 'font-weight: 500'};
`;

// SearchResults styles
const containerLeftRightMargin = '5px';

export const ResultsHeader = styled('div')`
  display: flex;
  padding: 32px 20px 0px 20px;
  flex-direction: column;
  flex-wrap: nowrap;
  background-color: #ffffff;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  margin: 0 ${containerLeftRightMargin};
  height: 100%;
  min-height: 75px;
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
    margin: 5,
  },
  disabled: {
    color: 'rgba(0, 0, 0, 0.26)',
  },
})(ButtonBase);

export const StyledFormControlLabel = styled(FormControlLabel)`
  margin-left: 0px !important;
  margin-right: 0px !important;
`;
StyledFormControlLabel.displayName = 'StyledFormControlLabel';

export const StyledCount = styled('p')`
  font-weight: 600;
`;
StyledCount.displayName = 'StyledCount';

export const StyledContactResultsHeader = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 550px;
`;

StyledContactResultsHeader.displayName = 'StyledContactResultsHeader';

export const StyledCaseResultsHeader = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 600px;
`;

StyledCaseResultsHeader.displayName = 'StyledCaseResultsHeader';

export const StyledSwitch = withStyles({
  icon: {
    border: 'none',
    width: '18px',
    height: '18px',
  },
  switchBase: {
    transform: 'translateX(6px)',
  },
  checked: {
    transform: 'translateX(17px)',
  },
  bar: {
    width: '40px',
    height: '22px',
    marginTop: '-11px',
    borderRadius: '13px',
    backgroundColor: '#D2DBE7',
    '$checked$checked + &': {
      backgroundColor: '#1D2B32',
    },
  },
})(Switch);
StyledSwitch.displayName = 'StyledSwitch';

export const SwitchLabel = styled(SummaryText)`
  margin-right: 5px;
`;
SwitchLabel.displayName = 'SwitchLabel';

export const SearchTitle = styled(FontOpenSans)`
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 20px;
`;
SearchTitle.displayName = 'SearchTitle';

export const StandaloneSearchContainer = styled(TabbedFormsContainer)`
  width: 50%;
  padding-right: 50%;
  background-color: ${props => props.theme.colors.base2};
`;
StandaloneSearchContainer.displayName = 'StandaloneSearchContainer';
