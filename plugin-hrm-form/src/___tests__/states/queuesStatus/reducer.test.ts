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

import { reduce } from '../../../states/queuesStatus/reducer';
import * as types from '../../../states/queuesStatus/types';
import * as actions from '../../../states/queuesStatus/actions';

describe('test reducer', () => {
  let state = undefined;

  test('should return initial state', async () => {
    const expected = {
      queuesStatus: null,
      error: 'Not initialized',
      loading: true,
    };

    const result = reduce(state, {});
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle QUEUES_STATUS_UPDATE', async () => {
    const queuesStatus: types.QueuesStatus = {
      q1: { facebook: 1, sms: 2, voice: 3, web: 4, whatsapp: 5, longestWaitingDate: '2020-09-01T15:35:24.807Z' },
      q2: { facebook: 2, sms: 3, voice: 4, web: 5, whatsapp: 1, longestWaitingDate: '2020-09-01T15:35:24.808Z' },
    };

    const expected = { queuesStatus, error: null, loading: false };

    const result = reduce(state, actions.queuesStatusUpdate(queuesStatus));
    expect(result).toStrictEqual(expected);

    state = result;
  });

  test('should handle QUEUES_STATUS_UPDATE', async () => {
    const error = 'something went wrong';

    const expected = { ...state, error };

    const result = reduce(state, actions.queuesStatusFailure(error));
    expect(result).toStrictEqual(expected);

    state = result;
  });
});
