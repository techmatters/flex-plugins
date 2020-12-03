import { Case, CaseInfo, HouseholdEntry, PerpetratorEntry } from '../../types/types';
import { NewCaseSubroutes } from '../routing/types';
import { CallerFormInformation } from '../../components/common/forms/CallerForm';

// Action types
export const SET_CONNECTED_CASE = 'SET_CONNECTED_CASE';
export const REMOVE_CONNECTED_CASE = 'REMOVE_CONNECTED_CASE';
export const UPDATE_CASE_INFO = 'UPDATE_CASE_INFO';
export const UPDATE_TEMP_INFO = 'UPDATE_TEMP_INFO';

export type ViewNote = {
  note: string;
  counselor: string;
  date: string;
};

export type ViewContact = {
  contact?: any; // TODO: create Contact type
  detailsExpanded: { [section: string]: boolean };
  date: string;
  counselor: string;
};

export type TemporaryCaseInfo =
  | { screen: typeof NewCaseSubroutes.AddNote; info: string }
  | { screen: typeof NewCaseSubroutes.AddHousehold; info: CallerFormInformation }
  | { screen: typeof NewCaseSubroutes.AddPerpetrator; info: CallerFormInformation }
  | { screen: typeof NewCaseSubroutes.ViewContact; info: ViewContact }
  | { screen: typeof NewCaseSubroutes.ViewNote; info: ViewNote }
  | { screen: typeof NewCaseSubroutes.ViewHousehold; info: HouseholdEntry }
  | { screen: typeof NewCaseSubroutes.ViewPerpetrator; info: PerpetratorEntry };

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

export type CaseActionType =
  | SetConnectedCaseAction
  | RemoveConnectedCaseAction
  | UpdateCaseInfoAction
  | TemporaryCaseInfoAction;
