/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { BoxStyleProps } from '@twilio-paste/core/box';
import { TextStyleProps } from '@twilio-paste/core/text';

export const outerContainerStyles: BoxStyleProps = {
  position: 'relative',
};

export const getContainerStyles = (isBubble: boolean, disabled?: boolean): BoxStyleProps => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  height: 'fit-content',
  width: '100%',
  alignItems: 'center',
  paddingTop: 'space30',
  paddingBottom: 'space30',
  paddingLeft: 'space30',
  paddingRight: isBubble ? 'space30' : 'space120',
  marginTop: 'space30',
  marginBottom: 'space30',
  borderColor: 'colorBorderWeak',
  borderWidth: 'borderWidth10',
  borderStyle: 'solid',
  borderRadius: 'borderRadius20',
  background: 'inherit',
  color: 'inherit',
  _hover: disabled ? {} : { cursor: 'pointer', borderColor: 'inherit' },
  _focusVisible: disabled ? {} : { boxShadow: 'shadowFocus', borderColor: 'transparent', outline: 'none' },
});

export const fileIconContainerStyles: BoxStyleProps = {
  paddingLeft: 'space20',
  paddingRight: 'space50',
};

export const actionIconContainerStyles: BoxStyleProps = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  top: '0px',
  bottom: '0px',
  right: '0px',
  margin: 'space50',
  marginRight: 'space40',
  color: 'colorTextWeaker',
  _hover: {
    color: 'inherit',
  },
};

export const fileDescriptionContainerStyles: BoxStyleProps = {
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  textAlign: 'left',
};

export const fileNameStyles: TextStyleProps = {
  color: 'inherit',
  fontWeight: 'fontWeightBold',
  fontSize: 'fontSize20',
  lineHeight: 'lineHeight10',
};

export const fileSizeStyles: TextStyleProps = {
  color: 'inherit',
  fontSize: 'fontSize10',
  lineHeight: 'lineHeight10',
};
