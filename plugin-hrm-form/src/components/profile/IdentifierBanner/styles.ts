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
import { withStyles, ButtonBase } from '@material-ui/core';

export const YellowBannerContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;
  background-color: #fdfad3;
  font-size: 13px;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5px;
  font-family: 'Open Sans', sans-serif;
`;
YellowBannerContainer.displayName = 'YellowBannerContainer';

export const IdentifierContainer = styled('div')`
  display: inline-flex;
  align-items: center;
  margin: 0 2px;
`;
IdentifierContainer.displayName = 'IdentifierContainer';

export const IconContainer = styled('div')`
  display: inline-flex;
  margin: '2px';
`;
IconContainer.displayName = 'IconContainer';

export const BannerLink = withStyles({
  root: {
    fontSize: '13px',
    padding: '0 0 2px 3px',
    textDecoration: 'underline',
    color: '#1874e1',
    whiteSpace: 'nowrap',
  },
})(ButtonBase);
BannerLink.displayName = 'BannerLink';
