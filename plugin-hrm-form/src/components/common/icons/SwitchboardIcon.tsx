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
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16" fill="none">
      <path
        d="M5.37317 5.9587L3.99984 5.33203L5.37317 4.70536L5.99984 3.33203L6.6265 4.70536L7.99984 5.33203L6.6265 5.9587L5.99984 7.33203L5.37317 5.9587ZM5.99984 13.9987L6.6265 12.6254L7.99984 11.9987L6.6265 11.372L5.99984 9.9987L5.37317 11.372L3.99984 11.9987L5.37317 12.6254L5.99984 13.9987ZM3.57984 8.24536L2.6665 8.66536L3.57984 9.08536L3.99984 9.9987L4.41984 9.08536L5.33317 8.66536L4.41984 8.24536L3.99984 7.33203L3.57984 8.24536ZM8.6665 7.9987C8.6665 5.9387 9.5865 4.0387 10.9598 2.66536H8.6665V1.33203H13.3332V5.9987H11.9998V3.5187C10.7998 4.6787 9.99984 6.3187 9.99984 7.9987C9.99984 10.212 11.3998 12.2387 13.3332 13.212V14.6654C10.6065 13.6054 8.6665 10.8987 8.6665 7.9987Z"
        fill="black"
      />
    </svg>
  );
};

SwitchboardIcon.displayName = 'SwitchboardIcon';

export default SwitchboardIcon;
