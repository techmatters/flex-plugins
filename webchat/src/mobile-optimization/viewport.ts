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

/**
 * In order for the widget to look/behave well on mobile devices (screen size smaller than 980px),
 * the page's viewport needs to be configured appropriately.
 */
const REQUIRED_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=yes';

export function updateViewport() {
  let viewportMeta = document?.querySelector('meta[name="viewport"]');

  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    document.head.appendChild(viewportMeta);
  }

  const previousViewportContent = viewportMeta.getAttribute('content');
  const updatedViewportContent = [previousViewportContent, REQUIRED_VIEWPORT_CONTENT].join(', ');
  viewportMeta.setAttribute('content', updatedViewportContent);
}
