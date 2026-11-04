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

/**
 * expect(value), whose failures say which case it was (e.g. which helpline or article) above
 * Jest's message: tests going through every helpline need it, and Jest's expect takes no message.
 *
 *   expectAt(`${code}/${version}`, errors).toEqual([]);
 */
import { expect } from '@jest/globals';

const withLabel = <T extends object>(target: T, label: string): T =>
  new Proxy(target, {
    get(object, property) {
      const value = Reflect.get(object, property);
      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          try {
            return value.apply(object, args);
          } catch (err) {
            if (err instanceof Error) err.message = `${label}\n\n${err.message}`;
            throw err;
          }
        };
      }
      // .not, .resolves and .rejects lead to more matchers
      return value && typeof value === 'object' ? withLabel(value, label) : value;
    },
  });

export const expectAt = <T>(label: string, value: T): ReturnType<typeof expect<T>> =>
  withLabel(expect(value), label);
