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

import timezonedDate from 'timezoned-date';

/**
 * Lifted from here (& slightly modified): https://bengry.medium.com/testing-dates-and-timezones-using-jest-10a6a6ecf375
 */
export type MockDateSetup = {
  reset: () => void;
  set: (options: { offsetMinutes?: number; isoDate?: string }) => void;
};

const originalDate = Date;

export function setupMockDate(): MockDateSetup {
  let currentOffset: number;

  function reset() {
    Date = originalDate;
  }

  function set({ isoDate, offsetMinutes }: { offsetMinutes?: number; isoDate?: string }) {
    const getMockDate = (): typeof import('mockdate') => {
      let MockDate: typeof import('mockdate') | undefined;
      jest.isolateModules(() => {
        // eslint-disable-next-line global-require
        MockDate = require('mockdate');
      });

      return MockDate!;
    };

    if (offsetMinutes !== undefined) {
      currentOffset = offsetMinutes;
    }
    console.log(currentOffset);
    Date = timezonedDate.makeConstructor(currentOffset);
    if (isoDate !== undefined) {
      getMockDate().set(isoDate);
    }
  }

  return { reset, set };
}
