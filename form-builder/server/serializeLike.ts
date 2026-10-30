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
 * JSON in the same style as the file it replaces (byte order mark, indentation, line endings
 * and final newline), so the diff only shows real changes. New files get 2-space JSON, which
 * most files use.
 */
export const serializeLike = (value: unknown, existingText?: string) => {
  const indent = existingText?.match(/^﻿?[{[]\r?\n([ \t]+)/)?.[1] ?? '  ';
  const finalNewline = existingText === undefined || existingText.endsWith('\n');
  const bom = existingText?.startsWith('﻿') ? '﻿' : '';
  const text = `${bom}${JSON.stringify(value, null, indent)}${finalNewline ? '\n' : ''}`;
  return existingText?.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text;
};
