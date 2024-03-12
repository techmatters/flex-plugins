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

import { isNullOrUndefined } from '../utils';

export function getQueryParams({
  limit,
  offset,
  sortBy = undefined,
  sortDirection = undefined,
  helpline = undefined,
}): string {
  const hasLimit = !isNullOrUndefined(limit);
  const hasOffset = !isNullOrUndefined(offset);
  const hasSortBy = !isNullOrUndefined(sortBy);
  const hasSortDirection = !isNullOrUndefined(sortDirection);
  const hasHelpline = !isNullOrUndefined(helpline);

  const appendLimit = hasLimit ? `limit=${limit}` : '';
  const appendOffset = hasOffset ? `offset=${offset}` : '';
  const appendSortBy = hasSortBy ? `sortBy=${sortBy}` : '';
  const appendSortDirection = hasSortDirection ? `sortDirection=${sortDirection}` : '';
  const appendHelpline = hasHelpline ? `helpline=${helpline}` : '';
  return `?${[appendLimit, appendOffset, appendSortBy, appendSortDirection, appendHelpline, 'onlyEssentialData=true']
    .filter(e => e)
    .join('&')}`;
}
