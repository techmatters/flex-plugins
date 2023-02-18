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

const patchUnsavedContactReferralResourceState = (
  state: ContactsState,
  taskId: string,
  patch: Partial<DraftResourceReferralState>,
) => ({
  ...state,
  tasks: {
    ...state.tasks,
    [taskId]: {
      ...state.tasks[taskId],
      draft: {
        ...state.tasks[taskId].draft,
        resourceReferralList: {
          ...state.tasks[taskId].draft.resourceReferralList,
          ...patch,
        },
      },
    },
  },
});

export const resourceReferralReducer = (initialState: ContactsState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      updateResourceReferralIdToAddForUnsavedContactAction,
      (state, { payload: { taskId, resourceReferralIdToAdd } }) =>
        patchUnsavedContactReferralResourceState(state, taskId, {
          resourceReferralIdToAdd,
          lookupStatus: ReferralLookupStatus.NOT_STARTED,
        }),
    ),
    handleAction(updateResourceReferralLookupStatusForUnsavedContactAction, (state, { payload: { taskId, status } }) =>
      patchUnsavedContactReferralResourceState(state, taskId, { lookupStatus: status }),
    ),
    handleAction(addResourceReferralForUnsavedContactAction, (state, { payload: { taskId, resource } }) => {
      if (state.tasks[taskId].referrals?.find(r => r.resourceId === resource.id)) {
        return state;
      }
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...state.tasks[taskId],
            referrals: [
              ...state.tasks[taskId].referrals,
              { resourceId: resource.id, referredAt: new Date().toISOString(), resourceName: resource.name },
            ],
            draft: {
              ...state.tasks[taskId].draft,
              resourceReferralList: {
                ...state.tasks[taskId].draft.resourceReferralList,
                lookupStatus: ReferralLookupStatus.NOT_STARTED,
              },
            },
          },
        },
      };
    }),
  ]);
