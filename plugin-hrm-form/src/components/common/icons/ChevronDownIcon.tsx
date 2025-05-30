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

/* eslint-disable react/prop-types */
import React from 'react';

/* eslint-disable react/prop-types */
const ChevronDownIcon: React.FC = () => {
  return (
    <svg
      role="img"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 20 20"
      aria-labelledby="ChevronDownIcon-1"
    >
      <title id="ChevronDownIcon-1">Expand user control menu</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6.293 8.293a1 1 0 011.32-.083l.094.083L10 10.585l2.293-2.292a1 1 0 011.32-.083l.094.083a1 1 0 01.083 1.32l-.083.094-3 3a1 1 0 01-1.32.083l-.094-.083-3-3a1 1 0 010-1.414z"
      />
    </svg>
  );
};

ChevronDownIcon.displayName = 'ChevronDownIcon';
export default ChevronDownIcon;
