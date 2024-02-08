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

import { addDays, endOfDay, formatISO } from 'date-fns';

import { DateExistsCondition, dateFilterPayloadFromFilters } from '../../../../states/caseList/dateFilters';

const baseline = new Date(2000, 10, 14);

describe('dateFilterPayloadFromFilters', () => {
  test('Creates a filter property for each filter provided in the map', () => {
    const payload = dateFilterPayloadFromFilters({
      filter2: {
        option: 'Filter 2',
        exists: DateExistsCondition.MUST_NOT_EXIST,
      },
      filter4: {
        option: 'Filter 4',
        exists: DateExistsCondition.MUST_NOT_EXIST,
      },
    });
    expect(payload).toStrictEqual({
      filter2: expect.anything(),
      filter4: expect.anything(),
    });
  });

  test('Creates an empty object from an empty map', () => {
    expect(dateFilterPayloadFromFilters({})).toStrictEqual({});
  });

  test('Exists filters copy the condition', () => {
    const payload = dateFilterPayloadFromFilters({
      filter2: {
        option: 'Filter 2',
        exists: DateExistsCondition.MUST_NOT_EXIST,
      },
      filter4: {
        option: 'Filter 4',
        exists: DateExistsCondition.MUST_EXIST,
      },
    });
    expect(payload).toStrictEqual({
      filter2: { exists: DateExistsCondition.MUST_NOT_EXIST },
      filter4: { exists: DateExistsCondition.MUST_EXIST },
    });
  });
  test('Date ranges copy the to and from dates with a MUST_EXIST condition', () => {
    const payload = dateFilterPayloadFromFilters({
      filter1: {
        from: baseline,
        to: addDays(baseline, 2),
        option: 'option 1',
      },
      filter2: {
        from: baseline,
        option: 'option 2',
      },
      filter3: { to: addDays(baseline, 2), option: 'option 2' },
    });
    expect(payload).toStrictEqual({
      filter1: {
        exists: DateExistsCondition.MUST_EXIST,
        from: formatISO(baseline),
        to: formatISO(endOfDay(addDays(baseline, 2))),
      },
      filter2: { exists: DateExistsCondition.MUST_EXIST, from: formatISO(baseline), to: undefined },
      filter3: {
        exists: DateExistsCondition.MUST_EXIST,
        from: undefined,
        to: formatISO(endOfDay(addDays(baseline, 2))),
      },
    });
  });
});
