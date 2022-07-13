import { Case, CaseInfo, SearchContact } from '../../types/types';
import {
  CaseActionType,
  MARK_CASE_AS_UPDATED,
  REMOVE_CONNECTED_CASE,
  SET_CONNECTED_CASE,
  TemporaryCaseInfo,
  UPDATE_CASE_CONTACT,
  UPDATE_CASE_INFO,
  UPDATE_CASE_STATUS,
  UPDATE_TEMP_INFO,
} from './types';
import { searchContactToHrmServiceContact } from '../contacts/contactDetailsAdapter';

// Action creators
export const setConnectedCase = (
  connectedCase: Case,
  taskId: string,
  caseHasBeenEdited: Boolean,
  clearTemporaryInfo = true,
): CaseActionType => ({
  type: SET_CONNECTED_CASE,
  connectedCase,
  taskId,
  caseHasBeenEdited,
  clearTemporaryInfo,
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
 * @param {string} status (open, close, etc.)
 * @param {string} taskId Twilio Task Id
 */
export const updateCaseStatus = (status: string, taskId: string): CaseActionType => ({
  type: UPDATE_CASE_STATUS,
  status,
  taskId,
});

export const markCaseAsUpdated = (taskId: string): CaseActionType => ({
  type: MARK_CASE_AS_UPDATED,
  taskId,
});

export const updateCaseContactsWithSearchContact = (taskId: string, contact: SearchContact): CaseActionType => ({
  type: UPDATE_CASE_CONTACT,
  taskId,
  contact: searchContactToHrmServiceContact(contact),
});
