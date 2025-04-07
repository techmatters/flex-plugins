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

import { dateFilterOptionsInPast, dateFilterOptionsInPastAndFuture, DateFilter } from '../dateFilters';

/**
 * Creates and returns an array of date filters based on the case info filters
 * @param caseInfoFilters Record of case info filters
 * @returns DateFilter[]
 */
export const getInitialDateFilters = (caseInfoFilters?: Record<string, any>): DateFilter[] => {
  const standardFilters = [
    {
      labelKey: 'CaseList-Filters-DateFilter-CreatedAt',
      filterPayloadParameter: 'createdAt',
      options: dateFilterOptionsInPast(),
    },
    {
      labelKey: 'CaseList-Filters-DateFilter-UpdatedAt',
      filterPayloadParameter: 'updatedAt',
      options: dateFilterOptionsInPast(),
    },
  ];

  const customDateFilters: DateFilter[] = [];

  if (caseInfoFilters) {
    Object.keys(caseInfoFilters).forEach(filterName => {
      if (filterName === 'createdAt' || filterName === 'updatedAt') {
        return;
      }

      const filterConfig = caseInfoFilters[filterName];
      if (filterConfig?.type === 'date-input') {
        customDateFilters.push({
          labelKey: filterConfig.label || filterName,
          filterPayloadParameter: filterName,
          options: filterConfig.allowFutureDates
            ? dateFilterOptionsInPastAndFuture(filterConfig.label || filterName)
            : dateFilterOptionsInPast(),
        });
      }
    });
  }

  return [...standardFilters, ...customDateFilters];
};
