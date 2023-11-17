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
import { styled, Button } from '@twilio/flex-ui';
import { withStyles, Select, ButtonBase } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { FontOpenSans } from '../../styles/HrmStyles';
import HrmTheme from '../../styles/HrmTheme';

export const DetailsWrapper = styled(FontOpenSans)`
  margin-top: 10px;
  padding: 5px 20px 10px 20px;
  min-width: 400px;
  box-sizing: border-box;
  background-color: #ffffff;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);
  border-radius: 4px;
`;
DetailsWrapper.displayName = 'DetailsWrapper';

export const ProfileSectionWrapper = styled('div')`
  margin: 10px 0;
  padding: 0 0 10px 0;
`;
ProfileSectionWrapper.displayName = 'ProfileSectionWrapper';

export const ProfileSubtitle = styled(FontOpenSans)`
  color: ${HrmTheme.colors.categoryTextColor};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.67px;
  line-height: 12px;
  text-transform: uppercase;
  margin: 15px 0 5px;
`;
ProfileSubtitle.displayName = 'ProfileSubtitle';

type ProfileSectionEditButton = {
  onClick: () => void;
  showButton: boolean;
};

// eslint-disable-next-line import/no-unused-modules
export const ProfileSectionEditButton = styled(Button)<ProfileSectionEditButton>`
  color: ${props => (props.showButton ? HrmTheme.colors.categoryTextColor : 'inherit')};
  background-color: ${props => (props.showButton ? '#ecedf1' : 'transparent')};
  letter-spacing: normal;
  font-size: 14px;
  box-shadow: none;
  border: none;
  margin-left: auto;
  height: ${props => (props.showButton ? '30px' : '50px')};
  width: ${props => (props.showButton ? '40px' : '50px')};
  border-radius: ${props => (props.showButton ? '4px' : '50%')};
  cursor: pointer;

  :focus,
  :active {
    outline: auto;
    box-shadow: none;
    border: none;
    padding: unset;
  }
`;
ProfileSectionEditButton.displayName = 'ProfileSectionEditButton';

type ColorProps = {
  fillColor?: string;
  blocked?: boolean;
};

export const StatusLabelPill = styled('div')<ColorProps>`
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  white-space: nowrap;
  margin: 5px 6px 5px 1px;
  padding: 5px 20px;
  background-color: ${props => (props.fillColor ? `${props.fillColor}` : '#F9FAFB')};
  border: ${props => (props.blocked ? `2px dashed #D61F1F` : '#F9FAFB')};
  color: ${props => (props.blocked ? `#D61F1F` : 'none')};
`;
StatusLabelPill.displayName = 'StatusLabelPill';

export const StyledStatusSelect = styled(Select)`
  background-color: #f9fafb;
  border-radius: 5px;
  &:focus-within {
    outline: 3px solid rgb(0, 95, 204);
    border-radius: 5px;
  }
`;

export const CloseIconButton = withStyles({
  root: {
    width: '23px',
    height: '16px',
    margin: '1px',
    padding: '0 1px',
    cursor: 'pointer',
  },
})(CloseIcon);

type StyledTextProps = {
  hasContent?: boolean;
};
export const SectionContentStyledText = styled('p')<StyledTextProps>`
  font-size: 14px;
  line-height: 15px;
  padding: 5px 0 5px 15px;
  margin: 10px 10px 10px 0;
  height: 50px;
  width: 100%;
  background-color: #f6f6f67d;
  border: none;
  border-radius: 2px;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
  opacity: ${props => (props.hasContent ? 1 : 0.5)};
  :focus {
    outline: none;
  }
`;
SectionContentStyledText.displayName = 'SectionContentStyledText';
