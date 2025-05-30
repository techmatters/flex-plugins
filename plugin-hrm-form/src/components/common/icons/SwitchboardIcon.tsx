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

type Props = {
  width: string;
  height: string;
};

const SwitchboardIcon: React.FC<Props> = ({ width, height }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.74967 10.7186H6.66634V8.24493H8.74967V6.18353H11.2497V8.24493H13.333V10.7186H11.2497V12.78H8.74967V10.7186ZM9.99967 1.64844L3.33301 4.12212V9.1437C3.33301 13.3077 6.17467 17.1914 9.99967 18.1397C13.8247 17.1914 16.6663 13.3077 16.6663 9.1437V4.12212L9.99967 1.64844ZM14.9997 9.1437C14.9997 12.4419 12.8747 15.4928 9.99967 16.4246C7.12467 15.4928 4.99967 12.4502 4.99967 9.1437V5.26826L9.99967 3.413L14.9997 5.26826V9.1437Z"
        fill="black"
      />
    </svg>
  );
};

SwitchboardIcon.displayName = 'SwitchboardIcon';

export default SwitchboardIcon;
