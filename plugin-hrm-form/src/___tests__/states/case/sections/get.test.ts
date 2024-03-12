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
import { Case } from '../../../../types/types';
import { VALID_EMPTY_CASE } from '../../../testCases';
import { WorkerSID } from '../../../../types/twilio';

const baselineDate = new Date(2015, 5, 15);
const WORKER_SID: WorkerSID = 'WK-worker_sid';

describe('getSectionItemById', () => {
  const inputCase: Case = {
    ...VALID_EMPTY_CASE,
    sections: {
      household: [
        {
          sectionId: 'THIS_EXISTS',
          createdAt: baselineDate.toISOString(),
          twilioWorkerId: WORKER_SID,
          sectionTypeSpecificData: {},
        },
        {
          sectionId: 'EXISTS',
          createdAt: baselineDate.toISOString(),
          twilioWorkerId: WORKER_SID,
          sectionTypeSpecificData: {},
        },
        {
          sectionId: 'ALSO_EXISTS',
          createdAt: baselineDate.toISOString(),
          twilioWorkerId: WORKER_SID,
          sectionTypeSpecificData: {},
        },
      ],
    },
  };
  test('Item with matching id exists in array at specified property name - returns item', () => {
    expect(getSectionItemById('household')(inputCase, 'EXISTS')).toMatchObject(inputCase.sections.household[1]);
  });
  test('No item with matching id exists in array at specified property name - returns undefined', () => {
    expect(getSectionItemById('household')(inputCase, 'NOT_EXISTS')).toBeUndefined();
  });
  test('Nothing exists at specified property name - returns undefined', () => {
    expect(getSectionItemById('referral')(inputCase, 'NOT_EXISTS')).toBeUndefined();
  });
  test('Non array at specified property name - returns undefined', () => {
    expect(
      getSectionItemById('referral')({ ...inputCase, sections: { referral: <any>'not an array' } }, 'NOT_EXISTS'),
    ).toBeUndefined();
  });
});

describe('getMostRecentSectionItem', () => {
  const inputCase: Case = {
    ...VALID_EMPTY_CASE,
    sections: {
      household: [
        {
          sectionId: 'EARLIEST',
          createdAt: baselineDate.toISOString(),
          twilioWorkerId: WORKER_SID,
          sectionTypeSpecificData: {},
        },
        {
          sectionId: 'LATEST',
          createdAt: addSeconds(baselineDate, 100).toISOString(),
          twilioWorkerId: WORKER_SID,
          sectionTypeSpecificData: {},
        },
        {
          sectionId: 'ALSO_EXISTS',
          createdAt: addSeconds(baselineDate, 10).toISOString(),
          twilioWorkerId: WORKER_SID,
          sectionTypeSpecificData: {},
        },
      ],
    },
  };
  test('Populated array at specified property name - returns item with latest createdAt date', () => {
    expect(getMostRecentSectionItem('household')(inputCase)).toMatchObject(inputCase.sections.household[1]);
  });
  test('Empty array at specified property name - returns undefined', () => {
    expect(getMostRecentSectionItem('household')({ ...VALID_EMPTY_CASE, sections: { household: [] } })).toBeUndefined();
  });
  test('Array with unparseable createdAt dates at specified property name - uses remaining dates', () => {
    expect(
      getMostRecentSectionItem('household')({
        ...VALID_EMPTY_CASE,
        sections: {
          household: [
            {
              sectionId: 'EARLIEST',
              createdAt: baselineDate.toISOString(),
              twilioWorkerId: WORKER_SID,
              sectionTypeSpecificData: {},
            },
            { sectionId: 'PROBLEM', createdAt: 'NOT A DATE', twilioWorkerId: WORKER_SID, sectionTypeSpecificData: {} },
          ],
        },
      }),
    ).toMatchObject(inputCase.sections.household[0]);
  });
  test('Nothing exists at specified property name - returns undefined', () => {
    expect(getMostRecentSectionItem('referral')(inputCase)).toBeUndefined();
  });
  test('Non array at specified property name - returns undefined', () => {
    expect(
      getMostRecentSectionItem('referral')({ ...inputCase, sections: { referral: <any>'not an array' } }),
    ).toBeUndefined();
  });
});
