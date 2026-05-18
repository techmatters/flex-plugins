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

import { DefinitionVersion, FormInputType } from 'hrm-form-definitions';

import {
  clearDraft,
  ContactDetailsRoute,
  createDraft,
  createDraftReducer,
  ExistingContactsState,
  LOAD_CONTACT_ACTION,
  loadContact,
  loadContactReducer,
  loadContacts,
  loadTranscript,
  loadTranscriptReducer,
  setCategoriesGridView,
  setCategoriesGridViewReducer,
  toggleCategoryExpanded,
  toggleCategoryExpandedReducer,
  Transcript,
  updateDraft,
  updateDraftReducer,
} from '../../../states/contacts/existingContacts';
import { Contact } from '../../../types/types';
import { ConfigurationState } from '../../../states/configuration/reducer';
import { VALID_EMPTY_CONTACT, VALID_EMPTY_METADATA } from '../../testContacts';
import { reduce } from '../../../states/contacts/reducer';
import { HrmState } from '../../../states';
import { REMOVE_CONTACT_STATE } from '../../../states/types';
import { STALE_CONTACT_CASE_MINUTES } from '../../../states/staleTimeout';

const baseContact: Contact = {
  ...VALID_EMPTY_CONTACT,
  id: '1337',
  channel: 'default',
  helpline: 'test helpline',
  taskId: 'TASK_ID',
  rawJson: {
    ...VALID_EMPTY_CONTACT.rawJson,
    definitionVersion: 'as-v1',
    callType: 'Child calling about self',
    childInformation: { firstName: 'Lorna', lastName: 'Ballantyne' },
    callerInformation: { firstName: 'Charlie', lastName: 'Ballantyne' },
    contactlessTask: {
      ...VALID_EMPTY_CONTACT.rawJson.contactlessTask,
      channel: 'web',
    },
  },
};

const baseState: ExistingContactsState = {
  [baseContact.id]: {
    savedContact: baseContact,
    lastReferencedDate: new Date(),
    metadata: VALID_EMPTY_METADATA,
  },
} as const;

describe('loadContactReducer', () => {
  describe('replaceExisting set to false', () => {
    test('Nothing currently for that ID - adds the contact and sets lastReferencedDate', () => {
      const newState = loadContactReducer({}, loadContact(baseContact, 'TEST_REFERENCE'));
      expect(newState[baseContact.id].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.id].lastReferencedDate).toBeInstanceOf(Date);
      expect(newState[baseContact.id].categories).toStrictEqual({ gridView: false, expanded: {} });
    });

    test('Contact already loaded for that ID - does not overwrite existing contact', () => {
      const changedContact = {
        ...baseContact,
        rawJson: {
          ...baseContact.rawJson,
          childInformation: {
            ...baseContact.rawJson.childInformation,
            firstName: 'Charlotte',
            lastName: 'Ballantyne',
          },
        },
      };
      const newState = loadContactReducer(
        {
          [baseContact.id]: {
            savedContact: baseContact,
            lastReferencedDate: new Date(),
            metadata: VALID_EMPTY_METADATA,
          },
        },
        loadContact(changedContact, 'ANOTHER_TEST_REFERENCE'),
      );
      // replaceExisting is false and contact already exists, so it should NOT be updated
      expect(newState[baseContact.id].savedContact).toStrictEqual(baseContact);
    });

    test('Multiple contacts - applies rules to each contact separately', () => {
      const changedContact = {
        ...baseContact,
        rawJson: {
          ...baseContact.rawJson,
          childInformation: {
            ...baseContact.rawJson.childInformation,
            firstName: 'Charlotte',
            lastName: 'Ballantyne',
          },
        },
      };
      const newState = loadContactReducer(
        {
          [baseContact.id]: {
            savedContact: baseContact,
            lastReferencedDate: new Date(),
            metadata: VALID_EMPTY_METADATA,
          },
          '666': {
            savedContact: { ...baseContact, id: '666' },
            lastReferencedDate: new Date(),
            metadata: VALID_EMPTY_METADATA,
          },
        },
        {
          type: LOAD_CONTACT_ACTION,
          contacts: [changedContact, { ...changedContact, id: '666' }, { ...changedContact, id: '42' }],
          replaceExisting: false,
        },
      );
      // Already loaded contacts not replaced when replaceExisting=false
      expect(newState[baseContact.id].savedContact).toStrictEqual(baseContact);
      expect(newState['666'].savedContact).toStrictEqual({ ...baseContact, id: '666' });
      // New contact added
      expect(newState['42'].savedContact).toStrictEqual({ ...changedContact, id: '42' });
      expect(newState['42'].lastReferencedDate).toBeInstanceOf(Date);
    });
  });

  describe('replaceExisting set to true', () => {
    test('Nothing currently for that ID - adds the contact and sets lastReferencedDate', () => {
      const newState = loadContactReducer({}, loadContact(baseContact, 'TEST_REFERENCE', true));
      expect(newState[baseContact.id].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.id].lastReferencedDate).toBeInstanceOf(Date);
      expect(newState[baseContact.id].categories).toStrictEqual({ gridView: false, expanded: {} });
    });

    test('Different contact currently for that ID - replaces the contact and updates lastReferencedDate', () => {
      const changedContact = {
        ...baseContact,
        rawJson: {
          ...baseContact.rawJson,
          childInformation: {
            ...baseContact.rawJson.childInformation,
            firstName: 'Charlotte',
            lastName: 'Ballantyne',
          },
        },
      };
      const newState = loadContactReducer(
        {
          [baseContact.id]: {
            savedContact: baseContact,
            lastReferencedDate: new Date(),
            metadata: VALID_EMPTY_METADATA,
          },
        },
        loadContact(changedContact, 'ANOTHER_TEST_REFERENCE', true),
      );
      expect(newState[baseContact.id].savedContact).toStrictEqual(changedContact);
      expect(newState[baseContact.id].lastReferencedDate).toBeInstanceOf(Date);
    });

    test('Multiple contacts - replaces all existing contacts', () => {
      const changedContact = {
        ...baseContact,
        rawJson: {
          ...baseContact.rawJson,
          childInformation: {
            ...baseContact.rawJson.childInformation,
            firstName: 'Charlotte',
            lastName: 'Ballantyne',
          },
        },
      };
      const newState = loadContactReducer(
        {
          [baseContact.id]: {
            savedContact: baseContact,
            lastReferencedDate: new Date(),
            metadata: VALID_EMPTY_METADATA,
          },
          '666': {
            savedContact: { ...baseContact, id: '666' },
            lastReferencedDate: new Date(),
            metadata: VALID_EMPTY_METADATA,
          },
        },
        {
          type: LOAD_CONTACT_ACTION,
          contacts: [changedContact, { ...changedContact, id: '666' }, { ...changedContact, id: '42' }],
          replaceExisting: true,
        },
      );
      expect(newState[baseContact.id].savedContact).toStrictEqual(changedContact);
      expect(newState['42'].savedContact).toStrictEqual({ ...changedContact, id: '42' });
      expect(newState['666'].savedContact).toStrictEqual({ ...changedContact, id: '666' });
    });
  });

  test('loadContact', () => {
    const input = { ...baseContact };
    const outAction = loadContact(input, 'TEST_REFERENCE');
    expect(outAction.contacts.length).toEqual(1);
    expect(outAction.contacts[0]).toStrictEqual(baseContact);
  });

  test('loadContacts', () => {
    const input1 = { ...baseContact };
    const input2 = { ...baseContact, id: '42' };
    const outAction = loadContacts([input1, input2], 'TEST_REFERENCE');
    expect(outAction.contacts.length).toEqual(2);
    expect(outAction.contacts[0]).toStrictEqual(baseContact);
    expect(outAction.contacts[1]).toStrictEqual({ ...baseContact, id: '42' });
  });
});

describe('loadTranscriptReducer', () => {
  const transcript: Transcript = {
    accountSid: '',
    serviceSid: '',
    channelSid: '',
    participants: {},
    messages: [
      {
        sid: 'sid',
        body: 'body',
        dateCreated: new Date('2022-20-10'),
        from: 'from',
        index: 1,
        type: 'text',
        media: '',
      },
    ],
  };
  test('Contact not loaded - noop', () => {
    const newState = loadTranscriptReducer({}, loadTranscript(baseContact.id, transcript));
    expect(newState).toStrictEqual({});
  });

  test('Contact loaded - loads the transcript', async () => {
    const newState = loadTranscriptReducer(
      {
        [baseContact.id]: {
          savedContact: baseContact,
          lastReferencedDate: new Date(),
          metadata: {
            ...VALID_EMPTY_METADATA,
            categories: {
              gridView: false,
              expanded: {
                category1: true,
              },
            },
          },
        },
      },
      loadTranscript(baseContact.id, transcript),
    );
    expect(newState[baseContact.id].transcript).toMatchObject(transcript);
  });
});

describe('toggleCategoryExpandedReducer', () => {
  test('Contact loaded and category present in expanded map - flips boolean state', () => {
    const newState = toggleCategoryExpandedReducer(
      {
        [baseContact.id]: {
          savedContact: baseContact,
          lastReferencedDate: new Date(),
          metadata: {
            ...VALID_EMPTY_METADATA,
            categories: {
              gridView: false,
              expanded: {
                category1: true,
              },
            },
          },
        },
      },
      toggleCategoryExpanded(baseContact.id, 'category1'),
    );
    expect(newState[baseContact.id].metadata.categories.expanded.category1).toBe(false);
    expect(
      toggleCategoryExpandedReducer(newState, toggleCategoryExpanded(baseContact.id, 'category1'))[baseContact.id]
        .metadata.categories.expanded.category1,
    ).toBe(true);
  });
  test("Contact loaded and category not present in expanded map - adds it in a 'true' state", () => {
    const newState = toggleCategoryExpandedReducer(
      {
        [baseContact.id]: {
          savedContact: baseContact,
          lastReferencedDate: new Date(),
          metadata: VALID_EMPTY_METADATA,
        },
      },
      toggleCategoryExpanded(baseContact.id, 'category1'),
    );
    expect(newState[baseContact.id].metadata.categories.expanded.category1).toBe(true);
  });

  test('Contact not loaded - noop', () => {
    const newState = toggleCategoryExpandedReducer({}, toggleCategoryExpanded(baseContact.id, 'category1'));
    expect(newState).toStrictEqual({});
  });
});

describe('setCategoriesGridViewReducer', () => {
  test('Contact loaded - sets gridView state', () => {
    const newState = setCategoriesGridViewReducer(
      {
        [baseContact.id]: {
          savedContact: baseContact,
          lastReferencedDate: new Date(),
          metadata: {
            ...VALID_EMPTY_METADATA,
            categories: {
              gridView: false,
              expanded: {},
            },
          },
        },
      },
      setCategoriesGridView(baseContact.id, true),
    );
    expect(newState[baseContact.id].metadata.categories.gridView).toBe(true);
    expect(
      setCategoriesGridViewReducer(newState, setCategoriesGridView(baseContact.id, false))[baseContact.id].metadata
        .categories.gridView,
    ).toBe(false);
  });

  test('Contact not loaded - noop', () => {
    const newState = setCategoriesGridViewReducer({}, setCategoriesGridView(baseContact.id, true));
    expect(newState).toStrictEqual({});
  });
});

describe('updateDraftReducer', () => {
  const config: ConfigurationState = {
    counselors: { hash: {}, list: undefined },
    definitionVersions: {},
    language: '',
    workerInfo: { chatChannelCapacity: 0 },
    currentDefinitionVersion: {
      tabbedForms: {
        ChildInformationTab: [
          {
            label: 'First Name',
            name: 'firstName',
            type: FormInputType.Input,
          },
          {
            label: 'Last Name',
            name: 'lastName',
            type: FormInputType.Input,
          },
        ],
      },
    } as DefinitionVersion,
  };

  describe('updateDraft', () => {
    test('Contact ID not loaded - noop', () => {
      const newState = updateDraftReducer(
        baseState,
        config,
        updateDraft('42', { rawJson: { categories: { category1: ['x', 'y'] } } }),
      );
      expect(newState).toEqual(baseState);
    });

    test('Contact ID loaded - replaces any draftContact currently attached to the loaded contact', () => {
      const startingState = { ...baseState };
      startingState[baseContact.id].draftContact = {
        rawJson: {
          childInformation: {
            firstName: 'Bobby',
            lastName: 'Ewing',
          },
        },
      };
      const newState = updateDraftReducer(
        baseState,
        config,
        updateDraft(baseContact.id, { rawJson: { categories: { category1: ['x', 'y'] } } }),
      );
      expect(newState).toEqual<ExistingContactsState>({
        [baseContact.id]: {
          ...baseState[baseContact.id],
          lastReferencedDate: expect.any(Date),
          draftContact: {
            rawJson: {
              childInformation: {
                firstName: 'Bobby',
                lastName: 'Ewing',
              },
              categories: { category1: ['x', 'y'] },
            },
          },
        },
      });
    });
  });
  describe('clearDraft', () => {
    test('Contact ID not loaded - noop', () => {
      const newState = updateDraftReducer(baseState, config, clearDraft('42'));
      expect(newState).toEqual(baseState);
    });

    test('Contact ID loaded - removes any draftContact currently attached to the loaded contact', () => {
      const startingState = { ...baseState };
      startingState[baseContact.id].draftContact = {
        rawJson: {
          childInformation: {
            firstName: 'Bobby',
            lastName: 'Ewing',
          },
        },
      };
      const newState = updateDraftReducer(baseState, config, clearDraft('42'));
      expect(newState).toEqual<ExistingContactsState>(baseState);
    });
  });
});

describe('createDraftReducer', () => {
  const stateWithExistingDraft = { ...baseState };
  stateWithExistingDraft[baseContact.id].draftContact = {
    rawJson: {
      childInformation: {
        firstName: 'Bobby',
        lastName: 'Ewing',
      },
    },
  };

  test('Contact ID not loaded - noop', () => {
    const newState = createDraftReducer(baseState, createDraft('42', ContactDetailsRoute.EDIT_CHILD_INFORMATION));
    expect(newState).toEqual(baseState);
  });

  test("Contact ID loaded & EDIT_CHILD_INFORMATION route specified - sets draft to saved contact's child information", () => {
    const newState = createDraftReducer(
      stateWithExistingDraft,
      createDraft(baseContact.id, ContactDetailsRoute.EDIT_CHILD_INFORMATION),
    );
    expect(newState).toEqual<ExistingContactsState>({
      ...baseState,
      [baseContact.id]: {
        ...baseState[baseContact.id],
        lastReferencedDate: expect.any(Date),
        draftContact: {
          rawJson: {
            childInformation: baseContact.rawJson.childInformation,
          },
        },
      },
    });
  });

  test("Contact ID loaded & EDIT_CALLER_INFORMATION route specified - sets draft to saved contact's caller information", () => {
    const newState = createDraftReducer(
      stateWithExistingDraft,
      createDraft(baseContact.id, ContactDetailsRoute.EDIT_CALLER_INFORMATION),
    );
    expect(newState).toEqual<ExistingContactsState>({
      ...baseState,
      [baseContact.id]: {
        ...baseState[baseContact.id],
        lastReferencedDate: expect.any(Date),
        draftContact: {
          rawJson: {
            callerInformation: baseContact.rawJson.callerInformation,
          },
        },
      },
    });
  });

  test("Contact ID loaded & EDIT_CASE_INFORMATION route specified - sets draft to saved contact's case information", () => {
    const newState = createDraftReducer(
      stateWithExistingDraft,
      createDraft(baseContact.id, ContactDetailsRoute.EDIT_CASE_INFORMATION),
    );
    expect(newState).toEqual<ExistingContactsState>({
      ...baseState,
      [baseContact.id]: {
        ...baseState[baseContact.id],
        lastReferencedDate: expect.any(Date),
        draftContact: {
          rawJson: {
            caseInformation: baseContact.rawJson.caseInformation,
          },
        },
      },
    });
  });

  test("Contact ID loaded & EDIT_CATEGORIES route specified - sets draft to saved contact's categories", () => {
    const newState = createDraftReducer(
      stateWithExistingDraft,
      createDraft(baseContact.id, ContactDetailsRoute.EDIT_CATEGORIES),
    );
    expect(newState).toEqual<ExistingContactsState>({
      ...baseState,
      [baseContact.id]: {
        ...baseState[baseContact.id],
        lastReferencedDate: expect.any(Date),
        draftContact: {
          rawJson: {
            categories: baseContact.rawJson.categories,
          },
        },
      },
    });
  });
});

const stubRootState = ({
  configuration: { definitionVersions: {} },
  activeContacts: { existingContacts: {}, contactsBeingCreated: new Set<string>(), contactDetails: {} },
} as unknown) as HrmState;

describe('contact garbage collection (GC)', () => {
  const staleDate = new Date(Date.now() - (STALE_CONTACT_CASE_MINUTES + 1) * 60 * 1000);
  const recentDate = new Date();

  const contactEntry = {
    savedContact: baseContact,
    metadata: VALID_EMPTY_METADATA,
  };

  test('GC - removes stale contacts with no draftContact', () => {
    const state = ({
      ...stubRootState,
      activeContacts: {
        ...stubRootState.activeContacts,
        existingContacts: {
          [baseContact.id]: { ...contactEntry, lastReferencedDate: staleDate },
        },
      },
    } as unknown) as HrmState;

    const result = reduce(state, state.activeContacts, {
      type: REMOVE_CONTACT_STATE,
      taskId: 'task1',
      contactId: baseContact.id,
    });
    expect(result.existingContacts[baseContact.id]).toBeUndefined();
  });

  test('GC - does not remove recent contacts with no draftContact', () => {
    const state = ({
      ...stubRootState,
      activeContacts: {
        ...stubRootState.activeContacts,
        existingContacts: {
          [baseContact.id]: { ...contactEntry, lastReferencedDate: recentDate },
        },
      },
    } as unknown) as HrmState;

    const result = reduce(state, state.activeContacts, {
      type: REMOVE_CONTACT_STATE,
      taskId: 'task1',
      contactId: baseContact.id,
    });
    expect(result.existingContacts[baseContact.id]).toBeDefined();
  });

  test('GC - does not remove stale contacts with meaningful draftContact data', () => {
    const state = ({
      ...stubRootState,
      activeContacts: {
        ...stubRootState.activeContacts,
        existingContacts: {
          [baseContact.id]: {
            ...contactEntry,
            lastReferencedDate: staleDate,
            draftContact: { rawJson: { childInformation: { firstName: 'Draft Name' } } },
          },
        },
      },
    } as unknown) as HrmState;

    const result = reduce(state, state.activeContacts, {
      type: REMOVE_CONTACT_STATE,
      taskId: 'task1',
      contactId: baseContact.id,
    });
    expect(result.existingContacts[baseContact.id]).toBeDefined();
  });

  test('GC - removes stale contacts with empty draftContact object', () => {
    const state = ({
      ...stubRootState,
      activeContacts: {
        ...stubRootState.activeContacts,
        existingContacts: {
          [baseContact.id]: {
            ...contactEntry,
            lastReferencedDate: staleDate,
            draftContact: {},
          },
        },
      },
    } as unknown) as HrmState;

    const result = reduce(state, state.activeContacts, {
      type: REMOVE_CONTACT_STATE,
      taskId: 'task1',
      contactId: baseContact.id,
    });
    expect(result.existingContacts[baseContact.id]).toBeUndefined();
  });

  test('GC - removes stale contacts with draftContact containing only empty nested objects', () => {
    const state = ({
      ...stubRootState,
      activeContacts: {
        ...stubRootState.activeContacts,
        existingContacts: {
          [baseContact.id]: {
            ...contactEntry,
            lastReferencedDate: staleDate,
            draftContact: { rawJson: { childInformation: {}, callerInformation: {} } },
          },
        },
      },
    } as unknown) as HrmState;

    const result = reduce(state, state.activeContacts, {
      type: REMOVE_CONTACT_STATE,
      taskId: 'task1',
      contactId: baseContact.id,
    });
    expect(result.existingContacts[baseContact.id]).toBeUndefined();
  });
});
