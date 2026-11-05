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

type VariantProps = {
  variant: Variant;
};

export const PopoverContainer = styled('section')<VariantProps>`
  box-sizing: border-box;
  width: 315px;
  padding: 24px 24px 24px 28px;
  background-color: ${({ variant }) => variantBackgroundColors[variant]};
  border: 1px solid #e0e3ea;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  font-family: 'Open Sans';
`;
PopoverContainer.displayName = 'PopoverContainer';

export const PopoverHeader = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
`;
PopoverHeader.displayName = 'PopoverHeader';

export const PopoverTitle = styled('h2')`
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${textColor};
`;
PopoverTitle.displayName = 'PopoverTitle';

export const PopoverContent = styled('div')<VariantProps>`
  margin: 0;
  font-size: 14px;
  font-style: ${({ variant }) => (variant === 'guidance' ? 'italic' : 'normal')};
  color: #000;
  overflow-wrap: break-word;
  max-width: 250px;
  max-height: 160px;
`;
PopoverContent.displayName = 'PopoverContent';
