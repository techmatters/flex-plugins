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

import React from 'react';

type Props = {
  width: string;
  height: string;
};

/* eslint-disable react/prop-types */
const AudioIcon: React.FC<Props> = ({ width, height }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 18.5a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-13a.5.5 0 01.5-.5h9.88a.5.5 0 01.35.15l3.12 3.12a.5.5 0 01.15.35v9.88zM4 5.5A1.5 1.5 0 015.5 4h9.88a1.5 1.5 0 011.06.44l3.12 3.12A1.5 1.5 0 0120 8.62v9.88a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5v-13zm7.81 2.77a.72.72 0 01.76-.14c.3.12.43.4.43.66v6.98a.7.7 0 01-.43.65.72.72 0 01-.76-.14L9.25 14H8.11c-.34 0-.62-.17-.8-.38a1.22 1.22 0 01-.31-.8V11.6c0-.68.57-1.05 1.11-1.05h1.14l2.56-2.28zM12 9.44l-2.22 1.98a.5.5 0 01-.34.13H8.11c-.06 0-.1.02-.1.03H8a.08.08 0 000 .02v1.23c0 .04.02.1.06.13a.15.15 0 00.04.04h1.34a.5.5 0 01.33.13L12 15.11V9.44zm3.1.77a.5.5 0 01.7-.11c.67.49 1.06 1.17 1.06 1.9s-.4 1.41-1.07 1.9a.5.5 0 01-.58-.8c.46-.35.65-.75.65-1.1 0-.35-.18-.75-.65-1.1a.5.5 0 01-.11-.7z"
      />
    </svg>
  );
};

AudioIcon.displayName = 'AudioIcon';
export default AudioIcon;
