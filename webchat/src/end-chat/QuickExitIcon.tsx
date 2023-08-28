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

/* eslint-disable react/jsx-max-depth */
import React from 'react';

// eslint-disable-next-line react/no-multi-comp
const QuickExitIcon = () => {
  return (
    <svg
      width="20px"
      height="20px"
      viewBox="0 -2 20 22"
      version="1.1"
      fontSize="11px"
      xmlns="http://www.w3.org/2000/svg"
      // eslint-disable-next-line react/no-unknown-property
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Exit</title>
      <defs>
        <path
          d="M8.40833333,12.9916667 L9.58333333,14.1666667 L13.75,10 L9.58333333,5.83333333 L8.40833333,7.00833333 L10.5583333,9.16666667 L2.5,9.16666667 L2.5,10.8333333 L10.5583333,10.8333333 L8.40833333,12.9916667 L8.40833333,12.9916667 Z M15.8333333,2.5 L4.16666667,2.5 C3.24166667,2.5 2.5,3.25 2.5,4.16666667 L2.5,7.5 L4.16666667,7.5 L4.16666667,4.16666667 L15.8333333,4.16666667 L15.8333333,15.8333333 L4.16666667,15.8333333 L4.16666667,12.5 L2.5,12.5 L2.5,15.8333333 C2.5,16.75 3.24166667,17.5 4.16666667,17.5 L15.8333333,17.5 C16.75,17.5 17.5,16.75 17.5,15.8333333 L17.5,4.16666667 C17.5,3.25 16.75,2.5 15.8333333,2.5 L15.8333333,2.5 Z"
          id="path-1"
        />
      </defs>
      <g id="final" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="1-final" transform="translate(-1129.000000, -685.000000)">
          <g id="Group" transform="translate(640.000000, 496.000000)">
            <g id="Group-3" transform="translate(-0.000000, 0.000000)">
              <g id="exit_to_app" transform="translate(489.000000, 189.000000)">
                <polygon id="Base" points="0 0 20 0 20 20 0 20" />
                <mask id="mask-2" fill="white">
                  <use xlinkHref="#path-1" />
                </mask>
                <g id="Icon" fillRule="nonzero" />
                <rect
                  id="inner-rect"
                  fill="#FFF"
                  mask="url(#mask-2)"
                  x="4.16669838e-08"
                  y="4.16666048e-08"
                  width="19.9999999"
                  height="19.9999999"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default QuickExitIcon;
