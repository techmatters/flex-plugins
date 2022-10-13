import { DefinitionVersionId, HelplineEntry, StatusInfo } from 'hrm-form-definitions';

import type * as t from '../../types/types';
import { Case, CaseItemEntry } from '../../types/types';

// Action types
export const SET_CONNECTED_CASE = 'SET_CONNECTED_CASE';
export const REMOVE_CONNECTED_CASE = 'REMOVE_CONNECTED_CASE';

type SetConnectedCaseAction = {
  type: typeof SET_CONNECTED_CASE;
  connectedCase: t.Case;
  taskId: string;
};

type RemoveConnectedCaseAction = {
  type: typeof REMOVE_CONNECTED_CASE;
  taskId: string;
};

export type CaseActionType = SetConnectedCaseAction | RemoveConnectedCaseAction;

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

export const caseItemHistory = (
  info: { updatedAt?: string; updatedBy?: string; createdAt: string; twilioWorkerId: string },
  counselorsHash: Record<string, string>,
) => {
  const addingCounsellorName = counselorsHash[info.twilioWorkerId] || 'Unknown';
  const added = new Date(info.createdAt);
  const updatingCounsellorName = info.updatedBy ? counselorsHash[info.updatedBy] || 'Unknown' : undefined;
  const updated = info.updatedAt ? new Date(info.updatedAt) : undefined;
  return { addingCounsellorName, added, updatingCounsellorName, updated };
};

export type CaseSummaryWorkingCopy = {
  status: string;
  followUpDate: string;
  childIsAtRisk: boolean;
  summary: string;
};

export type CaseWorkingCopy = {
  sections: {
    [section: string]: {
      new?: CaseItemEntry;
      existing: { [id: string]: CaseItemEntry };
    };
  };
  caseSummary?: CaseSummaryWorkingCopy;
};
export type CaseState = {
  tasks: {
    [taskId: string]: {
      connectedCase: Case;
      caseWorkingCopy: CaseWorkingCopy;
      availableStatusTransitions: StatusInfo[];
    };
  };
};
