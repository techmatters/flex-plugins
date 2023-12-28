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
import { Button, ButtonBase, Collapse, FormControlLabel, Paper, Switch, withStyles } from '@material-ui/core';
import { styled, Tabs, TabsProps } from '@twilio/flex-ui';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import { ButtonProps } from '@material-ui/core/Button';
import { TransitionProps } from '@material-ui/core/transitions/transition';

import { TabbedFormTabContainer, TabbedFormsContainer } from '../tabbedForms/styles';
import { Flex, Row, FontOpenSans, BottomButtonBar } from '../../styles';
import { StyledNextStepButton } from '../../styles/buttons';
import HrmTheme from '../../styles/HrmTheme';
import { BannerContainerProps, colors } from '../banners';

// CaseViewer Styles

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

export const ContactButtonsWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  align-self: flex-start;
  margin-left: auto;
  align-items: center;
`;

type StyledLinkProps = ButtonProps & { underline?: boolean };

const UnstyledLinkButton = React.forwardRef<HTMLButtonElement, StyledLinkProps>(
  ({ onClick, underline, ...rest }, ref) => (
    <Button
      size="small"
      onClick={onClick}
      disableFocusRipple={underline}
      disableRipple={underline}
      ref={ref}
      {...rest}
    />
  ),
);

export const StyledLink = styled(UnstyledLinkButton)<StyledLinkProps>`
  && {
    padding: 0;
    line-height: normal;
    letter-spacing: normal;

    :hover {
      text-decoration: ${props => (props.underline ? 'underline' : 'none')};
      text-decoration-color: ${props => (props.underline ? '#1874e1' : 'transparent')};
      background-color: ${props => (props.underline ? 'transparent' : HrmTheme.colors.hyperlinkHoverBackgroundColor)};
    }

    :focus {
      outline: auto;
      background-color: ${props => (props.underline ? 'transparent' : HrmTheme.colors.hyperlinkHoverBackgroundColor)};
    }
  }

  span {
    padding: 0px;
    line-height: normal;
    letter-spacing: normal;
    text-transform: none;
    color: #1874e1;
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

export const PreviewHeaderText = styled(FontOpenSans)`
  font-size: 14px;
  font-weight: 600;
  line-height: 14px;
  color: #192b33;
`;

export const StyledTabs = styled((props: Partial<TabsProps> & { children?: any }) => <Tabs {...props} />)`
  .Twilio-TabHeader {
    flex-grow: 1;

    button {
      width: 100%;
    }
  }

  .Twilio-TabHeader-StateIndicator-Active {
    background-color: #0064e1;
    height: 1px;
    padding: 0;
  }
  .Twilio-Tabs-Labels {
    padding: 0;
  }

  .Twilio-Tab {
    flex-direction: column;
  }
`;
StyledTabs.displayName = 'StyledTabs';

export const StyledResultsContainer = styled('div')`
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 10px;
`;
StyledResultsContainer.displayName = 'StyledResultsContainer';

export const StyledResultsText = styled('div')`
  display: flex;
  padding-right: 5px;
`;
StyledResultsText.displayName = 'StyledResultsText';

export const EmphasisedText = styled('div')`
  font-weight: 600;
  color: #000000;
  font-family: Open Sans;
  text-align: left;
`;
EmphasisedText.displayName = 'EmphasisedText';

export const SummaryText = styled(FontOpenSans)`
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

export const PreviewRow = styled(Row)<Partial<BannerContainerProps>>`
  ${({ color }) => (color ? `background-color: ${colors.background[color]}` : '')};
  ${({ color }) => (color ? `border-bottom: 2px solid ${colors.border[color]}` : '')};
  margin-top: 10px;
  padding: 0 20px 5px 20px;
`;

export const SubtitleValue = styled(SummaryText)`
  padding-inline-end: 10px;
`;

export const SubtitleLabel = styled(SummaryText)`
  padding-inline-end: 5px;
  color: #606b85;
`;

export const TagsWrapper = styled(Flex)`
  min-width: 0;
  margin-right: 5px;
  overflow: hidden;

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
  font-size: 12px;
  font-weight: 400;
  line-height: 14px;
  opacity: 1;
  color: #2f3e44;
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
  font-size: 16px;
`;

const containerPadding = 20;
export const DetailsContainer = styled('div')`
  padding-left: ${containerPadding}px;
  padding-right: ${containerPadding}px;
`;

export const SectionTitleContainer = styled(Row)<ColorProps>`
  background-color: #ecedf1;
  padding: 8px 25px 8px;
  margin: 2px 0;
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

type SectionActionButton = {
  padding?: string;
};

export const SectionActionButton = styled('button')<SectionActionButton>`
  display: flex;
  border: none;
  background-color: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #1976d2;
  padding: ${props => (props.padding ? props.padding : '0 6px')};
  font-family: 'Open Sans';
  cursor: pointer;
  white-space: nowrap;
  align-items: center;

  :focus {
    outline: auto;
    outline-color: black;
  }
`;
SectionActionButton.displayName = 'SectionActionButton';

type CollapseProps = {
  expanded: boolean;
};

export const SectionCollapse = styled(
  ({ expanded, ...rest }: CollapseProps & { timeout?: TransitionProps['timeout'] | 'auto'; children?: any }) => (
    <Collapse in={expanded} {...rest} />
  ),
)<CollapseProps>`
  visibility: ${props => (props.expanded ? 'visible' : 'collapse')};
`;
SectionCollapse.displayName = 'SectionCollapse';

const BoldDetailFont = styled(FontOpenSans)`
  font-size: 12px;
  font-weight: 700;
  line-height: 14px;
`;

export const BackText = styled(BoldDetailFont)`
  margin-left: 15px;
  font-weight: 600;
`;

export const ContactAddedFont = styled(FontOpenSans)`
  font-style: italic;
  font-size: 12px;
  line-height: 30px;
  opacity: 67%;
`;
ContactAddedFont.displayName = 'ContactAddedFont';

// eslint-disable-next-line import/no-unused-modules
export const sectionTitleFontStyle = `
  font-size: 12px;
  font-weight: 600;
  line-height: 13px;
`;
export const SectionTitleText = styled(FontOpenSans)`
  margin-right: auto;
  color: #192b33;
  ${sectionTitleFontStyle}
`;
SectionTitleText.displayName = 'SectionTitleText';

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
  line-height: 18px;
  ${props => props.notBold && 'font-weight: 500'};
`;

// SearchResults styles
const containerLeftRightMargin = '5px';

export const ResultsHeader = styled('div')`
  display: flex;
  padding: 32px 20px 60px 20px;
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
  box-shadow: none;
  background-color: #ffffff;
  flex-basis: 0;
  flex-grow: 1;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 0;
  padding-right: 0;
  margin: 2px 5px 0 5px;
`;

export const ScrollableList = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

export const StyledFormControlLabel = styled(FormControlLabel)`
  margin-left: 0px !important;
  margin-right: 0px !important;
`;
StyledFormControlLabel.displayName = 'StyledFormControlLabel';

export const StyledCount = styled('p')`
  font-weight: 600;
`;
StyledCount.displayName = 'StyledCount';

export const StyledResultsHeader = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 600px;
`;

StyledResultsHeader.displayName = 'StyledCaseResultsHeader';

export const StyledSwitch = withStyles({
  thumb: {
    color: '#000',
  },
})(Switch);
StyledSwitch.displayName = 'StyledSwitch';

export const SwitchLabel = styled(SummaryText)`
  margin-right: 5px;
`;
SwitchLabel.displayName = 'SwitchLabel';

export const StandaloneSearchContainer = styled(TabbedFormsContainer)`
  max-width: 800px;
  width: 100%;
  background-color: ${HrmTheme.colors.base2};
`;
StandaloneSearchContainer.displayName = 'StandaloneSearchContainer';

export const PreviewActionButton = styled(StyledNextStepButton)`
  padding: 5px 17px 5px 12px;
`;
PreviewActionButton.displayName = 'PreviewActionButton';

export const SearchResultWarningContainer = styled('div')`
  width: 597px;
  height: auto;
  top: 143px;
  left: 744px;
  margin-top: 30px;
  background-color: #fffeef;
  padding-left: 20px;
  padding-right: 30px;
  padding-bottom: 20px;
  border: 1px solid #ffc811;
  border-radius: 5px;
`;
SearchResultWarningContainer.displayName = 'SearchResultWarningContainer';

type TextProps = {
  margin?: string;
  padding?: string;
  fontWeight?: string;
  decoration?: string;
  color?: string;
  cursor?: string;
  onClick?: () => void;
};

export const NoResultTextLink = styled('button')<TextProps>`
  align-items: center;
  color: ${({ color }) => color};
  font-weight: ${({ fontWeight }) => fontWeight};
  padding-top: ${({ padding }) => (padding ? padding : '17px')};
  margin-left: ${({ margin }) => (margin ? margin : '5px')};
  text-decoration: ${({ decoration }) => decoration};
  cursor: ${({ cursor }) => cursor};
  background: none;
  border: none;
`;
NoResultTextLink.displayName = 'Text';

export const Text = styled('span')<TextProps>`
  align-items: center;
  color: ${({ color }) => color};
  font-weight: ${({ fontWeight }) => fontWeight};
  padding-top: ${({ padding }) => (padding ? padding : '17px')};
  margin-left: ${({ margin }) => (margin ? margin : '5px')};
  text-decoration: ${({ decoration }) => decoration};
  cursor: ${({ cursor }) => cursor};
`;
Text.displayName = 'Text';
