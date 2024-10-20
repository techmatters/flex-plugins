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

import * as types from '../../../states/queuesStatus/types';
import * as actions from '../../../states/queuesStatus/actions';

describe('test action creators', () => {
  test('queuesStatusUpdate', async () => {
    const queuesStatus: types.QueuesStatus = {
      q1: { messenger: 1, sms: 2, voice: 3, web: 4, whatsapp: 5, longestWaitingDate: '2020-09-01T15:35:24.807Z' },
      q2: { messenger: 2, sms: 3, voice: 4, web: 5, whatsapp: 1, longestWaitingDate: '2020-09-01T15:35:24.808Z' },
    };

    const expected = { type: types.QUEUES_STATUS_UPDATE, queuesStatus };

    expect(actions.queuesStatusUpdate(queuesStatus)).toStrictEqual(expected);
  });

  test('queuesStatusFailure', async () => {
    const error = 'something went wrong';

    const expected = { type: types.QUEUES_STATUS_FAILURE, error };

    expect(actions.queuesStatusFailure(error)).toStrictEqual(expected);
  });
});
