/* eslint-disable import/no-unused-modules */
import type { CallTypes } from '../states/DomainConstants';
import { CallerFormValues } from '../components/common/forms/CallerForm';

export type CaseStatus = 'open' | 'close';

export type PerpetratorEntry = { perpetrator: CallerFormValues; createdAt: string; twilioWorkerId: string };

export type HouseholdEntry = { household: CallerFormValues; createdAt: string; twilioWorkerId: string };

export type CaseInfo = {
  summary?: string;
  notes?: string[];
  perpetrators?: PerpetratorEntry[];
  households?: HouseholdEntry[];
};

export type Case = {
  id: number;
  status: CaseStatus;
  helpline: string;
  twilioWorkerId: string;
  info?: CaseInfo;
  createdAt: string;
  updatedAt: string;
  connectedContacts: any[]; // TODO: create contact type
};

// Information about a single contact, as expected from DB (we might want to reuse this type in backend) - (is this a correct placement for this?)
export type ContactRawJson = {
  definitionVersion?: number;
  callType: CallTypes;
  childInformation: { [key: string]: string | boolean } & { name: { firstName: string; lastName: string } };
  callerInformation: { [key: string]: string | boolean } & { name: { firstName: string; lastName: string } };
  caseInformation: { [key: string]: string | boolean } & { categories: {} };
  contactlessTask: { [key: string]: string | boolean };
  metadata: {
    startMillis: number;
    endMillis: number;
    recreated: boolean;
  };
};

// Information about a single contact, as expected from search contacts endpoint (we might want to reuse this type in backend) - (is this a correct placement for this?)
export type SearchContact = {
  contactId: string;
  overview: {
    dateTime: string;
    name: string;
    customerNumber: string;
    callType: string;
    categories: {};
    counselor: string;
    notes: string;
    channel: string;
    conversationDuration: number;
  };
  details: ContactRawJson;
};

export type SearchContactResult = {
  count: number;
  contacts: SearchContact[];
};

export type SearchCaseResult = {
  count: number;
  cases: Case[];
};
