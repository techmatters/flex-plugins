import { omit } from 'lodash';

import { SearchContact } from '../../types/types';
import { hrmServiceContactToSearchContact } from './contactDetailsAdapter';

export enum ContactDetailsRoute {
  EDIT_CALLER_INFORMATION = 'editCallerInformation',
  EDIT_CHILD_INFORMATION = 'editChildInformation',
  EDIT_CATEGORIES = 'editIssueCategories',
  EDIT_CASE_INFORMATION = 'editCaseInformation',
}

// From https://stackoverflow.com/questions/47914536/use-partial-in-nested-property-with-typescript
type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type SearchContactDraftChanges = RecursivePartial<SearchContact>;

export type ExistingContactsState = {
  [contactId: string]: {
    references: Set<string>;
    savedContact: SearchContact;
    draftContact?: RecursivePartial<SearchContact>;
    categories: {
      gridView: boolean;
      expanded: { [key: string]: boolean };
    };
  };
};

export const LOAD_CONTACT_ACTION = 'LOAD_CONTACT_ACTION';

type LoadContactAction = {
  type: typeof LOAD_CONTACT_ACTION;
  contacts: SearchContact[];
  reference?: string;
  replaceExisting: boolean;
};

export const loadContact = (contact: SearchContact, reference, replaceExisting = false): LoadContactAction => ({
  type: LOAD_CONTACT_ACTION,
  contacts: [contact],
  reference,
  replaceExisting,
});

export const loadRawContact = (contact: any, reference: string, replaceExisting = false): LoadContactAction => ({
  type: LOAD_CONTACT_ACTION,
  contacts: [hrmServiceContactToSearchContact(contact)],
  reference,
  replaceExisting,
});

export const loadRawContacts = (contacts: any[], reference: string, replaceExisting = false): LoadContactAction => ({
  type: LOAD_CONTACT_ACTION,
  contacts: contacts.map(c => hrmServiceContactToSearchContact(c)),
  reference,
  replaceExisting,
});

export const refreshRawContact = (contact: any) => loadRawContact(contact, undefined, true);

export const loadContactReducer = (state: ExistingContactsState, action: LoadContactAction) => {
  const updateEntries = action.contacts
    .filter(c => {
      return (
        (action.reference && !(state[c.contactId]?.references ?? new Set()).has(action.reference)) ||
        action.replaceExisting
      );
    })
    .map(c => {
      const current = state[c.contactId] ?? { references: new Set() };
      const { draftContact, ...currentContact } = state[c.contactId] ?? {
        categories: {
          expanded: {},
          gridView: false,
        },
      };
      return [
        c.contactId,
        {
          ...currentContact,
          savedContact: action.replaceExisting || !current.references.size ? c : state[c.contactId].savedContact,
          references: action.reference ? current.references.add(action.reference) : current.references,
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

export const releaseContactReducer = (state: ExistingContactsState, action: ReleaseContactAction) => {
  const updateKvps = action.ids
    .map(id => {
      const current = state[id];
      if (!current) {
        console.warn(
          `Tried to release contact id ${id} but wasn't in the redux state. You should only release previously loaded contacts once`,
        );
        return [id, undefined];
      }
      current.references.delete(action.reference);
      return [id, current];
    })
    .filter(([, ecs]) => typeof ecs === 'object' && ecs.references.size > 0);
  return {
    ...omit(state, ...action.ids),
    ...Object.fromEntries(updateKvps),
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
      categories: {
        ...state[action.contactId].categories,
        expanded: {
          ...state[action.contactId].categories.expanded,
          [action.category]: !state[action.contactId].categories.expanded[action.category],
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
      categories: {
        ...state[action.contactId].categories,
        gridView: action.useGridView,
      },
    },
  };
};

export const EXISTING_CONTACT_UPDATE_DRAFT_ACTION = 'EXISTING_CONTACT_UPDATE_DRAFT_ACTION';

type UpdateDraftAction = {
  type: typeof EXISTING_CONTACT_UPDATE_DRAFT_ACTION;
  contactId: string;
  draft?: RecursivePartial<SearchContact>;
};

export const updateDraft = (contactId: string, draft: SearchContactDraftChanges): UpdateDraftAction => ({
  type: EXISTING_CONTACT_UPDATE_DRAFT_ACTION,
  contactId,
  draft,
});

export const clearDraft = (contactId: string): UpdateDraftAction => ({
  type: EXISTING_CONTACT_UPDATE_DRAFT_ACTION,
  contactId,
  draft: undefined,
});

export const updateDraftReducer = (state: ExistingContactsState, action: UpdateDraftAction): ExistingContactsState => {
  if (!state[action.contactId]) {
    console.error(
      `Attempted to update draft changes on contact ID '${action.contactId}' but this contact has not been loaded into redux. Load the contact into the existing contacts store using 'loadContact' before attempting to manipulate it's category state`,
    );
    return state;
  }
  return {
    ...state,
    [action.contactId]: {
      ...state[action.contactId],
      draftContact: action.draft,
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
  let newDraft: SearchContactDraftChanges;

  switch (action.draftRoute) {
    case ContactDetailsRoute.EDIT_CHILD_INFORMATION:
      newDraft = {
        details: {
          childInformation: savedContact.details.childInformation,
        },
      };
      break;
    case ContactDetailsRoute.EDIT_CALLER_INFORMATION:
      newDraft = {
        details: {
          callerInformation: savedContact.details.callerInformation,
        },
      };
      break;
    case ContactDetailsRoute.EDIT_CASE_INFORMATION:
      newDraft = {
        details: {
          caseInformation: savedContact.details.caseInformation,
        },
      };
      break;
    case ContactDetailsRoute.EDIT_CATEGORIES:
      newDraft = {
        overview: {
          categories: savedContact.overview.categories,
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
  | ToggleCategoryExpandedAction
  | SetCategoriesGridViewAction
  | UpdateDraftAction
  | CreateDraftAction;
