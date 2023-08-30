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

import ReactHtmlParser from 'react-html-parser';
import DOMPurify from 'dompurify';

/**
 * Adds target="_blank" rel="noopener" to <a> elements
 */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if ('target' in node) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener');
  }
});

export const safeParseHtml = (htmlString: string) =>
  ReactHtmlParser(DOMPurify.sanitize(htmlString, { USE_PROFILES: { html: true } }));
