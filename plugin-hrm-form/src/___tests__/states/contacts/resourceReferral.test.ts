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

import { isAfter, parseISO, subHours } from 'date-fns';

import {
  addResourceReferralForUnsavedContactAction,
  DraftResourceReferralState,
  ReferralLookupStatus,
  ResourceReferral,
  resourceReferralReducer,
  updateResourceReferralIdToAddForUnsavedContactAction,
  updateResourceReferralLookupStatusForUnsavedContactAction,
} from '../../../states/contacts/resourceReferral';
import { initialState } from '../../../states/contacts/reducer';
import { ContactsState } from '../../../states/contacts/types';
import { ReferrableResource } from '../../../services/ResourceService';
import { VALID_EMPTY_CONTACT } from '../../testContacts';

const patchResourceReferralState = (
  state: ContactsState,
  contactId: string,
  resourceReferralState: Partial<DraftResourceReferralState>,
): ContactsState => {
  return {
    ...state,
    existingContacts: {
      ...state.existingContacts,
      contact1: {
        ...state.existingContacts[contactId],
        metadata: {
          ...state.existingContacts[contactId].metadata,
          draft: {
            ...state.existingContacts[contactId].metadata.draft,
            resourceReferralList: {
              ...state.existingContacts[contactId].metadata.draft.resourceReferralList,
              ...resourceReferralState,
            },
          },
        },
      },
    },
  };
};

const setDraftResourceReferrals = (
  state: ContactsState,
  contactId: string,
  referrals: ResourceReferral[],
): ContactsState => {
  return {
    ...state,
    existingContacts: {
      ...state.existingContacts,
      contact1: {
        ...state.existingContacts[contactId],
        draftContact: {
          ...(state.existingContacts[contactId].draftContact ?? {}),
          referrals,
        },
      },
    },
  };
};

describe('resourceReferralReducer', () => {
  const reducer = resourceReferralReducer(initialState);
  const baseState: ContactsState = {
    ...initialState,
    existingContacts: {
      contact1: {
        savedContact: {
          ...VALID_EMPTY_CONTACT,
          rawJson: {
            ...VALID_EMPTY_CONTACT.rawJson,
            callType: undefined,
            contactlessTask: { ...VALID_EMPTY_CONTACT.rawJson.contactlessTask, channel: undefined },
          },
          helpline: '',
          referrals: [],
        },
        metadata: {
          categories: { expanded: {}, gridView: false },
          endMillis: 0,
          startMillis: 0,
          draft: {
            resourceReferralList: { resourceReferralIdToAdd: '', lookupStatus: ReferralLookupStatus.NOT_STARTED },
          },
        },
        references: new Set(),
      },
    },
  };
  describe('updateResourceReferralIdToAddForUnsavedContactAction', () => {
    test("contact exists for taskSid - updates draft referral's resourceReferralIdToAdd", () => {
      const state = reducer(baseState, updateResourceReferralIdToAddForUnsavedContactAction('contact1', '1234'));
      const expectedState = patchResourceReferralState(baseState, 'contact1', {
        resourceReferralIdToAdd: '1234',
      });
      expect(state).toEqual(expectedState);
    });

    test("contact exists for taskSid and draft referrals lookupStatus is not NOT_STARTED - updates draft referral's lookupStatus to NOT_STARTED", () => {
      const state = reducer(
        patchResourceReferralState(baseState, 'contact1', {
          lookupStatus: ReferralLookupStatus.PENDING,
        }),
        updateResourceReferralIdToAddForUnsavedContactAction('contact1', '1234'),
      );
      expect(state).toEqual(
        patchResourceReferralState(baseState, 'contact1', {
          resourceReferralIdToAdd: '1234',
          lookupStatus: ReferralLookupStatus.NOT_STARTED,
        }),
      );
    });
    test("contact doesn't exist for taskSid - noop", () => {
      const state = reducer(baseState, updateResourceReferralIdToAddForUnsavedContactAction('not a task', '1234'));
      expect(state).toEqual(baseState);
    });
  });
  describe('updateResourceReferralLookupStatusForUnsavedContactAction', () => {
    test("contact exists for taskSid - updates draft referral's lookupStatus", () => {
      const state = reducer(
        baseState,
        updateResourceReferralLookupStatusForUnsavedContactAction('contact1', ReferralLookupStatus.FOUND),
      );
      const expectedState = patchResourceReferralState(baseState, 'contact1', {
        lookupStatus: ReferralLookupStatus.FOUND,
      });
      expect(state).toEqual(expectedState);
    });
    test("contact doesn't exist for taskSid - noop", () => {
      const state = reducer(
        baseState,
        updateResourceReferralLookupStatusForUnsavedContactAction('not a task', ReferralLookupStatus.FOUND),
      );
      expect(state).toEqual(baseState);
    });
  });
  describe('addResourceReferralForUnsavedContactAction', () => {
    test('contact exists for taskSid with empty referrals - adds referral to draft contact', () => {
      const newReferral: ReferrableResource = {
        id: 'res-1234',
        name: 'Resource 1234',
        attributes: {},
      };
      const state = reducer(baseState, addResourceReferralForUnsavedContactAction('contact1', newReferral));
      expect(state).toEqual(
        setDraftResourceReferrals(baseState, 'contact1', [
          { resourceId: 'res-1234', resourceName: 'Resource 1234', referredAt: expect.any(String) },
        ]),
      );
      const referredAt = parseISO(state.existingContacts.contact1.draftContact.referrals[0].referredAt);
      expect(isAfter(referredAt, subHours(new Date(), 1))).toBe(true);
    });
    test('contact exists for taskSid with undefined referrals - adds referral to contact', () => {
      const newReferral: ReferrableResource = {
        id: 'res-1234',
        name: 'Resource 1234',
        attributes: {},
      };
      const state = reducer(
        setDraftResourceReferrals(baseState, 'contact1', undefined),
        addResourceReferralForUnsavedContactAction('contact1', newReferral),
      );
      expect(state).toEqual({
        ...baseState,
        existingContacts: {
          ...baseState.existingContacts,
          contact1: {
            ...baseState.existingContacts.contact1,
            draftContact: {
              ...(baseState.existingContacts.contact1.draftContact ?? {}),
              referrals: [{ resourceId: 'res-1234', resourceName: 'Resource 1234', referredAt: expect.any(String) }],
            },
          },
        },
      });
      const referredAt = parseISO(state.existingContacts.contact1.draftContact.referrals[0].referredAt);
      expect(isAfter(referredAt, subHours(new Date(), 1))).toBe(true);
    });
    test('contact exists for taskSid with other referrals - adds referral to end of list', () => {
      const newReferral: ReferrableResource = {
        id: 'res-1234',
        name: 'Resource 1234',
        attributes: {},
      };
      const state = reducer(
        setDraftResourceReferrals(baseState, 'contact1', [
          {
            resourceId: 'res-existing',
            resourceName: 'Existing Resource',
            referredAt: '2020-01-01T00:00:00.000Z',
          },
        ]),
        addResourceReferralForUnsavedContactAction('contact1', newReferral),
      );
      expect(state).toEqual(
        setDraftResourceReferrals(baseState, 'contact1', [
          { resourceId: 'res-existing', resourceName: 'Existing Resource', referredAt: '2020-01-01T00:00:00.000Z' },
          { resourceId: 'res-1234', resourceName: 'Resource 1234', referredAt: expect.any(String) },
        ]),
      );
      const referredAt = parseISO(state.existingContacts.contact1.draftContact.referrals[1].referredAt);
      expect(isAfter(referredAt, subHours(new Date(), 1))).toBe(true);
    });

    test('contact exists for taskSid with referral with for same resource - noop', () => {
      const newReferral: ReferrableResource = {
        id: 'res-1234',
        name: 'Resource 1234',
        attributes: {},
      };
      const state = reducer(
        setDraftResourceReferrals(baseState, 'contact1', [
          {
            resourceId: 'res-1234',
            resourceName: 'Existing Resource',
            referredAt: '2020-01-01T00:00:00.000Z',
          },
        ]),
        addResourceReferralForUnsavedContactAction('contact1', newReferral),
      );
      expect(state).toEqual(
        setDraftResourceReferrals(baseState, 'contact1', [
          { resourceId: 'res-1234', resourceName: 'Existing Resource', referredAt: '2020-01-01T00:00:00.000Z' },
        ]),
      );
    });

    test('contact exists for taskSid with other referrals and lookupStatus is something other than NOT_STARTED - adds referral to end of list and sets lookupStatus to NOT_STARTED', () => {
      const newReferral: ReferrableResource = {
        id: 'res-1234',
        name: 'Resource 1234',
        attributes: {},
      };
      const stateWithPatchedLookupStatus = patchResourceReferralState(baseState, 'contact1', {
        lookupStatus: ReferralLookupStatus.FOUND,
      });
      const state = reducer(
        setDraftResourceReferrals(stateWithPatchedLookupStatus, 'contact1', [
          {
            resourceId: 'res-existing',
            resourceName: 'Existing Resource',
            referredAt: '2020-01-01T00:00:00.000Z',
          },
        ]),

        addResourceReferralForUnsavedContactAction('contact1', newReferral),
      );
      const expectedStateWithPatchedLookupStatus = patchResourceReferralState(baseState, 'contact1', {
        lookupStatus: ReferralLookupStatus.NOT_STARTED,
      });
      expect(state).toEqual(
        setDraftResourceReferrals(expectedStateWithPatchedLookupStatus, 'contact1', [
          { resourceId: 'res-existing', resourceName: 'Existing Resource', referredAt: '2020-01-01T00:00:00.000Z' },
          { resourceId: 'res-1234', resourceName: 'Resource 1234', referredAt: expect.any(String) },
        ]),
      );
      const referredAt = parseISO(state.existingContacts.contact1.draftContact.referrals[1].referredAt);
      expect(isAfter(referredAt, subHours(new Date(), 1))).toBe(true);
    });

    test('contact exists for taskSid with referral for same resource and lookupStatus is something other than NOT_STARTED - sets lookupStatus to NOT_STARTED', () => {
      const newReferral: ReferrableResource = {
        id: 'res-1234',
        name: 'Resource 1234',
        attributes: {},
      };
      const inputStateWithPatchedLookupStatus = patchResourceReferralState(baseState, 'contact1', {
        lookupStatus: ReferralLookupStatus.FOUND,
      });
      const state = reducer(
        setDraftResourceReferrals(inputStateWithPatchedLookupStatus, 'contact1', [
          {
            resourceId: 'res-1234',
            resourceName: 'Existing Resource',
            referredAt: '2020-01-01T00:00:00.000Z',
          },
        ]),
        addResourceReferralForUnsavedContactAction('contact1', newReferral),
      );
      const expectedStateWithPatchedLookupStatus = patchResourceReferralState(baseState, 'contact1', {
        lookupStatus: ReferralLookupStatus.NOT_STARTED,
      });
      expect(state).toEqual(
        setDraftResourceReferrals(expectedStateWithPatchedLookupStatus, 'contact1', [
          { resourceId: 'res-1234', resourceName: 'Existing Resource', referredAt: '2020-01-01T00:00:00.000Z' },
        ]),
      );
    });

    test("contact doesn't exist for taskSid - noop", () => {
      const state = reducer(
        baseState,
        addResourceReferralForUnsavedContactAction('not a task', {
          id: 'res-1234',
          name: 'Resource 1234',
          attributes: {},
        }),
      );
      expect(state).toEqual(baseState);
    });
  });
});
