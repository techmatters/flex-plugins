import { QueuesStatusActionType, QUEUES_STATUS_UPDATE, QUEUES_STATUS_FAILURE, QueuesStatus } from './types';

// Action creators
export const queuesStatusUpdate = (queuesStatus: QueuesStatus): QueuesStatusActionType => ({
  type: QUEUES_STATUS_UPDATE,
  queuesStatus,
});

export const queuesStatusFailure = (error: string): QueuesStatusActionType => ({ type: QUEUES_STATUS_FAILURE, error });
