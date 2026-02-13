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

export const containerStyles: BoxStyleProps = {
  border: 'none',
  backgroundColor: 'colorBackgroundPrimary',
  display: 'flex',
  height: 'sizeIcon90',
  width: 'sizeIcon90',
  fontSize: 'fontSize50',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'borderRadiusCircle',
  color: 'colorTextWeakest',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  outline: '0px',
  padding: 'space0',
  _hover: {
    backgroundColor: 'colorBackgroundPrimaryStronger',
  },
  _focusVisible: {
    backgroundColor: 'colorBackgroundPrimaryStronger',
    boxShadow: 'shadowFocus',
  },
};
