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

import { createAction, createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { RootState } from '../../states';
import { namespace } from '../../states/storeNamespaces';

const SHOW_CONNECTED_TO_CASE_BANNER = 'case-merging-banners/show-connected-to-case-banner';
const SHOW_REMOVED_FROM_CASE_BANNER = 'case-merging-banners/show-removed-from-case-banner';

export const showConnectedToCaseBannerAction = createAction(SHOW_CONNECTED_TO_CASE_BANNER, () => ({
  showConnectedToCaseBanner: true,
}));

export const removeContactFromCaseAction = createAsyncAction(SHOW_REMOVED_FROM_CASE_BANNER, async () => ({
  showConnectedToCaseBanner: false,
  showRemovedFromCaseBanner: true,
}));

export const closeRemovedFromCaseBannerAction = createAction(SHOW_REMOVED_FROM_CASE_BANNER, () => ({
  showRemovedFromCaseBanner: false,
}));

type CaseMergingBannersAction =
  | ReturnType<typeof showConnectedToCaseBannerAction>
  | ReturnType<typeof removeContactFromCaseAction>
  | ReturnType<typeof closeRemovedFromCaseBannerAction>;

type CaseMergingBannersState = {
  showConnectedToCaseBanner: boolean;
  showRemovedFromCaseBanner: boolean;
};

const initialState: CaseMergingBannersState = {
  showConnectedToCaseBanner: false,
  showRemovedFromCaseBanner: false,
};

export const selectCaseMergingBanners = (state: RootState): CaseMergingBannersState =>
  state[namespace].caseMergingBanners;

const handleNoChangeAction = (handleAction, asyncAction) =>
  handleAction(asyncAction, state => {
    return {
      ...state,
    };
  });

const mergeResultPayloadIntoState = (state, action) => {
  return {
    ...state,
    ...action.payload,
  };
};

const caseMergingBannersReducer = createReducer(initialState, handleAction => [
  handleAction(showConnectedToCaseBannerAction, mergeResultPayloadIntoState),
  handleAction(removeContactFromCaseAction.fulfilled, mergeResultPayloadIntoState),
  handleAction(closeRemovedFromCaseBannerAction, mergeResultPayloadIntoState),

  handleNoChangeAction(handleAction, removeContactFromCaseAction.pending),
  handleNoChangeAction(handleAction, removeContactFromCaseAction.rejected),
]);

export const reduce = (inputState = initialState, action: CaseMergingBannersAction): CaseMergingBannersState => {
  return caseMergingBannersReducer(inputState, action);
};
