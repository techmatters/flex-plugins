import { Case, CaseInfo, CaseStatus } from '../../types/types';
import {
  CaseActionType,
  TemporaryCaseInfo,
  SET_CONNECTED_CASE,
  REMOVE_CONNECTED_CASE,
  UPDATE_CASE_INFO,
  UPDATE_TEMP_INFO,
  UPDATE_CASE_STATUS,
  MARK_CASE_AS_UPDATED,
} from './types';

// Action creators
export const setConnectedCase = (connectedCase: Case, taskId: string, caseHasBeenEdited: Boolean): CaseActionType => ({
  type: SET_CONNECTED_CASE,
  connectedCase,
  taskId,
  caseHasBeenEdited,
});

export const removeConnectedCase = (taskId: string): CaseActionType => ({
  type: REMOVE_CONNECTED_CASE,
  taskId,
});

export const updateCaseInfo = (info: CaseInfo, taskId: string): CaseActionType => ({
  type: UPDATE_CASE_INFO,
  info,
  taskId,
});

export const updateTempInfo = (value: TemporaryCaseInfo, taskId: string): CaseActionType => ({
  type: UPDATE_TEMP_INFO,
  value,
  taskId,
});

/**
 * Redux: Updates status for a provided case.
 * @param status CaseStatus (open, close, etc.)
 * @param taskId Twilio Task Id
 */
export const updateCaseStatus = (status: CaseStatus, taskId: string): CaseActionType => ({
  type: UPDATE_CASE_STATUS,
  status,
  taskId,
});

export const markCaseAsUpdated = (taskId: string): CaseActionType => ({
  type: MARK_CASE_AS_UPDATED,
  taskId,
});
