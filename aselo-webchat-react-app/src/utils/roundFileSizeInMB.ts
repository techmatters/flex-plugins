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
 * Rounds filesize in bytes to megabytes, with 0-2 decimal places ensuring atleast 3 digits.
 * e.g. 100MB, 10.0MB, 1.00MB, 0.10MB, 0.01MB
 */
export const roundFileSizeInMB = (fileSizeInBytes: number): string => {
  const sizeInMB = fileSizeInBytes / 1024 / 1024;
  const decimalPlaces = Math.max(0, 3 - Math.ceil(Math.log10(sizeInMB + 1)));
  const roundedResult = sizeInMB.toFixed(decimalPlaces);
  return Number(roundedResult) > 0.01 ? roundedResult : '0.01';
};
