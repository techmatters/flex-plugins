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
 * A textarea as tall as its text: it grows (and shrinks) as the paragraph is typed or changed.
 */
import { TextareaHTMLAttributes, useLayoutEffect, useRef } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string; minRows?: number };

export const AutoTextarea = ({ value, minRows = 1, ...rest }: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    // scrollHeight is 0 where there's no layout (tests): rows keep it readable there
    if (textarea.scrollHeight > 0) textarea.style.height = `${textarea.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      rows={Math.max(minRows, value.split('\n').length)}
      style={{ resize: 'none', overflow: 'hidden' }}
      {...rest}
    />
  );
};
