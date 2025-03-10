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
import { parseISO } from 'date-fns/parseISO';
// Declares this module as an 'external module' so augmentations can be added to global scope.
export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toParseAsDate(date?: string | Date): R;
    }
    interface Expect {
      toParseAsDate(date?: string | Date): any;
    }
  }
}

// Usage: This is a custom matcher for Jest, it extends the expect object with a new matcher.
// So you just need to import this file in your test file and it will be available, you don't need to import any symbols from it.
// i.e. import '@tech-matters/testing/expectToParseAsDate';
expect.extend({
  toParseAsDate(received: any, date?: string | Date) {
    let receivedDate;
    try {
      receivedDate = received instanceof Date ? received : Date.parse(received);
    } catch (e) {
      return {
        pass: false,
        message: () => `Expected '${received}' to be a parseable date. Error: ${e}`,
      };
    }

    if (date) {
      const expectedDate = typeof date === 'string' ? parseISO(date) : date;
      const pass = receivedDate.valueOf() === expectedDate.valueOf();
      return {
        pass,
        message: () =>
          `Expected '${received}' to be the same as '${expectedDate.toISOString()}'`,
      };
    }

    return {
      pass: true,
      message: () => `Expected '${received}' to be a parseable date.`,
    };
  },
});
