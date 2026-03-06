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

import { FontOpenSans } from '../../../../styles/typography';
import { Column } from '../../../../styles/layout';
import { FORM_INPUT_DEFAULT_WITH } from '../styles';
import ExpandableTextBlock, { ExpandableTextBlockProps } from '../../../ExpandableTextBlock';

export const BACKROUND_COLOR = '#fffeef';
export const FieldInputDescriptionContainer = styled(Column)`
  background-color: ${BACKROUND_COLOR};
  width: ${FORM_INPUT_DEFAULT_WITH}px;
  padding: 16px;
  margin: 24px 0 8px 0;
`;

export const FieldInputDescriptionText = styled(FontOpenSans)`
  color: #192b33;
  font-size: 13px;
  font-style: normal;
`;

export const FieldInputDescriptionTitle = styled(FieldInputDescriptionText)`
  font-weight: 700;
`;

export const FieldInputDescriptionExpandableText = styled(ExpandableTextBlock)<ExpandableTextBlockProps>``;
