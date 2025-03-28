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
import type { LayoutValue } from 'hrm-form-definitions';
import { parse, parseISO } from 'date-fns';

import { getTemplateStrings } from '../../hrmConfig';
import { formatFileNameAtAws } from '../../utils';

/**
 * Formats a form value based on its layout definition as a simple string
 * @param value
 * @param layout
 * @param allFormValues
 */
const formatFormValue = (
  value: string | number | boolean,
  layout?: LayoutValue,
  allFormValues?: Record<string, string | boolean | number>,
) => {
  const strings = getTemplateStrings();
  if (layout && typeof value === 'string') {
    switch (layout.format) {
      case 'date': {
        return parse(value as string, 'yyyy-MM-dd', new Date()).toLocaleDateString(navigator.language);
      }
      case 'timestamp': {
        return parseISO(value).toLocaleString(navigator.language);
      }
      case 'file': {
        return formatFileNameAtAws(value);
      }
      default: {
        if (layout.valueTemplateCode && allFormValues && strings[layout.valueTemplateCode]) {
          return Handlebars.compile(strings[layout.valueTemplateCode])(allFormValues);
        }
        return value;
      }
    }
  }
  return value;
};

export default formatFormValue;
