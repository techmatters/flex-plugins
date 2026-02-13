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
import { keyframes } from '@emotion/core';

const popIn = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.9);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
`;

export const containerStyles: BoxStyleProps = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
};

export const dropAreaStyles: BoxStyleProps = {
  position: 'absolute',
  zIndex: 'zIndex10',
  top: 'space30',
  left: 'space30',
  bottom: 'space30',
  right: 'space30',
  backgroundColor: 'colorBackgroundBody',
  opacity: 0.96,
  borderColor: 'colorBorderPrimary',
  borderWidth: 'borderWidth20',
  borderStyle: 'dashed',
  borderRadius: 'borderRadius30',
  display: 'flex',
  flexDirection: 'column',
  alignContent: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  pointerEvents: 'none',
  animation: `${popIn} 0.1s forwards`,
};

export const attachIconContainerStyles: BoxStyleProps = {
  marginLeft: 'auto',
  marginRight: 'auto',
  color: 'colorTextLink',
};

export const attachTitleStyles: TextStyleProps = {
  fontSize: 'fontSize40',
  fontWeight: 'fontWeightBold',
  lineHeight: 'lineHeight40',
  color: 'colorText',
};
