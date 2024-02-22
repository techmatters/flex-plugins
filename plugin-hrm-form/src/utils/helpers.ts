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

import { isValid } from 'date-fns';

export const splitDate = (date: string) => date.split('-').map(s => parseInt(s, 10));

export const splitTime = (time: string) => time.split(':').map(s => parseInt(s, 10));

/**
 * If the provided object includes valid date and time, returns the corresponding Date object, returns Date.now otherwise
 * Use of getTime() means this will return the Date based on the browser's locale.
 */
export const getDateTime = ({ date, time }: { date?: string; time?: string }) => {
  if (date) {
    const [y, m, d] = splitDate(date);
    const [hh, mm] = time ? splitTime(time) : [0, 0];

    const dateTime = new Date(y, m - 1, d, hh, mm).getTime();

    if (isValid(dateTime)) return dateTime;
  }

  return Date.now();
};
