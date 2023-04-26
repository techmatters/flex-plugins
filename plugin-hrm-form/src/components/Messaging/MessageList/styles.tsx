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

import { FontOpenSans } from '../../../styles/HrmStyles';

export const MessageListContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 6px 0;
  width: 100%;
`;
MessageListContainer.displayName = 'MessageListContainer';

export const DateRulerContainer = styled('div')`
  display: flex;
  flex-flow: row nowrap;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
  width: 100%;
`;
DateRulerContainer.displayName = 'DateRulerContainer';

export const DateRulerHr = styled('hr')`
  flex: 1 1 1px;
  margin: auto;
  border-color: rgb(198, 202, 215);
`;
DateRulerHr.displayName = 'DateRulerHr';

export const DateRulerDateText = styled(FontOpenSans)`
  flex: 0 1 auto;
  margin-left: 12px;
  margin-right: 12px;
  font-size: 10px;
  letter-spacing: 2px;
  color: rgb(34, 34, 34);
`;
DateRulerDateText.displayName = 'DateRulerDateText';
