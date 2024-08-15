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
const UnsupportedFileIcon: React.FC<Props> = ({ width, height }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 48 48" className="Twilio-Icon-Content">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path d="M21 13h10a2 2 0 012 2v18a2 2 0 01-2 2H17a2 2 0 01-2-2V19l6-6z" fill="currentColor" />
        <path d="M21.5 14L16 19.5V33a1 1 0 001 1h14a1 1 0 001-1V15a1 1 0 00-1-1h-9.5z" fill="#FFF" />
        <path
          d="M21.5 29a.5.5 0 110 1h-2a.5.5 0 110-1h2zm5-2a.5.5 0 110 1h-7a.5.5 0 110-1h7zm-1-2a.5.5 0 110 1h-6a.5.5 0 110-1h6zm3-2a.5.5 0 110 1h-9a.5.5 0 110-1h9zm0-2a.5.5 0 110 1h-3a.5.5 0 110-1h3zm0-2a.5.5 0 110 1h-3a.5.5 0 110-1h3zM22 13v7h-7v-1h6v-6z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
};

UnsupportedFileIcon.displayName = 'UnsupportedFileIcon';
export default UnsupportedFileIcon;
