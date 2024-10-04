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

export type BannerContainerProps = {
  color: 'blue' | 'orange' | 'yellow';
};

export const colors = {
  background: {
    blue: '#ebf4ff',
    orange: '#fef5ee',
    yellow: '#fefad3',
  },
  border: {
    blue: '#0263e0',
    orange: '#ffb37a',
    yellow: '#fed44b',
  },
};

export const BannerContainer = styled('div')<BannerContainerProps>`
  display: flex;
  width: 100%;
  height: 54px;
  background-color: ${({ color }) => colors.background[color]};
  align-items: center;
  padding-left: 20px;
  padding-right: 30px;
  border-bottom: 2px solid ${({ color }) => colors.border[color]};
`;

BannerContainer.displayName = 'BannerContainer';

export const BannerText = styled('span')`
  color: #282a2b;
  font-weight: 700;
  margin-left: 8px;
  margin-right: 1ch;
`;

BannerText.displayName = 'BannerText';

type ButtonProps = {
  onClick: () => void;
  color?: string;
  permission?: string;
  alignRight?: boolean;
};

export const CaseLink = styled('button')<ButtonProps>`
  color: ${({ color }) => (color ? color : '#0263e0')};
  font-size: 14px;
  background: none;
  border: none;
  cursor: ${({ permission }) => (permission ? 'default' : 'pointer')};
  font-family: Open Sans;
`;

CaseLink.displayName = 'CaseLink';

export const BannerAction = styled('button')<ButtonProps>`
  color: ${({ color }) => (color ? color : '#0263e0')};
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  align-items: ${({ alignRight }) => (alignRight ? 'flex-end' : 'none')};
`;

BannerAction.displayName = 'BannerAction';
