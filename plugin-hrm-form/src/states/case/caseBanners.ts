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

import { createAction, createReducer } from 'redux-promise-middleware-actions';

import { RootState } from '..';
import { namespace } from '../storeNamespaces';

const SHOW_REMOVED_FROM_CASE_BANNER = 'case-merging-banners/show-removed-from-case-banner';

export const showRemovedFromCaseBannerAction = createAction(
  SHOW_REMOVED_FROM_CASE_BANNER,
  (contactId: string, caseId?: string) => ({
    contactId,
    caseId,
    banners: {
      showConnectedToCaseBanner: false,
      showRemovedFromCaseBanner: true,
    },
  }),
);

export const closeRemovedFromCaseBannerAction = createAction(
  SHOW_REMOVED_FROM_CASE_BANNER,
  (contactId: string, caseId?: string) => ({
    contactId,
    caseId,
    banners: {
      showRemovedFromCaseBanner: false,
    },
  }),
);

type CaseMergingBannersAction =
  | ReturnType<typeof showRemovedFromCaseBannerAction>
  | ReturnType<typeof closeRemovedFromCaseBannerAction>;

type CaseMergingBannersState = {
  [contactId: string]: {
    showRemovedFromCaseBanner: boolean;
    caseId: string;
  };
};

const initialState: CaseMergingBannersState = {};

export const selectCaseMergingBanners = (
  state: RootState,
  contactId: string,
): CaseMergingBannersState['contactId'] & { showConnectedToCaseBanner: boolean } => {
  const connected = Boolean(state[namespace].activeContacts.existingContacts[contactId]?.savedContact.caseId);
  return {
    showConnectedToCaseBanner: connected,
    showRemovedFromCaseBanner: Boolean(
      !connected && state[namespace].caseMergingBanners[contactId]?.showRemovedFromCaseBanner,
    ),
    caseId: state[namespace].caseMergingBanners[contactId]?.caseId,
  };
};
const mergeResultPayloadIntoState = (state, action: CaseMergingBannersAction) => {
  const { contactId, banners, caseId } = action.payload;

  return {
    ...state,
    [contactId]: {
      ...state[contactId],
      caseId,
      ...banners,
    },
  };
};

const caseMergingBannersReducer = createReducer(initialState, handleAction => [
  handleAction(showRemovedFromCaseBannerAction, mergeResultPayloadIntoState),
  handleAction(closeRemovedFromCaseBannerAction, mergeResultPayloadIntoState),
]);

export const reduce = (inputState = initialState, action: CaseMergingBannersAction): CaseMergingBannersState => {
  return caseMergingBannersReducer(inputState, action);
};
