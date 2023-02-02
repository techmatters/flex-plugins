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

import { ContactDetailsSectionsType } from '../../components/common/ContactDetails';

export enum DetailsContext {
  CONTACT_SEARCH = 'contactSearch',
  CASE_DETAILS = 'caseDetails',
}

export type ContactDetailsState = {
  [context in DetailsContext]: {
    detailsExpanded: { [Section in ContactDetailsSectionsType]?: boolean };
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

export type ContactDetailsAction = ToggleDetailExpandedAction;
