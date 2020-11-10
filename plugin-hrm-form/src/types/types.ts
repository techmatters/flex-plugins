/* eslint-disable import/no-unused-modules */

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
};

// Information about a single contact, as expected from DB (we might want to reuse this type in backend) - (is this a correct placement for this?)
export type ContactValues = {
  childInformation: {
    name: {
      firstName: string;
      lastName: string;

      gender: string;
      age: string;
      language: string;
      nationality: string;
      ethnicity: string;
      location: {
        streetAddress: string;
        city: string;
        stateOrCounty: string;
        postalCode: string;
        phone1: string;
        phone2: string;
      };
      refugee: boolean;
      disabledOrSpecialNeeds: boolean;
      hiv: boolean;
      school: {
        name: string;
        gradeLevel: string;
      };
    };
    caseInformation: {
      callSummary: string;
      referredTo: string;
      status: string;
      keepConfidential: boolean;
      okForCaseWorkerToCall: boolean;
      howDidTheChildHearAboutUs: string;
      didYouDiscussRightsWithTheChild: boolean;
      didTheChildFeelWeSolvedTheirProblem: boolean;
      wouldTheChildRecommendUsToAFriend: boolean;
    };
    callerInformation: CallerFormValues;
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
  details: ContactValues;
  counselor: string;
};

export type SearchCase = {
  // Todo: should be 'caseId' instead of 'id'?
  id: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  helpline: string;
  info: {
    summary?: string;
    notes?: string[];
    perpetrators?: PerpetratorEntry[];
    households?: HouseholdEntry[];
  };
  twilioWorkerId: string;
  // Todo: change to contacts type
  connectedContacts: Array<any>;
};

export type SearchContactResult = {
  count: number;
  contacts: SearchContact[];
  // ToDo: remove this
  cases: SearchCase[];
  casesCount: number;
};
