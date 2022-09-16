import { Case, CaseInfo, CaseItemEntry, SearchContact } from '../../types/types';
import {
  CaseActionType, INIT_CASE_SECTION_WORKING_COPY,
  MARK_CASE_AS_UPDATED, REMOVE_CASE_SECTION_WORKING_COPY,
  REMOVE_CONNECTED_CASE,
  SET_CONNECTED_CASE,
  TemporaryCaseInfo,
  UPDATE_CASE_CONTACT,
  UPDATE_CASE_INFO,
  UPDATE_CASE_SECTION_WORKING_COPY,
  UPDATE_CASE_STATUS,
  UPDATE_TEMP_INFO,
} from './types';
import { searchContactToHrmServiceContact } from '../contacts/contactDetailsAdapter';
import { CaseSectionApi } from './sections/api';

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

export const updateCaseSectionWorkingCopy = (
  taskId: string,
  api: CaseSectionApi<unknown>,
  sectionItem: CaseItemEntry,
  id?: string,
): CaseActionType => ({
  type: UPDATE_CASE_SECTION_WORKING_COPY,
  taskId,
  api,
  sectionItem,
  id,
});

export const initialiseCaseSectionWorkingCopy = (
  taskId: string,
  api: CaseSectionApi<unknown>,
  id?: string,
): CaseActionType => ({
  type: INIT_CASE_SECTION_WORKING_COPY,
  taskId,
  api,
  id,
});

export const removeCaseSectionWorkingCopy = (
  taskId: string,
  api: CaseSectionApi<unknown>,
  id?: string,
): CaseActionType => ({
  type: REMOVE_CASE_SECTION_WORKING_COPY,
  taskId,
  id,
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
