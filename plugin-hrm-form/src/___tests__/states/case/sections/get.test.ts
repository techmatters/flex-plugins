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

import { addSeconds } from 'date-fns';

import { getMostRecentSectionItem, getSectionItemById } from '../../../../states/case/sections/get';
import { CaseInfo } from '../../../../types/types';

const baselineDate = new Date(2015, 5, 15);

describe('getSectionItemById', () => {
  const inputCase: CaseInfo = {
    households: [
      { id: 'THIS_EXISTS', createdAt: baselineDate.toISOString(), twilioWorkerId: 'worker_sid', household: {} },
      { id: 'EXISTS', createdAt: baselineDate.toISOString(), twilioWorkerId: 'worker_sid', household: {} },
      { id: 'ALSO_EXISTS', createdAt: baselineDate.toISOString(), twilioWorkerId: 'worker_sid', household: {} },
    ],
  };
  test('Item with matching id exists in array at specified property name - returns item', () => {
    expect(getSectionItemById('households')(inputCase, 'EXISTS')).toMatchObject(inputCase.households[1]);
  });
  test('No item with matching id exists in array at specified property name - returns undefined', () => {
    expect(getSectionItemById('households')(inputCase, 'NOT_EXISTS')).toBeUndefined();
  });
  test('Nothing exists at specified property name - returns undefined', () => {
    expect(getSectionItemById('referrals')(inputCase, 'NOT_EXISTS')).toBeUndefined();
  });
  test('Non array at specified property name - returns undefined', () => {
    expect(
      getSectionItemById('referrals')({ ...inputCase, referrals: <any>'not an array' }, 'NOT_EXISTS'),
    ).toBeUndefined();
  });
});

describe('getMostRecentSectionItem', () => {
  const inputCase: CaseInfo = {
    households: [
      { id: 'EARLIEST', createdAt: baselineDate.toISOString(), twilioWorkerId: 'worker_sid', household: {} },
      {
        id: 'LATEST',
        createdAt: addSeconds(baselineDate, 100).toISOString(),
        twilioWorkerId: 'worker_sid',
        household: {},
      },
      {
        id: 'ALSO_EXISTS',
        createdAt: addSeconds(baselineDate, 10).toISOString(),
        twilioWorkerId: 'worker_sid',
        household: {},
      },
    ],
  };
  test('Populated array at specified property name - returns item with latest createdAt date', () => {
    expect(getMostRecentSectionItem('households')(inputCase)).toMatchObject(inputCase.households[1]);
  });
  test('Empty array at specified property name - returns undefined', () => {
    expect(getMostRecentSectionItem('households')({ households: [] })).toBeUndefined();
  });
  test('Array with unparseable createdAt dates at specified property name - uses remaining dates', () => {
    expect(
      getMostRecentSectionItem('households')({
        households: [
          { id: 'EARLIEST', createdAt: baselineDate.toISOString(), twilioWorkerId: 'worker_sid', household: {} },
          { id: 'PROBLEM', createdAt: 'NOT A DATE', twilioWorkerId: 'worker_sid', household: {} },
        ],
      }),
    ).toMatchObject(inputCase.households[0]);
  });
  test('Nothing exists at specified property name - returns undefined', () => {
    expect(getMostRecentSectionItem('referrals')(inputCase)).toBeUndefined();
  });
  test('Non array at specified property name - returns undefined', () => {
    expect(getMostRecentSectionItem('referrals')({ ...inputCase, referrals: <any>'not an array' })).toBeUndefined();
  });
});
