import * as types from '../../../states/queuesStatus/types';
import * as actions from '../../../states/queuesStatus/actions';

describe('test action creators', () => {
  test('queuesStatusUpdate', async () => {
    const queuesStatus: types.QueuesStatus = {
      q1: { facebook: 1, sms: 2, voice: 3, web: 4, whatsapp: 5, longestWaitingDate: '2020-09-01T15:35:24.807Z' },
      q2: { facebook: 2, sms: 3, voice: 4, web: 5, whatsapp: 1, longestWaitingDate: '2020-09-01T15:35:24.808Z' },
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
