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

import { roundFileSizeInMB } from "./roundFileSizeInMB";

it.each([
    {
        sizeInBytes: 1048.58, // 0.001 MB
        displayInMegaBytes: "0.01"
    },
    {
        sizeInBytes: 10485.76, // 0.01 MB
        displayInMegaBytes: "0.01"
    },
    {
        sizeInBytes: 104857.6, // 0.1 MB
        displayInMegaBytes: "0.10"
    },
    {
        sizeInBytes: 1048576, // 1 MB
        displayInMegaBytes: "1.00"
    },
    {
        sizeInBytes: 10485760, // 10 MB
        displayInMegaBytes: "10.0"
    },
    {
        sizeInBytes: 104857600, // 100 MB
        displayInMegaBytes: "100"
    }
])("returns correctly rounded file size", async ({ sizeInBytes, displayInMegaBytes }) => {
    expect(roundFileSizeInMB(sizeInBytes)).toBe(displayInMegaBytes);
});
