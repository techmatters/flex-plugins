/**
 * Copyright (C) 2021-2026 Technology Matters
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

/**
 * A box for a widget's JSON (a request body, task attributes): once it's been edited and is valid,
 * leaving it lays the JSON out (jsonFormat.ts). Only after an edit, so opening an imported widget
 * and clicking around never changes it.
 */
import { TextareaHTMLAttributes, useRef } from 'react';

import { AutoTextarea } from '../common/AutoTextarea';
import { formatTemplateJson } from './jsonFormat';

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
  value: string;
  onValueChange: (value: string) => void;
  // Whether a text is valid JSON for this box (fieldProblem, taskAttributesProblem)
  isValid: (value: string) => boolean;
  // Grows with its text (AutoTextarea) instead of a fixed number of rows
  autoGrow?: boolean;
  minRows?: number;
};

export const JsonTextarea = ({ value, onValueChange, isValid, autoGrow = false, minRows, onBlur, ...rest }: Props) => {
  const edited = useRef(false);
  const handlers = {
    value,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      edited.current = true;
      onValueChange(e.target.value);
    },
    onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (edited.current) {
        edited.current = false;
        const text = e.currentTarget.value;
        const formatted = isValid(text) ? formatTemplateJson(text) : undefined;
        if (formatted !== undefined && formatted !== text && isValid(formatted)) onValueChange(formatted);
      }
      onBlur?.(e);
    },
  };
  // eslint-disable-next-line react/jsx-props-no-spreading -- forwards the textarea's props
  return autoGrow ? <AutoTextarea {...rest} minRows={minRows} {...handlers} /> : <textarea {...rest} {...handlers} />;
};
