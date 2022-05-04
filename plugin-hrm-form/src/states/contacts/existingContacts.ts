import { CallTypes } from 'hrm-form-definitions';

import { SearchContact } from '../../types/types';
import { hrmServiceContactToSearchContact } from './contactDetailsAdapter';

export type ExistingContactsState = {
  [contactId: string]: {
    refCount: number;
    contact: SearchContact;
    categories: {
      gridView: boolean;
      expanded: { [key: string]: boolean };
    };
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
      ...(state[action.id] ?? {
        categories: {
          expanded: {},
          gridView: false,
        },
      }),
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

export type ExistingContactAction =
  | LoadContactAction
  | ReleaseContactAction
  | ToggleCategoryExpandedAction
  | SetCategoriesGridViewAction;
