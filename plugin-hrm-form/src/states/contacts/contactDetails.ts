import { ContactDetailsSectionsType } from '../../components/common/ContactDetails';

export enum DetailsContext {
  CONTACT_SEARCH = 'contactSearch',
  CASE_DETAILS = 'caseDetails',
}

export type ContactDetailsState = {
  [context in DetailsContext]: { detailsExpanded: { [Section in ContactDetailsSectionsType]?: boolean } };
};

export const TOGGLE_DETAIL_EXPANDED_ACTION = 'TOGGLE_DETAIL_EXPANDED_ACTION';

export type ToggleDetailExpandedAction = {
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
