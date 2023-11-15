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
import { withStyles, Select } from '@material-ui/core';
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

type EditButtonProps = {
  onClick: () => void;
};

// eslint-disable-next-line import/no-unused-modules
export const EditButton = styled(props => <Button roundCorners={false} {...props} />)<EditButtonProps>`
  color: ${HrmTheme.colors.categoryTextColor};
  text-align: right;
  background-color: #ecedf1;
  height: 28px;
  border-radius: 4px;
  letter-spacing: normal;
  font-size: 13px;
  box-shadow: none;
  border: none;

  :focus {
    outline: auto;
  }
`;
EditButton.displayName = 'EditButton';

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
    margin: '5px',
    padding: '0 2px',
    cursor: 'pointer',
  },
})(CloseIcon);
