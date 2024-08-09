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
import { FilterOption } from './types';

// Temporary until we pull these options from the DB - we could pull them from S3 but not worth it for a temp workaround

// Deduplicate based on value and sort by label
const dedupAndSort = (arr: FilterOption[]) => {
  const mapped = arr.reduce((optionMap: Record<string, FilterOption>, option: FilterOption) => {
    optionMap[option.value] = option;
    return optionMap;
  }, {});
  const deduped = Object.values(mapped);
  return deduped.sort((a, b) => a.label.localeCompare(b.label));
};

export const provinceOptions = dedupAndSort([]);

export const regionOptions = dedupAndSort([]);

export const cityOptions = dedupAndSort([]);
