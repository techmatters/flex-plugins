import { Case, CaseInfo } from '../../types/types';
import { CallerFormInformation } from '../../components/common/forms/CallerForm';

// Action types
export const SET_CONNECTED_CASE = 'SET_CONNECTED_CASE';
export const REMOVE_CONNECTED_CASE = 'REMOVE_CONNECTED_CASE';
export const UPDATE_CASE_INFO = 'UPDATE_CASE_INFO';
export const UPDATE_TEMP_INFO = 'UPDATE_TEMP_INFO';
export const UPDATE_VIEW_NOTE_INFO = 'UPDATE_VIEW_NOTE_INFO';

export type ViewNoteInfo = {
  note: string;
  counselor: string;
  date: string;
};

export type TemporaryCaseInfo = string | CallerFormInformation;

export type TemporaryCaseInfo = string | CallerFormInformation;

type SetConnectedCaseAction = {
  type: typeof SET_CONNECTED_CASE;
  connectedCase: Case;
  taskId: string;
};

type RemoveConnectedCaseAction = {
  type: typeof REMOVE_CONNECTED_CASE;
  taskId: string;
};

type UpdateCaseInfoAction = {
  type: typeof UPDATE_CASE_INFO;
  info: CaseInfo;
  taskId: string;
};

type TemporaryCaseInfoAction = {
  type: typeof UPDATE_TEMP_INFO;
  value: TemporaryCaseInfo;
  taskId: string;
};

type UpdateViewNoteInfoAction = {
  type: typeof UPDATE_VIEW_NOTE_INFO;
  taskId: string;
  info: ViewNoteInfo;
};

export type CaseActionType =
  | SetConnectedCaseAction
  | RemoveConnectedCaseAction
  | UpdateCaseInfoAction
  | TemporaryCaseInfoAction
  | UpdateViewNoteInfoAction;
