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

import { BottomButtonBar, Flex, FontOpenSans, ChipBase, Row, StyledNextStepButton } from '../../styles';
import HrmTheme from '../../styles/HrmTheme';
import { BannerContainerProps, colors } from '../../styles/banners';

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

type ColorProps = {
  color?: string;
};

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

export const ResultsSubheader = styled('div')`
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

export const StyledFormControlLabel = styled(FormControlLabel)`
  margin-left: 0px !important;
  margin-right: 0px !important;
`;
StyledFormControlLabel.displayName = 'StyledFormControlLabel';

export const StyledResultsHeader = styled('div')`
  display: flex;
  flex-flow: column;
  padding: 0 20px;
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

export const PreviewActionButton = styled(StyledNextStepButton)`
  padding: 5px 17px 5px 12px;
`;
PreviewActionButton.displayName = 'PreviewActionButton';

export const SearchResultWarningContainer = styled('div')`
  width: 100%;
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
