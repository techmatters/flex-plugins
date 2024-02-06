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
  color?: string;
};
/* eslint-disable react/prop-types */
const CallIcon: React.FC<Props> = ({ width, height, color }) => {
  return (
    <svg width={width} height={height} fill={color} viewBox="0 0 202 202" aria-label="Voice Call">
      <path
        fill={color}
        stroke="none"
        strokeWidth="1"
        fillRule="evenodd"
        d="M 198.048 160.105 l -31.286 -31.29 c -6.231 -6.206 -16.552 -6.016 -23.001 0.433 l -15.761 15.761 c -0.995 -0.551 -2.026 -1.124 -3.11 -1.732 c -9.953 -5.515 -23.577 -13.074 -37.914 -27.421 C 72.599 101.48 65.03 87.834 59.5 77.874 c -0.587 -1.056 -1.145 -2.072 -1.696 -3.038 l 10.579 -10.565 l 5.2 -5.207 c 6.46 -6.46 6.639 -16.778 0.419 -23.001 L 42.715 4.769 c -6.216 -6.216 -16.541 -6.027 -23.001 0.433 l -8.818 8.868 l 0.243 0.24 c -2.956 3.772 -5.429 8.124 -7.265 12.816 c -1.696 4.466 -2.752 8.729 -3.235 12.998 c -4.13 34.25 11.52 65.55 53.994 108.028 c 58.711 58.707 106.027 54.273 108.067 54.055 c 4.449 -0.53 8.707 -1.593 13.038 -3.275 c 4.652 -1.818 9.001 -4.284 12.769 -7.233 l 0.193 0.168 l 8.933 -8.747 C 204.079 176.661 204.265 166.343 198.048 160.105 Z M 190.683 176.164 l -3.937 3.93 l -1.568 1.507 c -2.469 2.387 -6.743 5.74 -12.984 8.181 c -3.543 1.364 -7.036 2.24 -10.59 2.663 c -0.447 0.043 -44.95 3.84 -100.029 -51.235 C 14.743 94.38 7.238 67.395 10.384 41.259 c 0.394 -3.464 1.263 -6.95 2.652 -10.593 c 2.462 -6.277 5.812 -10.547 8.181 -13.02 l 5.443 -5.497 c 2.623 -2.63 6.714 -2.831 9.112 -0.433 l 31.286 31.286 c 2.394 2.401 2.205 6.492 -0.422 9.13 L 45.507 73.24 l 1.95 3.282 c 1.084 1.829 2.23 3.879 3.454 6.106 c 5.812 10.482 13.764 24.83 29.121 40.173 c 15.317 15.325 29.644 23.27 40.094 29.067 c 2.258 1.249 4.32 2.398 6.17 3.5 l 3.289 1.95 l 21.115 -21.122 c 2.634 -2.623 6.739 -2.817 9.137 -0.426 l 31.272 31.279 C 193.5 169.446 193.31 173.537 190.683 176.164 Z"
      />
    </svg>
  );
};

CallIcon.displayName = 'CallIcon';
CallIcon.defaultProps = {
  color: '#1DA1F2',
};
export default CallIcon;
