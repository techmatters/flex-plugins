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
import type { ITask as ITaskOriginalType, TaskContextProps as TaskContextPropsOriginalType } from '@twilio/flex-ui';
import type { CallTypes, DefinitionVersionId } from 'hrm-form-definitions';

import type { ChannelTypes } from '../states/DomainConstants';
import type { ResourceReferral } from '../states/contacts/resourceReferral';
import { DateFilterValue } from '../states/caseList/dateFilters';
import { AccountSID, TaskSID, WorkerSID } from './twilio';

declare global {
  export interface ITask<T = Record<string, any>> extends ITaskOriginalType<T> {
    taskSid: TaskSID
  }
  export interface TaskContextProps extends TaskContextPropsOriginalType {
    task?: ITask
  }
}

export type EntryInfo = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  twilioWorkerId: string;
};

export type CaseItemFormValues = { [key: string]: string | boolean };

export type CSAMReportEntry = {
  csamReportId: string;
  id: number;
  reportType: 'counsellor-generated' | 'self-generated';
  acknowledged: boolean;
  contactId?: number;
} & Omit<EntryInfo, 'id'>;

export type CaseOverview = {
  followUpDate?: string;
  childIsAtRisk?: boolean;
  summary?: string;
  [key: string]: any;
}

export type CaseInfo = CaseOverview & {
  definitionVersion?: DefinitionVersionId;
  offlineContactCreator?: string;
};

export type Case = {
  accountSid: AccountSID;
  id: string;
  label: string;
  status: string;
  helpline: string;
  twilioWorkerId: WorkerSID;
  info?: CaseInfo;
  createdAt: string;
  updatedAt: string;
  updatedBy?: WorkerSID;
  statusUpdatedAt?: string;
  statusUpdatedBy?: WorkerSID;
  previousStatus?: string;
};

export type TwilioStoredMedia = {
  storeType: 'twilio';
  storeTypeSpecificData: {
    reservationSid: string;
  };
};

export type SignedURLMethod = 'getObject' | 'putObject' | 'deleteObject';
export type ObjectType = 'case' | 'contact';
export type MediaType = 'recording' | 'transcript' | 'document';

export type GenerateSignedUrlPathParams = {
  method: SignedURLMethod;
  objectType: ObjectType;
  objectId: string;
  fileType: MediaType;
  location: S3Location;
};

export type S3Location = {
  bucket: string;
  key: string;
};

export type S3StoredTranscript = {
  storeType: 'S3';
  storeTypeSpecificData: {
    type: 'transcript';
    location?: S3Location;
  };
};

export type S3StoredRecording = {
  storeType: 'S3';
  storeTypeSpecificData: {
    type: 'recording';
    location?: S3Location;
  };
};

export type S3StoredMedia = S3StoredTranscript | S3StoredRecording;

export type ConversationMedia = TwilioStoredMedia | S3StoredMedia;

export const isTwilioStoredMedia = (m: ConversationMedia): m is TwilioStoredMedia => m.storeType === 'twilio';
export const isS3StoredTranscript = (m: ConversationMedia): m is S3StoredTranscript =>
  m.storeType === 'S3' && m.storeTypeSpecificData.type === 'transcript';
export const isS3StoredRecording = (m: ConversationMedia): m is S3StoredRecording =>
  m.storeType === 'S3' && m.storeTypeSpecificData.type === 'recording';

// Information about a single contact, as expected from DB (we might want to reuse this type in backend) - (is this a correct placement for this?)
export type ContactRawJson = {
  definitionVersion?: DefinitionVersionId;
  callType: CallTypes | '';
  childInformation: Record<string, boolean | string>;
  callerInformation: Record<string, boolean | string>;
  caseInformation: Record<string, boolean | string>;
  categories: Record<string, string[]>;
  contactlessTask: {
    channel: ChannelTypes;
    createdOnBehalfOf: WorkerSID;
    [key: string]: string | boolean;
  };
  llmSupportedEntries?: { [key in 'childInformation'|'callerInformation'|'caseInformation']?: string[] }
};

export type Contact = {
  id: string;
  accountSid: AccountSID;
  twilioWorkerId: WorkerSID;
  number: string;
  conversationDuration: number;
  csamReports: CSAMReportEntry[];
  referrals?: ResourceReferral[];
  conversationMedia?: ConversationMedia[];
  createdAt: string;
  createdBy: string;
  helpline: string;
  taskId: TaskSID;
  // taskReservationSid: string;
  profileId: Profile['id'] | null;
  identifierId: Identifier['id'] | null;
  channel: ChannelTypes | 'default';
  updatedBy: string;
  updatedAt?: string;
  finalizedAt?: string;
  rawJson: ContactRawJson;
  timeOfContact: string;
  queueName: string;
  channelSid: string;
  serviceSid: string;
  caseId?: string;
  definitionVersion: string;
};


export type SearchContactResult = {
  count: number;
  contacts: Contact[];
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

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type ListCasesSort = {
  sortBy?: ListCasesSortBy;
  sortDirection?: SortDirection;
};

export type ListCasesQueryParams = {
  limit?: number;
  offset?: number;
  sortBy?: ListCasesSortBy;
  sortDirection?: SortDirection;
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
  caseInfoFilters?: Record<string, string[] | DateFilterValue>;
};

export type CounselorHash = {
  [sid: string]: string;
};

export type ConfigFlags = {
  enableExternalRecordings: boolean;
  enableUnmaskingCalls: boolean;
  hideAddToNewCaseButton: boolean;
};

/* eslint-disable camelcase */
export type FeatureFlags = {
  // Please keep this in alphabetical order!
  backend_handled_chat_janitor: boolean; // [Temporary flag until all accounts are migrated] Enables handling the janitor from taskrouter event listeners
  enable_active_contact_header: boolean; // Enables Active Contact Header
  enable_aselo_messaging_ui: boolean; // Enables Aselo Messaging UI iinstead of the default Twilio one - reduced functionality for low spec clients.
  enable_backend_hrm_contact_creation: boolean; // If this is enabled, HRM contact creation is initiated from a task router handler rather than from the Flex plugin
  enable_backend_manual_pulling: boolean; // Enables Backend Manual Pulling
  enable_canned_responses: boolean; // Enables Canned Responses
  enable_client_profiles: boolean; // Enables Client Profiles
  enable_conferencing: boolean; // Enables Conferencing UI and replaces default Twilio components and behavior  
  enable_confirm_on_browser_close: boolean; // Enables confirmation dialog on browser close when there are unsaved changes
  enable_counselor_toolkits: boolean; // Enables Counselor Toolkits
  enable_csam_clc_report: boolean; // Enables CSAM child Reports
  enable_csam_report: boolean; // Enables CSAM Reports
  enable_dual_write: boolean; // Enables Saving Contacts on External Backends
  enable_emoji_picker: boolean; // Enables Emoji Picker
  enable_external_transcripts: boolean; // Enables Viewing Transcripts Stored Outside of Twilio
  enable_filter_cases: boolean; // Enables Filters at Case List
  enable_fullstory_monitoring: boolean; // Enables Full Story
  enable_generalized_search: boolean; // Enables Generalized Search
  enable_last_case_status_update_info: boolean; // Enables showing the time, user and changed status of the most recent case status update on the 'Edit Case Summary' page
  enable_manual_pulling: boolean; // Enables Adding Another Task
  enable_offline_contact: boolean; // Enables Creating Offline Contacts  
  enable_permissions_from_backend: boolean; // Enables fetching permissions from backend service
  enable_post_survey: boolean; // Enables Post-Survey
  enable_previous_contacts: boolean; // Enables Previous Contacts Yellow Banner
  enable_region_resource_search: boolean; // Enables specifying a region as well as a province and / or city in Resource Search
  enable_save_in_progress_contacts: boolean; // Enables Saving In Progress Contacts
  enable_save_insights: boolean; // Enables Saving Aditional Data on Insights
  enable_teams_view_enhancements2: boolean; // Enables custom Teams View UI with labels
  enable_hierarchical_translations: boolean; // Enables new translation structure with base language, locale overrides, and helpline overrides. When false, uses legacy helpline-based translation files
  enable_twilio_transcripts: boolean; // Enables Viewing Transcripts Stored at Twilio
  enable_voice_recordings: boolean; // Enables Loading Voice Recordings
  enable_llm_summary: boolean; // Enables generation of suggested contact summaries via an LLM
};
/* eslint-enable camelcase */

export type LexMemory = {
  aboutSelf?: 'Yes' | 'No';
  [key: string]: string;
};

/* eslint-disable camelcase */
export type AutopilotMemory = {
  twilio: {
    collected_data: {
      collect_survey: {
        answers: {
          [key: string]: {
            answer: string;
            error: string;
          };
        };
      };
    };
  };
};
/* eslint-enable camelcase */

/**
 * Custom tasks
 */
export type OfflineContactTask = {
  // eslint-disable-next-line prettier/prettier
  taskSid: `offline-contact-task-${string}`
  attributes: {
    isContactlessTask: true;
    channelType: 'default';
    helplineToSave?: string;
    preEngagementData?: Record<string, string>;
    skipInsights?: boolean;
    customChannelType?: string;
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

export function isStandaloneTask(task: RouterTask): task is StandaloneITask {
  return task.taskSid === standaloneTaskSid;
}

// Whilst this is the same as ITask<{ isContactlessTask: true; isInMyBehalf: true }>, TS can distinguish this one from a Twilio ITask
export type InMyBehalfITask = ITask & { attributes: { isContactlessTask: true; isInMyBehalf: true } };

export type CustomITask = ITask | OfflineContactTask | InMyBehalfITask

export type RouterTask = CustomITask | StandaloneITask

export function isOfflineContactTask(task: RouterTask): task is OfflineContactTask {
  return Boolean(task.taskSid?.startsWith('offline-contact-task-'));
}

export function isOfflineContact(contact: Contact): boolean {
  return Boolean(contact?.taskId?.startsWith('offline-contact-task-'));
}

/**
 * Checks if the task is issued by someone else to avoid showing certain things in the UI. This is done by checking isInMyBehalf task attribute (attached while creating offline contacts)
 */
export function isInMyBehalfITask(task: RouterTask): task is InMyBehalfITask {
  return task?.attributes && task.attributes.isContactlessTask && (task.attributes as any).isInMyBehalf;
}

export function isTwilioTask(task: RouterTask): task is ITask {
  return task && !isOfflineContactTask(task) && !isInMyBehalfITask(task);
}

export const isStandaloneITask = (task): task is StandaloneITask => {
  return task && task.taskSid === standaloneTaskSid;
};

export type Identifier = {
  id: number;
  identifier: string;
  accountSid: string;
  createdAt?: string;
  updatedAt?: string;
  profiles: Profile[];
};

export type ProfileSection = {
  id: number;
  sectionType: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Profile = {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  identifiers?: Identifier[];
  profileFlags?: {id: ProfileFlag['id'], name: ProfileFlag['name'], validUntil: ProfileFlag['validUntil']}[];
  profileSections?: ProfileSection[];
  // This is a flag to indicate if the profile has contacts or not. It will be set to 'true' even if the user as no permission to view any of the contacts.
  // It is a hack to work around the fact we don't support limited contact view permission. Once we do, this property along with its backend logic should be removed.
  hasContacts?: boolean;
};


export type ProfileFlag = {
  id: number;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  validUntil?: Date;
};

export enum ProfilesListSortBy {
  ID = 'id',
  NAME = 'name',
}

export type ProfilesListSort = {
  sortBy?: ProfilesListSortBy;
  sortDirection?: SortDirection;
};

export type ProfilesListFilters = {
  statuses: string[];
}
