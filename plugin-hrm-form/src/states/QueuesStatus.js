import { QUEUES_STATUS_INIT, QUEUES_STATUS_UPDATE, QUEUES_STATUS_FAILURE } from './ActionTypes';

export const queuesStatusInit = queuesStatus => ({ type: QUEUES_STATUS_INIT, queuesStatus });

export const queuesStatusUpdate = queuesStatus => ({ type: QUEUES_STATUS_UPDATE, queuesStatus });

export const queuesStatusFailure = error => ({ type: QUEUES_STATUS_FAILURE, error });

const initialState = {
  queuesStatus: null,
  error: 'Not initialized',
  loading: true,
};

export function reduce(state = initialState, action) {
  switch (action.type) {
    case QUEUES_STATUS_INIT:
      return {
        ...state,
        queuesStatus: action.queuesStatus,
        error: null,
        loading: false,
      };
    case QUEUES_STATUS_UPDATE:
      return {
        ...state,
        error: null,
        queuesStatus: action.queuesStatus,
      };
    case QUEUES_STATUS_FAILURE:
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
}
