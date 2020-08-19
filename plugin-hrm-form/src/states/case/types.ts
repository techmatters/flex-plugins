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

export type ViewContact = {
  contactId?: string;
  detailsExpanded: { [section: string]: boolean };
  date: string;
  counselor: string;
};

export function isViewContact(object: any): object is ViewContact {
  return (
    typeof object === 'object' &&
    (!object.contactId || typeof object.contactId === 'string') &&
    typeof object.detailsExpanded === 'object' &&
    Object.keys(object.detailsExpanded).every(key => typeof key === 'string') &&
    Object.values(object.detailsExpanded).every(value => typeof value === 'boolean') &&
    typeof object.date === 'string' &&
    typeof object.counselor === 'string'
  );
}

export type TemporaryCaseInfo = string | CallerFormInformation | ViewContact;

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
