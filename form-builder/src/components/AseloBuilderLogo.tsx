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
 * The Aselo Builder mark: an "A" drawn as three connected nodes (a tiny flow), on a blue to teal
 * tile. The same drawing is the favicon (public/favicon.svg).
 */
import { useId } from 'react';

export const AseloBuilderMark = ({ size = 28 }: { size?: number }) => {
  // Each mark needs its own gradient id
  const gradient = `aselo-builder-${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f8cff" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradient})`} />
      <path
        d="M9.5 23 L16 9 L22.5 23 M12.4 17.6 H19.6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="9" r="2.7" fill="#ffffff" />
      <circle cx="9.5" cy="23" r="2.7" fill="#ffffff" />
      <circle cx="22.5" cy="23" r="2.7" fill="#ffffff" />
    </svg>
  );
};

// The mark and the name, for the top bar
export const AseloBuilderLogo = () => (
  <span className="aselo-builder-logo">
    <AseloBuilderMark />
    <span className="aselo-builder-name">
      <strong>Aselo</strong> Builder
    </span>
  </span>
);
