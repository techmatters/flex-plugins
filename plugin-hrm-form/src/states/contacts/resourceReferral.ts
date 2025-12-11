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
import { getUnsavedContactFromState } from './getUnsavedContact';

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
  (contactId: string, resourceReferralIdToAdd: string) => ({
    contactId,
    resourceReferralIdToAdd,
  }),
);

const UPDATE_RESOURCE_REFERRAL_STATUS_FOR_UNSAVED_CONTACT = 'UpdateResourceReferralStatusForUnsavedContact';

export const updateResourceReferralLookupStatusForUnsavedContactAction = createAction(
  UPDATE_RESOURCE_REFERRAL_STATUS_FOR_UNSAVED_CONTACT,
  (contactId: string, status: ReferralLookupStatus) => ({
    contactId,
    status,
  }),
);

const ADD_RESOURCE_REFERRAL_FOR_UNSAVED_CONTACT = 'AddResourceReferralForUnsavedContact';

export const addResourceReferralForUnsavedContactAction = createAction(
  ADD_RESOURCE_REFERRAL_FOR_UNSAVED_CONTACT,
  (contactId: string, resource: ReferrableResource) => ({
    contactId,
    resource,
  }),
);

const REMOVE_RESOURCE_REFERRAL_FOR_UNSAVED_CONTACT = 'RemoveResourceReferralForUnsavedContact';

export const removeResourceReferralForUnsavedContactAction = createAction(
  REMOVE_RESOURCE_REFERRAL_FOR_UNSAVED_CONTACT,
  (contactId: string, referralId: string) => ({ contactId, referralId }),
);

const patchUnsavedContactReferralResourceState = (
  state: ContactsState,
  contactId: string,
  patch: Partial<DraftResourceReferralState>,
): ContactsState =>
  state.existingContacts[contactId]
    ? {
        ...state,
        existingContacts: {
          ...state.existingContacts,
          [contactId]: {
            ...state.existingContacts[contactId],
            metadata: {
              ...state.existingContacts[contactId].metadata,
              draft: {
                ...state.existingContacts[contactId].metadata.draft,
                resourceReferralList: {
                  ...state.existingContacts[contactId].metadata.draft.resourceReferralList,
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
      (state, { payload: { contactId, resourceReferralIdToAdd } }): ContactsState => {
        if (
          !state.existingContacts[contactId] ||
          state.existingContacts[contactId].metadata.draft.resourceReferralList.resourceReferralIdToAdd ===
            resourceReferralIdToAdd
        ) {
          // Don't clobber the lookup status if the text hasn't actually changed
          return state;
        }
        return patchUnsavedContactReferralResourceState(state, contactId, {
          resourceReferralIdToAdd,
          lookupStatus: ReferralLookupStatus.NOT_STARTED,
        });
      },
    ),
    handleAction(
      updateResourceReferralLookupStatusForUnsavedContactAction,
      (state, { payload: { contactId, status } }) =>
        patchUnsavedContactReferralResourceState(state, contactId, { lookupStatus: status }),
    ),
    handleAction(
      addResourceReferralForUnsavedContactAction,
      (state, { payload: { contactId, resource } }): ContactsState => {
        const unsavedContact = getUnsavedContactFromState(state.existingContacts[contactId]);
        if (!unsavedContact) {
          return state;
        }
        if (unsavedContact.referrals?.find(r => r.resourceId === resource.id)) {
          // Don't add a referral if it already exists
          return patchUnsavedContactReferralResourceState(state, contactId, {
            lookupStatus: ReferralLookupStatus.NOT_STARTED,
          });
        }
        return {
          ...state,
          existingContacts: {
            ...state.existingContacts,
            [contactId]: {
              ...state.existingContacts[contactId],
              draftContact: {
                ...state.existingContacts[contactId].draftContact,
                referrals: [
                  ...(unsavedContact.referrals ?? []),
                  { resourceId: resource.id, referredAt: new Date().toISOString(), resourceName: resource.name },
                ],
              },
              metadata: {
                ...state.existingContacts[contactId].metadata,
                draft: {
                  ...state.existingContacts[contactId].metadata.draft,
                  resourceReferralList: {
                    ...state.existingContacts[contactId].metadata.draft.resourceReferralList,
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
      (state, { payload: { contactId, referralId } }): ContactsState => {
        const referrals = getUnsavedContactFromState(state.existingContacts[contactId])?.referrals?.filter(
          referral => referral.resourceId !== referralId,
        );
        return {
          ...state,
          existingContacts: {
            ...state.existingContacts,
            [contactId]: {
              ...state.existingContacts[contactId],
              draftContact: {
                ...state.existingContacts[contactId].draftContact,
                referrals,
              },
            },
          },
        };
      },
    ),
  ]);
