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

type Props = { color: string };

const InfoIcon: React.FC<Props> = ({ color }: { color: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-label="Information"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10.9992 6.9804V7.01959C10.9992 7.19593 10.9533 7.36051 10.8634 7.51334C10.8374 7.54665 10.8114 7.57947 10.7854 7.61229C10.7594 7.64511 10.7335 7.67793 10.7075 7.71124C10.5836 7.83272 10.4357 7.91697 10.2658 7.96399L10 7.99926C9.86211 8.00514 9.7342 7.97574 9.61429 7.915C9.49038 7.87582 9.38247 7.80724 9.29253 7.71319C9.19461 7.62503 9.12666 7.51922 9.08669 7.39774C9.02473 7.28018 8.99476 7.15479 9.00075 7.01959V6.9804C9.00075 6.80406 9.04671 6.63948 9.13665 6.48665C9.16263 6.45334 9.18861 6.42052 9.21459 6.3877C9.24057 6.35489 9.26655 6.32207 9.29253 6.28876C9.41644 6.16727 9.56432 6.08302 9.7342 6.036L10 6.00074C10.1379 5.99486 10.2658 6.02425 10.3857 6.08499C10.5096 6.12418 10.6175 6.19275 10.7075 6.2868C10.8054 6.37496 10.8733 6.48077 10.9133 6.60225C10.9753 6.71981 11.0052 6.8452 10.9992 6.9804ZM10.9992 13.1853C10.9992 13.4067 10.8853 13.6021 10.7075 13.7616C10.5276 13.9212 10.2598 13.9912 10 13.9994C9.75019 14.0091 9.4664 13.9017 9.29253 13.7616C9.11067 13.6135 9.00075 13.3953 9.00075 13.1853V9.81474C9.00075 9.59493 9.11467 9.39791 9.29253 9.23997C9.47239 9.0804 9.74019 9.01039 10 9.00062C10.2498 8.99085 10.5336 9.09831 10.7075 9.23997C10.8893 9.38814 10.9992 9.60632 10.9992 9.81474V13.1853Z"
      fill={color}
    />
  </svg>
);

export default InfoIcon;
