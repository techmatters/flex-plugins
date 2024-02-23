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
const WhatsappIcon: React.FC<Props> = ({ width, height, color }) => {
  return (
    <svg width={width} height={height} fill={color} viewBox="0 0 52 52" aria-label="Whatsapp">
      <path
        fill={color}
        stroke="none"
        strokeWidth="1"
        fillRule="evenodd"
        d="M42.985,32.126c-1.846-1.025-3.418-2.053-4.565-2.803c-0.876-0.572-1.509-0.985-1.973-1.218    c-1.297-0.647-2.28-0.19-2.654,0.188c-0.047,0.047-0.089,0.098-0.125,0.152c-1.347,2.021-3.106,3.954-3.621,4.058    c-0.595-0.093-3.38-1.676-6.148-3.981c-2.826-2.355-4.604-4.61-4.865-6.146C20.847,20.51,21.5,19.336,21.5,18    c0-1.377-3.212-7.126-3.793-7.707c-0.583-0.582-1.896-0.673-3.903-0.273c-0.193,0.039-0.371,0.134-0.511,0.273    c-0.243,0.243-5.929,6.04-3.227,13.066c2.966,7.711,10.579,16.674,20.285,18.13c1.103,0.165,2.137,0.247,3.105,0.247    c5.71,0,9.08-2.873,10.029-8.572C43.556,32.747,43.355,32.331,42.985,32.126z M30.648,39.511    c-10.264-1.539-16.729-11.708-18.715-16.87c-1.97-5.12,1.663-9.685,2.575-10.717c0.742-0.126,1.523-0.179,1.849-0.128    c0.681,0.947,3.039,5.402,3.143,6.204c0,0.525-0.171,1.256-2.207,3.293C17.105,21.48,17,21.734,17,22c0,5.236,11.044,12.5,13,12.5    c1.701,0,3.919-2.859,5.182-4.722c0.073,0.003,0.196,0.028,0.371,0.116c0.36,0.181,0.984,0.588,1.773,1.104    c1.042,0.681,2.426,1.585,4.06,2.522C40.644,37.09,38.57,40.701,30.648,39.511z"
      />

      <path
        d="M 26 0 C 11.663 0 0 11.663 0 26 c 0 4.891 1.359 9.639 3.937 13.762 C 2.91 43.36 1.055 50.166 1.035 50.237 c -0.096 0.352 0.007 0.728 0.27 0.981 c 0.263 0.253 0.643 0.343 0.989 0.237 L 12.6 48.285 C 16.637 50.717 21.26 52 26 52 c 14.337 0 26 -11.663 26 -26 S 40.337 0 26 0 Z M 26 50 c -4.519 0 -8.921 -1.263 -12.731 -3.651 c -0.161 -0.101 -0.346 -0.152 -0.531 -0.152 c -0.099 0 -0.198 0.015 -0.294 0.044 l -8.999 2.77 c 0.661 -2.413 1.849 -6.729 2.538 -9.13 c 0.08 -0.278 0.035 -0.578 -0.122 -0.821 C 3.335 35.173 2 30.657 2 26 C 2 12.767 12.767 2 26 2 s 24 10.767 24 24 S 39.233 50 26 50 Z"
        fill={color}
        stroke="none"
        strokeWidth="1"
        fillRule="evenodd"
      />
    </svg>
  );
};

WhatsappIcon.displayName = 'WhatsappIcon';
WhatsappIcon.defaultProps = {
  color: '#1DA1F2',
};
export default WhatsappIcon;
