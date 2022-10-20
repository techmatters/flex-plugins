import { hrmServiceContactToSearchContact } from '../../../states/contacts/contactDetailsAdapter';
import {
  clearDraft,
  ContactDetailsRoute,
  createDraft,
  createDraftReducer,
  ExistingContactsState,
  LOAD_CONTACT_ACTION,
  loadContact,
  loadContactReducer,
  loadRawContact,
  loadRawContacts,
  releaseContact,
  releaseContactReducer,
  releaseContacts,
  setCategoriesGridView,
  setCategoriesGridViewReducer,
  toggleCategoryExpanded,
  toggleCategoryExpandedReducer,
  updateDraft,
  updateDraftReducer,
} from '../../../states/contacts/existingContacts';
import { SearchContact } from '../../../types/types';

const baseContact: SearchContact = {
  contactId: '1337',
  overview: {
    helpline: undefined,
    dateTime: undefined,
    name: 'Lorna Ballantyne',
    customerNumber: undefined,
    callType: undefined,
    categories: ['x', 'y', 'z'],
    counselor: undefined,
    notes: undefined,
    channel: undefined,
    conversationDuration: undefined,
    createdBy: undefined,
    taskId: undefined,
  },
  details: {
    callType: '',
    caseInformation: { categories: {} },
    childInformation: { name: { firstName: 'Lorna', lastName: 'Ballantyne' } },
    callerInformation: { name: { firstName: 'Charlie', lastName: 'Ballantyne' } },
    contactlessTask: undefined,
    conversationMedia: [],
  },
  csamReports: [],
};

const baseState: ExistingContactsState = {
  [baseContact.contactId]: {
    savedContact: baseContact,
    references: new Set('x'),
    categories: {
      gridView: false,
      expanded: {},
    },
  },
} as const;

jest.mock('../../../states/contacts/contactDetailsAdapter');

describe('loadContactReducer', () => {
  describe('replaceExisting set to false', () => {
    test('Nothing currently for that ID - adds the contact with provided reference and blank categories state', () => {
      const newState = loadContactReducer({}, loadContact(baseContact, 'TEST_REFERENCE'));
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
      expect(newState[baseContact.contactId].references.has('TEST_REFERENCE')).toBeTruthy();
      expect(newState[baseContact.contactId].categories).toStrictEqual({ gridView: false, expanded: {} });
    });

    test('Same contact currently loaded for that ID with a different reference - leaves contact the same and adds the reference', () => {
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(baseContact, 'ANOTHER_TEST_REFERENCE'),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(2);
      expect([...newState[baseContact.contactId].references]).toEqual(
        expect.arrayContaining(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
      );
    });

    test('Different contact currently for that ID - leaves contact the same and adds the reference', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(changedContact, 'ANOTHER_TEST_REFERENCE'),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(2);
      expect([...newState[baseContact.contactId].references]).toEqual(
        expect.arrayContaining(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
      );
    });

    test('Same reference as a contact already loaded - does nothing', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(changedContact, 'TEST_REFERENCE'),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
      expect(newState[baseContact.contactId].references.has('TEST_REFERENCE')).toBeTruthy();
    });
    test('Multiple contacts in different states - applies rules to each contact separately', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
          '666': {
            savedContact: { ...baseContact, contactId: '666' },
            references: new Set(['ANOTHER_TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        {
          type: LOAD_CONTACT_ACTION,
          reference: 'TEST_REFERENCE',
          contacts: [changedContact, { ...changedContact, contactId: '666' }, { ...changedContact, contactId: '42' }],
          replaceExisting: false,
        },
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect([...newState[baseContact.contactId].references]).toStrictEqual(['TEST_REFERENCE']);
      expect(newState['42'].savedContact).toStrictEqual({ ...changedContact, contactId: '42' });
      expect([...newState['42'].references]).toStrictEqual(['TEST_REFERENCE']);
      expect(newState['666'].savedContact).toStrictEqual({ ...baseContact, contactId: '666' });
      expect([...newState['666'].references]).toMatchObject(['ANOTHER_TEST_REFERENCE', 'TEST_REFERENCE']);
      expect(newState['666'].references.size).toEqual(2);
    });
  });

  describe('replaceExisting set to true', () => {
    test('Nothing currently for that ID - adds the contact with provided reference and blank categories state', () => {
      const newState = loadContactReducer({}, loadContact(baseContact, 'TEST_REFERENCE', true));
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
      expect(newState[baseContact.contactId].references.has('TEST_REFERENCE')).toBeTruthy();
      expect(newState[baseContact.contactId].categories).toStrictEqual({ gridView: false, expanded: {} });
    });

    test('Same contact currently for that ID, with different reference - adds reference', () => {
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(baseContact, 'ANOTHER_TEST_REFERENCE', true),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(2);
      expect([...newState[baseContact.contactId].references]).toEqual(
        expect.arrayContaining(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
      );
    });

    test('Different contact currently for that ID - replaces and adds the reference', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(changedContact, 'ANOTHER_TEST_REFERENCE', true),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(changedContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(2);
      expect([...newState[baseContact.contactId].references]).toEqual(
        expect.arrayContaining(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
      );
    });

    test('Same reference as a contact already loaded - replaces contact but leaves references the same', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        loadContact(changedContact, 'TEST_REFERENCE', true),
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(changedContact);
      expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
      expect(newState[baseContact.contactId].references.has('TEST_REFERENCE')).toBeTruthy();
    });

    test('Multiple contacts in different states - applies rules to each contact separately', () => {
      const changedContact = { ...baseContact, overview: { ...baseContact.overview, name: 'Charlotte Ballantyne' } };
      const newState = loadContactReducer(
        {
          [baseContact.contactId]: {
            savedContact: baseContact,
            references: new Set(['TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
          '666': {
            savedContact: { ...baseContact, contactId: '666' },
            references: new Set(['ANOTHER_TEST_REFERENCE']),
            categories: { gridView: false, expanded: {} },
          },
        },
        {
          type: LOAD_CONTACT_ACTION,
          reference: 'TEST_REFERENCE',
          contacts: [changedContact, { ...changedContact, contactId: '666' }, { ...changedContact, contactId: '42' }],
          replaceExisting: true,
        },
      );
      expect(newState[baseContact.contactId].savedContact).toStrictEqual(changedContact);
      expect([...newState[baseContact.contactId].references]).toStrictEqual(['TEST_REFERENCE']);
      expect(newState['42'].savedContact).toStrictEqual({ ...changedContact, contactId: '42' });
      expect([...newState['42'].references]).toStrictEqual(['TEST_REFERENCE']);
      expect(newState['666'].savedContact).toStrictEqual({ ...changedContact, contactId: '666' });
      expect([...newState['666'].references]).toMatchObject(['ANOTHER_TEST_REFERENCE', 'TEST_REFERENCE']);
      expect(newState['666'].references.size).toEqual(2);
    });
  });

  test('loadRawContact - converts using hrmServiceContactToSearchContact before creating load contact action', () => {
    (<jest.Mock>hrmServiceContactToSearchContact).mockReturnValue(baseContact);
    const input = { id: baseContact.contactId, bleep: 'bloop' };
    const outAction = loadRawContact(input, 'TEST_REFERENCE');
    expect(outAction.contacts.length).toEqual(1);
    expect(outAction.contacts[0]).toStrictEqual(baseContact);
    expect(outAction.reference).toEqual('TEST_REFERENCE');
    expect(hrmServiceContactToSearchContact).toHaveBeenCalledWith(input);
  });

  test('loadRawContacts - converts all contacts using hrmServiceContactToSearchContact before creating load contact action', () => {
    (<jest.Mock>hrmServiceContactToSearchContact)
      .mockReturnValueOnce(baseContact)
      .mockReturnValueOnce({ ...baseContact, contactId: '42' });
    const input1 = { id: baseContact.contactId, bleep: 'bloop' };
    const input2 = { id: '42', bleep: 'bloop' };
    const outAction = loadRawContacts([input1, input2], 'TEST_REFERENCE');
    expect(outAction.contacts.length).toEqual(2);
    expect(outAction.contacts[0]).toStrictEqual(baseContact);
    expect(outAction.contacts[1]).toStrictEqual({ ...baseContact, contactId: '42' });
    expect(outAction.reference).toEqual('TEST_REFERENCE');
    expect(hrmServiceContactToSearchContact).toHaveBeenCalledWith(input1);
    expect(hrmServiceContactToSearchContact).toHaveBeenCalledWith(input2);
  });
});

describe('releaseContactReducer', () => {
  test('Nothing currently for that ID - noop', () => {
    const newState = releaseContactReducer({}, releaseContact(baseContact.contactId, 'TEST_REFERENCE'));
    expect(newState).toStrictEqual({});
  });
  test('Contact loaded for that ID with that reference and others - removes that reference', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId, 'TEST_REFERENCE'),
    );
    expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
    expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
    expect(newState[baseContact.contactId].references.has('ANOTHER_TEST_REFERENCE')).toBeTruthy();
  });
  test('Contact loaded for that ID with just that reference - removes contact from state', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(['TEST_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId, 'TEST_REFERENCE'),
    );
    expect(newState[baseContact.contactId]).toBeUndefined();
  });
  test('Contact loaded for that ID but not the specified reference - does nothing', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(['ANOTHER_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId, 'TEST_REFERENCE'),
    );
    expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
    expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
    expect(newState[baseContact.contactId].references.has('ANOTHER_REFERENCE')).toBeTruthy();
  });
  test('Contact loaded for that ID with no references - should never be in this state but removes contact from state', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(),
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContact(baseContact.contactId, 'ANYTHING'),
    );
    expect(newState[baseContact.contactId]).toBeUndefined();
  });
  test('Multiple contacts that are all present - removes references and removes contacts left with no references', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(['TEST_REFERENCE', 'ANOTHER_TEST_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
        '666': {
          savedContact: { ...baseContact, contactId: '666' },
          references: new Set(['TEST_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContacts([baseContact.contactId, '666'], 'TEST_REFERENCE'),
    );
    expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
    expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
    expect(newState[baseContact.contactId].references.has('ANOTHER_TEST_REFERENCE')).toBeTruthy();
    expect(newState['666']).toBeUndefined();
  });
  test('Multiple contacts that are not all present - removes references and removes contacts left with no references', () => {
    const newState = releaseContactReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(['ANOTHER_TEST_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
        '666': {
          savedContact: { ...baseContact, contactId: '666' },
          references: new Set(['TEST_REFERENCE']),
          categories: { gridView: false, expanded: {} },
        },
      },
      releaseContacts([baseContact.contactId, '666', '42'], 'TEST_REFERENCE'),
    );
    expect(newState[baseContact.contactId].savedContact).toStrictEqual(baseContact);
    expect(newState[baseContact.contactId].references.size).toStrictEqual(1);
    expect(newState[baseContact.contactId].references.has('ANOTHER_TEST_REFERENCE')).toBeTruthy();
    expect(newState['666']).toBeUndefined();
  });
});

describe('toggleCategoryExpandedReducer', () => {
  test('Contact loaded and category present in expanded map - flips boolean state', () => {
    const newState = toggleCategoryExpandedReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set(['x']),
          categories: {
            gridView: false,
            expanded: {
              category1: true,
            },
          },
        },
      },
      toggleCategoryExpanded(baseContact.contactId, 'category1'),
    );
    expect(newState[baseContact.contactId].categories.expanded.category1).toBe(false);
    expect(
      toggleCategoryExpandedReducer(newState, toggleCategoryExpanded(baseContact.contactId, 'category1'))[
        baseContact.contactId
      ].categories.expanded.category1,
    ).toBe(true);
  });
  test("Contact loaded and category not present in expanded map - adds it in a 'true' state", () => {
    const newState = toggleCategoryExpandedReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set('x'),
          categories: {
            gridView: false,
            expanded: {},
          },
        },
      },
      toggleCategoryExpanded(baseContact.contactId, 'category1'),
    );
    expect(newState[baseContact.contactId].categories.expanded.category1).toBe(true);
  });

  test('Contact not loaded - noop', () => {
    const newState = toggleCategoryExpandedReducer({}, toggleCategoryExpanded(baseContact.contactId, 'category1'));
    expect(newState).toStrictEqual({});
  });
});

describe('setCategoriesGridViewReducer', () => {
  test('Contact loaded - sets grivView state', () => {
    const newState = setCategoriesGridViewReducer(
      {
        [baseContact.contactId]: {
          savedContact: baseContact,
          references: new Set('x'),
          categories: {
            gridView: false,
            expanded: {},
          },
        },
      },
      setCategoriesGridView(baseContact.contactId, true),
    );
    expect(newState[baseContact.contactId].categories.gridView).toBe(true);
    expect(
      setCategoriesGridViewReducer(newState, setCategoriesGridView(baseContact.contactId, false))[baseContact.contactId]
        .categories.gridView,
    ).toBe(false);
  });

  test('Contact not loaded - noop', () => {
    const newState = setCategoriesGridViewReducer({}, setCategoriesGridView(baseContact.contactId, true));
    expect(newState).toStrictEqual({});
  });
});

describe('updateDraftReducer', () => {
  describe('updateDraft', () => {
    test('Contact ID not loaded - noop', () => {
      const newState = updateDraftReducer(baseState, updateDraft('42', { overview: { categories: ['category1'] } }));
      expect(newState).toEqual(baseState);
    });

    test('Contact ID loaded - replaces any draftContact currently attached to the loaded contact', () => {
      const startingState = { ...baseState };
      startingState[baseContact.contactId].draftContact = {
        details: {
          childInformation: {
            name: {
              firstName: 'Bobby',
              lastName: 'Ewing',
            },
          },
        },
      };
      const newState = updateDraftReducer(
        baseState,
        updateDraft(baseContact.contactId, { overview: { categories: ['category1'] } }),
      );
      expect(newState).toEqual<ExistingContactsState>({
        [baseContact.contactId]: {
          ...baseState[baseContact.contactId],
          draftContact: { overview: { categories: ['category1'] } },
        },
      });
    });
  });
  describe('clearDraft', () => {
    test('Contact ID not loaded - noop', () => {
      const newState = updateDraftReducer(baseState, clearDraft('42'));
      expect(newState).toEqual(baseState);
    });

    test('Contact ID loaded - removes any draftContact currently attached to the loaded contact', () => {
      const startingState = { ...baseState };
      startingState[baseContact.contactId].draftContact = {
        details: {
          childInformation: {
            name: {
              firstName: 'Bobby',
              lastName: 'Ewing',
            },
          },
        },
      };
      const newState = updateDraftReducer(baseState, clearDraft('42'));
      expect(newState).toEqual<ExistingContactsState>(baseState);
    });
  });
});

describe('createDraftReducer', () => {
  const stateWithExistingDraft = { ...baseState };
  stateWithExistingDraft[baseContact.contactId].draftContact = {
    details: {
      childInformation: {
        name: {
          firstName: 'Bobby',
          lastName: 'Ewing',
        },
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
      createDraft(baseContact.contactId, ContactDetailsRoute.EDIT_CHILD_INFORMATION),
    );
    expect(newState).toEqual<ExistingContactsState>({
      ...baseState,
      [baseContact.contactId]: {
        ...baseState[baseContact.contactId],
        draftContact: {
          details: {
            childInformation: baseContact.details.childInformation,
          },
        },
      },
    });
  });

  test("Contact ID loaded & EDIT_CALLER_INFORMATION route specified - sets draft to saved contact's caller information", () => {
    const newState = createDraftReducer(
      stateWithExistingDraft,
      createDraft(baseContact.contactId, ContactDetailsRoute.EDIT_CALLER_INFORMATION),
    );
    expect(newState).toEqual<ExistingContactsState>({
      ...baseState,
      [baseContact.contactId]: {
        ...baseState[baseContact.contactId],
        draftContact: {
          details: {
            callerInformation: baseContact.details.callerInformation,
          },
        },
      },
    });
  });

  test("Contact ID loaded & EDIT_CASE_INFORMATION route specified - sets draft to saved contact's case information", () => {
    const newState = createDraftReducer(
      stateWithExistingDraft,
      createDraft(baseContact.contactId, ContactDetailsRoute.EDIT_CASE_INFORMATION),
    );
    expect(newState).toEqual<ExistingContactsState>({
      ...baseState,
      [baseContact.contactId]: {
        ...baseState[baseContact.contactId],
        draftContact: {
          details: {
            caseInformation: baseContact.details.caseInformation,
          },
        },
      },
    });
  });

  test("Contact ID loaded & EDIT_CATEGORIES route specified - sets draft to saved contact's categories", () => {
    const newState = createDraftReducer(
      stateWithExistingDraft,
      createDraft(baseContact.contactId, ContactDetailsRoute.EDIT_CATEGORIES),
    );
    expect(newState).toEqual<ExistingContactsState>({
      ...baseState,
      [baseContact.contactId]: {
        ...baseState[baseContact.contactId],
        draftContact: {
          overview: {
            categories: baseContact.overview.categories,
          },
        },
      },
    });
  });
});
