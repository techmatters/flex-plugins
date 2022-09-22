import { DefinitionVersionId, HelplineEntry } from 'hrm-form-definitions';

import type * as t from '../../types/types';
import { CaseItemAction, CaseSectionSubroute, NewCaseSubroutes } from '../routing/types';
import { CaseItemEntry } from '../../types/types';
import { CaseSectionApi } from './sections/api';

// Action types
export const SET_CONNECTED_CASE = 'SET_CONNECTED_CASE';
export const REMOVE_CONNECTED_CASE = 'REMOVE_CONNECTED_CASE';
export const UPDATE_CASE_INFO = 'UPDATE_CASE_INFO';
export const UPDATE_TEMP_INFO = 'UPDATE_TEMP_INFO';
export const UPDATE_CASE_SECTION_WORKING_COPY = 'UPDATE_CASE_SECTION_WORKING_COPY';
export const INIT_CASE_SECTION_WORKING_COPY = 'INIT_CASE_SECTION_WORKING_COPY';
export const REMOVE_CASE_SECTION_WORKING_COPY = 'REMOVE_CASE_SECTION_WORKING_COPY';
export const UPDATE_CASE_STATUS = 'UPDATE_CASE_STATUS';
export const MARK_CASE_AS_UPDATED = 'MARK_CASE_AS_UPDATED';
export const UPDATE_CASE_CONTACT = 'UPDATE_CASE_CONTACT';

export type EditTemporaryCaseInfo = {
  screen: CaseSectionSubroute;
  action: CaseItemAction.Edit;
  info: t.CaseItemEntry;
  isEdited?: boolean;
};

export type TemporaryCaseInfo = EditTemporaryCaseInfo;

type SetConnectedCaseAction = {
  type: typeof SET_CONNECTED_CASE;
  connectedCase: t.Case;
  taskId: string;
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

type UpdateCaseSectionWorkingCopyAction = {
  type: typeof UPDATE_CASE_SECTION_WORKING_COPY;
  taskId: string;
  api: CaseSectionApi<unknown>;
  id?: string;
  sectionItem: CaseItemEntry;
};

type InitialiseCaseSectionWorkingCopyAction = {
  type: typeof INIT_CASE_SECTION_WORKING_COPY;
  taskId: string;
  api: CaseSectionApi<unknown>;
  id?: string;
};

type RemoveCaseSectionWorkingCopyAction = {
  type: typeof REMOVE_CASE_SECTION_WORKING_COPY;
  taskId: string;
  api: CaseSectionApi<unknown>;
  id?: string;
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

type UpdateCaseContactAction = {
  type: typeof UPDATE_CASE_CONTACT;
  taskId: string;
  contact: any;
};

export type CaseActionType =
  | SetConnectedCaseAction
  | RemoveConnectedCaseAction
  | UpdateCaseInfoAction
  | TemporaryCaseInfoAction
  | UpdateCaseSectionWorkingCopyAction
  | InitialiseCaseSectionWorkingCopyAction
  | UpdateCasesStatusAction
  | MarkCaseAsUpdated
  | UpdateCaseContactAction
  | RemoveCaseSectionWorkingCopyAction;

export type Activity = NoteActivity | ReferralActivity | ConnectedCaseActivity;

export type NoteActivity = {
  id: string;
  date: string;
  type: string;
  text: string;
  note: t.Note;
  twilioWorkerId: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type ReferralActivity = {
  id: string;
  date: string;
  createdAt: string;
  type: string;
  text: string;
  referral: t.Referral;
  twilioWorkerId: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type ConnectedCaseActivity = {
  callType: string;
  contactId?: string;
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
  prevStatus: string;
  caseCounselor: string;
  currentCounselor: string;
  createdAt: string;
  updatedAt: string;
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

export const temporaryCaseInfoHistory = (
  temporaryCaseInfo: EditTemporaryCaseInfo,
  counselorsHash: Record<string, string>,
) => caseItemHistory(temporaryCaseInfo.info, counselorsHash);

export const caseItemHistory = (info: CaseItemEntry, counselorsHash: Record<string, string>) => {
  const addingCounsellorName = counselorsHash[info.twilioWorkerId] || 'Unknown';
  const added = new Date(info.createdAt);
  const updatingCounsellorName = info.updatedBy ? counselorsHash[info.updatedBy] || 'Unknown' : undefined;
  const updated = info.updatedAt ? new Date(info.updatedAt) : undefined;
  return { addingCounsellorName, added, updatingCounsellorName, updated };
};
