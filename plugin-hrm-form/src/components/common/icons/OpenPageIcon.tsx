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
  color: string;
};

/* eslint-disable react/prop-types */
const OpenPageIcon: React.FC<Props> = ({ width, height, color }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M170.65984 42.65984l298.65984 0q17.67424 0 30.16704 12.4928t12.4928 30.16704-12.4928 30.16704-30.16704 12.4928l-298.65984 0q-17.67424 0-30.16704 12.4928t-12.4928 30.16704l0 682.65984q0 17.67424 12.4928 30.16704t30.16704 12.4928l682.65984 0q17.67424 0 30.16704-12.4928t12.4928-30.16704l0-298.65984q0-17.67424 12.4928-30.16704t30.16704-12.4928 30.16704 12.4928 12.4928 30.16704l0 298.65984q0 53.00224-37.49888 90.50112t-90.50112 37.49888l-682.65984 0q-53.00224 0-90.50112-37.49888t-37.49888-90.50112l0-682.65984q0-53.00224 37.49888-90.50112t90.50112-37.49888zM682.65984 42.65984l256 0q17.67424 0 30.16704 12.4928t12.4928 30.16704l0 256q0 17.67424-12.4928 30.16704t-30.16704 12.4928-30.16704-12.4928-12.4928-30.16704l0-153.00608-353.9968 353.9968q-12.32896 12.32896-30.0032 12.32896-18.3296 0-30.49472-12.16512t-12.16512-30.49472q0-17.67424 12.32896-30.0032l353.9968-353.9968-153.00608 0q-17.67424 0-30.16704-12.4928t-12.4928-30.16704 12.4928-30.16704 30.16704-12.4928z"
        fill={color}
      />
    </svg>
  );
};

OpenPageIcon.displayName = 'OpenPageIcon';
export default OpenPageIcon;
