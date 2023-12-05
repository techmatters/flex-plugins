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

import { endOfDay, formatISO, startOfDay } from 'date-fns';

export enum DateExistsCondition {
  MUST_EXIST = 'MUST_EXIST',
  MUST_NOT_EXIST = 'MUST_NOT_EXIST',
}

type RangeDateFilterValue = {
  option: string;
  from?: Date;
  to?: Date;
};

type ExistsDateFilterValue = {
  option: string;
  exists: DateExistsCondition;
};

export type DateFilterValue = RangeDateFilterValue | ExistsDateFilterValue;
export const isExistsDateFilterValue = (filterValue: DateFilterValue): filterValue is ExistsDateFilterValue =>
  Boolean((filterValue as ExistsDateFilterValue)?.exists);
/**
 * Creates the date filters sub section of the search endpoint POST payload from a list of DateFilter objects
 * @param filters - the input date filters used to build the payload
 */
export const dateFilterPayloadFromFilters = (filters: Record<string, DateFilterValue>) => {
  if (!filters) return {};
  const entries = Object.entries(filters)
    .filter(([, filter]) => filter)
    .map(([key, filter]) => {
      let filterPayload: { from?: string; to?: string; exists: DateExistsCondition };
      if (isExistsDateFilterValue(filter)) {
        filterPayload = {
          exists: filter.exists,
        };
      } else {
        filterPayload = {
          from: filter.from ? formatISO(startOfDay(filter.from)) : undefined,
          to: filter.to ? formatISO(endOfDay(filter.to)) : undefined,
          exists: DateExistsCondition.MUST_EXIST,
        };
      }
      return [key, filterPayload];
    });
  return Object.fromEntries(entries);
};
