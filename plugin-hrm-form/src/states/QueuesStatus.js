import { QUEUES_STATUS_UPDATE, QUEUES_STATUS_FAILURE } from './ActionTypes';

export const queuesStatusUpdate = queuesStatus => ({ type: QUEUES_STATUS_UPDATE, queuesStatus });

export const queuesStatusFailure = error => ({ type: QUEUES_STATUS_FAILURE, error });

const initialState = {
  queuesStatus: null,
  error: 'Not initialized',
  loading: true,
};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case QUEUES_STATUS_UPDATE:
      return {
        ...state,
        error: null,
        loading: false,
        queuesStatus: action.queuesStatus,
      };
    case QUEUES_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
}
