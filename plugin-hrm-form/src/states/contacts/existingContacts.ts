import { CallTypes } from 'hrm-form-definitions';

import { CSAMReportEntry, SearchContact } from '../../types/types';
import { hrmServiceContactToSearchContact } from './contactDetailsAdapter';

export type Contact = {
  helpline: string;
  callType: CallTypes;
  childInformation: { [key: string]: string | boolean };
  callerInformation: { [key: string]: string | boolean };
  caseInformation: { [key: string]: string | boolean };
  contactlessTask: { [key: string]: string | boolean };
  categories: string[];
  csamReports: CSAMReportEntry[];
};

export type ExistingContactsState = {
  [contactId: string]: {
    refCount: number;
    contact: SearchContact;
  };
};

export const LOAD_CONTACT_ACTION = 'LOAD_CONTACT_ACTION';

type LoadContactAction = {
  type: typeof LOAD_CONTACT_ACTION;
  id: string;
  contact: SearchContact;
};

export const loadContact = (contact: SearchContact): LoadContactAction => ({
  type: LOAD_CONTACT_ACTION,
  id: contact.contactId,
  contact,
});

export const loadRawContact = (contact: any): LoadContactAction => ({
  type: LOAD_CONTACT_ACTION,
  id: contact.id,
  contact: hrmServiceContactToSearchContact(contact),
});

export const loadContactReducer = (state: ExistingContactsState, action: LoadContactAction) => {
  const current = state[action.id] ?? { refCount: 0 };
  return {
    ...state,
    [action.id]: {
      contact: action.contact,
      refCount: current.refCount + 1,
    },
  };
};

export const RELEASE_CONTACT_ACTION = 'RELEASE_CONTACT_ACTION';

type ReleaseContactAction = {
  type: typeof RELEASE_CONTACT_ACTION;
  id: string;
};

export const releaseContact = (id: string): ReleaseContactAction => ({
  type: RELEASE_CONTACT_ACTION,
  id,
});

export const releaseContactReducer = (state: ExistingContactsState, action: ReleaseContactAction) => {
  const current = state[action.id];
  if (!current) {
    console.warn(
      `Tried to release contact id ${action.id} but wasn't in the redux state. You should only release previously loaded contacts once`,
    );
  }
  if (current.refCount < 2) {
    if (current.refCount !== 1) {
      console.warn(
        `Contact id ${action.id} had a refCount of ${current.refCount} before it was removed, it should never go lower than 1`,
      );
    }
    const copy = { ...state };
    delete copy[action.id];
    return copy;
  }
  return {
    ...state,
    [action.id]: {
      ...current,
      refCount: current.refCount - 1,
    },
  };
};

export type ExistingContactAction = LoadContactAction | ReleaseContactAction;
