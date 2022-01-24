import { DefinitionVersionId, HelplineEntry } from 'hrm-form-definitions';

import type * as t from '../../types/types';
import { NewCaseSubroutes } from '../routing/types';

// Action types
export const SET_CONNECTED_CASE = 'SET_CONNECTED_CASE';
export const REMOVE_CONNECTED_CASE = 'REMOVE_CONNECTED_CASE';
export const UPDATE_CASE_INFO = 'UPDATE_CASE_INFO';
export const UPDATE_TEMP_INFO = 'UPDATE_TEMP_INFO';
export const UPDATE_CASE_STATUS = 'UPDATE_CASE_STATUS';
export const MARK_CASE_AS_UPDATED = 'MARK_CASE_AS_UPDATED';

export type ViewNote = {
  note: string;
  counselor: string;
  date: string;
};

export type ViewContact = {
  contact?: any; // TODO: create Contact type
  detailsExpanded: { [section: string]: boolean };
  createdAt: string;
  timeOfContact: string;
  counselor: string;
};

export type ViewReferral = {
  referral: t.ReferralEntry;
  counselor: string;
  date: string;
};

type Indexable = { index: number };

export type ViewTemporaryCaseInfo = {
  screen:
    | typeof NewCaseSubroutes.ViewDocument
    | typeof NewCaseSubroutes.ViewIncident
    | typeof NewCaseSubroutes.ViewPerpetrator
    | typeof NewCaseSubroutes.ViewHousehold
    | typeof NewCaseSubroutes.ViewNote
    | typeof NewCaseSubroutes.ViewReferral;
  info: t.CaseItemEntry;
};

export function isViewTemporaryCaseInfo(tci: TemporaryCaseInfo): tci is ViewTemporaryCaseInfo {
  return (
    tci &&
    (tci.screen === NewCaseSubroutes.ViewDocument ||
      tci.screen === NewCaseSubroutes.ViewIncident ||
      tci.screen === NewCaseSubroutes.ViewPerpetrator ||
      tci.screen === NewCaseSubroutes.ViewHousehold ||
      tci.screen === NewCaseSubroutes.ViewNote ||
      tci.screen === NewCaseSubroutes.ViewReferral)
  );
}

export type EditTemporaryCaseInfo = {
  screen:
    | typeof NewCaseSubroutes.EditDocument
    | typeof NewCaseSubroutes.EditIncident
    | typeof NewCaseSubroutes.EditPerpetrator
    | typeof NewCaseSubroutes.EditHousehold
    | typeof NewCaseSubroutes.EditNote
    | typeof NewCaseSubroutes.EditReferral;
  info: t.CaseItemEntry & Indexable;
};

export function isEditTemporaryCaseInfo(tci: TemporaryCaseInfo): tci is EditTemporaryCaseInfo {
  return (
    tci &&
    (tci.screen === NewCaseSubroutes.EditDocument ||
      tci.screen === NewCaseSubroutes.EditIncident ||
      tci.screen === NewCaseSubroutes.EditPerpetrator ||
      tci.screen === NewCaseSubroutes.EditHousehold ||
      tci.screen === NewCaseSubroutes.EditNote ||
      tci.screen === NewCaseSubroutes.EditReferral)
  );
}

export type AddTemporaryCaseInfo = {
  screen:
    | typeof NewCaseSubroutes.AddDocument
    | typeof NewCaseSubroutes.AddIncident
    | typeof NewCaseSubroutes.AddPerpetrator
    | typeof NewCaseSubroutes.AddHousehold
    | typeof NewCaseSubroutes.AddNote
    | typeof NewCaseSubroutes.AddReferral;
  info: t.CaseItemFormValues;
};

export function isAddTemporaryCaseInfo(tci: TemporaryCaseInfo): tci is AddTemporaryCaseInfo {
  return (
    tci &&
    (tci.screen === NewCaseSubroutes.AddDocument ||
      tci.screen === NewCaseSubroutes.AddIncident ||
      tci.screen === NewCaseSubroutes.AddPerpetrator ||
      tci.screen === NewCaseSubroutes.AddHousehold ||
      tci.screen === NewCaseSubroutes.AddNote ||
      tci.screen === NewCaseSubroutes.AddReferral)
  );
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
};

type ReferralActivity = {
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
};

export type ConnectedCaseActivity = {
  contactId?: number;
  date: string;
  createdAt: string;
  type: string;
  text: string;
  twilioWorkerId: string;
  channel: string;
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
  caseCounselor: string;
  currentCounselor: string;
  openedDate: string;
  lastUpdatedDate: string;
  followUpDate: string;
  households: t.HouseholdEntry[];
  perpetrators: t.PerpetratorEntry[];
  incidents: t.IncidentEntry[];
  referrals: t.ReferralEntry[];
  notes: NoteActivity[];
  summary: string;
  childIsAtRisk: boolean;
  office?: HelplineEntry;
  version?: DefinitionVersionId;
  contact: any; // ToDo: change this
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
