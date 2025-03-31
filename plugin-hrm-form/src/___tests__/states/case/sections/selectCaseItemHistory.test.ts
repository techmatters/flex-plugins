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
import { addDays } from 'date-fns';

import { RecursivePartial } from '../../../RecursivePartial';
import { HrmState, RootState } from '../../../../states';
import { Case } from '../../../../types/types';
import '../../../mockGetConfig';
import selectCaseItemHistory from '../../../../states/case/sections/selectCaseItemHistory';
import { namespace } from '../../../../states/storeNamespaces';
import { CaseStateEntry } from '../../../../states/case/types';

const BASELINE_DATE = new Date('2021-01-01T00:00:00Z');
const CASE_ID = 'case123';

let rootState: RootState;
let sampleSections: CaseStateEntry['sections'];

beforeEach(() => {
  sampleSections = {
    note: {
      'this one': {
        sectionId: 'this one',
        sectionType: 'note',
        sectionTypeSpecificData: { note: 'this is the note you are looking for' } as any,
        createdAt: BASELINE_DATE,
        eventTimestamp: BASELINE_DATE,
        createdBy: 'WK-1',
        updatedAt: addDays(BASELINE_DATE, 1),
        updatedBy: 'WK-2',
      },
      'not this one': {
        sectionId: 'not this one',
        sectionType: 'note',
        sectionTypeSpecificData: { note: 'this is not the note you are looking for' } as any,
        createdAt: addDays(BASELINE_DATE, 1),
        eventTimestamp: addDays(BASELINE_DATE, 1),
        createdBy: 'WK-2',
      },
    },
  };
  const partialCase: RecursivePartial<Case> = {
    id: CASE_ID,
  };
  const partialState: RecursivePartial<HrmState> = {
    configuration: {
      counselors: {
        hash: {
          'WK-1': 'Counselor 1',
          'WK-2': 'Counselor 2',
        },
      },
    },
    connectedCase: {
      cases: {
        [CASE_ID]: {
          connectedCase: partialCase,
          sections: sampleSections,
        },
      },
    },
  };
  rootState = { [namespace]: partialState } as RootState;
});

test('Case section exists, and createdBy & updatedBy exist in the counselor map state', () => {
  const { added, updated, addingCounsellorName, updatingCounsellorName } = selectCaseItemHistory(
    rootState,
    CASE_ID,
    'note',
    'this one',
  );
  expect(added).toEqual(BASELINE_DATE);
  expect(updated).toEqual(addDays(BASELINE_DATE, 1));
  expect(addingCounsellorName).toEqual('Counselor 1');
  expect(updatingCounsellorName).toEqual('Counselor 2');
});

test('Case section exists, without updatedAt - leaves updatedAt undefined', () => {
  delete sampleSections.note['this one'].updatedAt;
  const { added, updated, addingCounsellorName, updatingCounsellorName } = selectCaseItemHistory(
    rootState,
    'case123',
    'note',
    'this one',
  );
  expect(added).toEqual(BASELINE_DATE);
  expect(updated).toBeUndefined();
  expect(addingCounsellorName).toEqual('Counselor 1');
  expect(updatingCounsellorName).toEqual('Counselor 2');
});

test('Case section exists, without createdAt - returns undefined for createdAt', () => {
  delete sampleSections.note['this one'].createdAt;
  const { added, updated, addingCounsellorName, updatingCounsellorName } = selectCaseItemHistory(
    rootState,
    CASE_ID,
    'note',
    'this one',
  );
  expect(added).not.toBeDefined();
  expect(updated).toEqual(addDays(BASELINE_DATE, 1));
  expect(addingCounsellorName).toEqual('Counselor 1');
  expect(updatingCounsellorName).toEqual('Counselor 2');
});

test("Case section doesn't exist, without createdAt - returns object with undefined properties", () => {
  delete sampleSections.note['this one'].createdAt;
  const { added, updated, addingCounsellorName, updatingCounsellorName } = selectCaseItemHistory(
    rootState,
    CASE_ID,
    'note',
    'never seen this one',
  );
  expect(added).not.toBeDefined();
  expect(updated).toBeUndefined();
  expect(addingCounsellorName).toBeUndefined();
  expect(updatingCounsellorName).toBeUndefined();
});
