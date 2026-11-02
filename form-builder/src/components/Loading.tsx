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
 * What's being loaded, with a spinner so it's clear something is happening. `inline` for a
 * small one next to a field, otherwise it stands on its own (e.g. where a list will be).
 */
export const Loading = ({ text, inline = false }: { text: string; inline?: boolean }) => (
  <div className={`loading${inline ? ' loading-inline' : ''}`} role="status">
    <span className="loading-spinner" aria-hidden />
    <span>{text}</span>
  </div>
);
