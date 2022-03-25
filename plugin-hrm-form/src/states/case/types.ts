import { DefinitionVersionId, HelplineEntry } from 'hrm-form-definitions';

import type * as t from '../../types/types';
import { CaseItemAction, CaseSectionSubroute, NewCaseSubroutes } from '../routing/types';

// Action types
export const SET_CONNECTED_CASE = 'SET_CONNECTED_CASE';
export const REMOVE_CONNECTED_CASE = 'REMOVE_CONNECTED_CASE';
export const UPDATE_CASE_INFO = 'UPDATE_CASE_INFO';
export const UPDATE_TEMP_INFO = 'UPDATE_TEMP_INFO';
export const UPDATE_CASE_STATUS = 'UPDATE_CASE_STATUS';
export const MARK_CASE_AS_UPDATED = 'MARK_CASE_AS_UPDATED';

type ViewContact = {
  contact?: any; // TODO: create Contact type
  detailsExpanded: { [section: string]: boolean };
  createdAt: string;
  timeOfContact: string;
  counselor: string;
};

type Indexable = { index: number };

export type ViewTemporaryCaseInfo = {
  screen: CaseSectionSubroute;
  action: CaseItemAction.View;
  info: t.CaseItemEntry & Indexable;
  isEdited?: boolean;
};

export function isViewTemporaryCaseInfo(tci: TemporaryCaseInfo): tci is ViewTemporaryCaseInfo {
  return tci && (<ViewTemporaryCaseInfo>tci).action === CaseItemAction.View;
}

export type EditTemporaryCaseInfo = {
  screen: CaseSectionSubroute;
  action: CaseItemAction.Edit;
  info: t.CaseItemEntry & Indexable;
  isEdited?: boolean;
};

export function isEditTemporaryCaseInfo(tci: TemporaryCaseInfo): tci is EditTemporaryCaseInfo {
  return tci && (<EditTemporaryCaseInfo>tci).action === CaseItemAction.Edit;
}

export type AddTemporaryCaseInfo = {
  screen: CaseSectionSubroute;
  action: CaseItemAction.Add;
  info: t.CaseItemFormValues;
  isEdited?: boolean;
};

export function isAddTemporaryCaseInfo(tci: TemporaryCaseInfo): tci is AddTemporaryCaseInfo {
  return tci && (<AddTemporaryCaseInfo>tci).action === CaseItemAction.Add;
}

export type TemporaryCaseInfo =
  | { screen: typeof NewCaseSubroutes.ViewContact; info: ViewContact }
  | ViewTemporaryCaseInfo
  | AddTemporaryCaseInfo
  | EditTemporaryCaseInfo;

type SetConnectedCaseAction = {
  type: typeof SET_CONNECTED_CASE;
  connectedCase: t.Case;
  taskId: string;
  caseHasBeenEdited: Boolean;
};

type RemoveConnectedCaseAction = {
  type: typeof REMOVE_CONNECTED_CASE;
  taskId: string;
};

type UpdateCaseInfoAction = {
  type: typeof UPDATE_CASE_INFO;
  info: t.CaseInfo;
  taskId: string;
};

type TemporaryCaseInfoAction = {
  type: typeof UPDATE_TEMP_INFO;
  value: TemporaryCaseInfo;
  taskId: string;
};

type UpdateCasesStatusAction = {
  type: typeof UPDATE_CASE_STATUS;
  status: string;
  taskId: string;
};

type MarkCaseAsUpdated = {
  type: typeof MARK_CASE_AS_UPDATED;
  taskId: string;
};

export type CaseActionType =
  | SetConnectedCaseAction
  | RemoveConnectedCaseAction
  | UpdateCaseInfoAction
  | TemporaryCaseInfoAction
  | UpdateCasesStatusAction
  | MarkCaseAsUpdated;

export type Activity = NoteActivity | ReferralActivity | ConnectedCaseActivity;

export type NoteActivity = {
  date: string;
  type: string;
  text: string;
  twilioWorkerId: string;
  updatedAt?: string;
  updatedBy?: string;
  originalIndex: number;
};

export type ReferralActivity = {
  date: string;
  createdAt: string;
  type: string;
  text: string;
  referral: {
    date: string;
    comments: string;
    referredTo: string;
  };
  twilioWorkerId: string;
  updatedAt?: string;
  updatedBy?: string;
  originalIndex: number;
};

export type ConnectedCaseActivity = {
  contactId?: number;
  date: string;
  createdAt: string;
  type: string;
  text: string;
  twilioWorkerId: string;
  channel: string;
  originalIndex: number;
};

export type CaseDetailsName = {
  firstName: string;
  lastName: string;
};

export type CaseDetails = {
  id: number;
  name: CaseDetailsName;
  categories?: {
    [category: string]: {
      [subcategory: string]: boolean;
    };
  };
  status: string;
  prevStatus: string;
  caseCounselor: string;
  currentCounselor: string;
  openedDate: string;
  lastUpdatedDate: string;
  followUpDate: string;
  followUpPrintedDate: string;
  households: t.HouseholdEntry[];
  perpetrators: t.PerpetratorEntry[];
  incidents: t.IncidentEntry[];
  referrals: t.ReferralEntry[];
  notes: NoteActivity[];
  documents: t.DocumentEntry[];
  summary: string;
  childIsAtRisk: boolean;
  office?: HelplineEntry;
  version?: DefinitionVersionId;
  contact: any; // ToDo: change this
  contacts: any[];
};

export type CaseUpdater = (
  original: t.CaseInfo,
  temporaryInfo: t.CaseItemEntry,
  index: number | undefined,
) => t.CaseInfo;

export const updateCaseSectionListByIndex = (
  listProperty: string,
  entryProperty: string = listProperty,
): CaseUpdater => (original: t.CaseInfo, temporaryInfo: t.CaseItemEntry, index: number | undefined) => {
  const sectionList = [...((original ?? {})[listProperty] ?? [])];
  const { ...entry } = { ...temporaryInfo, [entryProperty]: temporaryInfo.form };
  if (entryProperty !== 'form') {
    delete entry.form;
  }
  if (typeof index === 'number') {
    sectionList[index] = entry;
  } else {
    sectionList.push(entry);
  }

  return original ? { ...original, [listProperty]: sectionList } : { [listProperty]: sectionList };
};

export const updateCaseListByIndex = <T>(
  listGetter: (ci: t.CaseInfo) => T[] | undefined,
  caseItemToListItem: (caseItemEntry: t.CaseItemEntry) => T,
): CaseUpdater => (original: t.CaseInfo, temporaryInfo: t.CaseItemEntry, index: number | undefined) => {
  const copy = { ...original };
  const sectionList = listGetter(copy);
  const entry: T = caseItemToListItem(temporaryInfo);
  if (typeof index === 'number') {
    sectionList[index] = entry;
  } else {
    sectionList.push(entry);
  }
  return copy;
};

export const temporaryCaseInfoHistory = (
  temporaryCaseInfo: EditTemporaryCaseInfo | ViewTemporaryCaseInfo,
  counselorsHash: Record<string, string>,
) => {
  const addingCounsellorName = counselorsHash[temporaryCaseInfo.info.twilioWorkerId] || 'Unknown';
  const added = new Date(temporaryCaseInfo.info.createdAt);
  const updatingCounsellorName = temporaryCaseInfo.info.updatedBy
    ? counselorsHash[temporaryCaseInfo.info.updatedBy] || 'Unknown'
    : undefined;
  const updated = temporaryCaseInfo.info.updatedAt ? new Date(temporaryCaseInfo.info.updatedAt) : undefined;
  return { addingCounsellorName, added, updatingCounsellorName, updated };
};
