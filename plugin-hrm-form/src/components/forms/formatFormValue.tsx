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
import type { FormValue } from 'hrm-types';
import type { LayoutValue } from 'hrm-form-definitions';
import { parse, parseISO } from 'date-fns';

import { getTemplateStrings } from '../../hrmConfig';
import { formatDuration, formatFileNameAtAws } from '../../utils';

/**
 * Formats a form value based on its layout definition as a simple string
 * @param rawValue
 * @param layout
 * @param allFormValues
 */
const formatFormValue = (
  rawValue: FormValue,
  layout?: LayoutValue,
  allFormValues?: Record<string, FormValue>,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const strings = getTemplateStrings();
  const value = (Array.isArray(rawValue) ? rawValue.join(', ') : rawValue) ?? '';
  if (layout) {
    switch (layout.format) {
      case 'date': {
        if (typeof value === 'string') {
          return parse(value, 'yyyy-MM-dd', new Date()).toLocaleDateString(navigator.language);
        }
        break;
      }
      case 'timestamp': {
        if (typeof value === 'string') {
          return parseISO(value).toLocaleString(navigator.language);
        }
        break;
      }
      case 'duration-from-seconds': {
        if (typeof value === 'number') {
          return formatDuration(value);
        }
        if (typeof value === 'string') {
          return formatDuration(parseInt(value, 10));
        }
        break;
      }
      case 'file': {
        if (typeof value === 'string') {
          return formatFileNameAtAws(value);
        }
        break;
      }
      default: {
        if (layout.valueTemplateCode && allFormValues && strings[layout.valueTemplateCode]) {
          return Handlebars.compile(strings[layout.valueTemplateCode])(allFormValues);
        }
      }
    }
  }
  return value;
};

export default formatFormValue;
