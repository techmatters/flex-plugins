import { newQueueEntry } from '../../components/queuesStatus/helpers';

// Action types
export const QUEUES_STATUS_UPDATE = 'QUEUES_STATUS_UPDATE';
export const QUEUES_STATUS_FAILURE = 'QUEUES_STATUS_FAILURE';

type QueueEntry = typeof newQueueEntry;

export type QueuesStatus = { [qName: string]: QueueEntry };

type QueuesUpdateAction = {
  type: typeof QUEUES_STATUS_UPDATE;
  queuesStatus: QueuesStatus;
};

type QueuesFailureAction = {
  type: typeof QUEUES_STATUS_FAILURE;
  error: string;
};

export type QueuesStatusActionType = QueuesUpdateAction | QueuesFailureAction;
