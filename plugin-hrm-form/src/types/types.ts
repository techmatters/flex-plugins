/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable import/no-unused-modules */
import { ITask } from '@twilio/flex-ui';
import { DefinitionVersionId, CallTypes } from 'hrm-form-definitions';

import { DateFilterValue } from '../components/caseList/filters/dateFilters';
import { ChannelTypes } from '../states/DomainConstants';

export type EntryInfo = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  twilioWorkerId: string;
};

/*
 * export type ReferralEntry = {
 *   date: string;
 *   referredTo: string;
 *   comments: string;
 * };
 */

export type CaseItemFormValues = { [key: string]: string | boolean };

export type CaseItemEntry = { form: CaseItemFormValues } & EntryInfo;

export type Household = { [key: string]: string | boolean };

export type HouseholdEntry = { household: Household } & EntryInfo;

export type Perpetrator = { [key: string]: string | boolean };

export type PerpetratorEntry = { perpetrator: Perpetrator } & EntryInfo;

export type Incident = { [key: string]: string | boolean };

export type IncidentEntry = { incident: Incident } & EntryInfo;

export type Note = { [key: string]: string | boolean };

export type NoteEntry = Note & EntryInfo;

export type Referral = { date: string; referredTo: string; [key: string]: string | boolean };

export type ReferralEntry = Referral & EntryInfo;

export type Document = { [key: string]: string | boolean };

export type DocumentEntry = { document: Document; id: string | undefined } & EntryInfo;

export type CSAMReportEntry = {
  csamReportId: string;
  id: number;
  reportType: 'counsellor-generated' | 'self-generated';
  acknowledged: boolean;
  contactId?: number;
} & Omit<EntryInfo, 'id'>;

export type CaseInfo = {
  definitionVersion?: DefinitionVersionId;
  offlineContactCreator?: string;
  summary?: string;
  counsellorNotes?: NoteEntry[];
  perpetrators?: PerpetratorEntry[];
  households?: HouseholdEntry[];
  referrals?: ReferralEntry[];
  incidents?: IncidentEntry[];
  documents?: DocumentEntry[];
  followUpDate?: string;
  childIsAtRisk?: boolean;
};

export type Case = {
  accountSid: any;
  id: number;
  status: string;
  helpline: string;
  twilioWorkerId: string;
  info?: CaseInfo;
  categories: {};
  createdAt: string;
  updatedAt: string;
  connectedContacts: HrmServiceContact[];
};

export type TwilioStoredMedia = {
  store: 'twilio';
  reservationSid: string;
};

export enum ContactMediaType {
  // RECORDING = 'recording',
  TRANSCRIPT = 'transcript',
}

export type S3StoredTranscript = {
  store: 'S3';
  type: ContactMediaType.TRANSCRIPT;
  url?: string;
};

type S3StoredMedia = S3StoredTranscript;

export type ConversationMedia = TwilioStoredMedia | S3StoredMedia;

export const isTwilioStoredMedia = (m: ConversationMedia): m is TwilioStoredMedia => m.store === 'twilio';
export const isS3StoredTranscript = (m: ConversationMedia): m is S3StoredTranscript =>
  m.store === 'S3' && m.type === ContactMediaType.TRANSCRIPT;

// Information about a single contact, as expected from DB (we might want to reuse this type in backend) - (is this a correct placement for this?)
export type ContactRawJson = {
  definitionVersion?: DefinitionVersionId;
  callType: CallTypes | '';
  childInformation: Record<string, boolean | string>;
  callerInformation: Record<string, boolean | string>;
  caseInformation: { categories: {} } & { [key: string]: string | boolean | {} }; // having {} makes type looser here because of this https://github.com/microsoft/TypeScript/issues/17867. Possible/future solution https://github.com/microsoft/TypeScript/pull/29317
  contactlessTask: { channel: ChannelTypes; [key: string]: string | boolean };
  conversationMedia: ConversationMedia[];
};

export type HrmServiceContact = {
  id: string;
  twilioWorkerId: string;
  number: string;
  conversationDuration: number;
  csamReports: CSAMReportEntry[];
  createdBy: string;
  helpline: string;
  taskId: string;
  channel: ChannelTypes | 'default';
  updatedBy: string;
  updatedAt: string;
  rawJson: ContactRawJson;
  timeOfContact: string;
  queueName: string;
  channelSid: string;
  serviceSid: string;
};

// Information about a single contact, as expected from search contacts endpoint (we might want to reuse this type in backend) - (is this a correct placement for this?)
export type SearchAPIContact = {
  contactId: string;
  overview: {
    helpline: string;
    dateTime: string;
    customerNumber: string;
    callType: CallTypes | '';
    categories: {};
    counselor: string;
    notes: string;
    channel: ChannelTypes | 'default';
    conversationDuration: number;
    createdBy: string;
    taskId: string;
    updatedBy?: string;
    updatedAt?: string;
  };
  details: ContactRawJson;
  csamReports: CSAMReportEntry[];
};

export type SearchUIContact = SearchAPIContact & { counselorName: string; callerName?: string };

export type SearchContactResult = {
  count: number;
  contacts: SearchUIContact[];
};

export type SearchCaseResult = {
  count: number;
  cases: Case[];
};

export enum ListCasesSortBy {
  ID = 'id',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  CHILD_NAME = 'childName',
  FOLLOW_UP_DATE = 'info.followUpDate',
}

export enum ListCasesSortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type ListCasesSort = {
  sortBy?: ListCasesSortBy;
  sortDirection?: ListCasesSortDirection;
};

export type ListCasesQueryParams = {
  limit?: number;
  offset?: number;
  sortBy?: ListCasesSortBy;
  sortDirection?: ListCasesSortDirection;
} & ListCasesSort;

export type CategoryFilter = {
  category: string;
  subcategory: string;
};

export type ListCasesFilters = {
  counsellors: string[];
  statuses: string[];
  includeOrphans: boolean;
  createdAt?: DateFilterValue;
  updatedAt?: DateFilterValue;
  followUpDate?: DateFilterValue;
  categories?: CategoryFilter[];
};

export type CounselorHash = {
  [sid: string]: string;
};

/* eslint-disable camelcase */
export type FeatureFlags = {
  enable_fullstory_monitoring: boolean; // Enables Full Story
  enable_upload_documents: boolean; // Enables Case Documents
  enable_post_survey: boolean; // Enables Post-Survey
  enable_contact_editing: boolean; // Enables Editing Contacts
  enable_case_management: boolean; // Enables Creating Cases and Viewing the Case List
  enable_offline_contact: boolean; // Enables Creating Offline Contacts
  enable_filter_cases: boolean; // Enables Filters at Case List
  enable_sort_cases: boolean; // Enables Sorting at Case List
  enable_transfers: boolean; // Enables Transfering Contacts
  enable_manual_pulling: boolean; // Enables Adding Another Task
  enable_csam_report: boolean; // Enables CSAM Reports
  enable_canned_responses: boolean; // Enables Canned Responses
  enable_dual_write: boolean; // Enables Saving Contacts on External Backends
  enable_save_insights: boolean; // Enables Saving Aditional Data on Insights
  enable_previous_contacts: boolean; // Enables Previous Contacts Yellow Banner
  enable_voice_recordings: boolean; // Enables Loading Voice Recordings
  enable_twilio_transcripts: boolean; // Enables Viewing Transcripts Stored at Twilio
  enable_external_transcripts: boolean; // Enables Viewing Transcripts Stored Outside of Twilio
  post_survey_serverless_handled: boolean; // Post Survey handled in serverless instead of in Flex
  enable_csam_clc_report: boolean; // Enables CSAM child Reports
  enable_emoji_picker: boolean; // Enables Emoji Picker
};
/* eslint-enable camelcase */

/**
 * Custom tasks
 */
export const offlineContactTaskSid = 'offline-contact-task-sid';
export type OfflineContactTask = {
  taskSid: typeof offlineContactTaskSid;
  attributes: {
    isContactlessTask: true;
    channelType: 'default';
    helplineToSave?: string;
    preEngagementData?: Record<string, string>;
  };
  channelType: 'default';
};

export const standaloneTaskSid = 'standalone-task-sid';

export type StandaloneITask = {
  taskSid: typeof standaloneTaskSid;
  attributes: {
    isContactlessTask: boolean;
  };
};

export type InMyBehalfITask = ITask & { attributes: { isContactlessTask: true; isInMyBehalf: true } };

export type CustomITask = ITask | OfflineContactTask | InMyBehalfITask;

export function isOfflineContactTask(task: CustomITask): task is OfflineContactTask {
  return task.taskSid === offlineContactTaskSid;
}

/**
 * Checks if the task is issued by someone else to avoid showing certain things in the UI. This is done by checking isInMyBehalf task attribute (attached while creating offline contacts)
 */
export function isInMyBehalfITask(task: CustomITask): task is InMyBehalfITask {
  return task.attributes && task.attributes.isContactlessTask && (task.attributes as any).isInMyBehalf;
}

export function isTwilioTask(task: CustomITask): task is ITask {
  return task && !isOfflineContactTask(task) && !isInMyBehalfITask(task);
}

export const isStandaloneITask = (task): task is StandaloneITask => {
  return task && task.taskSid === standaloneTaskSid;
};
