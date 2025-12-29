/**
 * Copyright (C) 2021-2026 Technology Matters
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

/*
 * Gets the number of days between the given date and the current date.
 * e.g. if today is 10/01/2022 then 08/01/2022 returns 2
 */
export const getDaysOld = (date: Date): number => {
    const messageDate = new Date(date.getTime());
    messageDate.setUTCHours(0);
    messageDate.setUTCMinutes(0);
    messageDate.setUTCSeconds(0, 0);

    const currentDate = new Date();
    currentDate.setUTCHours(0);
    currentDate.setUTCMinutes(0);
    currentDate.setUTCSeconds(0, 0);

    const timeDiff = currentDate.getTime() - messageDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};
