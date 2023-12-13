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

// The JS set doesn't serialize to JSON, so we need to use a plain object instead if we want to keep it in redux state, now we store it in localStorage

export type SerializableSet = Record<string, true>;

export const has = (set: SerializableSet, key: string): boolean => Boolean(set[key]);

export const add = (set: SerializableSet, key: string): SerializableSet => {
  set[key] = true;
  return set;
};

export const remove = (set: SerializableSet, key: string): boolean => {
  if (!has(set, key)) {
    return false;
  }
  delete set[key];
  return true;
};

export const size = (set: SerializableSet): number => Object.keys(set).length;
