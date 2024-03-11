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
import selectCaseItemHistory from '../../../../states/case/sections/selectCaseItemHistory';
import { namespace } from '../../../../states/storeNamespaces';
import { noteSectionApi } from '../../../../states/case/sections/note';

const BASELINE_DATE = new Date('2021-01-01T00:00:00Z');

let rootState: RootState;
let sampleCase: Case;

beforeEach(() => {
  const partialCase: RecursivePartial<Case> = {
    sections: {
      note: [
        {
          sectionId: 'this one',
          sectionTypeSpecificData: { note: 'this is the note you are looking for' },
          createdAt: BASELINE_DATE.toISOString(),
          createdBy: 'WK-1',
          updatedAt: addDays(BASELINE_DATE, 1).toISOString(),
          updatedBy: 'WK-2',
        },
        {
          sectionId: 'not this one',
          sectionTypeSpecificData: { note: 'this is not the note you are looking for' },
        },
      ],
    },
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
        case123: {
          connectedCase: partialCase,
        },
      },
    },
  };
  rootState = { [namespace]: partialState } as RootState;
  sampleCase = partialCase as Case;
});

test('Case section exists, and createdBy & updatedBy exist in the counselor map state', () => {
  const { added, updated, addingCounsellorName, updatingCounsellorName } = selectCaseItemHistory(
    rootState,
    sampleCase,
    noteSectionApi,
    'this one',
  );
  expect(added).toEqual(BASELINE_DATE);
  expect(updated).toEqual(addDays(BASELINE_DATE, 1));
  expect(addingCounsellorName).toEqual('Counselor 1');
  expect(updatingCounsellorName).toEqual('Counselor 2');
});

test('Case section exists, without updatedAt - leaves updatedAt undefined', () => {
  delete sampleCase.sections.note[0].updatedAt;
  const { added, updated, addingCounsellorName, updatingCounsellorName } = selectCaseItemHistory(
    rootState,
    sampleCase,
    noteSectionApi,
    'this one',
  );
  expect(added).toEqual(BASELINE_DATE);
  expect(updated).toBeUndefined();
  expect(addingCounsellorName).toEqual('Counselor 1');
  expect(updatingCounsellorName).toEqual('Counselor 2');
});

test('Case section exists, without createdAt - returns Invalid Date for createdAt', () => {
  delete sampleCase.sections.note[0].createdAt;
  const { added, updated, addingCounsellorName, updatingCounsellorName } = selectCaseItemHistory(
    rootState,
    sampleCase,
    noteSectionApi,
    'this one',
  );
  expect(added.toString()).toEqual('Invalid Date');
  expect(updated).toEqual(addDays(BASELINE_DATE, 1));
  expect(addingCounsellorName).toEqual('Counselor 1');
  expect(updatingCounsellorName).toEqual('Counselor 2');
});

test("Case section doesn't exist, without createdAt - returns object with undefined / invalid properties", () => {
  delete sampleCase.sections.note[0].createdAt;
  const { added, updated, addingCounsellorName, updatingCounsellorName } = selectCaseItemHistory(
    rootState,
    sampleCase,
    noteSectionApi,
    'never seen this one',
  );
  expect(added.toString()).toEqual('Invalid Date');
  expect(updated).toBeUndefined();
  expect(addingCounsellorName).toBeUndefined();
  expect(updatingCounsellorName).toBeUndefined();
});
