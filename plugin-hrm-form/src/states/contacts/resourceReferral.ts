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

import { ContactsState } from './types';
import { ReferrableResource } from '../../services/ResourceService';

export enum ReferralLookupStatus {
  NOT_STARTED = 'not started',
  PENDING = 'pending',
  FOUND = 'found',
  NOT_FOUND = 'not found',
}

export type ResourceReferral = {
  resourceId: string;
  referredAt: string;
  resourceName: string;
};

export type DraftResourceReferralState = {
  resourceReferralIdToAdd: string;
  lookupStatus: ReferralLookupStatus;
};

const UPDATE_RESOURCE_REFERRAL_ID_FOR_UNSAVED_CONTACT = 'UpdateResourceReferralIdToAddForUnsavedContact';

export const updateResourceReferralIdToAddForUnsavedContactAction = createAction(
  UPDATE_RESOURCE_REFERRAL_ID_FOR_UNSAVED_CONTACT,
  (taskId: string, resourceReferralIdToAdd: string) => ({
    taskId,
    resourceReferralIdToAdd,
  }),
);

const UPDATE_RESOURCE_REFERRAL_STATUS_FOR_UNSAVED_CONTACT = 'UpdateResourceReferralStatusForUnsavedContact';

export const updateResourceReferralLookupStatusForUnsavedContactAction = createAction(
  UPDATE_RESOURCE_REFERRAL_STATUS_FOR_UNSAVED_CONTACT,
  (taskId: string, status: ReferralLookupStatus) => ({
    taskId,
    status,
  }),
);

const ADD_RESOURCE_REFERRAL_FOR_UNSAVED_CONTACT = 'AddResourceReferralForUnsavedContact';

export const addResourceReferralForUnsavedContactAction = createAction(
  ADD_RESOURCE_REFERRAL_FOR_UNSAVED_CONTACT,
  (taskId: string, resource: ReferrableResource) => ({
    taskId,
    resource,
  }),
);

const REMOVE_RESOURCE_REFERRAL_FOR_UNSAVED_CONTACT = 'RemoveResourceReferralForUnsavedContact';

export const removeResourceReferralForUnsavedContactAction = createAction(
  REMOVE_RESOURCE_REFERRAL_FOR_UNSAVED_CONTACT,
  (taskId: string, referralId: string) => ({ taskId, referralId }),
);

const patchUnsavedContactReferralResourceState = (
  state: ContactsState,
  taskId: string,
  patch: Partial<DraftResourceReferralState>,
): ContactsState =>
  state.tasks[taskId]
    ? {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...state.tasks[taskId],
            metadata: {
              ...state.tasks[taskId].metadata,
              draft: {
                ...state.tasks[taskId].metadata.draft,
                resourceReferralList: {
                  ...state.tasks[taskId].metadata.draft.resourceReferralList,
                  ...patch,
                },
              },
            },
          },
        },
      }
    : state;

export const resourceReferralReducer = (initialState: ContactsState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      updateResourceReferralIdToAddForUnsavedContactAction,
      (state, { payload: { taskId, resourceReferralIdToAdd } }): ContactsState => {
        if (
          !state.tasks[taskId] ||
          state.tasks[taskId].metadata.draft.resourceReferralList.resourceReferralIdToAdd === resourceReferralIdToAdd
        ) {
          // Don't clobber the lookup status if the text hasn't actually changed
          return state;
        }
        return patchUnsavedContactReferralResourceState(state, taskId, {
          resourceReferralIdToAdd,
          lookupStatus: ReferralLookupStatus.NOT_STARTED,
        });
      },
    ),
    handleAction(updateResourceReferralLookupStatusForUnsavedContactAction, (state, { payload: { taskId, status } }) =>
      patchUnsavedContactReferralResourceState(state, taskId, { lookupStatus: status }),
    ),
    handleAction(
      addResourceReferralForUnsavedContactAction,
      (state, { payload: { taskId, resource } }): ContactsState => {
        if (!state.tasks[taskId]) {
          return state;
        }
        if (state.tasks[taskId].contact.referrals?.find(r => r.resourceId === resource.id)) {
          // Don't add a referral if it already exists
          return patchUnsavedContactReferralResourceState(state, taskId, {
            lookupStatus: ReferralLookupStatus.NOT_STARTED,
          });
        }
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [taskId]: {
              contact: {
                ...state.tasks[taskId].contact,
                referrals: [
                  ...(state.tasks[taskId].contact.referrals ?? []),
                  { resourceId: resource.id, referredAt: new Date().toISOString(), resourceName: resource.name },
                ],
              },
              metadata: {
                ...state.tasks[taskId].metadata,
                draft: {
                  ...state.tasks[taskId].metadata.draft,
                  resourceReferralList: {
                    ...state.tasks[taskId].metadata.draft.resourceReferralList,
                    lookupStatus: ReferralLookupStatus.NOT_STARTED,
                  },
                },
              },
            },
          },
        };
      },
    ),
    handleAction(
      removeResourceReferralForUnsavedContactAction,
      (state, { payload: { taskId, referralId } }): ContactsState => {
        const referrals = state.tasks[taskId].contact.referrals.filter(referral => referral.resourceId !== referralId);
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [taskId]: {
              ...state.tasks[taskId],
              contact: {
                ...state.tasks[taskId].contact,
                referrals,
              },
            },
          },
        };
      },
    ),
  ]);
