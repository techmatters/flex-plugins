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

export const ValidationType = {
  REQUIRED: 'REQUIRED', // Will not be applied if in the callerInformation tab and callType is not caller.  Will not be applied when callType is standalone.
};
export const FieldType = {
  CALL_TYPE: 'CALL_TYPE',
  CHECKBOX: 'CHECKBOX',
  CHECKBOX_FIELD: 'CHECKBOX_FIELD',
  INTERMEDIATE: 'INTERMEDIATE',
  SELECT_SINGLE: 'SELECT_SINGLE',
  TAB: 'TAB',
  TEXT_BOX: 'TEXT_BOX',
  TEXT_INPUT: 'TEXT_INPUT',
};

export function isNotCategory(value) {
  const notCategory = ['error', 'touched', 'type', 'validation'];
  return notCategory.includes(value);
}

export function isNotSubcategory(value) {
  const notSubcategory = ['type'];
  return notSubcategory.includes(value);
}
