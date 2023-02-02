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

/* eslint-disable sonarjs/prefer-immediate-return */
import { ConfigurationState } from '../configuration/reducer';
import { SearchAPIContact, SearchUIContact } from '../../types/types';

export const searchAPIContactToSearchUIContact = (
  counselorsHash: ConfigurationState['counselors']['hash'],
  raw: SearchAPIContact[],
): SearchUIContact[] =>
  raw.map(contact => {
    const counselor = counselorsHash[contact.overview.counselor] || 'Unknown';
    const { firstName, lastName } = contact.details.callerInformation ?? {};
    const callerName =
      contact.overview.callType === 'Someone calling about a child' && (firstName || lastName)
        ? `${firstName} ${lastName}`
        : undefined;
    return { ...contact, counselorName: counselor, callerName };
  });
