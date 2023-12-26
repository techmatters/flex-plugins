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

import { omit } from 'lodash';

import { Contact, ContactRawJson } from '../../types/types';
import { AddExternalReportEntryAction } from '../csam-report/existingContactExternalReport';
import { ConfigurationState } from '../configuration/reducer';
import { transformValuesForContactForm } from './contactDetailsAdapter';
import { ContactMetadata } from './types';
import { newContactMetaData } from './contactState';

export enum ContactDetailsRoute {
  EDIT_CALLER_INFORMATION = 'editCallerInformation',
  EDIT_CHILD_INFORMATION = 'editChildInformation',
  EDIT_CATEGORIES = 'editIssueCategories',
  EDIT_CASE_INFORMATION = 'editCaseInformation',
}

export type ContactDraftChanges = Omit<Partial<Contact>, 'rawJson'> & { rawJson?: Partial<ContactRawJson> };

// TODO: Update this type when the Lambda worker is "done"
export type TranscriptMessage = {
  sid: string;
  dateCreated: Date;
  from: string;
  body: string;
  index: number;
  type: string;
  media: any;
};

type ExportTranscripParticipantUser = {
  sid: string;
  accountSid: string;
  serviceSid: string;
  friendlyName: string;
  type: string;
  permissions: string[];
  dateCreated: Date;
  url: string;
  isCounselor: boolean;
};

type ExportTranscripParticipantRole = {
  isCounselor: boolean;
};

type ExportTranscripParticipants = {
  [key: string]: {
    user: ExportTranscripParticipantUser | null;
    role: ExportTranscripParticipantRole | null;
  };
};

export type Transcript = {
  accountSid: string;
  serviceSid: string;
  channelSid: string;
  messages: TranscriptMessage[];
  participants: ExportTranscripParticipants;
};

export type TranscriptResult = {
  transcript: Transcript;
  accountSid: string;
  contactId: string;
  taskId: string;
  twilioWorkerId: string;
  serviceSid: string;
  channelSid: string;
};

export type ContactState = {
  references: Set<string>;
  savedContact: Contact;
  draftContact?: ContactDraftChanges;
  metadata: ContactMetadata;
  transcript?: Transcript;
};

export type ExistingContactsState = {
  [contactId: string]: ContactState;
};

export const LOAD_CONTACT_ACTION = 'LOAD_CONTACT_ACTION';

type LoadContactAction = {
  type: typeof LOAD_CONTACT_ACTION;
  contacts: Partial<Contact>[];
  reference?: string;
  replaceExisting: boolean;
};

export const loadContact = (contact: Partial<Contact>, reference, replaceExisting = false): LoadContactAction => ({
  type: LOAD_CONTACT_ACTION,
  contacts: [contact],
  reference,
  replaceExisting,
});

export const loadContacts = (
  contacts: Partial<Contact>[],
  reference: string,
  replaceExisting = false,
): LoadContactAction => ({
  type: LOAD_CONTACT_ACTION,
  contacts,
  reference,
  replaceExisting,
});

export const initialState: ExistingContactsState = {};

export const refreshContact = (contact: any) => loadContact(contact, undefined, true);

export const loadContactReducer = (state = initialState, action: LoadContactAction) => {
  const updateEntries = action.contacts
    .filter(c => {
      return (
        (action.reference && !(state[c.id]?.references ?? new Set()).has(action.reference)) || action.replaceExisting
      );
    })
    .map(c => {
      const current = state[c.id] ?? { references: new Set() };
      const { draftContact, ...currentContact } = state[c.id] ?? {
        categories: {
          expanded: {},
          gridView: false,
        },
      };
      return [
        c.id,
        {
          metadata: newContactMetaData(true),
          ...currentContact,
          savedContact: action.replaceExisting || !current.references.size ? c : state[c.id].savedContact,
          references: action.reference ? current.references.add(action.reference) : current.references,
          draftContact: action.replaceExisting ? undefined : draftContact,
        },
      ];
    });
  return {
    ...state,
    ...Object.fromEntries(updateEntries),
  };
};

export const RELEASE_CONTACT_ACTION = 'RELEASE_CONTACT_ACTION';

type ReleaseContactAction = {
  type: typeof RELEASE_CONTACT_ACTION;
  ids: string[];
  reference: string;
};

const releaseContactStatesById = (
  state: ExistingContactsState,
  ids: string[],
  reference: string,
): ExistingContactsState => {
  const updateKvps = ids
    .map(id => {
      const current = state[id];
      if (!current) {
        console.warn(
          `Tried to release contact id ${id} but wasn't in the redux state. You should only release previously loaded contacts once`,
        );
        return [id, undefined];
      }
      current.references.delete(reference);
      return [id, current];
    })
    .filter(([, ecs]) => typeof ecs === 'object' && ecs.references.size > 0);
  return {
    ...omit(state, ...ids),
    ...Object.fromEntries(updateKvps),
  };
};

export const releaseAllContactStates = (state: ExistingContactsState, reference: string) =>
  releaseContactStatesById(state, Object.keys(state), reference);

export const releaseContact = (id: string, reference: string): ReleaseContactAction => ({
  type: RELEASE_CONTACT_ACTION,
  ids: [id],
  reference,
});

export const releaseContacts = (ids: string[], reference: string): ReleaseContactAction => ({
  type: RELEASE_CONTACT_ACTION,
  ids,
  reference,
});

export const releaseContactReducer = (state: ExistingContactsState, { ids, reference }: ReleaseContactAction) =>
  releaseContactStatesById(state, ids, reference);

export const EXISTING_CONTACT_LOAD_TRANSCRIPT = 'EXISTING_CONTACT_LOAD_TRANSCRIPT';

type LoadTranscriptAction = {
  type: typeof EXISTING_CONTACT_LOAD_TRANSCRIPT;
  contactId: string;
  transcript: Transcript;
};

export const loadTranscript = (contactId: string, transcript: Transcript): LoadTranscriptAction => ({
  type: EXISTING_CONTACT_LOAD_TRANSCRIPT,
  contactId,
  transcript,
});

export const loadTranscriptReducer = (
  state: ExistingContactsState,
  action: LoadTranscriptAction,
): ExistingContactsState => {
  if (!state[action.contactId]) {
    console.error(
      `Attempted to load transcript on contact ID '${action.contactId}' but this contact has not been loaded into redux. Load the contact into the existing contacts store using 'loadContact'.`,
    );
    return state;
  }

  return {
    ...state,
    [action.contactId]: {
      ...state[action.contactId],
      transcript: action.transcript,
    },
  };
};

export const EXISTING_CONTACT_TOGGLE_CATEGORY_EXPANDED_ACTION = 'EXISTING_CONTACT_TOGGLE_CATEGORY_EXPANDED_ACTION';

type ToggleCategoryExpandedAction = {
  type: typeof EXISTING_CONTACT_TOGGLE_CATEGORY_EXPANDED_ACTION;
  contactId: string;
  category: string;
};

export const toggleCategoryExpanded = (contactId: string, category: string): ToggleCategoryExpandedAction => ({
  type: EXISTING_CONTACT_TOGGLE_CATEGORY_EXPANDED_ACTION,
  contactId,
  category,
});

export const toggleCategoryExpandedReducer = (state: ExistingContactsState, action: ToggleCategoryExpandedAction) => {
  if (!state[action.contactId]) {
    console.error(
      `Attempted to toggle category expansion for '${action.category}' on contact ID '${action.contactId}' but this contact has not been loaded into redux. Load the contact into the existing contacts store using 'loadContact' before attempting to manipulate it's category state`,
    );
    return state;
  }
  return {
    ...state,
    [action.contactId]: {
      ...state[action.contactId],
      metadata: {
        ...state[action.contactId].metadata,
        categories: {
          ...state[action.contactId].metadata.categories,
          expanded: {
            ...state[action.contactId].metadata.categories.expanded,
            [action.category]: !state[action.contactId].metadata.categories.expanded[action.category],
          },
        },
      },
    },
  };
};

export const EXISTING_CONTACT_SET_CATEGORIES_GRID_VIEW_ACTION = 'EXISTING_CONTACT_SET_CATEGORIES_GRID_VIEW_ACTION';

type SetCategoriesGridViewAction = {
  type: typeof EXISTING_CONTACT_SET_CATEGORIES_GRID_VIEW_ACTION;
  contactId: string;
  useGridView: boolean;
};

export const setCategoriesGridView = (contactId: string, useGridView: boolean): SetCategoriesGridViewAction => ({
  type: EXISTING_CONTACT_SET_CATEGORIES_GRID_VIEW_ACTION,
  contactId,
  useGridView,
});

export const setCategoriesGridViewReducer = (state: ExistingContactsState, action: SetCategoriesGridViewAction) => {
  if (!state[action.contactId]) {
    console.error(
      `Attempted to set category grid view '${action.useGridView}' on contact ID '${action.contactId}' but this contact has not been loaded into redux. Load the contact into the existing contacts store using 'loadContact' before attempting to manipulate it's category state`,
    );
    return state;
  }
  return {
    ...state,
    [action.contactId]: {
      ...state[action.contactId],
      metadata: {
        ...state[action.contactId].metadata,
        categories: {
          ...state[action.contactId].metadata.categories,
          gridView: action.useGridView,
        },
      },
    },
  };
};

export const SET_CONTACT_DIALOG_STATE = 'contacts/SET_CONTACT_DIALOG_STATE';

type SetContactDialogStateAction = {
  type: typeof SET_CONTACT_DIALOG_STATE;
  contactId: string;
  dialogName: string;
  dialogOpen: boolean;
};

export const newSetContactDialogStateAction = (
  contactId: string,
  dialogName: string,
  dialogOpen: boolean,
): SetContactDialogStateAction => ({
  type: SET_CONTACT_DIALOG_STATE,
  contactId,
  dialogName,
  dialogOpen,
});

export const setContactDialogStateReducer = (
  state: ExistingContactsState,
  { dialogName, dialogOpen, contactId }: SetContactDialogStateAction,
) => {
  if (!state[contactId]) {
    console.error(
      `Attempted to open dialog '${dialogName}' on contact ID '${contactId}' but this contact has not been loaded into redux. Load the contact into the existing contacts store using 'loadContact' before attempting to manipulate it's category state`,
    );
    return state;
  }
  return {
    ...state,
    [contactId]: {
      ...state[contactId],
      metadata: {
        ...state[contactId].metadata,
        draft: {
          ...state[contactId].metadata.draft,
          dialogsOpen: {
            ...state[contactId].metadata.draft.dialogsOpen,
            [dialogName]: dialogOpen,
          },
        },
      },
    },
  };
};

export const EXISTING_CONTACT_UPDATE_DRAFT_ACTION = 'EXISTING_CONTACT_UPDATE_DRAFT_ACTION';

type UpdateDraftAction = {
  type: typeof EXISTING_CONTACT_UPDATE_DRAFT_ACTION;
  contactId: string;
  draft?: ContactDraftChanges;
};

export const updateDraft = (contactId: string, draft: ContactDraftChanges): UpdateDraftAction => ({
  type: EXISTING_CONTACT_UPDATE_DRAFT_ACTION,
  contactId,
  draft,
});

export const clearDraft = (contactId: string): UpdateDraftAction => ({
  type: EXISTING_CONTACT_UPDATE_DRAFT_ACTION,
  contactId,
  draft: undefined,
});

export const updateDraftReducer = (
  state: ExistingContactsState,
  configState: ConfigurationState,
  { contactId, draft }: UpdateDraftAction,
): ExistingContactsState => {
  if (!state[contactId]) {
    console.error(
      `Attempted to update draft changes on contact ID '${contactId}' but this contact has not been loaded into redux. Load the contact into the existing contacts store using 'loadContact' before attempting to manipulate it's category state`,
    );
    return state;
  }

  const definition =
    configState.definitionVersions[state[contactId].savedContact.rawJson.definitionVersion] ??
    configState.currentDefinitionVersion;

  if (draft?.rawJson) {
    // Transform from RHF friendly values to the state we want in redux
    const transformedForm = transformValuesForContactForm(definition)(draft.rawJson);
    return {
      ...state,
      [contactId]: {
        ...state[contactId],
        draftContact: {
          ...state[contactId].draftContact,
          ...draft,
          rawJson: {
            ...state[contactId].draftContact?.rawJson,
            ...draft.rawJson,
            ...transformedForm,
          },
        },
      },
    };
  }
  return {
    ...state,
    [contactId]: {
      ...state[contactId],
      draftContact: draft,
    },
  };
};

export const EXISTING_CONTACT_CREATE_DRAFT_ACTION = 'EXISTING_CONTACT_CREATE_DRAFT_ACTION';

type CreateDraftAction = {
  type: typeof EXISTING_CONTACT_CREATE_DRAFT_ACTION;
  contactId: string;
  draftRoute: ContactDetailsRoute;
};

export const createDraft = (contactId: string, draftRoute: ContactDetailsRoute): CreateDraftAction => ({
  type: EXISTING_CONTACT_CREATE_DRAFT_ACTION,
  contactId,
  draftRoute,
});

export const createDraftReducer = (state: ExistingContactsState, action: CreateDraftAction): ExistingContactsState => {
  if (!state[action.contactId]) {
    console.error(
      `Attempted to update draft changes on contact ID '${action.contactId}' but this contact has not been loaded into redux. Load the contact into the existing contacts store using 'loadContact' before attempting to manipulate it's category state`,
    );
    return state;
  }
  const { savedContact } = state[action.contactId];
  let newDraft: ContactDraftChanges;

  switch (action.draftRoute) {
    case ContactDetailsRoute.EDIT_CHILD_INFORMATION:
      newDraft = {
        rawJson: {
          childInformation: savedContact.rawJson.childInformation,
        },
      };
      break;
    case ContactDetailsRoute.EDIT_CALLER_INFORMATION:
      newDraft = {
        rawJson: {
          callerInformation: savedContact.rawJson.callerInformation,
        },
      };
      break;
    case ContactDetailsRoute.EDIT_CASE_INFORMATION:
      newDraft = {
        rawJson: {
          caseInformation: savedContact.rawJson.caseInformation,
        },
      };
      break;
    case ContactDetailsRoute.EDIT_CATEGORIES:
      newDraft = {
        rawJson: {
          categories: savedContact.rawJson.categories,
        },
      };
      break;
    default:
      newDraft = undefined;
  }

  return {
    ...state,
    [action.contactId]: {
      ...state[action.contactId],
      draftContact: newDraft,
    },
  };
};

export type ExistingContactAction =
  | LoadContactAction
  | ReleaseContactAction
  | LoadTranscriptAction
  | ToggleCategoryExpandedAction
  | SetCategoriesGridViewAction
  | UpdateDraftAction
  | CreateDraftAction
  | AddExternalReportEntryAction
  | SetContactDialogStateAction;
