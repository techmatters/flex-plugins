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

import ExpandableTextBlock, { ExpandableTextBlockProps } from './ExpandableTextBlock';

export const PreviewDescription = styled(ExpandableTextBlock)<ExpandableTextBlockProps>`
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  color: #000000;
  font-family: Open Sans, serif;
  text-align: left;
  padding-top: 5px;
  width: 100%;
`;

PreviewDescription.displayName = 'PreviewDescription';
