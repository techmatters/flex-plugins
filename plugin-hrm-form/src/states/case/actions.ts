import { Case } from '../../types/types';
import { CaseActionType, REMOVE_CONNECTED_CASE, SET_CONNECTED_CASE } from './types';

// Action creators
export const setConnectedCase = (connectedCase: Case, taskId: string): CaseActionType => ({
  type: SET_CONNECTED_CASE,
  connectedCase,
  taskId,
});

export const removeConnectedCase = (taskId: string): CaseActionType => ({
  type: REMOVE_CONNECTED_CASE,
  taskId,
});
