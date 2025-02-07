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

import { LayoutValue } from 'hrm-form-definitions';
import { parse } from 'date-fns';

/**
 * Given a displayValue spec for a certain form field and a value (current state of such field),
 * formats the value accordingly. E.g. from a date string, creates a date object without the locale timezone offset difference
 */
export const formatValue = (displayValue: LayoutValue) => (value: string | number | boolean) => {
  if (displayValue && displayValue.format === 'date' && typeof value === 'string') {
    return parse(value, 'yyyy-MM-dd', new Date()).toLocaleDateString(navigator.language);
  }
  return value;
};
