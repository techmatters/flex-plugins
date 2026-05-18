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
  color?: string;
};

const GenerateSummaryIcon: React.FC<Props> = ({ width, height, color }) => {
  return (
    <svg
      width={width}
      height={height}
      fill={color}
      role="img"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      aria-labelledby="ArtificialIntelligenceIcon-:r1g:"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.699 2.447c-.01 2.674-1.297 3.917-3.962 3.955-.595.008-.588.899.007.898 2.735-.004 3.928 1.287 3.955 3.957.005.58.868.598.897.017.135-2.699 1.396-3.984 3.953-3.974.594.002.605-.885.012-.898-2.739-.062-3.974-1.345-3.964-3.951.002-.599-.896-.602-.898-.004zm.444 2.432l.06.131c.394.81 1.015 1.41 1.864 1.794l.105.045-.035.016c-.837.387-1.463 1.015-1.873 1.872l-.078.17-.017-.044c-.37-.89-.98-1.547-1.838-1.958l-.155-.07c.837-.37 1.46-.95 1.866-1.743l.101-.213z"
      />
      <path
        fill="currentColor"
        d="M4.5 10.132a5.87 5.87 0 015.871-5.868.5.5 0 100-1A6.87 6.87 0 003.5 10.132a6.87 6.87 0 004.417 6.417.5.5 0 00.357-.934A5.87 5.87 0 014.5 10.132zm8.368 5.358a.5.5 0 01.202.96 6.851 6.851 0 01-2.67.55h-.029a.5.5 0 110-1h.024a5.85 5.85 0 002.282-.47.499.499 0 01.191-.04zm3.657-3.628a.5.5 0 01.297.642 6.863 6.863 0 01-1.187 2.043.5.5 0 01-.766-.643 5.86 5.86 0 001.014-1.745.5.5 0 01.642-.297z"
      />
    </svg>
  );
};

GenerateSummaryIcon.displayName = 'GenerateSummaryIcon';

export default GenerateSummaryIcon;
