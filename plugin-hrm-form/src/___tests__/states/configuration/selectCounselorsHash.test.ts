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

import { RootState } from '../../../states';
import { RecursivePartial } from '../../RecursivePartial';
import { namespace } from '../../../states/storeNamespaces';
import { selectCounselorName } from '../../../states/configuration/selectCounselorsHash';
import { WorkerSID } from '../../../types/twilio';

let state: RootState;

beforeEach(() => {
  const partialState: RecursivePartial<RootState> = {
    [namespace]: {
      configuration: {
        counselors: {
          hash: {
            'WK-1': 'Counselor 1',
            'WK-2': 'Counselor 2',
          },
        },
      },
    },
  };
  state = partialState as RootState;
});

describe('selectCounselorsName', () => {
  test('sid present in counselor hash - returns looked up name', () => {
    expect(selectCounselorName(state, 'WK-1')).toEqual('Counselor 1');
  });
  test('sid not present in counselor hash - returns sid', () => {
    const res = selectCounselorName(state, 'WK-not-here');
    expect(res).not.toEqual('WK-not-here');
    expect(typeof res).toBe('string');
  });
  test('sid not valid - returns placeholder', () => {
    expect(selectCounselorName(state, 'not an sid' as WorkerSID)).toEqual('not an sid');
  });
  test('sid false - returns undefined', () => {
    expect(selectCounselorName(state, undefined)).toBeUndefined();
    expect(selectCounselorName(state, null)).toBeUndefined();
    expect(selectCounselorName(state, '' as WorkerSID)).toBeUndefined();
  });
});
