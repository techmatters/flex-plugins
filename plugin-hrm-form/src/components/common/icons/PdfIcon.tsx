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
const PdfIcon: React.FC<Props> = ({ width, height }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 48 48">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path d="M21 13h10a2 2 0 012 2v18a2 2 0 01-2 2H17a2 2 0 01-2-2V19l6-6z" fill="#EA1010" />
        <path d="M21.5 14L16 19.5V33a1 1 0 001 1h14a1 1 0 001-1V15a1 1 0 00-1-1h-9.5z" fill="#FFF" />
        <path
          d="M23.495 21c.709-.006.927.538.95 1.481.024.943-.477 2.448-.477 2.448.413.913 1.546 2.092 1.546 2.092s.372-.097 1.89-.133c1.523-.036 1.588.84 1.594.913.006.072.065.767-1.146.816-1.1.044-2.234-1.021-2.431-1.215l-.03-.03s-.52.084-.945.187c-.425.103-1.8.49-1.8.49s-.408.755-1.306 1.964c-.903 1.21-1.907 1.119-2.196.72-.33-.466-.07-.931.561-1.536.632-.604 2.096-1.106 2.096-1.106s.295-.544.726-1.584c.437-1.04.762-2.08.762-2.08s-.431-.997-.514-1.843c-.089-.943.012-1.578.72-1.584zm.313 4.37s-.319.968-.626 1.675l-.307.707c.06-.03.436-.213 1.134-.386.756-.194 1.075-.218 1.075-.218s-.85-.961-1.276-1.777zM22 13v7h-7v-1h6v-6z"
          fill="#EA1010"
        />
      </g>
    </svg>
  );
};

PdfIcon.displayName = 'PdfIcon';
export default PdfIcon;
