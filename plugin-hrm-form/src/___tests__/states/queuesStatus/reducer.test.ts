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
