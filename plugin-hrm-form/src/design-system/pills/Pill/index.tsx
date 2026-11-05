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

import { styled } from '@twilio/flex-ui';

import { textColor, Variant, variantBackgroundColors } from '../../variants';

const borderColors: Record<Variant, string> = {
  default: '#e0e3ea',
  guidance: '#fff1b3',
};

type PillProps = {
  variant?: Variant;
};

/**
 * A short label. Renders a span by default; use `as="button"` for a clickable pill.
 */
export const Pill = styled('span')<PillProps>`
  padding: 4px 8px;
  background-color: ${({ variant = 'default' }) => variantBackgroundColors[variant]};
  border: 1px solid ${({ variant = 'default' }) => borderColors[variant]};
  border-radius: 4px;
  font-family: 'Open Sans';
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  letter-spacing: 0.2px;
  color: ${textColor};
  white-space: nowrap;
`;
Pill.displayName = 'Pill';
