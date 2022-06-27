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
