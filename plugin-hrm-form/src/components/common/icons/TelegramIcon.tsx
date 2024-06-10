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
const TelegramIcon: React.FC<Props> = ({ width, height, color }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 612 612" fill={color} aria-label="Telegram" version="1.1">
      <g>
        <path
          style={{ fill: color }}
          d="M0,0v455h455V0H0z M384.814,100.68l-53.458,257.136
 c-1.259,6.071-8.378,8.822-13.401,5.172l-72.975-52.981c-4.43-3.217-10.471-3.046-14.712,0.412l-40.46,32.981
 c-4.695,3.84-11.771,1.7-13.569-4.083l-28.094-90.351l-72.583-27.089c-7.373-2.762-7.436-13.171-0.084-16.003L373.36,90.959
 C379.675,88.517,386.19,94.049,384.814,100.68z"
        />
        <path
          style={{ fill: color }}
          d="M313.567,147.179l-141.854,87.367c-5.437,3.355-7.996,9.921-6.242,16.068
 l15.337,53.891c1.091,3.818,6.631,3.428,7.162-0.517l3.986-29.553c0.753-5.564,3.406-10.693,7.522-14.522l117.069-108.822
 C318.739,149.061,316.115,145.614,313.567,147.179z"
        />
      </g>
    </svg>
  );
};

TelegramIcon.displayName = 'TelegramIcon';
TelegramIcon.defaultProps = {
  color: '#1DA1F2',
};
export default TelegramIcon;
