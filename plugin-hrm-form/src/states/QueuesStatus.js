import { QUEUES_STATUS_UPDATE, QUEUES_STATUS_FAILURE, QUEUES_STATUS_TICK } from './ActionTypes';
import { getNewQueuesStatus, increaseWait } from '../components/queuesStatus/helpers';

export const queuesStatusUpdate = intermidiateStatus => ({ type: QUEUES_STATUS_UPDATE, intermidiateStatus });

export const queuesStatusFailure = error => ({ type: QUEUES_STATUS_FAILURE, error });

export const queuesStatusTick = () => ({ type: QUEUES_STATUS_TICK });

const initialState = {
  queuesStatus: null,
  error: 'Not initialized',
  loading: true,
};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case QUEUES_STATUS_UPDATE: {
      const queuesStatus = getNewQueuesStatus(action.intermidiateStatus, state.queuesStatus);
      return {
        ...state,
        error: null,
        loading: false,
        queuesStatus,
      };
    }
    case QUEUES_STATUS_FAILURE:
      return {
        ...state,
        error: action.error,
      };
    case QUEUES_STATUS_TICK: {
      const queuesStatus = increaseWait(state.queuesStatus);
      return {
        ...state,
        queuesStatus,
      };
    }
    default:
      return state;
  }
}
