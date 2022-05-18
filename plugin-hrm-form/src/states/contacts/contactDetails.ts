import { ContactDetailsSectionsType } from '../../components/common/ContactDetails';

export enum DetailsContext {
  CONTACT_SEARCH = 'contactSearch',
  CASE_DETAILS = 'caseDetails',
}

export enum ContactDetailsRoute {
  HOME = 'home',
  EDIT_CALLER_INFORMATION = 'editCallerInformation',
  EDIT_CHILD_INFORMATION = 'editChildInformation',
  EDIT_CATEGORIES = 'editIssueCategories',
  EDIT_CASE_INFORMATION = 'editCaseInformation',
}

export type ContactDetailsState = {
  [context in DetailsContext]: {
    detailsExpanded: { [Section in ContactDetailsSectionsType]?: boolean };
    route: ContactDetailsRoute;
  };
};

export const TOGGLE_DETAIL_EXPANDED_ACTION = 'TOGGLE_DETAIL_EXPANDED_ACTION';

type ToggleDetailExpandedAction = {
  type: typeof TOGGLE_DETAIL_EXPANDED_ACTION;
  context: DetailsContext;
  section: ContactDetailsSectionsType;
};

export const toggleDetailSectionExpanded = (
  context: DetailsContext,
  section: ContactDetailsSectionsType,
): ToggleDetailExpandedAction => ({
  type: TOGGLE_DETAIL_EXPANDED_ACTION,
  context,
  section,
});

export const sectionExpandedStateReducer = (
  state: ContactDetailsState,
  action: ToggleDetailExpandedAction,
): ContactDetailsState => ({
  ...state,
  [action.context]: {
    ...state[action.context],
    detailsExpanded: {
      ...state[action.context].detailsExpanded,
      [action.section]: !state[action.context].detailsExpanded[action.section],
    },
  },
});

export const NAVIGATE_CONTACT_DETAILS_ACTION = 'NAVIGATE_CONTACT_DETAILS_ACTION';

type NavigateContactDetailsAction = {
  type: typeof NAVIGATE_CONTACT_DETAILS_ACTION;
  context: DetailsContext;
  route: ContactDetailsRoute;
};

export const navigateContactDetails = (
  context: DetailsContext,
  route: ContactDetailsRoute,
): NavigateContactDetailsAction => ({
  type: NAVIGATE_CONTACT_DETAILS_ACTION,
  context,
  route,
});

export const navigateContactDetailsReducer = (
  state: ContactDetailsState,
  action: NavigateContactDetailsAction,
): ContactDetailsState => ({
  ...state,
  [action.context]: {
    ...state[action.context],
    route: action.route,
  },
});

export type ContactDetailsAction = ToggleDetailExpandedAction | NavigateContactDetailsAction;
