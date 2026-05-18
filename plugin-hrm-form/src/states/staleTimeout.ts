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

export const STALE_CONTACT_CASE_MINUTES = 120;

export const isStale = (lastReferencedDate: Date): boolean => {
  const diffMs = Date.now() - lastReferencedDate.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes > STALE_CONTACT_CASE_MINUTES;
};

/**
 * Returns true if the value contains any meaningful data.
 * - null and undefined are considered empty
 * - Primitive values (including falsy primitives like `false`, `0`, empty string `''`) are considered non-empty
 * - Empty arrays and arrays containing only empty values are considered empty
 * - Empty objects and objects containing only empty values are considered empty
 */
export const hasNonEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value !== 'object') return true;
  if (Array.isArray(value)) return value.some(v => hasNonEmptyValue(v));
  return Object.values(value as object).some(v => hasNonEmptyValue(v));
};
