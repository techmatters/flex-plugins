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
const ImageIcon: React.FC<Props> = ({ width, height }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 48 48">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path d="M15 15h18a2 2 0 012 2v14a2 2 0 01-2 2H15a2 2 0 01-2-2V17a2 2 0 012-2z" fill="#8891AA" />
        <path d="M15 16a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V17a1 1 0 00-1-1H15z" fill="#FFF" />
        <path d="M27 23l5 7H16l3.5-4 2.949 3.371L27 23zm-8.5-4a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="#8891AA" />
      </g>
    </svg>
  );
};

ImageIcon.displayName = 'ImageIcon';
export default ImageIcon;
