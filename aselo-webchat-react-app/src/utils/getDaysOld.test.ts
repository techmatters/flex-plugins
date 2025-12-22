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

import { getDaysOld } from "./getDaysOld";

describe("getDaysOld", () => {
    it.each([0, 1, 2, 5, 10, 100, 500, 1000])("when supplied x days ago date, should return x", (daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        expect(getDaysOld(date)).toBe(daysAgo);
    });
});
