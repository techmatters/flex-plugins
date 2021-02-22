import { QueuesStatusActionType, QueuesStatus, QUEUES_STATUS_UPDATE, QUEUES_STATUS_FAILURE } from './types';

type QueuesStatusState = {
  queuesStatus: QueuesStatus;
  error?: string;
  loading: boolean;
};

const initialState: QueuesStatusState = {
  queuesStatus: null,
  error: 'Not initialized',
  loading: true,
};

// eslint-disable-next-line import/no-unused-modules
export function reduce(state = initialState, action: QueuesStatusActionType): QueuesStatusState {
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
