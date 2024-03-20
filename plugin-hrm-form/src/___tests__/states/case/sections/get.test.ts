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

import { getSectionItemById } from '../../../../states/case/sections/get';
import { WorkerSID } from '../../../../types/twilio';
import { CaseStateEntry } from '../../../../states/case/types';

const baselineDate = new Date(2015, 5, 15);
const WORKER_SID: WorkerSID = 'WK-worker_sid';

describe('getSectionItemById', () => {
  const inputSections: CaseStateEntry['sections'] = {
    household: {
      THIS_EXISTS: {
        sectionId: 'THIS_EXISTS',
        sectionType: 'household',
        createdAt: baselineDate,
        eventTimestamp: baselineDate,
        createdBy: WORKER_SID,
        sectionTypeSpecificData: {},
      },
      EXISTS: {
        sectionId: 'EXISTS',
        sectionType: 'household',
        createdAt: baselineDate,
        eventTimestamp: baselineDate,
        createdBy: WORKER_SID,
        sectionTypeSpecificData: {},
      },
      ALSO_EXISTS: {
        sectionId: 'ALSO_EXISTS',
        sectionType: 'household',
        createdAt: baselineDate,
        eventTimestamp: baselineDate,
        createdBy: WORKER_SID,
        sectionTypeSpecificData: {},
      },
    },
  };
  test('Item with matching id exists in array at specified property name - returns item', () => {
    expect(getSectionItemById('household')(inputSections, 'EXISTS')).toMatchObject(inputSections.household.EXISTS);
  });
  test('No item with matching id exists in array at specified property name - returns undefined', () => {
    expect(getSectionItemById('household')(inputSections, 'NOT_EXISTS')).toBeUndefined();
  });
  test('Nothing exists at specified property name - returns undefined', () => {
    expect(getSectionItemById('referral')(inputSections, 'NOT_EXISTS')).toBeUndefined();
  });
  test('Non array at specified property name - returns undefined', () => {
    expect(
      getSectionItemById('referral')({ ...inputSections, referral: <any>'not an array' }, 'NOT_EXISTS'),
    ).toBeUndefined();
  });
});
